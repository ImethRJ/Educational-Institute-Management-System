import 'dotenv/config';
import { PrismaClient, FeeCategory, Gender } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Sector Database Seeding...');

  // 1. Seed Initial System Admin User
  const existingAdmin = await prisma.systemAdmin.findFirst({
    where: { username: 'admin' },
  });

  if (!existingAdmin) {
    const passwordHash = await argon2.hash('Admin@Sector2026');
    await prisma.systemAdmin.create({
      data: {
        username: 'admin',
        email: 'admin@sector.lk',
        fullName: 'Institute Administrator',
        passwordHash,
      },
    });
    console.log('✅ System Admin created (Username: admin, Password: Admin@Sector2026)');
  }

  // 2. Seed Main Branch
  const mainBranch = await prisma.branch.upsert({
    where: { code: 'MAIN' },
    update: {
      name: 'Sector Higher Educational Institute - Panadura',
      address: '3/B Grace Peiris Road, Panadura',
      contactNumber: '0382232299',
    },
    create: {
      code: 'MAIN',
      name: 'Sector Higher Educational Institute - Panadura',
      address: '3/B Grace Peiris Road, Panadura',
      contactNumber: '0382232299',
      isActive: true,
    },
  });
  console.log(`✅ Main Branch seeded: ${mainBranch.name}`);

  // 3. Seed Current Academic Year
  const currentAcademicYear = await prisma.academicYear.upsert({
    where: { id: '00000000-0000-0000-0000-000000002026' },
    update: {
      yearName: '2026',
    },
    create: {
      id: '00000000-0000-0000-0000-000000002026',
      yearName: '2026',
      startDate: new Date('2026-01-01'),
      endDate: new Date('2026-12-31'),
      isCurrent: true,
    },
  });
  console.log(`✅ Current Academic Year seeded: ${currentAcademicYear.yearName}`);

  // 4. Seed Grades 1 to 13 (Sri Lankan Education System)
  const grades = [
    { name: 'Grade 1', numericOrder: 1 },
    { name: 'Grade 2', numericOrder: 2 },
    { name: 'Grade 3', numericOrder: 3 },
    { name: 'Grade 4', numericOrder: 4 },
    { name: 'Grade 5 (Scholarship)', numericOrder: 5 },
    { name: 'Grade 6', numericOrder: 6 },
    { name: 'Grade 7', numericOrder: 7 },
    { name: 'Grade 8', numericOrder: 8 },
    { name: 'Grade 9', numericOrder: 9 },
    { name: 'Grade 10 (O/L)', numericOrder: 10 },
    { name: 'Grade 11 (O/L)', numericOrder: 11 },
    { name: 'Grade 12 (A/L)', numericOrder: 12 },
    { name: 'Grade 13 (A/L)', numericOrder: 13 },
  ];

  for (const g of grades) {
    const existingGrade = await prisma.gradeLevel.findFirst({
      where: { numericOrder: g.numericOrder },
    });
    if (!existingGrade) {
      await prisma.gradeLevel.create({
        data: g,
      });
    }
  }
  console.log('✅ Grades 1 to 13 seeded successfully.');

  // 5. Seed Sample Teachers
  const sampleTeachers = [
    {
      teacherCode: 'TCH-2026-001',
      fullName: 'Sunil Shantha',
      dob: new Date('1985-04-12'),
      gender: 'MALE' as Gender,
      joiningDate: new Date('2024-01-01'),
      nicOrPassport: '851234567V',
      mobileNumber: '0771122334',
      email: 'sunil@sector.lk',
      defaultTuitionCommissionPct: 75.0,
      admissionCommissionType: 'PERCENTAGE' as const,
      admissionCommissionValue: 20.0,
    },
    {
      teacherCode: 'TCH-2026-002',
      fullName: 'Kamani Perera',
      dob: new Date('1990-09-25'),
      gender: 'FEMALE' as Gender,
      joiningDate: new Date('2024-06-01'),
      nicOrPassport: '908765432V',
      mobileNumber: '0714455667',
      email: 'kamani@sector.lk',
      defaultTuitionCommissionPct: 70.0,
      admissionCommissionType: 'FIXED_AMOUNT' as const,
      admissionCommissionValue: 500.0,
    },
  ];

  for (const t of sampleTeachers) {
    await prisma.teacher.upsert({
      where: { teacherCode: t.teacherCode },
      update: {},
      create: t,
    });
  }
  console.log('✅ Sample Teachers seeded successfully.');

  // 6. Seed Sample Students
  const sampleStudents = [
    {
      studentCode: 'SEC-2026-COL-0001',
      fullName: 'Kasun Perera',
      dob: new Date('2008-05-14'),
      gender: 'MALE' as Gender,
      address: '12, Station Road, Panadura',
      mobileNumber: '0771234567',
      email: 'kasun@gmail.com',
      guardianName: 'Suneth Perera',
      guardianRelationship: 'Father',
      guardianMobile: '0719876543',
      guardianEmail: 'suneth@gmail.com',
      feeCategory: 'FULL_FEE' as FeeCategory,
      admissionFeeAmount: 2500,
    },
    {
      studentCode: 'SEC-2026-COL-0002',
      fullName: 'Amali Fernando',
      dob: new Date('2009-08-21'),
      gender: 'FEMALE' as Gender,
      address: '45, Galle Road, Moratuwa',
      mobileNumber: '0782345678',
      email: 'amali@gmail.com',
      guardianName: 'Nimal Fernando',
      guardianRelationship: 'Father',
      guardianMobile: '0702345678',
      feeCategory: 'HALF_FEE' as FeeCategory,
      admissionFeeAmount: 2500,
    },
    {
      studentCode: 'SEC-2026-COL-0003',
      fullName: 'Nuwan Silva',
      dob: new Date('2010-02-11'),
      gender: 'MALE' as Gender,
      address: '78, Temple Lane, Wadduwa',
      mobileNumber: '0763456789',
      guardianName: 'Dilhani Silva',
      guardianRelationship: 'Mother',
      guardianMobile: '0769876543',
      feeCategory: 'NO_FEE' as FeeCategory,
      admissionFeeAmount: 0,
    },
    {
      studentCode: 'SEC-2026-COL-0004',
      fullName: 'Dilani Jayasinghe',
      dob: new Date('2008-11-30'),
      gender: 'FEMALE' as Gender,
      address: '101, Main Street, Panadura',
      mobileNumber: '0754567890',
      guardianName: 'Sarath Jayasinghe',
      guardianRelationship: 'Father',
      guardianMobile: '0759876543',
      feeCategory: 'FULL_FEE' as FeeCategory,
      admissionFeeAmount: 2500,
    },
  ];

  for (const st of sampleStudents) {
    await prisma.student.upsert({
      where: { studentCode: st.studentCode },
      update: {},
      create: st,
    });
  }
  console.log('✅ Sample Students seeded successfully.');

  console.log('✨ Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
