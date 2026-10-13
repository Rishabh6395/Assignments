import { Router } from 'express';
import { authenticate, requireOrgContext, requireRole } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { createProjectSchema, updateProjectSchema, listProjectsQuerySchema } from './project.schema';
import {
  listProjectsHandler,
  getProjectHandler,
  createProjectHandler,
  updateProjectHandler,
  deleteProjectHandler,
  projectDashboardHandler
} from './project.controller';

const router = Router();

router.use(authenticate, requireOrgContext);

router.get('/', validate(listProjectsQuerySchema, 'query'), listProjectsHandler);
router.post('/', validate(createProjectSchema), createProjectHandler);
router.get('/:id', getProjectHandler);
router.patch('/:id', validate(updateProjectSchema), updateProjectHandler);
router.delete('/:id', requireRole('org_admin'), deleteProjectHandler);
router.get('/:id/dashboard', projectDashboardHandler);

export default router;
