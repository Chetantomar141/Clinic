import { z } from 'zod';
import prisma from '../../config/prisma.js';
import { AuditService } from '../../services/auditService.js';
import logger from '../../utils/logger.js';

const createPatientSchema = z.object({
  fullName: z.string().min(2),
  identifier: z.string().min(3),
  dob: z.string().or(z.date()),
  gender: z.string(),
  phone: z.string(),
  email: z.string().email(),
});

export class PatientsController {
  static async listPatients(req, res) {
    try {
      const clinicId = req.user?.clinicId;
      const isSuperAdmin = req.user?.role === 'SUPER_ADMIN';

      if (!clinicId && !isSuperAdmin) {
        return res.status(400).json({ error: 'No clinic context' });
      }

      const { q } = req.query;
      const searchFilter = q
        ? {
            OR: [
              { fullName: { contains: String(q) } },
              { identifier: { contains: String(q) } },
              { email: { contains: String(q) } },
            ],
          }
        : {};

      const queryOptions = {
        where: {
          ...searchFilter,
        },
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { certificate: true },
          },
        },
      };

      if (!isSuperAdmin) {
        queryOptions.where.clinicId = clinicId;
      }

      const patients = await prisma.patient.findMany(queryOptions);

      return res.status(200).json(patients);
    } catch (error) {
      logger.error('List patients error:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  static async createPatient(req, res) {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) {
        return res.status(400).json({ error: 'No clinic context' });
      }

      const data = createPatientSchema.parse(req.body);

      const existingPatient = await prisma.patient.findFirst({
        where: {
          clinicId,
          identifier: data.identifier,
        },
      });

      if (existingPatient) {
        return res.status(400).json({ error: 'Patient with this identifier already exists in this clinic' });
      }

      const patient = await prisma.patient.create({
        data: {
          clinicId,
          fullName: data.fullName,
          identifier: data.identifier,
          dob: new Date(data.dob),
          gender: data.gender,
          phone: data.phone,
          email: data.email,
        },
      });

      await AuditService.log({
        userId: req.user?.userId,
        clinicId,
        action: 'PATIENT_CREATE',
        targetType: 'PATIENT',
        targetId: patient.id,
        details: `Patient ${data.fullName} registered with ID ${data.identifier}`,
        ipAddress: req.ip || '',
      });

      return res.status(201).json(patient);
    } catch (error) {
      logger.error('Create patient error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Validation failed', details: error.errors });
      }
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  static async getPatientDetails(req, res) {
    try {
      const clinicId = req.user?.clinicId;
      const { id } = req.params;

      if (!clinicId) {
        return res.status(400).json({ error: 'No clinic context' });
      }

      const patient = await prisma.patient.findFirst({
        where: { id, clinicId },
        include: {
          certificate: {
            orderBy: { issueDate: 'desc' },
            include: {
              doctor: {
                include: {
                  user: {
                    select: { firstName: true, lastName: true },
                  },
                },
              },
              certificatefile: true,
            },
          },
        },
      });

      if (!patient) {
        return res.status(404).json({ error: 'Patient not found' });
      }

      const timeline = patient.certificate.map((cert) => ({
        id: cert.id,
        type: 'CERTIFICATE_ISSUED',
        date: cert.issueDate,
        title: `${cert.type.replace(/_/g, ' ')} Issued`,
        description: `Issued by Dr. ${cert.doctor.user.firstName} ${cert.doctor.user.lastName} (MC# ${cert.certificateNumber})`,
        status: cert.status,
        meta: {
          diagnosis: cert.diagnosis,
          durationDays: cert.durationDays,
          startDate: cert.startDate,
          endDate: cert.endDate,
        },
      }));

      const audits = await prisma.auditlog.findMany({
        where: {
          clinicId,
          targetType: 'PATIENT',
          targetId: id,
        },
        orderBy: { timestamp: 'desc' },
      });

      const auditTimeline = audits.map((audit) => ({
        id: audit.id,
        type: audit.action,
        date: audit.timestamp,
        title: audit.action.replace(/_/g, ' '),
        description: audit.details,
        status: 'INFO',
        meta: {},
      }));

      const completeTimeline = [...timeline, ...auditTimeline].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      return res.status(200).json({
        patient,
        timeline: completeTimeline,
      });
    } catch (error) {
      logger.error('Get patient details error:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  static async updatePatient(req, res) {
    try {
      const clinicId = req.user?.clinicId;
      const { id } = req.params;

      if (!clinicId) {
        return res.status(400).json({ error: 'No clinic context' });
      }

      const data = createPatientSchema.partial().parse(req.body);

      const patient = await prisma.patient.findFirst({
        where: { id, clinicId },
      });

      if (!patient) {
        return res.status(404).json({ error: 'Patient not found' });
      }

      const updated = await prisma.patient.update({
        where: { id },
        data: {
          ...data,
          dob: data.dob ? new Date(data.dob) : undefined,
        },
      });

      await AuditService.log({
        userId: req.user?.userId,
        clinicId,
        action: 'PATIENT_UPDATE',
        targetType: 'PATIENT',
        targetId: id,
        details: `Patient details updated: ${JSON.stringify(data)}`,
        ipAddress: req.ip || '',
      });

      return res.status(200).json(updated);
    } catch (error) {
      logger.error('Update patient error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Validation failed', details: error.errors });
      }
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  static async deletePatient(req, res) {
    try {
      const clinicId = req.user?.clinicId;
      const { id } = req.params;

      if (!clinicId) {
        return res.status(400).json({ error: 'No clinic context' });
      }

      const patient = await prisma.patient.findFirst({
        where: { id, clinicId },
      });

      if (!patient) {
        return res.status(404).json({ error: 'Patient not found' });
      }

      await prisma.patient.delete({
        where: { id },
      });

      await AuditService.log({
        userId: req.user?.userId,
        clinicId,
        action: 'PATIENT_DELETE',
        targetType: 'PATIENT',
        targetId: id,
        details: `Patient ${patient.fullName} soft-deleted`,
        ipAddress: req.ip || '',
      });

      return res.status(200).json({ message: 'Patient deleted successfully' });
    } catch (error) {
      logger.error('Delete patient error:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

export default PatientsController;
