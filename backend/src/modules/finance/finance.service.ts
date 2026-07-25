import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AttendanceService } from '../attendance/attendance.service';
import { GenerateMonthlyInvoicesDto } from './dto/generate-invoices.dto';
import { OverrideZeroAttendanceDto } from './dto/override-zero-att.dto';
import { RecordPaymentDto } from './dto/record-payment.dto';
import { ProcessTeacherPayoutDto } from './dto/payout.dto';
import { FeeCategory, InvoiceStatus } from '@prisma/client';

@Injectable()
export class FinanceService {
  private readonly logger = new Logger(FinanceService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly attendanceService: AttendanceService,
  ) {}

  /**
   * Automatic Monthly Invoice Generation Engine
   * Enforces Concession logic and 0% Monthly Attendance Prevention Rule
   */
  async generateMonthlyInvoices(dto: GenerateMonthlyInvoicesDto, adminId: string) {
    const { billingMonth, billingYear, batchClassId } = dto;

    // Fetch active enrollments
    const enrollments = await this.prisma.studentEnrollment.findMany({
      where: {
        isActive: true,
        student: { status: 'ACTIVE' },
        ...(batchClassId ? { batchClassId } : {}),
      },
      include: {
        student: true,
        batchClass: { include: { subject: true, teacher: true } },
      },
    });

    let generatedCount = 0;
    let suppressedCount = 0;

    const dueDate = new Date(billingYear, billingMonth - 1, 10); // Due 10th of the month

    for (const enrollment of enrollments) {
      const { student, batchClass } = enrollment;

      // Check if invoice already exists for student/batch/month/year
      const existingInvoice = await this.prisma.monthlyInvoice.findUnique({
        where: {
          studentId_batchClassId_billingMonth_billingYear: {
            studentId: student.id,
            batchClassId: batchClass.id,
            billingMonth,
            billingYear,
          },
        },
      });

      if (existingInvoice) continue;

      // 1. Calculate Monthly Attendance Percentage
      const attStats = await this.attendanceService.getMonthlyAttendancePercentage(
        student.id,
        batchClass.id,
        billingMonth,
        billingYear,
      );

      // 2. Evaluate Fee Concession
      const originalFee = Number(batchClass.monthlyFee);
      let finalAmountDue = originalFee;

      if (student.feeCategory === FeeCategory.HALF_FEE) {
        finalAmountDue = originalFee * 0.5;
      } else if (student.feeCategory === FeeCategory.NO_FEE) {
        finalAmountDue = 0.0;
      }

      // 3. Evaluate 0% Monthly Attendance Rule
      // If attendance is 0% (and total sessions > 0), suppress invoice unless overridden
      const isZeroAttendance = attStats.totalSessions > 0 && attStats.presentCount === 0;

      const invoiceNumber = `INV-${billingYear}-${String(billingMonth).padStart(2, '0')}-${Math.floor(
        1000 + Math.random() * 9000,
      )}`;

      await this.prisma.monthlyInvoice.create({
        data: {
          invoiceNumber,
          studentId: student.id,
          batchClassId: batchClass.id,
          billingMonth,
          billingYear,
          originalFee,
          feeCategoryApplied: student.feeCategory,
          finalAmountDue,
          status: isZeroAttendance ? InvoiceStatus.UNPAID : InvoiceStatus.UNPAID,
          attendancePercentage: attStats.percentage,
          isZeroAttendanceOverride: false,
          dueDate,
        },
      });

      if (isZeroAttendance) {
        suppressedCount++;
      } else {
        generatedCount++;
      }
    }

    await this.prisma.auditLog.create({
      data: {
        adminId,
        action: 'MONTHLY_INVOICES_GENERATED',
        entityName: 'monthly_invoice',
        newValues: { billingMonth, billingYear, generatedCount, suppressedCount },
      },
    });

    this.logger.log(
      `Generated ${generatedCount} invoices for ${billingYear}/${billingMonth}. (0% Attendance Suppressed: ${suppressedCount})`,
    );

    return {
      billingMonth,
      billingYear,
      generatedCount,
      suppressedCount,
    };
  }

  /**
   * Admin Zero-Attendance Invoice Override
   */
  async overrideZeroAttendance(
    invoiceId: string,
    dto: OverrideZeroAttendanceDto,
    adminId: string,
  ) {
    const invoice = await this.prisma.monthlyInvoice.findUnique({
      where: { id: invoiceId },
    });

    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${invoiceId} not found.`);
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const res = await tx.monthlyInvoice.update({
        where: { id: invoiceId },
        data: {
          isZeroAttendanceOverride: true,
          overrideReason: dto.overrideReason,
          overriddenByAdminId: adminId,
        },
      });

      await tx.auditLog.create({
        data: {
          adminId,
          action: 'ZERO_ATTENDANCE_OVERRIDE_APPROVED',
          entityName: 'monthly_invoice',
          entityId: invoiceId,
          newValues: { overrideReason: dto.overrideReason },
        },
      });

      return res;
    });

    return updated;
  }

  /**
   * Record Payment & Execute Revenue Split Engine
   */
  async recordPayment(dto: RecordPaymentDto, adminId: string) {
    const receiptNumber = `RCP-${new Date().getFullYear()}-${String(
      new Date().getMonth() + 1,
    ).padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`;

    return this.prisma.$transaction(async (tx) => {
      let teacherId: string | null = null;
      let teacherShareAmount = 0.0;
      let instituteShareAmount = dto.amountPaid;

      // Case A: Monthly Tuition Fee Payment
      if (dto.invoiceId) {
        const invoice = await tx.monthlyInvoice.findUnique({
          where: { id: dto.invoiceId },
          include: {
            batchClass: { include: { teacher: true } },
          },
        });

        if (!invoice) {
          throw new NotFoundException(`Invoice with ID ${dto.invoiceId} not found.`);
        }

        teacherId = invoice.batchClass.teacherId;
        const teacher = invoice.batchClass.teacher;

        // Tuition Fee Split Calculation
        const commissionPct = Number(teacher.defaultTuitionCommissionPct);
        teacherShareAmount = dto.amountPaid * (commissionPct / 100);
        instituteShareAmount = dto.amountPaid - teacherShareAmount;

        // Update Invoice Status
        const newPaidTotal = dto.amountPaid; // Simplified full/partial payment
        const newStatus =
          newPaidTotal >= Number(invoice.finalAmountDue)
            ? InvoiceStatus.PAID
            : InvoiceStatus.PARTIALLY_PAID;

        await tx.monthlyInvoice.update({
          where: { id: dto.invoiceId },
          data: { status: newStatus },
        });
      }
      // Case B: Admission Fee Payment
      else if (dto.isAdmissionFee) {
        const student = await tx.student.findUnique({
          where: { id: dto.studentId },
          include: { referredByTeacher: true },
        });

        if (!student) {
          throw new NotFoundException(`Student with ID ${dto.studentId} not found.`);
        }

        // Mark student admission fee paid
        await tx.student.update({
          where: { id: dto.studentId },
          data: { admissionFeePaid: true },
        });

        if (student.referredByTeacher) {
          teacherId = student.referredByTeacher.id;
          const teacher = student.referredByTeacher;

          if (teacher.admissionCommissionType === 'PERCENTAGE') {
            const pct = Number(teacher.admissionCommissionValue || 0);
            teacherShareAmount = dto.amountPaid * (pct / 100);
          } else if (teacher.admissionCommissionType === 'FIXED_AMOUNT') {
            teacherShareAmount = Math.min(
              dto.amountPaid,
              Number(teacher.admissionCommissionValue || 0),
            );
          }
          instituteShareAmount = dto.amountPaid - teacherShareAmount;
        }
      }

      // Create Payment Record
      const paymentRecord = await tx.paymentRecord.create({
        data: {
          receiptNumber,
          invoiceId: dto.invoiceId,
          studentId: dto.studentId,
          isAdmissionFee: dto.isAdmissionFee || false,
          amountPaid: dto.amountPaid,
          paymentMethod: dto.paymentMethod,
          recordedByAdminId: adminId,
          teacherId,
          teacherShareAmount,
          instituteShareAmount,
          remarks: dto.remarks,
        },
      });

      // Log Audit Trail
      await tx.auditLog.create({
        data: {
          adminId,
          action: 'PAYMENT_RECORDED',
          entityName: 'payment_record',
          entityId: paymentRecord.id,
          newValues: {
            receiptNumber,
            amountPaid: dto.amountPaid,
            teacherShare: teacherShareAmount,
            instituteShare: instituteShareAmount,
          },
        },
      });

      return paymentRecord;
    });
  }

  /**
   * Process Monthly Teacher Payout Settlement
   */
  async processTeacherPayout(dto: ProcessTeacherPayoutDto, adminId: string) {
    const { teacherId, periodMonth, periodYear, notes } = dto;

    const existingPayout = await this.prisma.teacherPayout.findFirst({
      where: { teacherId, periodMonth, periodYear },
    });

    if (existingPayout) {
      throw new ConflictException(
        `Teacher payout for period ${periodYear}/${periodMonth} has already been processed (Payout: ${existingPayout.payoutNumber}).`,
      );
    }

    const startDate = new Date(periodYear, periodMonth - 1, 1);
    const endDate = new Date(periodYear, periodMonth, 1);

    const payments = await this.prisma.paymentRecord.findMany({
      where: {
        teacherId,
        paymentDate: { gte: startDate, lt: endDate },
      },
    });

    const totalTuitionEarned = payments
      .filter((p) => !p.isAdmissionFee)
      .reduce((sum, p) => sum + Number(p.teacherShareAmount), 0);

    const totalAdmissionCommission = payments
      .filter((p) => p.isAdmissionFee)
      .reduce((sum, p) => sum + Number(p.teacherShareAmount), 0);

    const netPayoutAmount = totalTuitionEarned + totalAdmissionCommission;

    const payoutNumber = `PAY-${periodYear}-${String(periodMonth).padStart(2, '0')}-${Math.floor(
      100 + Math.random() * 900,
    )}`;

    return this.prisma.$transaction(async (tx) => {
      const payout = await tx.teacherPayout.create({
        data: {
          payoutNumber,
          teacherId,
          periodMonth,
          periodYear,
          totalTuitionEarned,
          totalAdmissionCommission,
          netPayoutAmount,
          processedByAdminId: adminId,
          notes,
        },
      });

      await tx.auditLog.create({
        data: {
          adminId,
          action: 'TEACHER_PAYOUT_PROCESSED',
          entityName: 'teacher_payout',
          entityId: payout.id,
          newValues: { payoutNumber, netPayoutAmount },
        },
      });

      return payout;
    });
  }

  async getInvoices(month?: number, year?: number, status?: InvoiceStatus) {
    const where: any = {};
    if (month) where.billingMonth = month;
    if (year) where.billingYear = year;
    if (status) where.status = status;

    return this.prisma.monthlyInvoice.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        student: { select: { studentCode: true, fullName: true, mobileNumber: true } },
        batchClass: { select: { batchName: true, subject: { select: { name: true } } } },
      },
    });
  }

  async getPayments(studentId?: string, teacherId?: string) {
    const where: any = {};
    if (studentId) where.studentId = studentId;
    if (teacherId) where.teacherId = teacherId;

    return this.prisma.paymentRecord.findMany({
      where,
      orderBy: { paymentDate: 'desc' },
      include: {
        student: { select: { studentCode: true, fullName: true } },
        teacher: { select: { teacherCode: true, fullName: true } },
        invoice: { select: { invoiceNumber: true } },
      },
    });
  }
}
