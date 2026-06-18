import { Router } from 'express';
import { ClinicsController } from './clinics.controller.js';
import { authenticate, authorize } from '../../middleware/authMiddleware.js';
import { upload } from '../../utils/upload.js';

const router = Router();

router.use(authenticate);

// Clinic Profile Routes
router.get('/profile', authorize(['CLINIC_ADMIN', 'DOCTOR', 'STAFF', 'SUPER_ADMIN']), ClinicsController.getClinicProfile);
router.put('/profile', authorize(['CLINIC_ADMIN']), upload.single('logo'), ClinicsController.updateClinicProfile);

// Super Admin Clinic Routes
router.get('/', authorize(['SUPER_ADMIN']), ClinicsController.listAllClinics);
router.post('/:id/toggle-status', authorize(['SUPER_ADMIN']), ClinicsController.toggleClinicStatus);

export default router;
