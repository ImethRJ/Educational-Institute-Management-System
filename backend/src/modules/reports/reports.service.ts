import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import * as ExcelJS from 'exceljs';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async generateFeeCollectionExcel(month?: number, year?: number): Promise<Buffer> {
    const targetMonth = month || new Date().getMonth() + 1;
    const targetYear = year || new Date().getFullYear();

    const startDate = new Date(targetYear, targetMonth - 1, 1);
    const endDate = new Date(targetYear, targetMonth, 1);

    const payments = await this.prisma.paymentRecord.findMany({
      where: {
        paymentDate: { gte: startDate, lt: endDate },
      },
      include: {
        student: { select: { studentCode: true, fullName: true, mobileNumber: true } },
        teacher: { select: { teacherCode: true, fullName: true } },
        invoice: { select: { invoiceNumber: true } },
        recordedByAdmin: { select: { fullName: true } },
      },
      orderBy: { paymentDate: 'desc' },
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(`Fee Collection ${targetYear}-${targetMonth}`);

    worksheet.columns = [
      { header: 'Receipt No', key: 'receiptNumber', width: 20 },
      { header: 'Payment Date', key: 'paymentDate', width: 22 },
      { header: 'Student Code', key: 'studentCode', width: 18 },
      { header: 'Student Name', key: 'studentName', width: 25 },
      { header: 'Type', key: 'type', width: 18 },
      { header: 'Amount Paid (LKR)', key: 'amountPaid', width: 20 },
      { header: 'Teacher Share (LKR)', key: 'teacherShare', width: 20 },
      { header: 'Institute Share (LKR)', key: 'instituteShare', width: 20 },
      { header: 'Payment Method', key: 'paymentMethod', width: 16 },
      { header: 'Recorded By', key: 'adminName', width: 20 },
    ];

    payments.forEach((p) => {
      worksheet.addRow({
        receiptNumber: p.receiptNumber,
        paymentDate: new Date(p.paymentDate).toLocaleString('en-LK'),
        studentCode: p.student.studentCode,
        studentName: p.student.fullName,
        type: p.isAdmissionFee ? 'Admission Fee' : 'Monthly Tuition',
        amountPaid: Number(p.amountPaid),
        teacherShare: Number(p.teacherShareAmount),
        instituteShare: Number(p.instituteShareAmount),
        paymentMethod: p.paymentMethod,
        adminName: p.recordedByAdmin.fullName,
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
}
