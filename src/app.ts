import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';

import authRoutes from './modules/auth/auth.routes';
import orgRoutes from './modules/organizations/org.routes';
import projectRoutes from './modules/projects/project.routes';
import taskRoutes from './modules/tasks/task.routes';
import jobsRoutes from './modules/jobs/jobs.routes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { env } from './config/env';

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors());
  if (env.nodeEnv !== 'test') {
    app.use(morgan('dev'));
  }
  app.use(express.json());

  app.get('/', (_req, res) =>
    res.status(200).json({
      name: 'TaskFlow API',
      docs: '/docs',
      health: '/health',
    }),
  );

  app.get('/health', (_req, res) => res.status(200).json({ status: 'ok' }));

  try {
    const openapiPath = path.resolve(process.cwd(), 'openapi.yaml');
    const openapiDocument = YAML.load(openapiPath);
    app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapiDocument));
  } catch {}

  app.use('/auth', authRoutes);
  app.use('/organizations', orgRoutes);
  app.use('/projects', projectRoutes);
  app.use('/tasks', taskRoutes);
  app.use('/jobs', jobsRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
