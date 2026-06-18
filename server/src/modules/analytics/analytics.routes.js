import { Router } from 'express';
import { AnalyticsController } from './analytics.controller.js';
import { LogsController } from './logs.controller.js';
import { authenticate, authorize } from '../../middleware/authMiddleware.js';

const router = Router();

router.use(authenticate);

router.get('/stats', authorize(['CLINIC_ADMIN', 'DOCTOR', 'STAFF', 'SUPER_ADMIN']), AnalyticsController.getDashboardStats);
router.get('/charts', authorize(['CLINIC_ADMIN', 'DOCTOR', 'SUPER_ADMIN']), AnalyticsController.getChartData);
router.get('/verification-logs', authorize(['CLINIC_ADMIN', 'SUPER_ADMIN']), LogsController.getVerificationLogs);
router.get('/audit-logs', authorize(['CLINIC_ADMIN', 'SUPER_ADMIN']), LogsController.getAuditLogs);

export default router;
