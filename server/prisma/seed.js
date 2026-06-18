import prisma from '../src/config/prisma.js';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

const rawPrisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clear existing data to allow re-seeding using a clean PrismaClient to bypass soft-delete logic
  await rawPrisma.auditlog.deleteMany({});
  await rawPrisma.verificationlog.deleteMany({});
  await rawPrisma.certificatefile.deleteMany({});
  await rawPrisma.certificate.deleteMany({});
  await rawPrisma.session.deleteMany({});
  await rawPrisma.staff.deleteMany({});
  await rawPrisma.doctor.deleteMany({});
  await rawPrisma.user.deleteMany({});
  await rawPrisma.patient.deleteMany({});
  await rawPrisma.setting.deleteMany({});
  await rawPrisma.subscription.deleteMany({});
  await rawPrisma.clinic.deleteMany({});
  await rawPrisma.notification.deleteMany({});

  // 1. Create Super Admin User
  const superAdminPasswordHash = await bcrypt.hash('superpassword', 12);
  const superAdmin = await prisma.user.upsert({
    where: { email: 'superadmin@healthverify.com' },
    update: {},
    create: {
      email: 'superadmin@healthverify.com',
      passwordHash: superAdminPasswordHash,
      role: 'SUPER_ADMIN',
      firstName: 'System',
      lastName: 'Administrator',
      phone: '+65 8000 0000',
    },
  });
  console.log('Super Admin user created:', superAdmin.email);

  // 2. Create Mount Elizabeth Clinic
  const clinic = await prisma.clinic.create({
    data: {
      name: 'Mount Elizabeth Medical Center',
      email: 'contact@mtelizabeth.com.sg',
      contactNumber: '+65 6737 2633',
      address: '3 Mount Elizabeth, Singapore 228510',
      logoUrl: null,
      logoPublicId: null,
      themeConfig: JSON.stringify({
        primaryColor: '#0F6FFF',
        secondaryColor: '#00C896',
        borderRadius: '8px',
      }),
    },
  });
  console.log('Clinic created:', clinic.name);

  // 3. Create Subscription
  const startDate = new Date();
  const endDate = new Date();
  endDate.setFullYear(endDate.getFullYear() + 1);

  await prisma.subscription.create({
    data: {
      clinicId: clinic.id,
      planName: 'Enterprise Premium Plan',
      status: 'ACTIVE',
      price: 1999.00,
      startDate,
      endDate,
    },
  });

  // 4. Create Clinic Admin
  const adminPasswordHash = await bcrypt.hash('clinicpassword', 12);
  const clinicAdmin = await prisma.user.create({
    data: {
      email: 'clinicadmin@mtelizabeth.com',
      passwordHash: adminPasswordHash,
      role: 'CLINIC_ADMIN',
      firstName: 'Sarah',
      lastName: 'Lim',
      phone: '+65 9111 2222',
      clinicId: clinic.id,
    },
  });
  console.log('Clinic Admin created:', clinicAdmin.email);

  // 5. Create Doctor
  const doctorPasswordHash = await bcrypt.hash('doctorpassword', 12);
  const doctorUser = await prisma.user.create({
    data: {
      email: 'doctor@mtelizabeth.com',
      passwordHash: doctorPasswordHash,
      role: 'DOCTOR',
      firstName: 'Alexander',
      lastName: 'Tan',
      phone: '+65 9222 3333',
      clinicId: clinic.id,
    },
  });

  const doctor = await prisma.doctor.create({
    data: {
      userId: doctorUser.id,
      clinicId: clinic.id,
      licenseNumber: 'MCR-98765-X',
      specialization: 'Cardiology & General Medicine',
      signatureUrl: null,
      signaturePublicId: null,
    },
  });
  console.log('Doctor created:', doctorUser.email, 'License:', doctor.licenseNumber);

  // 6. Create Staff
  const staffPasswordHash = await bcrypt.hash('staffpassword', 12);
  const staffUser = await prisma.user.create({
    data: {
      email: 'staff@mtelizabeth.com',
      passwordHash: staffPasswordHash,
      role: 'STAFF',
      firstName: 'Jane',
      lastName: 'Tan',
      phone: '+65 9333 4444',
      clinicId: clinic.id,
    },
  });

  const staff = await prisma.staff.create({
    data: {
      userId: staffUser.id,
      clinicId: clinic.id,
      position: 'Clinic Executive Nurse',
    },
  });
  console.log('Staff created:', staffUser.email);

  // 7. Create Patients
  const patient1 = await prisma.patient.create({
    data: {
      clinicId: clinic.id,
      fullName: 'Sukwindir Kaur',
      identifier: 'S1234567A',
      dob: new Date('1985-05-15'),
      gender: 'Female',
      phone: '+65 9876 5432',
      email: 'sukwindir@gmail.com',
    },
  });

  const patient2 = await prisma.patient.create({
    data: {
      clinicId: clinic.id,
      fullName: 'John Doe',
      identifier: 'K9876543',
      dob: new Date('1990-11-20'),
      gender: 'Male',
      phone: '+65 9012 3456',
      email: 'johndoe@gmail.com',
    },
  });
  console.log('Patients created:', patient1.fullName, ',', patient2.fullName);

  // 8. Create Certificates
  const cert1IssueDate = new Date();
  cert1IssueDate.setHours(10, 0, 0, 0);

  const cert1StartDate = new Date(cert1IssueDate);
  const cert1EndDate = new Date(cert1IssueDate);
  cert1EndDate.setDate(cert1EndDate.getDate() + 1); // 2 days

  const rawHashString = `MC-2026-000001${patient1.id}${doctor.id}${cert1IssueDate.toISOString()}supersecretmedicalverificationkey2026`;
  const verificationHash = crypto.createHash('sha256').update(rawHashString).digest('hex');

  const cert1 = await prisma.certificate.create({
    data: {
      certificateNumber: 'MC-2026-000001',
      clinicId: clinic.id,
      doctorId: doctor.id,
      patientId: patient1.id,
      type: 'MEDICAL_CERTIFICATE',
      issueDate: cert1IssueDate,
      startDate: cert1StartDate,
      endDate: cert1EndDate,
      durationDays: 2,
      diagnosis: 'Acute Gastroenteritis with Dehydration',
      remarks: 'Patient advised to rest at home and drink plenty of fluids.',
      status: 'ACTIVE',
      qrCodeUrl: `http://localhost:5173/verify/MC-2026-000001`,
      qrUrl: null,
      qrPublicId: null,
      pdfUrl: null,
      pdfPublicId: null,
      verificationHash,
    },
  });

  await prisma.certificatefile.create({
    data: {
      certificateId: cert1.id,
      fileUrl: 'seed-certificate-placeholder',
      filePublicId: null,
      fileType: 'PDF',
    },
  });

  // Create audit log for certificate creation
  await prisma.auditlog.create({
    data: {
      userId: doctorUser.id,
      clinicId: clinic.id,
      action: 'CERTIFICATE_CREATE',
      targetType: 'CERTIFICATE',
      targetId: cert1.id,
      details: 'Initial Seed MC generated for Sukwindir Kaur',
      ipAddress: '127.0.0.1',
    },
  });

  console.log('Seed Certificate created:', cert1.certificateNumber);
  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await rawPrisma.$disconnect();
  });
