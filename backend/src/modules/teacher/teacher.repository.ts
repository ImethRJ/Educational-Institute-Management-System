import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { Prisma, Teacher } from '@prisma/client';

@Injectable()
export class TeacherRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.TeacherCreateInput): Promise<Teacher> {
    return this.prisma.teacher.create({ data });
  }

  async findById(id: string) {
    return this.prisma.teacher.findUnique({
      where: { id },
      include: {
        teacherSubjects: {
          include: {
            subject: {
              include: { gradeLevel: true },
            },
          },
        },
        batchClasses: {
          include: {
            subject: true,
            branch: true,
            academicYear: true,
          },
        },
      },
    });
  }

  async findByCode(teacherCode: string) {
    return this.prisma.teacher.findUnique({
      where: { teacherCode },
    });
  }

  async findByNic(nicOrPassport: string) {
    return this.prisma.teacher.findUnique({
      where: { nicOrPassport },
    });
  }

  async findAll(search?: string, status?: any) {
    const where: Prisma.TeacherWhereInput = {};

    if (search) {
      where.OR = [
        { teacherCode: { contains: search, mode: 'insensitive' } },
        { fullName: { contains: search, mode: 'insensitive' } },
        { nicOrPassport: { contains: search, mode: 'insensitive' } },
        { mobileNumber: { contains: search } },
      ];
    }

    if (status) {
      where.status = status;
    }

    return this.prisma.teacher.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        teacherSubjects: {
          include: { subject: { select: { name: true, code: true } } },
        },
        _count: {
          select: { batchClasses: true, referredStudents: true },
        },
      },
    });
  }

  async update(id: string, data: Prisma.TeacherUpdateInput): Promise<Teacher> {
    return this.prisma.teacher.update({
      where: { id },
      data,
    });
  }

  async generateNextTeacherCode(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `TCH-${year}-`;

    const lastTeacher = await this.prisma.teacher.findFirst({
      where: { teacherCode: { startsWith: prefix } },
      orderBy: { teacherCode: 'desc' },
    });

    let nextSeq = 1;
    if (lastTeacher) {
      const parts = lastTeacher.teacherCode.split('-');
      const lastSeqStr = parts[parts.length - 1];
      const parsedSeq = parseInt(lastSeqStr, 10);
      if (!isNaN(parsedSeq)) {
        nextSeq = parsedSeq + 1;
      }
    }

    return `${prefix}${nextSeq.toString().padStart(3, '0')}`;
  }
}
