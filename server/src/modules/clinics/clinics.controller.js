import { z } from 'zod';
import prisma from '../../config/prisma.js';
import { AuditService } from '../../services/auditService.js';
import { cleanupUploadedFile, deleteAsset, uploadClinicLogo } from '../../services/cloudinaryService.js';
import logger from '../../utils/logger.js';

const updateClinicSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  contactNumber: z.string().optional(),
  address: z.string().optional(),
  themeConfig: z.string().optional(),
});

export class ClinicsController {
  static async getClinicProfile(req, res) {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) {
        return res.status(400).json({ error: 'No clinic context' });
      }

      const clinic = await prisma.clinic.findUnique({
        where: { id: clinicId },
        include: {
          subscription: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      });

      if (!clinic) {
        return res.status(404).json({ error: 'Clinic not found' });
      }

      return res.status(200).json(clinic);
    } catch (error) {
      logger.error('Get clinic profile error:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  static async updateClinicProfile(req, res) {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) {
        return res.status(400).json({ error: 'No clinic context' });
      }

      const updateData = updateClinicSchema.parse(req.body);
      
      const previousClinic = await prisma.clinic.findUnique({
        where: { id: clinicId },
        select: { logoPublicId: true },
      });

      let logoAsset = null;
      if (req.file) {
        logoAsset = await uploadClinicLogo(req.file.path);
        await cleanupUploadedFile(req.file.path);
      }

      const clinic = await prisma.clinic.update({
        where: { id: clinicId },
        data: {
          ...updateData,
          ...(logoAsset && { logoUrl: logoAsset.secureUrl, logoPublicId: logoAsset.publicId }),
        },
      });

      if (logoAsset && previousClinic?.logoPublicId) {
        await deleteAsset(previousClinic.logoPublicId, 'image');
      }

      await AuditService.log({
        userId: req.user?.userId,
        clinicId,
        action: 'CLINIC_UPDATE',
        targetType: 'CLINIC',
        targetId: clinicId,
        details: `Clinic profile updated: ${JSON.stringify(updateData)}`,
        ipAddress: req.ip || '',
      });

      return res.status(200).json({
        message: 'Clinic profile updated successfully',
        clinic,
      });
    } catch (error) {
      await cleanupUploadedFile(req.file?.path);
      logger.error('Update clinic profile error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Validation failed', details: error.errors });
      }
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  static async listAllClinics(req, res) {
    try {
      const clinics = await prisma.clinic.findMany({
        include: {
          user: {
            where: { role: 'CLINIC_ADMIN' },
            select: { id: true, email: true, firstName: true, lastName: true, isSuspended: true },
          },
          subscription: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      });

      const mappedClinics = clinics.map((clinic) => ({
        ...clinic,
        users: clinic.user || [],
        subscriptions: clinic.subscription || [],
      }));

      return res.status(200).json(mappedClinics);
    } catch (error) {
      logger.error('List clinics error:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  static async toggleClinicStatus(req, res) {
    try {
      const { id } = req.params;
      const { suspend } = z.object({ suspend: z.boolean() }).parse(req.body);

      const clinic = await prisma.clinic.findUnique({
        where: { id },
      });

      if (!clinic) {
        return res.status(404).json({ error: 'Clinic not found' });
      }

      await prisma.$transaction(async (tx) => {
        await tx.user.updateMany({
          where: { clinicId: id },
          data: { isSuspended: suspend },
        });
        
        await tx.doctor.updateMany({
          where: { clinicId: id },
          data: { isSuspended: suspend },
        });

        await tx.staff.updateMany({
          where: { clinicId: id },
          data: { isSuspended: suspend },
        });
      });

      await AuditService.log({
        userId: req.user?.userId,
        clinicId: null,
        action: suspend ? 'CLINIC_SUSPEND' : 'CLINIC_ACTIVATE',
        targetType: 'CLINIC',
        targetId: id,
        details: `Clinic ${clinic.name} ${suspend ? 'suspended' : 'activated'} by Super Admin`,
        ipAddress: req.ip || '',
      });

      return res.status(200).json({
        message: `Clinic has been successfully ${suspend ? 'suspended' : 'activated'}.`,
      });
    } catch (error) {
      logger.error('Toggle clinic status error:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

export default ClinicsController;
