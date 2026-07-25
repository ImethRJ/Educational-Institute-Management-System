import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Response } from 'express';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Reports & Analytics')
@ApiBearerAuth()
@Controller('reports')
@UseGuards(JwtAuthGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('fee-collection/excel')
  @ApiOperation({ summary: 'Export monthly fee collection report as Excel spreadsheet' })
  @ApiQuery({ name: 'month', required: false, example: 7 })
  @ApiQuery({ name: 'year', required: false, example: 2026 })
  async exportFeeCollectionExcel(
    @Query('month') month?: number,
    @Query('year') year?: number,
    @Res() res?: Response,
  ) {
    const excelBuffer = await this.reportsService.generateFeeCollectionExcel(
      month ? Number(month) : undefined,
      year ? Number(year) : undefined,
    );

    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="fee_collection_${year || 2026}_${month || 7}.xlsx"`,
      'Content-Length': excelBuffer.length,
    });

    res.end(excelBuffer);
  }
}
