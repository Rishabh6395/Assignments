import { Router } from 'express';
import { authRateLimiter } from '../../middleware/rateLimiter';
import { validate } from '../../middleware/validate';
import { registerSchema, loginSchema, refreshSchema, logoutSchema } from './auth.schema';
import {
  registerHandler,
  loginHandler,
  refreshHandler,
  logoutHandler
} from './auth.controller';

const router = Router();

router.use(authRateLimiter);

router.post('/register', validate(registerSchema), registerHandler);
router.post('/login', validate(loginSchema), loginHandler);
router.post('/refresh', validate(refreshSchema), refreshHandler);
router.post('/logout', validate(logoutSchema), logoutHandler);

export default router;
