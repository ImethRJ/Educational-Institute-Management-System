import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateGradeDto } from './dto/create-grade.dto';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { CreateBatchDto } from './dto/create-batch.dto';
import { CreateScheduleDto } from './dto/create-schedule.dto';

@Injectable()
export class AcademicService {
  private readonly logger = new Logger(AcademicService.name);

  constructor(private readonly prisma: PrismaService) {}

  // Grades
  async createGrade(dto: CreateGradeDto) {
    return this.prisma.gradeLevel.create({ data: dto });
  }

  async getAllGrades() {
    return this.prisma.gradeLevel.findMany({
      orderBy: { numericOrder: 'asc' },
      include: { _count: { select: { subjects: true } } },
    });
  }

  async updateGrade(id: string, dto: any) {
    const grade = await this.prisma.gradeLevel.findUnique({ where: { id } });
    if (!grade) throw new NotFoundException(`Grade level with ID ${id} not found.`);
    return this.prisma.gradeLevel.update({ where: { id }, data: dto });
  }

  async deleteGrade(id: string) {
    const subjectsCount = await this.prisma.subject.count({ where: { gradeLevelId: id } });
    if (subjectsCount > 0) {
      throw new BadRequestException(
        `This grade level is locked because there are ${subjectsCount} subject(s) assigned to it.`,
      );
    }
    return this.prisma.gradeLevel.delete({ where: { id } });
  }

  // Branches
  async getAllBranches() {
    return this.prisma.branch.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  // Academic Years
  async getAllAcademicYears() {
    return this.prisma.academicYear.findMany({
      orderBy: { yearName: 'desc' },
    });
  }


  // Subjects
  async createSubject(dto: CreateSubjectDto) {
    const existing = await this.prisma.subject.findUnique({
      where: { code: dto.code },
    });
    if (existing) {
      throw new ConflictException(`Subject with code ${dto.code} already exists.`);
    }

    const { gradeLevelIds, ...rest } = dto;
    const data: any = { ...rest };
    if (!data.gradeLevelId && gradeLevelIds && gradeLevelIds.length > 0) {
      data.gradeLevelId = gradeLevelIds[0];
    } else if (!data.gradeLevelId) {
      data.gradeLevelId = null;
    }

    if (gradeLevelIds && gradeLevelIds.length > 0) {
      data.subjectGradeLevels = {
        create: gradeLevelIds.map((gId) => ({ gradeLevelId: gId })),
      };
    }

    return this.prisma.subject.create({
      data,
      include: { gradeLevel: true, subjectGradeLevels: { include: { gradeLevel: true } } },
    });
  }

  async getAllSubjects(gradeLevelId?: string) {
    const where = gradeLevelId
      ? {
          OR: [
            { gradeLevelId },
            { subjectGradeLevels: { some: { gradeLevelId } } },
          ],
        }
      : {};
    return this.prisma.subject.findMany({
      where,
      orderBy: { name: 'asc' },
      include: {
        gradeLevel: true,
        subjectGradeLevels: { include: { gradeLevel: true } },
      },
    });
  }

  async updateSubject(id: string, dto: any) {
    const subject = await this.prisma.subject.findUnique({ where: { id } });
    if (!subject) throw new NotFoundException(`Subject with ID ${id} not found.`);

    const { gradeLevelIds, ...rest } = dto;
    const data: any = { ...rest };
    if (data.gradeLevelId === '' || data.gradeLevelId === null) {
      data.gradeLevelId = null;
    }

    if (gradeLevelIds !== undefined) {
      await this.prisma.subjectGradeLevel.deleteMany({ where: { subjectId: id } });
      if (gradeLevelIds && gradeLevelIds.length > 0) {
        data.subjectGradeLevels = {
          create: gradeLevelIds.map((gId: string) => ({ gradeLevelId: gId })),
        };
        if (!data.gradeLevelId) {
          data.gradeLevelId = gradeLevelIds[0];
        }
      }
    }

    return this.prisma.subject.update({
      where: { id },
      data,
      include: {
        gradeLevel: true,
        subjectGradeLevels: { include: { gradeLevel: true } },
      },
    });
  }

  async deleteSubject(id: string) {
    const batchesCount = await this.prisma.batchClass.count({ where: { subjectId: id } });
    if (batchesCount > 0) {
      throw new BadRequestException(
        `This subject is locked because there ${batchesCount === 1 ? 'is 1 active batch class' : `are ${batchesCount} active batch classes`} linked to it. Please reassign or delete the batch classes first.`,
      );
    }
    return this.prisma.subject.delete({ where: { id } });
  }

  // Batches
  async createBatch(dto: CreateBatchDto, adminId: string) {
    const { gradeLevelIds, ...rest } = dto;
    const data: any = { ...rest };
    if (!data.gradeLevelId && gradeLevelIds && gradeLevelIds.length > 0) {
      data.gradeLevelId = gradeLevelIds[0];
    } else if (!data.gradeLevelId) {
      data.gradeLevelId = null;
    }

    if (gradeLevelIds && gradeLevelIds.length > 0) {
      data.batchClassGradeLevels = {
        create: gradeLevelIds.map((gId) => ({ gradeLevelId: gId })),
      };
    }

    const batch = await this.prisma.batchClass.create({
      data,
      include: {
        subject: true,
        gradeLevel: true,
        batchClassGradeLevels: { include: { gradeLevel: true } },
        teacher: { select: { id: true, fullName: true, teacherCode: true } },
        branch: true,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        adminId,
        action: 'BATCH_CLASS_CREATED',
        entityName: 'batch_class',
        entityId: batch.id,
        newValues: { batchName: batch.batchName },
      },
    });

    return batch;
  }

  async getAllBatches(subjectId?: string, teacherId?: string) {
    const where: any = {};
    if (subjectId) where.subjectId = subjectId;
    if (teacherId) where.teacherId = teacherId;

    return this.prisma.batchClass.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        subject: { select: { id: true, name: true, code: true } },
        gradeLevel: { select: { id: true, name: true, numericOrder: true } },
        batchClassGradeLevels: { include: { gradeLevel: true } },
        teacher: { select: { id: true, fullName: true, teacherCode: true } },
        branch: { select: { name: true } },
        classSchedules: true,
        _count: { select: { enrollments: true } },
      },
    });
  }

  async getBatchById(id: string) {
    const batch = await this.prisma.batchClass.findUnique({
      where: { id },
      include: {
        subject: true,
        gradeLevel: true,
        batchClassGradeLevels: { include: { gradeLevel: true } },
        teacher: true,
        branch: true,
        academicYear: true,
        classSchedules: true,
        enrollments: {
          where: { isActive: true },
          include: { student: true },
        },
      },
    });
    if (!batch) {
      throw new NotFoundException(`Batch class with ID ${id} not found.`);
    }
    return batch;
  }

  async updateBatch(id: string, dto: any, adminId: string) {
    await this.getBatchById(id);
    const { gradeLevelIds, ...rest } = dto;
    const data: any = { ...rest };
    if (data.gradeLevelId === '' || data.gradeLevelId === null) {
      data.gradeLevelId = null;
    }

    if (gradeLevelIds !== undefined) {
      await this.prisma.batchClassGradeLevel.deleteMany({ where: { batchClassId: id } });
      if (gradeLevelIds && gradeLevelIds.length > 0) {
        data.batchClassGradeLevels = {
          create: gradeLevelIds.map((gId: string) => ({ gradeLevelId: gId })),
        };
        if (!data.gradeLevelId) {
          data.gradeLevelId = gradeLevelIds[0];
        }
      }
    }

    const updated = await this.prisma.batchClass.update({
      where: { id },
      data,
      include: {
        subject: true,
        gradeLevel: true,
        batchClassGradeLevels: { include: { gradeLevel: true } },
        teacher: { select: { id: true, fullName: true, teacherCode: true } },
      },
    });

    await this.prisma.auditLog.create({
      data: {
        adminId,
        action: 'BATCH_CLASS_UPDATED',
        entityName: 'batch_class',
        entityId: id,
        newValues: dto,
      },
    });

    return updated;
  }

  async deleteBatch(id: string, adminId: string) {
    const activeEnrollments = await this.prisma.studentEnrollment.count({
      where: { batchClassId: id, isActive: true },
    });
    if (activeEnrollments > 0) {
      throw new BadRequestException(
        `This batch class is locked because there ${activeEnrollments === 1 ? 'is 1 actively enrolled student' : `are ${activeEnrollments} actively enrolled students`}. Unenroll students first before deleting.`,
      );
    }

    const deleted = await this.prisma.batchClass.delete({ where: { id } });

    await this.prisma.auditLog.create({
      data: {
        adminId,
        action: 'BATCH_CLASS_DELETED',
        entityName: 'batch_class',
        entityId: id,
      },
    });

    return deleted;
  }

  // Timetable Schedules
  async createClassSchedule(dto: CreateScheduleDto) {
    if (dto.startTime >= dto.endTime) {
      throw new BadRequestException('Schedule end time must be after start time.');
    }

    const batch = await this.getBatchById(dto.batchClassId);

    // Collision Check: Check if teacher is already booked at overlapping time on the same day
    const teacherCollision = await this.prisma.classSchedule.findFirst({
      where: {
        dayOfWeek: dto.dayOfWeek,
        batchClass: { teacherId: batch.teacherId },
        OR: [
          {
            startTime: { lte: dto.startTime },
            endTime: { gt: dto.startTime },
          },
          {
            startTime: { lt: dto.endTime },
            endTime: { gte: dto.endTime },
          },
        ],
      },
      include: { batchClass: true },
    });

    if (teacherCollision) {
      throw new ConflictException(
        `Teacher ${batch.teacher.fullName} is already assigned to batch '${teacherCollision.batchClass.batchName}' at ${teacherCollision.startTime}-${teacherCollision.endTime} on day ${dto.dayOfWeek}.`,
      );
    }

    return this.prisma.classSchedule.create({ data: dto });
  }

  async getWeeklyTimetable(dayOfWeek?: number, hallNumber?: string) {
    const where: any = {};
    if (dayOfWeek) where.dayOfWeek = dayOfWeek;
    if (hallNumber) {
      where.batchClass = { hallNumber };
    }

    return this.prisma.classSchedule.findMany({
      where,
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
      include: {
        batchClass: {
          include: {
            subject: { select: { name: true, code: true } },
            teacher: { select: { fullName: true, teacherCode: true } },
          },
        },
      },
    });
  }

  async updateSchedule(id: string, dto: any) {
    const schedule = await this.prisma.classSchedule.findUnique({ where: { id } });
    if (!schedule) throw new NotFoundException(`Schedule slot with ID ${id} not found.`);
    return this.prisma.classSchedule.update({ where: { id }, data: dto });
  }

  async deleteSchedule(id: string) {
    const schedule = await this.prisma.classSchedule.findUnique({ where: { id } });
    if (!schedule) throw new NotFoundException(`Schedule slot with ID ${id} not found.`);
    return this.prisma.classSchedule.delete({ where: { id } });
  }
}
