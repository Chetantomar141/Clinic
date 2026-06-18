import { prisma } from '../../config/prisma.js';
import logger from '../../utils/logger.js';

export class LogsController {
  // Retrieve Verification Logs with advanced filtering
  static async getVerificationLogs(req, res) {
    try {
      const { clinicId, role } = req.user;
      const { result, q, startDate, endDate } = req.query;

      const filters = {};

      // Data isolation: only Super Admin can see logs across clinics
      if (role !== 'SUPER_ADMIN') {
        if (!clinicId) {
          return res.status(400).json({ error: 'No clinic context' });
        }
        filters.certificate = { clinicId };
      }

      if (result) {
        filters.result = String(result);
      }

      if (q) {
        filters.OR = [
          { ipAddress: { contains: String(q) } },
          { browser: { contains: String(q) } },
          { country: { contains: String(q) } },
          { certificate: { certificateNumber: { contains: String(q) } } },
        ];
      }

      if (startDate || endDate) {
        filters.timestamp = {};
        if (startDate) filters.timestamp.gte = new Date(String(startDate));
        if (endDate) filters.timestamp.lte = new Date(String(endDate));
      }

      const logs = await prisma.verificationlog.findMany({
        where: filters,
        orderBy: { timestamp: 'desc' },
        include: {
          certificate: {
            select: {
              certificateNumber: true,
              patient: { select: { fullName: true } },
            },
          },
        },
      });

      return res.status(200).json(logs);
    } catch (error) {
      logger.error('Get verification logs error:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  // Retrieve Internal Audit logs
  static async getAuditLogs(req, res) {
    try {
      const { clinicId, role } = req.user;
      const { action, q, startDate, endDate } = req.query;

      const filters = {};

      if (role !== 'SUPER_ADMIN') {
        if (!clinicId) {
          return res.status(400).json({ error: 'No clinic context' });
        }
        filters.clinicId = clinicId;
      }

      if (action) {
        filters.action = String(action);
      }

      if (q) {
        filters.OR = [
          { details: { contains: String(q) } },
          { ipAddress: { contains: String(q) } },
          { user: { firstName: { contains: String(q) } } },
          { user: { lastName: { contains: String(q) } } },
        ];
      }

      if (startDate || endDate) {
        filters.timestamp = {};
        if (startDate) filters.timestamp.gte = new Date(String(startDate));
        if (endDate) filters.timestamp.lte = new Date(String(endDate));
      }

      const logs = await prisma.auditlog.findMany({
        where: filters,
        orderBy: { timestamp: 'desc' },
        include: {
          user: {
            select: { firstName: true, lastName: true, email: true, role: true },
          },
        },
      });

      return res.status(200).json(logs);
    } catch (error) {
      logger.error('Get audit logs error:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}
