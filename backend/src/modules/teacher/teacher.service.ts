import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { TeacherRepository } from './teacher.repository';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { UpdateCommissionConfigDto } from './dto/commission-config.dto';
import { validateSriLankaNIC } from '../../common/utils/nic.validator';

@Injectable()
export class TeacherService {
  private readonly logger = new Logger(TeacherService.name);

  constructor(
    private readonly teacherRepository: TeacherRepository,
    private readonly prisma: PrismaService,
  ) {}

  async createTeacher(dto: CreateTeacherDto, adminId: string) {
    if (!validateSriLankaNIC(dto.nicOrPassport)) {
      this.logger.warn(`NIC format validation notice for: ${dto.nicOrPassport}`);
    }

    const existingNic = await this.teacherRepository.findByNic(dto.nicOrPassport);
    if (existingNic) {
      throw new ConflictException(`Teacher with NIC/Passport ${dto.nicOrPassport} already exists.`);
    }

    const teacherCode = await this.teacherRepository.generateNextTeacherCode();

    const teacher = await this.prisma.$transaction(async (tx) => {
      const newTeacher = await tx.teacher.create({
        data: {
          teacherCode,
          fullName: dto.fullName,
          nicOrPassport: dto.nicOrPassport,
          dob: new Date(dto.dob),
          gender: dto.gender,
          mobileNumber: dto.mobileNumber,
          email: dto.email,
          address: dto.address,
          emergencyContact: dto.emergencyContact,
          joiningDate: dto.joiningDate ? new Date(dto.joiningDate) : new Date(),
          qualifications: dto.qualifications,
          photoUrl: dto.photoUrl,
          defaultTuitionCommissionPct: dto.defaultTuitionCommissionPct,
          admissionCommissionType: dto.admissionCommissionType || 'PERCENTAGE',
          admissionCommissionValue: dto.admissionCommissionValue || 0.0,
        },
      });

      if (dto.subjectIds && dto.subjectIds.length > 0) {
        for (const subjectId of dto.subjectIds) {
          await tx.teacherSubject.create({
            data: {
              teacherId: newTeacher.id,
              subjectId,
            },
          });
        }
      }

      await tx.auditLog.create({
        data: {
          adminId,
          action: 'TEACHER_REGISTERED',
          entityName: 'teacher',
          entityId: newTeacher.id,
          newValues: { teacherCode, fullName: newTeacher.fullName },
        },
      });

      return newTeacher;
    });

    this.logger.log(`Teacher ${teacher.teacherCode} (${teacher.fullName}) created.`);
    return teacher;
  }

  async getTeacherById(id: string) {
    const teacher = await this.teacherRepository.findById(id);
    if (!teacher) {
      throw new NotFoundException(`Teacher with ID ${id} not found.`);
    }
    return teacher;
  }

  async getTeachers(search?: string, status?: any) {
    return this.teacherRepository.findAll(search, status);
  }

  async updateTeacher(id: string, dto: UpdateTeacherDto, adminId: string) {
    await this.getTeacherById(id);

    const { subjectIds, ...teacherFields } = dto;

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.teacher.update({
        where: { id },
        data: {
          ...teacherFields,
          dob: dto.dob ? new Date(dto.dob) : undefined,
          joiningDate: dto.joiningDate ? new Date(dto.joiningDate) : undefined,
        },
      });

      if (subjectIds !== undefined) {
        await tx.teacherSubject.deleteMany({ where: { teacherId: id } });
        for (const subjectId of subjectIds) {
          await tx.teacherSubject.create({
            data: {
              teacherId: id,
              subjectId,
            },
          });
        }
      }

      await tx.auditLog.create({
        data: {
          adminId,
          action: 'TEACHER_PROFILE_UPDATED',
          entityName: 'teacher',
          entityId: id,
        },
      });

      return updated;
    });
  }

  async updateCommissionConfig(
    id: string,
    dto: UpdateCommissionConfigDto,
    adminId: string,
  ) {
    const teacher = await this.getTeacherById(id);

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.teacher.update({
        where: { id },
        data: {
          defaultTuitionCommissionPct: dto.defaultTuitionCommissionPct,
          admissionCommissionType: dto.admissionCommissionType,
          admissionCommissionValue: dto.admissionCommissionValue,
        },
      });

      await tx.auditLog.create({
        data: {
          adminId,
          action: 'TEACHER_COMMISSION_UPDATED',
          entityName: 'teacher',
          entityId: id,
          oldValues: {
            tuitionPct: teacher.defaultTuitionCommissionPct,
            admissionVal: teacher.admissionCommissionValue,
          },
          newValues: {
            tuitionPct: dto.defaultTuitionCommissionPct,
            admissionVal: dto.admissionCommissionValue,
          },
        },
      });

      return updated;
    });
  }

  async getTeacherEarningsSummary(teacherId: string, month?: number, year?: number) {
    await this.getTeacherById(teacherId);

    const now = new Date();
    const targetMonth = month || now.getMonth() + 1;
    const targetYear = year || now.getFullYear();

    const paymentRecords = await this.prisma.paymentRecord.findMany({
      where: {
        teacherId,
        paymentDate: {
          gte: new Date(targetYear, targetMonth - 1, 1),
          lt: new Date(targetYear, targetMonth, 1),
        },
      },
      include: {
        student: { select: { studentCode: true, fullName: true } },
        invoice: { select: { invoiceNumber: true, billingMonth: true, billingYear: true } },
      },
    });

    const totalTuitionEarned = paymentRecords
      .filter((p) => !p.isAdmissionFee)
      .reduce((sum, p) => sum + Number(p.teacherShareAmount), 0);

    const totalAdmissionCommission = paymentRecords
      .filter((p) => p.isAdmissionFee)
      .reduce((sum, p) => sum + Number(p.teacherShareAmount), 0);

    return {
      teacherId,
      periodMonth: targetMonth,
      periodYear: targetYear,
      totalTuitionEarned,
      totalAdmissionCommission,
      totalEarned: totalTuitionEarned + totalAdmissionCommission,
      paymentCount: paymentRecords.length,
      records: paymentRecords,
    };
  }
}
