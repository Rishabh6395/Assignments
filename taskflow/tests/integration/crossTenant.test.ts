import request from 'supertest';
import { createApp } from '../../src/app';
import { resetDatabase, disconnectDatabase, registerActor, authHeaders } from '../setup';

const app = createApp();

beforeEach(async () => {
  await resetDatabase();
});

afterAll(async () => {
  await disconnectDatabase();
});

describe('Cross-tenant isolation', () => {
  it('returns 403 when calling with an X-Org-Id the caller does not belong to', async () => {
    const orgA = await registerActor(app, { email: 'a@orga.test', organizationName: 'Org A' });
    const orgB = await registerActor(app, { email: 'b@orgb.test', organizationName: 'Org B' });

    const res = await request(app)
      .get('/projects')
      .set({ Authorization: `Bearer ${orgA.accessToken}`, 'X-Org-Id': orgB.orgId });

    expect(res.status).toBe(403);
    expect(res.body.code).toBe('ORG_ACCESS_DENIED');
    expect(JSON.stringify(res.body)).not.toContain(orgB.orgId);
  });

  it('does not allow reading a project that belongs to a different organization', async () => {
    const orgA = await registerActor(app, { email: 'a@orga.test', organizationName: 'Org A' });
    const orgB = await registerActor(app, { email: 'b@orgb.test', organizationName: 'Org B' });

    const project = await request(app)
      .post('/projects')
      .set(authHeaders(orgB))
      .send({ name: 'Org B Secret Project' });

    const res = await request(app).get(`/projects/${project.body.id}`).set(authHeaders(orgA));

    expect(res.status).toBe(404);
    expect(res.body.code).toBe('PROJECT_NOT_FOUND');
    expect(JSON.stringify(res.body)).not.toContain('Org B Secret Project');
  });

  it('does not allow updating or deleting a task belonging to another org', async () => {
    const orgA = await registerActor(app, { email: 'a@orga.test', organizationName: 'Org A' });
    const orgB = await registerActor(app, { email: 'b@orgb.test', organizationName: 'Org B' });

    const project = await request(app).post('/projects').set(authHeaders(orgB)).send({ name: 'P' });
    const task = await request(app)
      .post('/tasks')
      .set(authHeaders(orgB))
      .send({ projectId: project.body.id, title: 'Org B task' });

    const update = await request(app)
      .patch(`/tasks/${task.body.id}`)
      .set(authHeaders(orgA))
      .send({ status: 'done' });
    expect(update.status).toBe(404);

    const del = await request(app).delete(`/tasks/${task.body.id}`).set(authHeaders(orgA));
    expect(del.status).toBe(404);

    const stillThere = await request(app).get(`/tasks/${task.body.id}`).set(authHeaders(orgB));
    expect(stillThere.status).toBe(200);
    expect(stillThere.body.status).toBe('todo');
  });

  it('cannot assign a task using a user id that belongs to a different org', async () => {
    const orgA = await registerActor(app, { email: 'a@orga.test', organizationName: 'Org A' });
    const orgB = await registerActor(app, { email: 'b@orgb.test', organizationName: 'Org B' });

    const project = await request(app).post('/projects').set(authHeaders(orgA)).send({ name: 'P' });
    const task = await request(app)
      .post('/tasks')
      .set(authHeaders(orgA))
      .send({ projectId: project.body.id, title: 'T' });

    const assign = await request(app)
      .post(`/tasks/${task.body.id}/assign`)
      .set(authHeaders(orgA))
      .send({ userId: orgB.userId });

    expect(assign.status).toBe(400);
    expect(assign.body.code).toBe('ASSIGNEE_NOT_IN_ORG');
  });

  it('rejects a request with no X-Org-Id header', async () => {
    const actor = await registerActor(app);
    const res = await request(app)
      .get('/projects')
      .set({ Authorization: `Bearer ${actor.accessToken}` });

    expect(res.status).toBe(403);
    expect(res.body.code).toBe('MISSING_ORG_CONTEXT');
  });

  it('only org_admin can delete a project, not a plain member', async () => {
    const admin = await registerActor(app, { email: 'admin@orgc.test', organizationName: 'Org C' });
    const member = await registerActor(app, { email: 'member@orgd.test', organizationName: 'Org D' });

    await request(app)
      .post('/organizations/members')
      .set(authHeaders(admin))
      .send({ email: 'member@orgd.test', role: 'member' });

    const project = await request(app)
      .post('/projects')
      .set(authHeaders(admin))
      .send({ name: 'Admin project' });

    const del = await request(app)
      .delete(`/projects/${project.body.id}`)
      .set({ Authorization: `Bearer ${member.accessToken}`, 'X-Org-Id': admin.orgId });

    expect(del.status).toBe(403);
    expect(del.body.code).toBe('INSUFFICIENT_ROLE');
  });
});
