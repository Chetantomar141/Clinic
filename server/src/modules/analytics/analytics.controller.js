import { prisma } from '../../config/prisma.js';
import logger from '../../utils/logger.js';

export class AnalyticsController {
  static async getDashboardStats(req, res) {
    try {
      const { role, clinicId } = req.user;

      // 1. Super Admin Stats
      if (role === 'SUPER_ADMIN') {
        const [
          totalClinics,
          totalDoctors,
          totalPatients,
          totalCertificates,
          activeCertificates,
          revokedCertificates,
          expiredCertificates,
          logsToday,
        ] = await Promise.all([
          prisma.clinic.count(),
          prisma.doctor.count(),
          prisma.patient.count(),
          prisma.certificate.count(),
          prisma.certificate.count({ where: { status: 'ACTIVE' } }),
          prisma.certificate.count({ where: { status: 'REVOKED' } }),
          prisma.certificate.count({ where: { status: 'EXPIRED' } }),
          prisma.verificationlog.count({
            where: {
              timestamp: {
                gte: new Date(new Date().setHours(0, 0, 0, 0)),
              },
            },
          }),
        ]);

        return res.status(200).json({
          totalClinics,
          totalDoctors,
          totalPatients,
          totalCertificates,
          activeCertificates,
          revokedCertificates,
          expiredCertificates,
          verificationsToday: logsToday,
        });
      }

      // 2. Clinic Admin / Doctor / Staff Stats
      if (!clinicId) {
        return res.status(400).json({ error: 'No clinic context' });
      }

      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const monthStart = new Date();
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);

      const [
        totalDoctors,
        totalPatients,
        totalCertificates,
        certToday,
        certMonth,
        activeCertificates,
        revokedCertificates,
        expiredCertificates,
        verificationAttempts,
        verificationSuccess,
      ] = await Promise.all([
        prisma.doctor.count({ where: { clinicId } }),
        prisma.patient.count({ where: { clinicId } }),
        prisma.certificate.count({ where: { clinicId } }),
        prisma.certificate.count({ where: { clinicId, issueDate: { gte: todayStart } } }),
        prisma.certificate.count({ where: { clinicId, issueDate: { gte: monthStart } } }),
        prisma.certificate.count({ where: { clinicId, status: 'ACTIVE' } }),
        prisma.certificate.count({ where: { clinicId, status: 'REVOKED' } }),
        prisma.certificate.count({ where: { clinicId, status: 'EXPIRED' } }),
        prisma.verificationlog.count({ where: { certificate: { clinicId } } }),
        prisma.verificationlog.count({ where: { certificate: { clinicId }, result: 'SUCCESS' } }),
      ]);

      const verificationSuccessRate = verificationAttempts > 0 
        ? Math.round((verificationSuccess / verificationAttempts) * 100)
        : 100;

      // Find most active doctor
      const activeDoctors = await prisma.certificate.groupBy({
        by: ['doctorId'],
        where: { clinicId },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 1,
      });

      let mostActiveDoctor = 'N/A';
      if (activeDoctors.length > 0) {
        const doc = await prisma.doctor.findUnique({
          where: { id: activeDoctors[0].doctorId },
          include: { user: true },
        });
        if (doc) {
          mostActiveDoctor = `Dr. ${doc.user.firstName} ${doc.user.lastName}`;
        }
      }

      return res.status(200).json({
        totalDoctors,
        totalPatients,
        totalCertificates,
        certificatesToday: certToday,
        certificatesThisMonth: certMonth,
        activeCertificates,
        revokedCertificates,
        expiredCertificates,
        verificationSuccessRate,
        mostActiveDoctor,
      });
    } catch (error) {
      logger.error('Get dashboard stats error:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  static async getChartData(req, res) {
    try {
      const { clinicId, role } = req.user;
      const { startDate, endDate } = req.query;

      const dateFilter = {};
      if (startDate) dateFilter.gte = new Date(String(startDate));
      if (endDate) dateFilter.lte = new Date(String(endDate));

      // 1. Certificates issued monthly (last 6 months)
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthlyData = [];

      for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const year = d.getFullYear();
        const month = d.getMonth();

        const startOfMonth = new Date(year, month, 1);
        const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59);

        const count = await prisma.certificate.count({
          where: {
            ...(role !== 'SUPER_ADMIN' && { clinicId: clinicId }),
            issueDate: {
              gte: startOfMonth,
              lte: endOfMonth,
            },
          },
        });

        monthlyData.push({
          name: `${months[month]} ${year}`,
          count,
        });
      }

      // 2. Verification log trends (past 7 days)
      const verificationTrends = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        d.setHours(0, 0, 0, 0);
        
        const nextDay = new Date(d);
        nextDay.setDate(nextDay.getDate() + 1);

        const [success, failed] = await Promise.all([
          prisma.verificationlog.count({
            where: {
              ...(role !== 'SUPER_ADMIN' && { certificate: { clinicId: clinicId } }),
              timestamp: { gte: d, lt: nextDay },
              result: 'SUCCESS',
            },
          }),
          prisma.verificationlog.count({
            where: {
              ...(role !== 'SUPER_ADMIN' && { certificate: { clinicId: clinicId } }),
              timestamp: { gte: d, lt: nextDay },
              result: { not: 'SUCCESS' },
            },
          }),
        ]);

        verificationTrends.push({
          date: d.toLocaleDateString('en-SG', { weekday: 'short', day: 'numeric', month: 'short' }),
          success,
          failed,
        });
      }

      // 3. Doctor performance (certificates count per doctor)
      let doctorPerformance = [];
      if (role !== 'SUPER_ADMIN' && clinicId) {
        const doctors = await prisma.doctor.findMany({
          where: { clinicId: clinicId },
          include: { user: true, _count: { select: { certificate: true } } },
        });
        doctorPerformance = doctors.map((doc) => ({
          name: `Dr. ${doc.user.firstName}`,
          certificates: doc._count?.certificate || 0,
        }));
      }

      // 4. Patient growth trends (cumulative count)
      const patientGrowth = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const endOfMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);

        const count = await prisma.patient.count({
          where: {
            ...(role !== 'SUPER_ADMIN' && { clinicId: clinicId }),
            createdAt: { lte: endOfMonth },
          },
        });

        patientGrowth.push({
          name: months[d.getMonth()],
          patients: count,
        });
      }

      return res.status(200).json({
        monthlyData,
        verificationTrends,
        doctorPerformance,
        patientGrowth,
      });
    } catch (error) {
      logger.error('Get chart data error:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}
