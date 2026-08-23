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

describe('Validation and error scenarios', () => {
  it('rejects registration with an invalid email and short password', async () => {
    const res = await request(app).post('/auth/register').send({
      email: 'not-an-email',
      password: 'short',
      name: 'A',
      organizationName: 'Org'
    });

    expect(res.status).toBe(400);
    expect(res.body.code).toBe('VALIDATION_ERROR');
    expect(res.body.details).toHaveProperty('email');
    expect(res.body.details).toHaveProperty('password');
  });

  it('rejects task creation with a missing required field (title)', async () => {
    const actor = await registerActor(app);
    const headers = authHeaders(actor);
    const project = await request(app).post('/projects').set(headers).send({ name: 'P1' });

    const res = await request(app)
      .post('/tasks')
      .set(headers)
      .send({ projectId: project.body.id });

    expect(res.status).toBe(400);
    expect(res.body.code).toBe('VALIDATION_ERROR');
    expect(res.body).toHaveProperty('error');
    expect(res.body).toHaveProperty('details');
  });

  it('rejects task creation with an invalid enum value for status', async () => {
    const actor = await registerActor(app);
    const headers = authHeaders(actor);
    const project = await request(app).post('/projects').set(headers).send({ name: 'P1' });

    const res = await request(app)
      .post('/tasks')
      .set(headers)
      .send({ projectId: project.body.id, title: 'T', status: 'not_a_real_status' });

    expect(res.status).toBe(400);
    expect(res.body.code).toBe('VALIDATION_ERROR');
  });

  it('returns a consistent 404 error shape for a missing task', async () => {
    const actor = await registerActor(app);
    const res = await request(app)
      .get('/tasks/00000000-0000-0000-0000-000000000000')
      .set(authHeaders(actor));

    expect(res.status).toBe(404);
    expect(res.body).toEqual({
      error: expect.any(String),
      code: 'TASK_NOT_FOUND',
      details: expect.any(Object)
    });
  });

  it('returns 401 for a request with no Authorization header', async () => {
    const res = await request(app).get('/projects');
    expect(res.status).toBe(401);
    expect(res.body.code).toBe('MISSING_TOKEN');
  });

  it('returns 401 for a malformed/expired access token', async () => {
    const res = await request(app)
      .get('/projects')
      .set({ Authorization: 'Bearer not-a-real-token' });

    expect(res.status).toBe(401);
    expect(res.body.code).toBe('INVALID_TOKEN');
  });

  it('rejects creating a task for a project that does not exist', async () => {
    const actor = await registerActor(app);
    const res = await request(app)
      .post('/tasks')
      .set(authHeaders(actor))
      .send({ projectId: '00000000-0000-0000-0000-000000000000', title: 'Orphan task' });

    expect(res.status).toBe(404);
    expect(res.body.code).toBe('PROJECT_NOT_FOUND');
  });

  it('rate-limits repeated auth requests from the same IP', async () => {
    const attempts = Array.from({ length: 12 }, (_, i) =>
      request(app)
        .post('/auth/login')
        .send({ email: `nobody${i}@test.dev`, password: 'whatever123' })
    );
    const results = await Promise.all(attempts);
    const tooMany = results.filter((r) => r.status === 429);

    expect(tooMany.length).toBeGreaterThan(0);
    if (tooMany.length > 0) {
      expect(tooMany[0].body.code).toBe('RATE_LIMITED');
    }
  });
});
