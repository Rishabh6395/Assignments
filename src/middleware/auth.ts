import { NextFunction, Request, Response } from 'express';
import { OrgRole } from '@prisma/client';
import { verifyAccessToken } from '../utils/jwt';
import { UnauthorizedError, ForbiddenError } from '../utils/errors';
import { prisma } from '../config/prisma';

export async function authenticate(req: Request, _res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      throw new UnauthorizedError('Missing or malformed Authorization header', 'MISSING_TOKEN');
    }
    const token = header.slice('Bearer '.length);
    const payload = verifyAccessToken(token);
    req.user = { id: payload.sub, email: payload.email };
    next();
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return next(err);
    }
    next(new UnauthorizedError('Invalid or expired access token', 'INVALID_TOKEN'));
  }
}

export async function requireOrgContext(req: Request, _res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      throw new UnauthorizedError();
    }
    const orgId = req.headers['x-org-id'];
    if (!orgId || typeof orgId !== 'string') {
      throw new ForbiddenError('X-Org-Id header is required', 'MISSING_ORG_CONTEXT');
    }

    const membership = await prisma.orgMember.findUnique({
      where: { userId_orgId: { userId: req.user.id, orgId } }
    });

    if (!membership) {
      throw new ForbiddenError('You do not have access to this organization', 'ORG_ACCESS_DENIED');
    }

    req.orgContext = { orgId: membership.orgId, role: membership.role };
    next();
  } catch (err) {
    next(err);
  }
}

export function requireRole(...roles: OrgRole[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.orgContext || !roles.includes(req.orgContext.role)) {
      return next(new ForbiddenError('Insufficient role for this action', 'INSUFFICIENT_ROLE'));
    }
    next();
  };
}
