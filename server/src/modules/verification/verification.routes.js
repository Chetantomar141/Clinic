import { Router } from 'express';
import { VerificationController } from './verification.controller.js';
import { verificationLimiter } from '../../middleware/rateLimitMiddleware.js';

const router = Router();

// Public routes, rate-limited to prevent brute forcing patient identifiers
router.post('/', verificationLimiter, VerificationController.verifyCertificate);
router.get('/:certNo', verificationLimiter, VerificationController.queryCertificateExistence);

export default router;
