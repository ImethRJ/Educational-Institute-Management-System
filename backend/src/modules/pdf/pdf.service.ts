import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import * as puppeteer from 'puppeteer';

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
      throw new NotFoundException(`Payment receipt ${receiptNumber} not found.`);
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
          <div class="sub">123 High Level Road, Nugegoda, Sri Lanka | Tel: +94 11 234 5678</div>
        </div>
        <div class="receipt-title">OFFICIAL PAYMENT RECEIPT</div>
        <table class="details-table">
          <tr><td class="label">Receipt Number:</td><td><strong>${payment.receiptNumber}</strong></td></tr>
          <tr><td class="label">Date & Time:</td><td>${new Date(payment.paymentDate).toLocaleString('en-LK', { timeZone: 'Asia/Colombo' })}</td></tr>
          <tr><td class="label">Student Code:</td><td>${payment.student.studentCode}</td></tr>
          <tr><td class="label">Student Name:</td><td>${payment.student.fullName}</td></tr>
          <tr><td class="label">Payment Purpose:</td><td>${payment.isAdmissionFee ? 'One-Time Admission Fee' : `Monthly Tuition (${payment.invoice?.batchClass?.subject?.name || 'Class Fee'})`}</td></tr>
          <tr><td class="label">Payment Method:</td><td>${payment.paymentMethod}</td></tr>
          <tr><td class="label">Issued By Admin:</td><td>${payment.recordedByAdmin.fullName}</td></tr>
        </table>
        <div class="total-box">Amount Paid: LKR ${Number(payment.amountPaid).toLocaleString('en-LK', { minimumFractionDigits: 2 })}</div>
        <div class="footer">Thank you for your payment. This is a computer-generated official receipt.</div>
      </body>
      </html>
    `;

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
      format: 'A5',
      landscape: false,
      printBackground: true,
      margin: { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' },
    });

    await browser.close();
    return Buffer.from(pdfBuffer);
  }
}
