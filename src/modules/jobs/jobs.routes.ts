import { Router } from 'express';
import { authenticate, requireOrgContext } from '../../middleware/auth';
import { getJobStatusHandler } from './jobs.controller';

const router = Router();

router.use(authenticate, requireOrgContext);
router.get('/:id', getJobStatusHandler);

export default router;
