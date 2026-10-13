import { prisma } from '../../config/prisma';
import { hashPassword, comparePassword } from '../../utils/password';
import {
  signAccessToken,
  generateRefreshToken,
  hashToken,
  refreshTokenExpiryDate
} from '../../utils/jwt';
import { ConflictError, UnauthorizedError } from '../../utils/errors';
import { RegisterInput, LoginInput } from './auth.schema';

interface AuthResult {
  user: { id: string; email: string; name: string };
  organization: { id: string; name: string; role: string };
  accessToken: string;
  refreshToken: string;
}

async function issueTokenPair(userId: string, email: string) {
  const accessToken = signAccessToken({ sub: userId, email });
  const refreshToken = generateRefreshToken();

  await prisma.refreshToken.create({
    data: {
      userId,
      tokenHash: hashToken(refreshToken),
      expiresAt: refreshTokenExpiryDate()
    }
  });

  return { accessToken, refreshToken };
}

export async function register(input: RegisterInput): Promise<AuthResult> {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    throw new ConflictError('An account with this email already exists', 'EMAIL_TAKEN');
  }

  const passwordHash = await hashPassword(input.password);

  const { user, org } = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: { email: input.email, passwordHash, name: input.name }
    });
    const org = await tx.organization.create({
      data: { name: input.organizationName }
    });
    await tx.orgMember.create({
      data: { userId: user.id, orgId: org.id, role: 'org_admin' }
    });
    return { user, org };
  });

  const { accessToken, refreshToken } = await issueTokenPair(user.id, user.email);

  return {
    user: { id: user.id, email: user.email, name: user.name },
    organization: { id: org.id, name: org.name, role: 'org_admin' },
    accessToken,
    refreshToken
  };
}

export async function login(input: LoginInput) {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
    include: { orgMemberships: { include: { org: true } } }
  });

  if (!user) {
    throw new UnauthorizedError('Invalid email or password', 'INVALID_CREDENTIALS');
  }
  const valid = await comparePassword(input.password, user.passwordHash);
  if (!valid) {
    throw new UnauthorizedError('Invalid email or password', 'INVALID_CREDENTIALS');
  }

  const { accessToken, refreshToken } = await issueTokenPair(user.id, user.email);

  return {
    user: { id: user.id, email: user.email, name: user.name },
    organizations: user.orgMemberships.map((m) => ({
      id: m.org.id,
      name: m.org.name,
      role: m.role
    })),
    accessToken,
    refreshToken
  };
}

export async function refresh(rawRefreshToken: string) {
  const tokenHash = hashToken(rawRefreshToken);
  const stored = await prisma.refreshToken.findUnique({
    where: { tokenHash },
    include: { user: true }
  });

  if (!stored || stored.revoked || stored.expiresAt < new Date()) {
    throw new UnauthorizedError('Refresh token is invalid or expired', 'INVALID_REFRESH_TOKEN');
  }

  const accessToken = signAccessToken({ sub: stored.user.id, email: stored.user.email });
  return { accessToken };
}

export async function logout(rawRefreshToken: string, allDevices: boolean) {
  const tokenHash = hashToken(rawRefreshToken);
  const stored = await prisma.refreshToken.findUnique({ where: { tokenHash } });

  if (!stored) {
    return;
  }

  if (allDevices) {
    await prisma.refreshToken.updateMany({
      where: { userId: stored.userId, revoked: false },
      data: { revoked: true, revokedAt: new Date() }
    });
  } else {
    await prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revoked: true, revokedAt: new Date() }
    });
  }
}
