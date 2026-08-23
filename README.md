# TaskFlow Backend

TaskFlow is a project-management API built with Node.js, TypeScript, Express, Prisma, PostgreSQL, Redis, and BullMQ.

## Run with Docker

```bash
docker compose up --build
docker compose exec api npm run prisma:seed
```

Services:

- API: http://localhost:3000
- Swagger: http://localhost:3000/docs
- Health: http://localhost:3000/health
- PostgreSQL: localhost:5432
- Redis: localhost:6379

Seeded accounts use `Password123!`.

## Local development

```bash
npm install
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

Run the worker separately:

```bash
npm run worker:dev
```

## API

Authentication routes are under `/auth`. Protected organization routes require:

```http
Authorization: Bearer <access-token>
X-Org-Id: <organization-id>
```

Available resources: organizations, projects, tasks, comments, and background jobs. The complete endpoint reference is available at `/docs`.

## Tests

```bash
npm test
```

Integration tests require `DATABASE_URL_TEST`.
