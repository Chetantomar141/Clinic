import { Router } from 'express';
import { DoctorsController } from './doctors.controller.js';
import { authenticate, authorize } from '../../middleware/authMiddleware.js';
import { upload } from '../../utils/upload.js';

const router = Router();

router.use(authenticate);

router.get('/', authorize(['CLINIC_ADMIN', 'STAFF', 'SUPER_ADMIN']), DoctorsController.listDoctors);
router.post('/', authorize(['CLINIC_ADMIN']), upload.single('signature'), DoctorsController.createDoctor);
router.put('/:id', authorize(['CLINIC_ADMIN']), upload.single('signature'), DoctorsController.updateDoctor);
router.post('/:id/toggle-status', authorize(['CLINIC_ADMIN']), DoctorsController.toggleDoctorStatus);
router.delete('/:id', authorize(['CLINIC_ADMIN']), DoctorsController.deleteDoctor);

export default router;
