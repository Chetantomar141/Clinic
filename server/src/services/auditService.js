import prisma from '../config/prisma.js';
import logger from '../utils/logger.js';

export class AuditService {
  static async log(params) {
    try {
      const log = await prisma.auditlog.create({
        data: {
          userId: params.userId || null,
          clinicId: params.clinicId || null,
          action: params.action,
          targetType: params.targetType,
          targetId: params.targetId || null,
          details: params.details,
          ipAddress: params.ipAddress,
        },
      });
      logger.info(`Audit Log Created: [${params.action}] by User [${params.userId || 'System/Guest'}] on [${params.targetType} - ${params.targetId || 'N/A'}]`);
      return log;
    } catch (error) {
      logger.error('Failed to create audit log:', error);
    }
  }
}
export default AuditService;
