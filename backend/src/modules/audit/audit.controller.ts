import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from "@nestjs/swagger";
import { AuditService } from "./audit.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";

@ApiTags("Audit & Security Logs")
@ApiBearerAuth()
@Controller("audit")
@UseGuards(JwtAuthGuard)
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get("logs")
  @ApiOperation({ summary: "Get administrative audit trail logs" })
  @ApiQuery({ name: "page", required: false, example: 1 })
  @ApiQuery({ name: "limit", required: false, example: 50 })
  @ApiQuery({ name: "action", required: false })
  async getAuditLogs(
    @Query("page") page?: number,
    @Query("limit") limit?: number,
    @Query("action") action?: string,
  ) {
    return this.auditService.getAuditLogs(
      page ? Number(page) : 1,
      limit ? Number(limit) : 50,
      action,
    );
  }
}
