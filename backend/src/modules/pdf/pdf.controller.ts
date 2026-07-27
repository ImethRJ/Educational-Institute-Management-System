import { Controller, Get, Param, Res, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { Response } from "express";
import { PdfService } from "./pdf.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";

@ApiTags("PDF Receipt & Reports Generator")
@ApiBearerAuth()
@Controller("pdf")
@UseGuards(JwtAuthGuard)
export class PdfController {
  constructor(private readonly pdfService: PdfService) {}

  @Get("receipt/:receiptNumber")
  @ApiOperation({ summary: "Download printable payment receipt PDF" })
  async downloadReceiptPdf(
    @Param("receiptNumber") receiptNumber: string,
    @Res() res: Response,
  ) {
    const pdfBuffer = await this.pdfService.generateReceiptPdf(receiptNumber);

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${receiptNumber}.pdf"`,
      "Content-Length": pdfBuffer.length,
    });

    res.end(pdfBuffer);
  }

  @Get("teacher-payout-summary")
  @ApiOperation({
    summary: "Generate printable PDF for Teacher Earnings & Payout Summary",
  })
  async downloadTeacherPayoutPdf(@Res() res: Response, @Param() query: any) {
    const month = (res.req.query.month as any)
      ? Number(res.req.query.month)
      : 7;
    const year = (res.req.query.year as any)
      ? Number(res.req.query.year)
      : 2026;

    const pdfBuffer = await this.pdfService.generateTeacherPayoutPdf(
      month,
      year,
    );

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="teacher_payout_summary_${year}_${month}.pdf"`,
      "Content-Length": pdfBuffer.length,
    });

    res.end(pdfBuffer);
  }
}
