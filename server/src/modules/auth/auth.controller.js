import bcrypt from 'bcrypt';
import { z } from 'zod';
import prisma from '../../config/prisma.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../../utils/jwt.js';
import { AuditService } from '../../services/auditService.js';
import logger from '../../utils/logger.js';

// Zod Schemas
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const registerSchema = z.object({
  clinicName: z.string().min(2),
  clinicEmail: z.string().email(),
  clinicPhone: z.string(),
  clinicAddress: z.string(),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  adminEmail: z.string().email(),
  adminPassword: z.string().min(6),
  adminPhone: z.string().optional(),
});

export class AuthController {
  static async login(req, res) {
    try {
      const { email, password } = loginSchema.parse(req.body);
      
      const user = await prisma.user.findUnique({
        where: { email },
        include: { clinic: true },
      });

      if (!user || user.isSuspended || user.deletedAt) {
        return res.status(401).json({ error: 'Invalid email/password or account suspended' });
      }

      const passwordMatch = await bcrypt.compare(password, user.passwordHash);
      if (!passwordMatch) {
        return res.status(401).json({ error: 'Invalid email/password' });
      }

      const payload = {
        userId: user.id,
        email: user.email,
        role: user.role,
        clinicId: user.clinicId,
      };

      const accessToken = generateAccessToken(payload);
      const refreshToken = generateRefreshToken(payload);

      // Save session in DB
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiration

      await prisma.session.create({
        data: {
          userId: user.id,
          token: refreshToken,
          expiresAt,
        },
      });

      // Audit Log
      await AuditService.log({
        userId: user.id,
        clinicId: user.clinicId,
        action: 'LOGIN',
        targetType: 'USER',
        targetId: user.id,
        details: `User logged in from IP ${req.ip}`,
        ipAddress: req.ip || '',
      });

      return res.status(200).json({
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
          clinic: user.clinic ? {
            id: user.clinic.id,
            name: user.clinic.name,
            logoUrl: user.clinic.logoUrl,
          } : null,
        },
      });
    } catch (error) {
      logger.error('Login error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Validation failed', details: error.errors });
      }
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  static async registerClinic(req, res) {
    try {
      const data = registerSchema.parse(req.body);

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: data.adminEmail },
      });

      if (existingUser) {
        return res.status(400).json({ error: 'Email already registered' });
      }

      // Execute inside transaction for atomicity
      const result = await prisma.$transaction(async (tx) => {
        // 1. Create Clinic
        const clinic = await tx.clinic.create({
          data: {
            name: data.clinicName,
            email: data.clinicEmail,
            contactNumber: data.clinicPhone,
            address: data.clinicAddress,
          },
        });

        // 2. Hash Password
        const passwordHash = await bcrypt.hash(data.adminPassword, 12);

        // 3. Create Admin User
        const admin = await tx.user.create({
          data: {
            email: data.adminEmail,
            passwordHash,
            firstName: data.firstName,
            lastName: data.lastName,
            phone: data.adminPhone || null,
            role: 'CLINIC_ADMIN',
            clinicId: clinic.id,
          },
        });

        // 4. Create Active Subscription Plan
        const startDate = new Date();
        const endDate = new Date();
        endDate.setFullYear(endDate.getFullYear() + 1); // 1 year plan
        
        await tx.subscription.create({
          data: {
            clinicId: clinic.id,
            planName: 'Enterprise Trial',
            status: 'ACTIVE',
            price: 0.00,
            startDate,
            endDate,
          },
        });

        return { clinic, admin };
      });

      // Audit Log
      await AuditService.log({
        userId: result.admin.id,
        clinicId: result.clinic.id,
        action: 'CLINIC_REGISTER',
        targetType: 'CLINIC',
        targetId: result.clinic.id,
        details: `Clinic ${data.clinicName} and Admin ${data.adminEmail} registered.`,
        ipAddress: req.ip || '',
      });

      return res.status(201).json({
        message: 'Clinic registered successfully. Please sign in.',
        clinicId: result.clinic.id,
      });
    } catch (error) {
      logger.error('Registration error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Validation failed', details: error.errors });
      }
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  static async refreshToken(req, res) {
    try {
      const { refreshToken } = z.object({ refreshToken: z.string() }).parse(req.body);

      // Verify token signature
      const decoded = verifyRefreshToken(refreshToken);

      // Check session in DB
      const session = await prisma.session.findUnique({
        where: { token: refreshToken },
        include: { user: true },
      });

      if (!session || session.revokedAt || session.expiresAt < new Date()) {
        return res.status(401).json({ error: 'Invalid or expired session' });
      }

      if (session.user.isSuspended || session.user.deletedAt) {
        return res.status(401).json({ error: 'User is suspended or deleted' });
      }

      const payload = {
        userId: session.user.id,
        email: session.user.email,
        role: session.user.role,
        clinicId: session.user.clinicId,
      };

      const newAccessToken = generateAccessToken(payload);
      
      return res.status(200).json({
        accessToken: newAccessToken,
      });
    } catch (error) {
      logger.error('Refresh token error:', error);
      return res.status(401).json({ error: 'Invalid refresh token' });
    }
  }

  static async logout(req, res) {
    try {
      const { refreshToken } = z.object({ refreshToken: z.string() }).parse(req.body);

      await prisma.session.update({
        where: { token: refreshToken },
        data: { revokedAt: new Date() },
      });

      if (req.user) {
        await AuditService.log({
          userId: req.user.userId,
          clinicId: req.user.clinicId,
          action: 'LOGOUT',
          targetType: 'USER',
          targetId: req.user.userId,
          details: `User logged out`,
          ipAddress: req.ip || '',
        });
      }

      return res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
      logger.error('Logout error:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

export default AuthController;
