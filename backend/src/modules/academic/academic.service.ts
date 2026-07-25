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

  // Subjects
  async createSubject(dto: CreateSubjectDto) {
    const existing = await this.prisma.subject.findUnique({
      where: { code: dto.code },
    });
    if (existing) {
      throw new ConflictException(`Subject with code ${dto.code} already exists.`);
    }

    return this.prisma.subject.create({ data: dto });
  }

  async getAllSubjects(gradeLevelId?: string) {
    const where = gradeLevelId ? { gradeLevelId } : {};
    return this.prisma.subject.findMany({
      where,
      orderBy: { name: 'asc' },
      include: { gradeLevel: true },
    });
  }

  // Batches
  async createBatch(dto: CreateBatchDto, adminId: string) {
    const batch = await this.prisma.batchClass.create({
      data: dto,
      include: {
        subject: true,
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
}
