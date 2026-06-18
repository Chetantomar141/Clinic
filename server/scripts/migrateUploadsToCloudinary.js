import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import prisma from '../src/config/prisma.js';
import {
  uploadCertificatePdf,
  uploadClinicLogo,
  uploadDoctorSignature,
  uploadMedicalReport,
  uploadQrCode,
} from '../src/services/cloudinaryService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..', '..');
const uploadsRoot = path.join(projectRoot, 'uploads');

const toLocalPath = (assetUrl) => {
  if (!assetUrl || !assetUrl.startsWith('/uploads/')) return null;
  return path.join(projectRoot, assetUrl.replace(/^\//, ''));
};

const exists = async (filePath) => {
  if (!filePath) return false;
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
};

const report = {
  clinics: { uploaded: 0, skipped: 0 },
  doctors: { uploaded: 0, skipped: 0 },
  certificates: { uploadedPdfs: 0, uploadedQr: 0, skipped: 0 },
  certificateFiles: { uploaded: 0, skipped: 0 },
};

const migrateClinics = async () => {
  const clinics = await prisma.clinic.findMany({
    where: { logoUrl: { startsWith: '/uploads/' } },
  });

  for (const clinic of clinics) {
    const localPath = toLocalPath(clinic.logoUrl);
    if (!(await exists(localPath))) {
      report.clinics.skipped += 1;
      continue;
    }

    const asset = await uploadClinicLogo(localPath);
    await prisma.clinic.update({
      where: { id: clinic.id },
      data: { logoUrl: asset.secureUrl, logoPublicId: asset.publicId },
    });
    report.clinics.uploaded += 1;
  }
};

const migrateDoctors = async () => {
  const doctors = await prisma.doctor.findMany({
    where: { signatureUrl: { startsWith: '/uploads/' } },
  });

  for (const doctor of doctors) {
    const localPath = toLocalPath(doctor.signatureUrl);
    if (!(await exists(localPath))) {
      report.doctors.skipped += 1;
      continue;
    }

    const asset = await uploadDoctorSignature(localPath);
    await prisma.doctor.update({
      where: { id: doctor.id },
      data: { signatureUrl: asset.secureUrl, signaturePublicId: asset.publicId },
    });
    report.doctors.uploaded += 1;
  }
};

const migrateCertificates = async () => {
  const certificates = await prisma.certificate.findMany({
    where: {
      OR: [
        { pdfUrl: { startsWith: '/uploads/' } },
        { qrUrl: { startsWith: '/uploads/' } },
      ],
    },
  });

  for (const certificate of certificates) {
    const data = {};

    const pdfPath = toLocalPath(certificate.pdfUrl);
    if (await exists(pdfPath)) {
      const asset = await uploadCertificatePdf(pdfPath);
      data.pdfUrl = asset.secureUrl;
      data.pdfPublicId = asset.publicId;
      report.certificates.uploadedPdfs += 1;
    }

    const qrPath = toLocalPath(certificate.qrUrl);
    if (await exists(qrPath)) {
      const asset = await uploadQrCode(qrPath);
      data.qrUrl = asset.secureUrl;
      data.qrPublicId = asset.publicId;
      report.certificates.uploadedQr += 1;
    }

    if (Object.keys(data).length === 0) {
      report.certificates.skipped += 1;
      continue;
    }

    await prisma.certificate.update({
      where: { id: certificate.id },
      data,
    });
  }
};

const migrateCertificateFiles = async () => {
  const files = await prisma.certificatefile.findMany({
    where: { fileUrl: { startsWith: '/uploads/' } },
  });

  for (const file of files) {
    const localPath = toLocalPath(file.fileUrl);
    if (!(await exists(localPath))) {
      report.certificateFiles.skipped += 1;
      continue;
    }

    const isPdf = path.extname(localPath).toLowerCase() === '.pdf';
    const asset = isPdf ? await uploadCertificatePdf(localPath) : await uploadMedicalReport(localPath);
    await prisma.certificatefile.update({
      where: { id: file.id },
      data: { fileUrl: asset.secureUrl, filePublicId: asset.publicId },
    });
    report.certificateFiles.uploaded += 1;
  }
};

const main = async () => {
  await fs.access(uploadsRoot);
  await migrateClinics();
  await migrateDoctors();
  await migrateCertificates();
  await migrateCertificateFiles();

  const reportPath = path.join(projectRoot, 'cloudinary-migration-report.json');
  await fs.writeFile(reportPath, JSON.stringify({ generatedAt: new Date().toISOString(), report }, null, 2));
  console.log(`Cloudinary migration complete. Report saved to ${reportPath}`);
};

main()
  .catch((error) => {
    console.error('Cloudinary migration failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
