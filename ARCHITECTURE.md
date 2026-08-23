# Architecture

The API is an Express application backed by PostgreSQL through Prisma. Redis and BullMQ handle task-assignment notifications.

- `api`: HTTP API and Prisma migrations
- `worker`: email-notification queue worker
- `postgres`: application database
- `redis`: queue storage

Requests pass through authentication, organization context, validation, controllers, and services. Background jobs are created when tasks are assigned and can be queried through `/jobs/:id`.
