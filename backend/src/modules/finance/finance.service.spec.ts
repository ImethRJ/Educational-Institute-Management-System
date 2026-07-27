import { Test, TestingModule } from '@nestjs/testing';
import { FinanceService } from './finance.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AttendanceService } from '../attendance/attendance.service';
import { FeeCategory, InvoiceStatus } from '@prisma/client';

describe('FinanceService', () => {
  let service: FinanceService;
  let prismaService: jest.Mocked<any>;
  let attendanceService: jest.Mocked<any>;

  beforeEach(async () => {
    prismaService = {
      monthlyInvoice: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      paymentRecord: {
        aggregate: jest.fn(),
        create: jest.fn(),
      },
      teacherSubject: {
        findUnique: jest.fn(),
      },
      studentEnrollment: {
        findMany: jest.fn(),
      },
      student: {
        findUnique: jest.fn(),
        count: jest.fn(),
      },
      auditLog: {
        create: jest.fn(),
      },
      $transaction: jest.fn((callback) => callback(prismaService)),
    };

    attendanceService = {
      getMonthlyAttendancePercentage: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FinanceService,
        { provide: PrismaService, useValue: prismaService },
        { provide: AttendanceService, useValue: attendanceService },
      ],
    }).compile();

    service = module.get<FinanceService>(FinanceService);
  });

  describe('recordPayment', () => {
    it('should accurately calculate accumulated payments and transition invoice to PAID when fully satisfied', async () => {
      const mockInvoice = {
        id: 'inv-123',
        finalAmountDue: 1000,
        status: InvoiceStatus.PARTIALLY_PAID,
        batchClass: {
          teacherId: 'teacher-1',
          subjectId: 'subject-1',
          teacher: { defaultTuitionCommissionPct: 70 },
        },
      };

      prismaService.monthlyInvoice.findUnique.mockResolvedValue(mockInvoice);
      prismaService.teacherSubject.findUnique.mockResolvedValue(null);
      // Prior payment was 600, current payment is 400 => total 1000
      prismaService.paymentRecord.aggregate.mockResolvedValue({
        _sum: { amountPaid: 600 },
      });
      prismaService.paymentRecord.create.mockResolvedValue({
        id: 'payment-1',
        receiptNumber: 'RCP-202607-ABC123',
      });

      await service.recordPayment(
        {
          studentId: 'student-1',
          invoiceId: 'inv-123',
          amountPaid: 400,
          paymentMethod: 'CASH' as any,
        },
        'admin-1',
      );

      expect(prismaService.monthlyInvoice.update).toHaveBeenCalledWith({
        where: { id: 'inv-123' },
        data: { status: InvoiceStatus.PAID },
      });
    });

    it('should respect custom teacher subject commission percentage when present', async () => {
      const mockInvoice = {
        id: 'inv-123',
        finalAmountDue: 1000,
        status: InvoiceStatus.UNPAID,
        batchClass: {
          teacherId: 'teacher-1',
          subjectId: 'subject-1',
          teacher: { defaultTuitionCommissionPct: 70 },
        },
      };

      prismaService.monthlyInvoice.findUnique.mockResolvedValue(mockInvoice);
      // Custom commission is 80% for this subject
      prismaService.teacherSubject.findUnique.mockResolvedValue({
        customTuitionCommissionPct: 80,
      });
      prismaService.paymentRecord.aggregate.mockResolvedValue({
        _sum: { amountPaid: 0 },
      });
      prismaService.paymentRecord.create.mockImplementation(({ data }) => data);

      await service.recordPayment(
        {
          studentId: 'student-1',
          invoiceId: 'inv-123',
          amountPaid: 1000,
          paymentMethod: 'CASH' as any,
        },
        'admin-1',
      );

      expect(prismaService.paymentRecord.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          teacherShareAmount: 800,
          instituteShareAmount: 200,
        }),
      });
    });

    it('should transition invoice to PAID when student has 0% attendance and 0 LKR is settled', async () => {
      const mockInvoice = {
        id: 'inv-absent-123',
        finalAmountDue: 2000,
        attendancePercentage: 0.0,
        status: InvoiceStatus.UNPAID,
        batchClass: {
          teacherId: 'teacher-1',
          subjectId: 'subject-1',
          teacher: { defaultTuitionCommissionPct: 70 },
        },
      };

      prismaService.monthlyInvoice.findUnique.mockResolvedValue(mockInvoice);
      prismaService.teacherSubject.findUnique.mockResolvedValue(null);
      prismaService.paymentRecord.aggregate.mockResolvedValue({
        _sum: { amountPaid: 0 },
      });
      prismaService.paymentRecord.create.mockResolvedValue({
        id: 'payment-absent',
        receiptNumber: 'RCP-202607-ZERO1',
      });

      await service.recordPayment(
        {
          studentId: 'student-absent',
          invoiceId: 'inv-absent-123',
          amountPaid: 0,
          paymentMethod: 'CASH' as any,
        },
        'admin-1',
      );

      expect(prismaService.monthlyInvoice.update).toHaveBeenCalledWith({
        where: { id: 'inv-absent-123' },
        data: { status: InvoiceStatus.PAID },
      });
    });
  });
});
