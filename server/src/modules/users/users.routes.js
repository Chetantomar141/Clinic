import { Router } from 'express';
import { UsersController } from './users.controller.js';
import { authenticate } from '../../middleware/authMiddleware.js';

const router = Router();

router.use(authenticate);

router.get('/me', UsersController.getMe);
router.post('/change-password', UsersController.changePassword);

export default router;
