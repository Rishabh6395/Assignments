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

describe('Task CRUD', () => {
  it('creates, reads, updates and deletes a task within a project', async () => {
    const actor = await registerActor(app);
    const headers = authHeaders(actor);

    const project = await request(app)
      .post('/projects')
      .set(headers)
      .send({ name: 'Website Redesign' });
    expect(project.status).toBe(201);

    const create = await request(app)
      .post('/tasks')
      .set(headers)
      .send({ projectId: project.body.id, title: 'Build homepage', priority: 'high' });
    expect(create.status).toBe(201);
    expect(create.body.status).toBe('todo');
    expect(create.body.priority).toBe('high');

    const get = await request(app).get(`/tasks/${create.body.id}`).set(headers);
    expect(get.status).toBe(200);
    expect(get.body.title).toBe('Build homepage');

    const update = await request(app)
      .patch(`/tasks/${create.body.id}`)
      .set(headers)
      .send({ status: 'in_progress' });
    expect(update.status).toBe(200);
    expect(update.body.status).toBe('in_progress');

    const del = await request(app).delete(`/tasks/${create.body.id}`).set(headers);
    expect(del.status).toBe(204);

    const getAfterDelete = await request(app).get(`/tasks/${create.body.id}`).set(headers);
    expect(getAfterDelete.status).toBe(404);
    expect(getAfterDelete.body.code).toBe('TASK_NOT_FOUND');
  });

  it('filters tasks by status and priority', async () => {
    const actor = await registerActor(app);
    const headers = authHeaders(actor);
    const project = await request(app).post('/projects').set(headers).send({ name: 'P1' });

    await request(app)
      .post('/tasks')
      .set(headers)
      .send({ projectId: project.body.id, title: 'Urgent bug', priority: 'urgent', status: 'todo' });
    await request(app)
      .post('/tasks')
      .set(headers)
      .send({ projectId: project.body.id, title: 'Nice to have', priority: 'low', status: 'todo' });
    await request(app)
      .post('/tasks')
      .set(headers)
      .send({ projectId: project.body.id, title: 'In progress task', priority: 'urgent', status: 'in_progress' });

    const res = await request(app).get('/tasks?status=todo&priority=urgent').set(headers);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].title).toBe('Urgent bug');
  });

  it('returns a { data, total, page, limit } shaped paginated response', async () => {
    const actor = await registerActor(app);
    const headers = authHeaders(actor);
    const project = await request(app).post('/projects').set(headers).send({ name: 'P1' });

    for (let i = 0; i < 5; i++) {
      await request(app)
        .post('/tasks')
        .set(headers)
        .send({ projectId: project.body.id, title: `Task ${i}` });
    }

    const res = await request(app).get('/tasks?page=1&limit=2').set(headers);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.total).toBe(5);
    expect(res.body.page).toBe(1);
    expect(res.body.limit).toBe(2);
  });

  it('assigns a task to a same-org user and enqueues a job', async () => {
    const admin = await registerActor(app, { email: 'admin@acme.test' });
    const headers = authHeaders(admin);

    const memberRegister = await request(app).post('/auth/register').send({
      email: 'member@other.test',
      password: 'Password123!',
      name: 'Member',
      organizationName: 'Throwaway Org'
    });
    await request(app)
      .post('/organizations/members')
      .set(headers)
      .send({ email: 'member@other.test', role: 'member' });

    const project = await request(app).post('/projects').set(headers).send({ name: 'P1' });
    const task = await request(app)
      .post('/tasks')
      .set(headers)
      .send({ projectId: project.body.id, title: 'Assign me' });

    const assign = await request(app)
      .post(`/tasks/${task.body.id}/assign`)
      .set(headers)
      .send({ userId: memberRegister.body.user.id });

    expect(assign.status).toBe(201);
    expect(assign.body.jobId).toEqual(expect.any(String));

    const jobStatus = await request(app).get(`/jobs/${assign.body.jobId}`).set(headers);
    expect(jobStatus.status).toBe(200);
    expect(['pending', 'active', 'completed']).toContain(jobStatus.body.status);
  });

  it('rejects assigning a user who is not a member of the task org', async () => {
    const admin = await registerActor(app);
    const outsider = await registerActor(app);
    const headers = authHeaders(admin);

    const project = await request(app).post('/projects').set(headers).send({ name: 'P1' });
    const task = await request(app)
      .post('/tasks')
      .set(headers)
      .send({ projectId: project.body.id, title: 'Assign me' });

    const assign = await request(app)
      .post(`/tasks/${task.body.id}/assign`)
      .set(headers)
      .send({ userId: outsider.userId });

    expect(assign.status).toBe(400);
    expect(assign.body.code).toBe('ASSIGNEE_NOT_IN_ORG');
  });
});
