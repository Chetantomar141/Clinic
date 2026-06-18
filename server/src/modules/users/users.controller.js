import bcrypt from 'bcrypt';
import { z } from 'zod';
import prisma from '../../config/prisma.js';
import { AuditService } from '../../services/auditService.js';
import logger from '../../utils/logger.js';

const changePasswordSchema = z.object({
  currentPassword: z.string(),
  newPassword: z.string().min(6),
});

export class UsersController {
  static async getMe(req, res) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const user = await prisma.user.findUnique({
        where: { id: req.user.userId },
        include: {
          clinic: true,
          doctor: true,
          staff: true,
        },
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      return res.status(200).json({
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        clinic: user.clinic,
        doctor: user.doctor,
        staff: user.staff,
      });
    } catch (error) {
      logger.error('Get profile error:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  static async changePassword(req, res) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);

      const user = await prisma.user.findUnique({
        where: { id: req.user.userId },
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const passwordMatch = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!passwordMatch) {
        return res.status(400).json({ error: 'Current password does not match' });
      }

      const newPasswordHash = await bcrypt.hash(newPassword, 12);
      await prisma.user.update({
        where: { id: user.id },
        data: { passwordHash: newPasswordHash },
      });

      await AuditService.log({
        userId: user.id,
        clinicId: user.clinicId,
        action: 'PASSWORD_CHANGE',
        targetType: 'USER',
        targetId: user.id,
        details: `User password updated`,
        ipAddress: req.ip || '',
      });

      return res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
      logger.error('Change password error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Validation failed', details: error.errors });
      }
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

export default UsersController;
