import { Router } from 'express';
import { authenticate, requireOrgContext, requireRole } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { addMemberSchema } from './org.schema';
import { listMembersHandler, addMemberHandler, removeMemberHandler } from './org.controller';

const router = Router();

router.use(authenticate, requireOrgContext);

router.get('/members', listMembersHandler);
router.post('/members', requireRole('org_admin'), validate(addMemberSchema), addMemberHandler);
router.delete('/members/:userId', requireRole('org_admin'), removeMemberHandler);

export default router;
