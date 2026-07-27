import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";
import * as ExcelJS from "exceljs";

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async generateFeeCollectionExcel(
    month?: number,
    year?: number,
  ): Promise<Buffer> {
    const targetMonth = month || new Date().getMonth() + 1;
    const targetYear = year || new Date().getFullYear();

    const startDate = new Date(targetYear, targetMonth - 1, 1);
    const endDate = new Date(targetYear, targetMonth, 1);

    const payments = await this.prisma.paymentRecord.findMany({
      where: {
        paymentDate: { gte: startDate, lt: endDate },
      },
      include: {
        student: {
          select: { studentCode: true, fullName: true, mobileNumber: true },
        },
        teacher: { select: { teacherCode: true, fullName: true } },
        invoice: { select: { invoiceNumber: true } },
        recordedByAdmin: { select: { fullName: true } },
      },
      orderBy: { paymentDate: "desc" },
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(
      `Fee Collection ${targetYear}-${targetMonth}`,
    );

    worksheet.columns = [
      { header: "Receipt No", key: "receiptNumber", width: 20 },
      { header: "Payment Date", key: "paymentDate", width: 22 },
      { header: "Student Code", key: "studentCode", width: 18 },
      { header: "Student Name", key: "studentName", width: 25 },
      { header: "Type", key: "type", width: 18 },
      { header: "Amount Paid (LKR)", key: "amountPaid", width: 20 },
      { header: "Teacher Share (LKR)", key: "teacherShare", width: 20 },
      { header: "Institute Share (LKR)", key: "instituteShare", width: 20 },
      { header: "Payment Method", key: "paymentMethod", width: 16 },
      { header: "Recorded By", key: "adminName", width: 20 },
    ];

    payments.forEach((p) => {
      worksheet.addRow({
        receiptNumber: p.receiptNumber,
        paymentDate: new Date(p.paymentDate).toLocaleString("en-LK"),
        studentCode: p.student.studentCode,
        studentName: p.student.fullName,
        type: p.isAdmissionFee ? "Admission Fee" : "Monthly Tuition",
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

  async getTeacherPayoutSummaryData(month?: number, year?: number) {
    const targetMonth = month || new Date().getMonth() + 1;
    const targetYear = year || new Date().getFullYear();

    const startDate = new Date(targetYear, targetMonth - 1, 1);
    const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59);

    const teachers = await this.prisma.teacher.findMany({
      where: { status: "ACTIVE" },
      orderBy: { fullName: "asc" },
    });

    return Promise.all(
      teachers.map(async (t) => {
        const agg = await this.prisma.paymentRecord.aggregate({
          where: {
            teacherId: t.id,
            paymentDate: { gte: startDate, lte: endDate },
          },
          _sum: {
            amountPaid: true,
            teacherShareAmount: true,
            instituteShareAmount: true,
          },
          _count: { id: true },
        });

        return {
          teacherId: t.id,
          teacherCode: t.teacherCode,
          fullName: t.fullName,
          commissionPct: Number(t.defaultTuitionCommissionPct),
          totalGross: Number(agg._sum.amountPaid || 0),
          teacherPayout: Number(agg._sum.teacherShareAmount || 0),
          instituteShare: Number(agg._sum.instituteShareAmount || 0),
          paymentCount: agg._count.id || 0,
        };
      }),
    );
  }

  async generateTeacherPayoutExcel(
    month?: number,
    year?: number,
  ): Promise<Buffer> {
    const data = await this.getTeacherPayoutSummaryData(month, year);
    const targetMonth = month || new Date().getMonth() + 1;
    const targetYear = year || new Date().getFullYear();

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(
      `Teacher Payouts ${targetYear}-${targetMonth}`,
    );

    worksheet.columns = [
      { header: "Teacher Code", key: "teacherCode", width: 18 },
      { header: "Teacher Name", key: "fullName", width: 25 },
      { header: "Commission Split %", key: "commissionPct", width: 20 },
      { header: "Gross Fee Collections (LKR)", key: "totalGross", width: 25 },
      { header: "Teacher Net Payout (LKR)", key: "teacherPayout", width: 25 },
      {
        header: "Institute Share Retained (LKR)",
        key: "instituteShare",
        width: 25,
      },
      { header: "Total Transactions", key: "paymentCount", width: 20 },
    ];

    data.forEach((row) => {
      worksheet.addRow(row);
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
}
