import { Router } from 'express';
import { StaffController } from './staff.controller.js';
import { authenticate, authorize } from '../../middleware/authMiddleware.js';

const router = Router();

router.use(authenticate);

router.get('/', authorize(['CLINIC_ADMIN', 'SUPER_ADMIN']), StaffController.listStaff);
router.post('/', authorize(['CLINIC_ADMIN']), StaffController.createStaff);
router.put('/:id', authorize(['CLINIC_ADMIN']), StaffController.updateStaff);
router.post('/:id/toggle-status', authorize(['CLINIC_ADMIN']), StaffController.toggleStaffStatus);
router.delete('/:id', authorize(['CLINIC_ADMIN']), StaffController.deleteStaff);

export default router;
