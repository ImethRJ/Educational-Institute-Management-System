import { Controller, Get, Param, Res, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { PdfService } from './pdf.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('PDF Receipt & Reports Generator')
@ApiBearerAuth()
@Controller('pdf')
@UseGuards(JwtAuthGuard)
export class PdfController {
  constructor(private readonly pdfService: PdfService) {}

  @Get('receipt/:receiptNumber')
  @ApiOperation({ summary: 'Download printable payment receipt PDF' })
  async downloadReceiptPdf(
    @Param('receiptNumber') receiptNumber: string,
    @Res() res: Response,
  ) {
    const pdfBuffer = await this.pdfService.generateReceiptPdf(receiptNumber);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${receiptNumber}.pdf"`,
      'Content-Length': pdfBuffer.length,
    });

    res.end(pdfBuffer);
  }
}
