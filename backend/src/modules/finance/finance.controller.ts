import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from "@nestjs/swagger";
import { FinanceService } from "./finance.service";
import { GenerateMonthlyInvoicesDto } from "./dto/generate-invoices.dto";
import { OverrideZeroAttendanceDto } from "./dto/override-zero-att.dto";
import { RecordPaymentDto } from "./dto/record-payment.dto";
import { ProcessTeacherPayoutDto } from "./dto/payout.dto";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { CurrentAdmin } from "../../common/decorators/current-admin.decorator";
import { InvoiceStatus } from "@prisma/client";

@ApiTags("Finance & Fee Management")
@ApiBearerAuth()
@Controller("finance")
@UseGuards(JwtAuthGuard)
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  @Post("invoices/generate-monthly")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      "Trigger monthly invoice generator engine with 0% attendance suppression",
  })
  async generateInvoices(
    @Body() dto: GenerateMonthlyInvoicesDto,
    @CurrentAdmin("id") adminId: string,
  ) {
    return this.financeService.generateMonthlyInvoices(dto, adminId);
  }

  @Put("invoices/:id/cancel")
  @ApiOperation({ summary: "Void / cancel an unpaid monthly invoice" })
  async cancelInvoice(
    @Param("id") id: string,
    @Body("reason") reason: string,
    @CurrentAdmin("id") adminId: string,
  ) {
    return this.financeService.cancelInvoice(id, adminId, reason);
  }

  @Put("invoices/:id/override-zero-attendance")
  @ApiOperation({
    summary:
      "Approve administrator override for 0% attendance suppressed invoice",
  })
  async overrideZeroAttendance(
    @Param("id") id: string,
    @Body() dto: OverrideZeroAttendanceDto,
    @CurrentAdmin("id") adminId: string,
  ) {
    return this.financeService.overrideZeroAttendance(id, dto, adminId);
  }

  @Get("dashboard-summary")
  @ApiOperation({
    summary: "Get live real-time dashboard KPIs and analytics metrics",
  })
  async getDashboardSummary() {
    return this.financeService.getDashboardKPIs();
  }

  @Get("invoices")
  @ApiOperation({ summary: "Get list of monthly invoices with filters" })
  @ApiQuery({ name: "month", required: false })
  @ApiQuery({ name: "year", required: false })
  @ApiQuery({ name: "status", required: false, enum: InvoiceStatus })
  async getInvoices(
    @Query("month") month?: number,
    @Query("year") year?: number,
    @Query("status") status?: InvoiceStatus,
  ) {
    return this.financeService.getInvoices(
      month ? Number(month) : undefined,
      year ? Number(year) : undefined,
      status,
    );
  }

  @Post("payments")
  @ApiOperation({
    summary:
      "Record student payment & execute automatic teacher revenue split engine",
  })
  async recordPayment(
    @Body() dto: RecordPaymentDto,
    @CurrentAdmin("id") adminId: string,
  ) {
    return this.financeService.recordPayment(dto, adminId);
  }

  @Get("payments")
  @ApiOperation({
    summary: "Get list of payment records with student & teacher split details",
  })
  @ApiQuery({ name: "studentId", required: false })
  @ApiQuery({ name: "teacherId", required: false })
  async getPayments(
    @Query("studentId") studentId?: string,
    @Query("teacherId") teacherId?: string,
  ) {
    return this.financeService.getPayments(studentId, teacherId);
  }

  @Post("payouts/process")
  @ApiOperation({ summary: "Process monthly teacher payout settlement" })
  async processPayout(
    @Body() dto: ProcessTeacherPayoutDto,
    @CurrentAdmin("id") adminId: string,
  ) {
    return this.financeService.processTeacherPayout(dto, adminId);
  }
}
