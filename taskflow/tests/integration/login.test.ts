import request from 'supertest';
import { createApp } from '../../src/app';
import { resetDatabase, disconnectDatabase } from '../setup';

const app = createApp();

beforeEach(async () => {
  await resetDatabase();
});

afterAll(async () => {
  await disconnectDatabase();
});

describe('Login flow', () => {
  const credentials = {
    email: 'alice@acme.test',
    password: 'Password123!',
    name: 'Alice Admin',
    organizationName: 'Acme Corp'
  };

  it('registers a new user with a new organization as org_admin', async () => {
    const res = await request(app).post('/auth/register').send(credentials);

    expect(res.status).toBe(201);
    expect(res.body.user.email).toBe(credentials.email);
    expect(res.body.organization.role).toBe('org_admin');
    expect(res.body.accessToken).toEqual(expect.any(String));
    expect(res.body.refreshToken).toEqual(expect.any(String));
  });

  it('rejects registration with a duplicate email', async () => {
    await request(app).post('/auth/register').send(credentials);
    const res = await request(app).post('/auth/register').send(credentials);

    expect(res.status).toBe(409);
    expect(res.body.code).toBe('EMAIL_TAKEN');
  });

  it('logs in with correct credentials and returns tokens + org memberships', async () => {
    await request(app).post('/auth/register').send(credentials);

    const res = await request(app)
      .post('/auth/login')
      .send({ email: credentials.email, password: credentials.password });

    expect(res.status).toBe(200);
    expect(res.body.accessToken).toEqual(expect.any(String));
    expect(res.body.organizations).toHaveLength(1);
    expect(res.body.organizations[0].role).toBe('org_admin');
  });

  it('rejects login with a wrong password without revealing which field was wrong', async () => {
    await request(app).post('/auth/register').send(credentials);

    const res = await request(app)
      .post('/auth/login')
      .send({ email: credentials.email, password: 'wrong-password' });

    expect(res.status).toBe(401);
    expect(res.body.code).toBe('INVALID_CREDENTIALS');
  });

  it('rejects login for a non-existent user with the same generic error', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'nobody@acme.test', password: 'whatever123' });

    expect(res.status).toBe(401);
    expect(res.body.code).toBe('INVALID_CREDENTIALS');
  });

  it('issues a new access token from a valid refresh token', async () => {
    const register = await request(app).post('/auth/register').send(credentials);
    const refreshToken = register.body.refreshToken;

    const res = await request(app).post('/auth/refresh').send({ refreshToken });

    expect(res.status).toBe(200);
    expect(res.body.accessToken).toEqual(expect.any(String));
  });

  it('rejects a refresh token after logout revokes it', async () => {
    const register = await request(app).post('/auth/register').send(credentials);
    const refreshToken = register.body.refreshToken;

    await request(app).post('/auth/logout').send({ refreshToken });
    const res = await request(app).post('/auth/refresh').send({ refreshToken });

    expect(res.status).toBe(401);
    expect(res.body.code).toBe('INVALID_REFRESH_TOKEN');
  });
});
