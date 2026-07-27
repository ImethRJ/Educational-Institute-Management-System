import { Injectable, NotFoundException, Logger } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";
import * as puppeteer from "puppeteer";

@Injectable()
export class PdfService {
  private readonly logger = new Logger(PdfService.name);

  constructor(private readonly prisma: PrismaService) {}

  async generateReceiptPdf(receiptNumber: string): Promise<Buffer> {
    const payment = await this.prisma.paymentRecord.findUnique({
      where: { receiptNumber },
      include: {
        student: true,
        teacher: true,
        invoice: { include: { batchClass: { include: { subject: true } } } },
        recordedByAdmin: { select: { fullName: true } },
      },
    });

    if (!payment) {
      throw new NotFoundException(
        `Payment receipt ${receiptNumber} not found.`,
      );
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 30px; color: #1e293b; }
          .header { text-align: center; border-bottom: 2px solid #0f172a; padding-bottom: 10px; }
          .logo { font-size: 24px; font-weight: bold; color: #0f172a; letter-spacing: 1px; }
          .sub { font-size: 12px; color: #64748b; margin-top: 4px; }
          .receipt-title { margin-top: 20px; font-size: 18px; font-weight: bold; text-align: center; background: #f8fafc; padding: 8px; border-radius: 4px; }
          .details-table { width: 100%; margin-top: 20px; border-collapse: collapse; }
          .details-table td { padding: 8px; border-bottom: 1px solid #e2e8f0; font-size: 14px; }
          .label { font-weight: bold; color: #475569; width: 40%; }
          .total-box { margin-top: 20px; text-align: right; font-size: 18px; font-weight: bold; color: #16a34a; }
          .footer { margin-top: 40px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px dashed #cbd5e1; padding-top: 10px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">SECTOR EDUCATIONAL INSTITUTE</div>
          <div class="sub">3/B Grace Peiris Road, Panadura | Tel: 0382232299</div>
        </div>
        <div class="receipt-title">OFFICIAL PAYMENT RECEIPT</div>
        <table class="details-table">
          <tr><td class="label">Receipt Number:</td><td><strong>${payment.receiptNumber}</strong></td></tr>
          <tr><td class="label">Date & Time:</td><td>${new Date(payment.paymentDate).toLocaleString("en-LK", { timeZone: "Asia/Colombo" })}</td></tr>
          <tr><td class="label">Student Code:</td><td>${payment.student.studentCode}</td></tr>
          <tr><td class="label">Student Name:</td><td>${payment.student.fullName}</td></tr>
          <tr><td class="label">Payment Purpose:</td><td>${payment.isAdmissionFee ? "One-Time Admission Fee" : `Monthly Tuition (${payment.invoice?.batchClass?.subject?.name || "Class Fee"})`}</td></tr>
          <tr><td class="label">Payment Method:</td><td>${payment.paymentMethod}</td></tr>
          <tr><td class="label">Issued By Admin:</td><td>${payment.recordedByAdmin.fullName}</td></tr>
        </table>
        <div class="total-box">Amount Paid: LKR ${Number(payment.amountPaid).toLocaleString("en-LK", { minimumFractionDigits: 2 })}</div>
        <div class="footer">Thank you for your payment. This is a computer-generated official receipt.</div>
      </body>
      </html>
    `;

    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      format: "A5",
      landscape: false,
      printBackground: true,
      margin: { top: "10mm", right: "10mm", bottom: "10mm", left: "10mm" },
    });

    await browser.close();
    return Buffer.from(pdfBuffer);
  }

  async generateTeacherPayoutPdf(month: number, year: number): Promise<Buffer> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const teachers = await this.prisma.teacher.findMany({
      where: { status: "ACTIVE" },
      orderBy: { fullName: "asc" },
    });

    const teacherPayouts = await Promise.all(
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

    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const monthLabel = monthNames[month - 1] || "July";

    const grandGross = teacherPayouts.reduce(
      (acc, curr) => acc + curr.totalGross,
      0,
    );
    const grandPayout = teacherPayouts.reduce(
      (acc, curr) => acc + curr.teacherPayout,
      0,
    );
    const grandInstitute = teacherPayouts.reduce(
      (acc, curr) => acc + curr.instituteShare,
      0,
    );

    const rowsHtml = teacherPayouts
      .map(
        (t) => `
        <tr>
          <td><strong>${t.teacherCode}</strong></td>
          <td>${t.fullName}</td>
          <td style="text-align: center;">${t.commissionPct}%</td>
          <td style="text-align: right;">LKR ${t.totalGross.toLocaleString("en-LK", { minimumFractionDigits: 2 })}</td>
          <td style="text-align: right; font-weight: bold; color: #0284c7;">LKR ${t.teacherPayout.toLocaleString("en-LK", { minimumFractionDigits: 2 })}</td>
          <td style="text-align: right; color: #16a34a;">LKR ${t.instituteShare.toLocaleString("en-LK", { minimumFractionDigits: 2 })}</td>
        </tr>
      `,
      )
      .join("");

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 25px; color: #0f172a; }
          .header { text-align: center; border-bottom: 2px solid #0f172a; padding-bottom: 10px; }
          .logo { font-size: 22px; font-weight: bold; letter-spacing: 1px; }
          .sub { font-size: 11px; color: #64748b; margin-top: 4px; }
          .title { margin-top: 15px; font-size: 16px; font-weight: bold; text-align: center; background: #f1f5f9; padding: 8px; border-radius: 4px; }
          .table { width: 100%; margin-top: 15px; border-collapse: collapse; font-size: 12px; }
          .table th { background: #0f172a; color: #ffffff; padding: 8px; text-align: left; }
          .table td { padding: 8px; border-bottom: 1px solid #e2e8f0; }
          .grand-total { margin-top: 20px; font-size: 14px; font-weight: bold; text-align: right; background: #f8fafc; padding: 12px; border: 1px solid #cbd5e1; border-radius: 6px; }
          .footer { margin-top: 30px; text-align: center; font-size: 10px; color: #94a3b8; border-top: 1px dashed #cbd5e1; padding-top: 8px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">SECTOR EDUCATIONAL INSTITUTE</div>
          <div class="sub">3/B Grace Peiris Road, Panadura | Tel: 0382232299</div>
        </div>
        <div class="title">TEACHER EARNINGS & PAYOUT RECONCILIATION (${monthLabel.toUpperCase()} ${year})</div>
        <table class="table">
          <thead>
            <tr>
              <th>Teacher Code</th>
              <th>Teacher Name</th>
              <th style="text-align: center;">Split %</th>
              <th style="text-align: right;">Gross Collections</th>
              <th style="text-align: right;">Teacher Payout Share</th>
              <th style="text-align: right;">Institute Net Share</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
        <div class="grand-total">
          Total Teacher Payouts: LKR ${grandPayout.toLocaleString("en-LK", { minimumFractionDigits: 2 })} | Total Institute Net Share: LKR ${grandInstitute.toLocaleString("en-LK", { minimumFractionDigits: 2 })}
        </div>
        <div class="footer">Confidential Administrative Financial Report • Generated on ${new Date().toLocaleString("en-LK")}</div>
      </body>
      </html>
    `;

    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      landscape: true,
      printBackground: true,
      margin: { top: "10mm", right: "10mm", bottom: "10mm", left: "10mm" },
    });

    await browser.close();
    return Buffer.from(pdfBuffer);
  }
}
