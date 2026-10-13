import { Router } from 'express';
import { validate } from '../../middleware/validate';
import { createCommentSchema } from './comment.schema';
import { listCommentsHandler, createCommentHandler } from './comment.controller';

const router = Router({ mergeParams: true });

router.get('/', listCommentsHandler);
router.post('/', validate(createCommentSchema), createCommentHandler);

export default router;
