import bcrypt from 'bcrypt';
import { z } from 'zod';
import prisma from '../../config/prisma.js';
import { AuditService } from '../../services/auditService.js';
import logger from '../../utils/logger.js';

const createStaffSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  phone: z.string().optional(),
  position: z.string().min(2),
});

const updateStaffSchema = z.object({
  firstName: z.string().min(2).optional(),
  lastName: z.string().min(2).optional(),
  phone: z.string().optional(),
  position: z.string().min(2).optional(),
});

export class StaffController {
  static async listStaff(req, res) {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) {
        return res.status(400).json({ error: 'No clinic context' });
      }

      const staff = await prisma.staff.findMany({
        where: { clinicId },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              phone: true,
              isSuspended: true,
            },
          },
        },
      });

      return res.status(200).json(staff);
    } catch (error) {
      logger.error('List staff error:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  static async createStaff(req, res) {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) {
        return res.status(400).json({ error: 'No clinic context' });
      }

      const data = createStaffSchema.parse(req.body);

      const existingUser = await prisma.user.findUnique({
        where: { email: data.email },
      });
      if (existingUser) {
        return res.status(400).json({ error: 'Email already registered' });
      }

      const result = await prisma.$transaction(async (tx) => {
        const passwordHash = await bcrypt.hash(data.password, 12);
        
        const user = await tx.user.create({
          data: {
            email: data.email,
            passwordHash,
            firstName: data.firstName,
            lastName: data.lastName,
            phone: data.phone || null,
            role: 'STAFF',
            clinicId,
          },
        });

        const staff = await tx.staff.create({
          data: {
            userId: user.id,
            clinicId,
            position: data.position,
          },
        });

        return { user, staff };
      });

      await AuditService.log({
        userId: req.user?.userId,
        clinicId,
        action: 'STAFF_CREATE',
        targetType: 'STAFF',
        targetId: result.staff.id,
        details: `Staff ${data.firstName} ${data.lastName} registered as ${data.position}`,
        ipAddress: req.ip || '',
      });

      return res.status(201).json({
        message: 'Staff created successfully',
        staff: result.staff,
      });
    } catch (error) {
      logger.error('Create staff error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Validation failed', details: error.errors });
      }
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  static async updateStaff(req, res) {
    try {
      const clinicId = req.user?.clinicId;
      const { id } = req.params;

      if (!clinicId) {
        return res.status(400).json({ error: 'No clinic context' });
      }

      const data = updateStaffSchema.parse(req.body);

      const staff = await prisma.staff.findFirst({
        where: { id, clinicId },
      });

      if (!staff) {
        return res.status(404).json({ error: 'Staff not found' });
      }

      const updated = await prisma.$transaction(async (tx) => {
        const updatedStaff = await tx.staff.update({
          where: { id },
          data: { position: data.position || staff.position },
        });

        await tx.user.update({
          where: { id: staff.userId },
          data: {
            firstName: data.firstName || undefined,
            lastName: data.lastName || undefined,
            phone: data.phone || undefined,
          },
        });

        return updatedStaff;
      });

      await AuditService.log({
        userId: req.user?.userId,
        clinicId,
        action: 'STAFF_UPDATE',
        targetType: 'STAFF',
        targetId: id,
        details: `Staff profile updated: ${JSON.stringify(data)}`,
        ipAddress: req.ip || '',
      });

      return res.status(200).json({
        message: 'Staff updated successfully',
        staff: updated,
      });
    } catch (error) {
      logger.error('Update staff error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Validation failed', details: error.errors });
      }
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  static async toggleStaffStatus(req, res) {
    try {
      const clinicId = req.user?.clinicId;
      const { id } = req.params;
      const { suspend } = z.object({ suspend: z.boolean() }).parse(req.body);

      if (!clinicId) {
        return res.status(400).json({ error: 'No clinic context' });
      }

      const staff = await prisma.staff.findFirst({
        where: { id, clinicId },
      });

      if (!staff) {
        return res.status(404).json({ error: 'Staff not found' });
      }

      await prisma.$transaction(async (tx) => {
        await tx.staff.update({
          where: { id },
          data: { isSuspended: suspend },
        });

        await tx.user.update({
          where: { id: staff.userId },
          data: { isSuspended: suspend },
        });
      });

      await AuditService.log({
        userId: req.user?.userId,
        clinicId,
        action: suspend ? 'STAFF_SUSPEND' : 'STAFF_ACTIVATE',
        targetType: 'STAFF',
        targetId: id,
        details: `Staff status updated. Suspended: ${suspend}`,
        ipAddress: req.ip || '',
      });

      return res.status(200).json({ message: `Staff has been ${suspend ? 'suspended' : 'activated'} successfully` });
    } catch (error) {
      logger.error('Toggle staff status error:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  static async deleteStaff(req, res) {
    try {
      const clinicId = req.user?.clinicId;
      const { id } = req.params;

      if (!clinicId) {
        return res.status(400).json({ error: 'No clinic context' });
      }

      const staff = await prisma.staff.findFirst({
        where: { id, clinicId },
      });

      if (!staff) {
        return res.status(404).json({ error: 'Staff not found' });
      }

      await prisma.$transaction(async (tx) => {
        await tx.staff.delete({ where: { id } });
        await tx.user.delete({ where: { id: staff.userId } });
      });

      await AuditService.log({
        userId: req.user?.userId,
        clinicId,
        action: 'STAFF_DELETE',
        targetType: 'STAFF',
        targetId: id,
        details: `Staff soft-deleted`,
        ipAddress: req.ip || '',
      });

      return res.status(200).json({ message: 'Staff deleted successfully' });
    } catch (error) {
      logger.error('Delete staff error:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

export default StaffController;
