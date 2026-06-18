import { Router } from 'express';
import { AuthController } from './auth.controller.js';
import { authLimiter } from '../../middleware/rateLimitMiddleware.js';
import { authenticate, authorize } from '../../middleware/authMiddleware.js';

const router = Router();

router.post('/login', authLimiter, AuthController.login);
router.post('/register', authenticate, authorize(['SUPER_ADMIN']), AuthController.registerClinic);
router.post('/refresh', AuthController.refreshToken);
router.post('/logout', AuthController.logout);

export default router;
