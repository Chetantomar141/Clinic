import { Router } from 'express';
import { PatientsController } from './patients.controller.js';
import { authenticate, authorize } from '../../middleware/authMiddleware.js';

const router = Router();

router.use(authenticate);

router.get('/', authorize(['CLINIC_ADMIN', 'DOCTOR', 'STAFF', 'SUPER_ADMIN']), PatientsController.listPatients);
router.post('/', authorize(['CLINIC_ADMIN', 'DOCTOR', 'STAFF']), PatientsController.createPatient);
router.get('/:id', authorize(['CLINIC_ADMIN', 'DOCTOR', 'STAFF', 'SUPER_ADMIN']), PatientsController.getPatientDetails);
router.put('/:id', authorize(['CLINIC_ADMIN', 'DOCTOR', 'STAFF']), PatientsController.updatePatient);
router.delete('/:id', authorize(['CLINIC_ADMIN']), PatientsController.deletePatient);

export default router;
