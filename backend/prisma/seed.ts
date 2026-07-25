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
    update: {},
    create: {
      code: 'MAIN',
      name: 'Sector Main Campus (Nugegoda)',
      address: '123 High Level Road, Nugegoda, Sri Lanka',
      contactNumber: '+94112345678',
      isActive: true,
    },
  });
  console.log(`✅ Main Branch seeded: ${mainBranch.name}`);

  // 3. Seed Current Academic Year
  const currentAcademicYear = await prisma.academicYear.upsert({
    where: { id: '00000000-0000-0000-0000-000000002026' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000002026',
      yearName: '2026/2027',
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
