import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { StudentRepository } from './student.repository';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { StudentQueryDto } from './dto/student-query.dto';

@Injectable()
export class StudentService {
  private readonly logger = new Logger(StudentService.name);

  constructor(
    private readonly studentRepository: StudentRepository,
    private readonly prisma: PrismaService,
  ) {}

  async createStudent(dto: CreateStudentDto, adminId: string) {
    const studentCode = await this.studentRepository.generateNextStudentCode('COL');

    const student = await this.prisma.$transaction(async (tx) => {
      const newStudent = await tx.student.create({
        data: {
          studentCode,
          fullName: dto.fullName,
          dob: new Date(dto.dob),
          gender: dto.gender,
          address: dto.address,
          mobileNumber: dto.mobileNumber,
          email: dto.email,
          guardianName: dto.guardianName,
          guardianRelationship: dto.guardianRelationship,
          guardianMobile: dto.guardianMobile,
          guardianEmail: dto.guardianEmail,
          guardianAddress: dto.guardianAddress,
          feeCategory: dto.feeCategory,
          customConcessionNotes: dto.customConcessionNotes,
          admissionFeeAmount: dto.admissionFeeAmount,
          admissionFeePaid: dto.admissionFeePaid || false,
          referredByTeacherId: dto.referredByTeacherId,
        },
      });

      // Enroll in initial batches if provided
      if (dto.initialBatchIds && dto.initialBatchIds.length > 0) {
        for (const batchClassId of dto.initialBatchIds) {
          await tx.studentEnrollment.create({
            data: {
              studentId: newStudent.id,
              batchClassId,
            },
          });
        }
      }

      // Record Audit Log
      await tx.auditLog.create({
        data: {
          adminId,
          action: 'STUDENT_ADMISSION_REGISTERED',
          entityName: 'student',
          entityId: newStudent.id,
          newValues: { studentCode: newStudent.studentCode, fullName: newStudent.fullName },
        },
      });

      return newStudent;
    });

    this.logger.log(`Student ${student.studentCode} (${student.fullName}) registered successfully.`);
    return student;
  }

  async getStudentById(id: string) {
    const student = await this.studentRepository.findById(id);
    if (!student) {
      throw new NotFoundException(`Student with ID ${id} not found.`);
    }
    return student;
  }

  async getStudentByCode(code: string) {
    const student = await this.studentRepository.findByCode(code);
    if (!student) {
      throw new NotFoundException(`Student with code ${code} not found.`);
    }
    return student;
  }

  async getStudents(query: StudentQueryDto) {
    return this.studentRepository.findAll(query);
  }

  async updateStudent(id: string, dto: UpdateStudentDto, adminId: string) {
    const existing = await this.getStudentById(id);

    const updated = await this.prisma.$transaction(async (tx) => {
      const result = await tx.student.update({
        where: { id },
        data: {
          ...dto,
          dob: dto.dob ? new Date(dto.dob) : undefined,
        },
      });

      await tx.auditLog.create({
        data: {
          adminId,
          action: 'STUDENT_PROFILE_UPDATED',
          entityName: 'student',
          entityId: id,
          oldValues: { fullName: existing.fullName, feeCategory: existing.feeCategory },
          newValues: { fullName: result.fullName, feeCategory: result.feeCategory },
        },
      });

      return result;
    });

    return updated;
  }

  async enrollStudentInBatch(studentId: string, batchClassId: string, adminId: string) {
    await this.getStudentById(studentId);

    const existingEnrollment = await this.prisma.studentEnrollment.findUnique({
      where: {
        studentId_batchClassId: { studentId, batchClassId },
      },
    });

    if (existingEnrollment) {
      if (existingEnrollment.isActive) {
        throw new BadRequestException('Student is already actively enrolled in this batch.');
      }
      return this.prisma.studentEnrollment.update({
        where: { id: existingEnrollment.id },
        data: { isActive: true },
      });
    }

    const enrollment = await this.prisma.studentEnrollment.create({
      data: { studentId, batchClassId },
    });

    await this.prisma.auditLog.create({
      data: {
        adminId,
        action: 'STUDENT_BATCH_ENROLLED',
        entityName: 'student_enrollment',
        entityId: enrollment.id,
      },
    });

    return enrollment;
  }
}
