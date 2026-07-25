import {
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { MarkBulkAttendanceDto } from './dto/mark-attendance.dto';
import { AttendanceQueryDto } from './dto/attendance-query.dto';

@Injectable()
export class AttendanceService {
  private readonly logger = new Logger(AttendanceService.name);

  constructor(private readonly prisma: PrismaService) {}

  async markBulkAttendance(dto: MarkBulkAttendanceDto, adminId: string) {
    const attendanceDate = new Date(dto.attendanceDate);

    // Verify Batch Class exists
    const batch = await this.prisma.batchClass.findUnique({
      where: { id: dto.batchClassId },
    });
    if (!batch) {
      throw new NotFoundException(`Batch class with ID ${dto.batchClassId} not found.`);
    }

    const savedRecords = await this.prisma.$transaction(async (tx) => {
      const results = [];
      for (const rec of dto.records) {
        const record = await tx.studentAttendance.upsert({
          where: {
            studentId_batchClassId_attendanceDate: {
              studentId: rec.studentId,
              batchClassId: dto.batchClassId,
              attendanceDate,
            },
          },
          update: {
            status: rec.status,
            remarks: rec.remarks,
            markedByAdminId: adminId,
          },
          create: {
            studentId: rec.studentId,
            batchClassId: dto.batchClassId,
            attendanceDate,
            status: rec.status,
            remarks: rec.remarks,
            markedByAdminId: adminId,
          },
        });
        results.push(record);
      }

      await tx.auditLog.create({
        data: {
          adminId,
          action: 'BULK_ATTENDANCE_MARKED',
          entityName: 'student_attendance',
          entityId: dto.batchClassId,
          newValues: { count: dto.records.length, date: dto.attendanceDate },
        },
      });

      return results;
    });

    this.logger.log(`Marked ${savedRecords.length} attendance records for batch ${dto.batchClassId} on ${dto.attendanceDate}.`);
    return { count: savedRecords.length, records: savedRecords };
  }

  async getAttendanceRecords(query: AttendanceQueryDto) {
    const where: any = {};
    if (query.batchClassId) where.batchClassId = query.batchClassId;
    if (query.studentId) where.studentId = query.studentId;

    if (query.month && query.year) {
      where.attendanceDate = {
        gte: new Date(query.year, query.month - 1, 1),
        lt: new Date(query.year, query.month, 1),
      };
    }

    return this.prisma.studentAttendance.findMany({
      where,
      orderBy: { attendanceDate: 'desc' },
      include: {
        student: { select: { studentCode: true, fullName: true } },
        batchClass: { select: { batchName: true } },
      },
    });
  }

  /**
   * Helper function: Calculates monthly attendance stats for a student in a batch
   * Returns total sessions held, present count, and attendance percentage.
   */
  async getMonthlyAttendancePercentage(
    studentId: string,
    batchClassId: string,
    month: number,
    year: number,
  ): Promise<{ totalSessions: number; presentCount: number; percentage: number }> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);

    const records = await this.prisma.studentAttendance.findMany({
      where: {
        studentId,
        batchClassId,
        attendanceDate: {
          gte: startDate,
          lt: endDate,
        },
      },
    });

    const totalSessions = records.length;
    const presentCount = records.filter(
      (r) => r.status === 'PRESENT' || r.status === 'LATE',
    ).length;

    const percentage = totalSessions > 0 ? (presentCount / totalSessions) * 100 : 0.0;

    return {
      totalSessions,
      presentCount,
      percentage: Number(percentage.toFixed(2)),
    };
  }

  async updateAttendanceRecord(id: string, status: any, remarks?: string, adminId?: string) {
    const record = await this.prisma.studentAttendance.findUnique({ where: { id } });
    if (!record) throw new NotFoundException(`Attendance record with ID ${id} not found.`);

    return this.prisma.studentAttendance.update({
      where: { id },
      data: {
        status,
        remarks,
        markedByAdminId: adminId,
      },
    });
  }

  async deleteAttendanceRecord(id: string) {
    const record = await this.prisma.studentAttendance.findUnique({ where: { id } });
    if (!record) throw new NotFoundException(`Attendance record with ID ${id} not found.`);
    return this.prisma.studentAttendance.delete({ where: { id } });
  }
}
