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

  // Fetch grade level IDs for linking subjects
  const g11 = await prisma.gradeLevel.findFirst({ where: { numericOrder: 11 } });
  const g13 = await prisma.gradeLevel.findFirst({ where: { numericOrder: 13 } });

  // 4b. Seed Open Academic Subjects
  const sampleSubjects = [
    {
      code: 'MATH',
      name: 'Mathematics',
      standardMonthlyFee: 2800.0,
    },
    {
      code: 'SCI',
      name: 'Science',
      standardMonthlyFee: 2800.0,
    },
    {
      code: 'ENG',
      name: 'English Language',
      standardMonthlyFee: 2500.0,
    },
    {
      code: 'HIST',
      name: 'History',
      standardMonthlyFee: 2500.0,
    },
    {
      code: 'CMATH',
      name: 'Combined Mathematics',
      standardMonthlyFee: 3500.0,
    },
    {
      code: 'PHY',
      name: 'Physics',
      standardMonthlyFee: 3500.0,
    },
    {
      code: 'CHEM',
      name: 'Chemistry',
      standardMonthlyFee: 3500.0,
    },
    {
      code: 'ICT',
      name: 'Information & Communication Technology',
      standardMonthlyFee: 3200.0,
    },
  ];

  for (const sub of sampleSubjects) {
    await prisma.subject.upsert({
      where: { code: sub.code },
      update: { name: sub.name, standardMonthlyFee: sub.standardMonthlyFee },
      create: sub,
    });
  }
  console.log('✅ Open Academic Subjects seeded successfully.');

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

  // 6. Seed Sample Students & Guardians
  const sampleStudents = [
    {
      studentCode: 'SEC-2026-COL-0001',
      branchId: mainBranch.id,
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
      branchId: mainBranch.id,
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
      branchId: mainBranch.id,
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
      branchId: mainBranch.id,
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
    const student = await prisma.student.upsert({
      where: { studentCode: st.studentCode },
      update: { branchId: st.branchId },
      create: st,
    });

    if (st.guardianName && st.guardianMobile) {
      // Find or create normalized Guardian
      let guardian = await prisma.guardian.findFirst({
        where: { mobileNumber: st.guardianMobile },
      });

      if (!guardian) {
        guardian = await prisma.guardian.create({
          data: {
            fullName: st.guardianName,
            mobileNumber: st.guardianMobile,
            email: st.guardianEmail,
            address: st.address,
          },
        });
      }

      // Link Student & Guardian
      await prisma.studentGuardian.upsert({
        where: {
          studentId_guardianId: {
            studentId: student.id,
            guardianId: guardian.id,
          },
        },
        update: {},
        create: {
          studentId: student.id,
          guardianId: guardian.id,
          relationship: st.guardianRelationship || 'Parent',
          isPrimary: true,
        },
      });
    }
  }
  console.log('✅ Sample Students & Guardians seeded successfully.');

  // 7. Seed Sample Teacher Subjects & Batch Classes
  const teacherSunil = await prisma.teacher.findUnique({ where: { teacherCode: 'TCH-2026-001' } });
  const teacherKamani = await prisma.teacher.findUnique({ where: { teacherCode: 'TCH-2026-002' } });

  const subjectCMath = await prisma.subject.findUnique({ where: { code: 'CMATH-A/L' } });
  const subjectPhysics = await prisma.subject.findUnique({ where: { code: 'PHY-A/L' } });
  const subjectScience = await prisma.subject.findUnique({ where: { code: 'SCI-G11' } });

  // Link TeacherSubjects
  if (teacherSunil && subjectCMath) {
    await prisma.teacherSubject.upsert({
      where: { teacherId_subjectId: { teacherId: teacherSunil.id, subjectId: subjectCMath.id } },
      update: {},
      create: { teacherId: teacherSunil.id, subjectId: subjectCMath.id, customTuitionCommissionPct: 75.0 },
    });
  }

  if (teacherKamani && subjectPhysics) {
    await prisma.teacherSubject.upsert({
      where: { teacherId_subjectId: { teacherId: teacherKamani.id, subjectId: subjectPhysics.id } },
      update: {},
      create: { teacherId: teacherKamani.id, subjectId: subjectPhysics.id, customTuitionCommissionPct: 70.0 },
    });
  }

  if (teacherKamani && subjectScience) {
    await prisma.teacherSubject.upsert({
      where: { teacherId_subjectId: { teacherId: teacherKamani.id, subjectId: subjectScience.id } },
      update: {},
      create: { teacherId: teacherKamani.id, subjectId: subjectScience.id, customTuitionCommissionPct: 70.0 },
    });
  }

  // Create Batch Classes
  const sampleBatches = [
    {
      batchName: '2026 A/L Combined Maths Theory',
      teacherId: teacherSunil?.id,
      subjectId: subjectCMath?.id,
      monthlyFee: 3500.0,
      hallNumber: 'Hall A',
    },
    {
      batchName: '2026 A/L Physics Theory & Revision',
      teacherId: teacherKamani?.id,
      subjectId: subjectPhysics?.id,
      monthlyFee: 3500.0,
      hallNumber: 'Hall B',
    },
    {
      batchName: '2026 O/L Science Target Class',
      teacherId: teacherKamani?.id,
      subjectId: subjectScience?.id,
      monthlyFee: 2800.0,
      hallNumber: 'Hall C',
    },
  ];

  for (const b of sampleBatches) {
    if (b.teacherId && b.subjectId) {
      const existingBatch = await prisma.batchClass.findFirst({
        where: { batchName: b.batchName },
      });
      if (!existingBatch) {
        await prisma.batchClass.create({
          data: {
            batchName: b.batchName,
            teacherId: b.teacherId,
            subjectId: b.subjectId,
            branchId: mainBranch.id,
            academicYearId: currentAcademicYear.id,
            monthlyFee: b.monthlyFee,
            hallNumber: b.hallNumber,
          },
        });
      }
    }
  }
  console.log('✅ Sample Batch Classes and Teacher Subjects seeded successfully.');

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
