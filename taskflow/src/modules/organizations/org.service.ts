import { prisma } from '../../config/prisma';
import { NotFoundError, ConflictError } from '../../utils/errors';
import { AddMemberInput } from './org.schema';

export async function listMembers(orgId: string) {
  const members = await prisma.orgMember.findMany({
    where: { orgId },
    include: { user: { select: { id: true, email: true, name: true } } },
    orderBy: { createdAt: 'asc' }
  });

  return members.map((m) => ({
    userId: m.user.id,
    email: m.user.email,
    name: m.user.name,
    role: m.role,
    memberSince: m.createdAt
  }));
}

export async function addMember(orgId: string, input: AddMemberInput) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user) {
    throw new NotFoundError('User', 'USER_NOT_FOUND', { email: input.email });
  }

  const existing = await prisma.orgMember.findUnique({
    where: { userId_orgId: { userId: user.id, orgId } }
  });
  if (existing) {
    throw new ConflictError('User is already a member of this organization', 'ALREADY_MEMBER');
  }

  const membership = await prisma.orgMember.create({
    data: { orgId, userId: user.id, role: input.role }
  });

  return {
    userId: user.id,
    email: user.email,
    name: user.name,
    role: membership.role
  };
}

export async function removeMember(orgId: string, userId: string) {
  const existing = await prisma.orgMember.findUnique({
    where: { userId_orgId: { userId, orgId } }
  });
  if (!existing) {
    throw new NotFoundError('Membership', 'MEMBERSHIP_NOT_FOUND');
  }
  await prisma.orgMember.delete({ where: { id: existing.id } });
}
