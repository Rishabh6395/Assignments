import { Router } from 'express';
import { authenticate, requireOrgContext } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import {
  createTaskSchema,
  updateTaskSchema,
  listTasksQuerySchema,
  assignTaskSchema
} from './task.schema';
import {
  listTasksHandler,
  getTaskHandler,
  createTaskHandler,
  updateTaskHandler,
  deleteTaskHandler,
  assignTaskHandler,
  unassignTaskHandler
} from './task.controller';
import commentsRouter from '../comments/comment.routes';

const router = Router();

router.use(authenticate, requireOrgContext);

router.get('/', validate(listTasksQuerySchema, 'query'), listTasksHandler);
router.post('/', validate(createTaskSchema), createTaskHandler);
router.get('/:id', getTaskHandler);
router.patch('/:id', validate(updateTaskSchema), updateTaskHandler);
router.delete('/:id', deleteTaskHandler);

router.post('/:id/assign', validate(assignTaskSchema), assignTaskHandler);
router.delete('/:id/assign/:userId', unassignTaskHandler);

router.use('/:taskId/comments', commentsRouter);

export default router;
