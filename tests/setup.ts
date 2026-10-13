import { prisma } from '../src/config/prisma';

export async function resetDatabase() {
  const tableNames = [
    'comments',
    'task_assignments',
    'tasks',
    'projects',
    'org_members',
    'refresh_tokens',
    'organizations',
    'users'
  ];
  await prisma.$transaction(
    tableNames.map((name) => prisma.$executeRawUnsafe(`TRUNCATE TABLE "${name}" CASCADE`))
  );
}

export async function disconnectDatabase() {
  await prisma.$disconnect();
}

import request from 'supertest';
import { Express } from 'express';

interface RegisteredActor {
  accessToken: string;
  refreshToken: string;
  userId: string;
  orgId: string;
}

export async function registerActor(
  app: Express,
  overrides: Partial<{ email: string; password: string; name: string; organizationName: string }> = {}
): Promise<RegisteredActor> {
  const payload = {
    email: overrides.email ?? `user-${Date.now()}-${Math.random().toString(36).slice(2)}@test.dev`,
    password: overrides.password ?? 'Password123!',
    name: overrides.name ?? 'Test User',
    organizationName: overrides.organizationName ?? 'Test Org'
  };

  const res = await request(app).post('/auth/register').send(payload);

  return {
    accessToken: res.body.accessToken,
    refreshToken: res.body.refreshToken,
    userId: res.body.user.id,
    orgId: res.body.organization.id
  };
}

export function authHeaders(actor: RegisteredActor) {
  return { Authorization: `Bearer ${actor.accessToken}`, 'X-Org-Id': actor.orgId };
}
