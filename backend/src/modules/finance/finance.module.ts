import { Module } from "@nestjs/common";
import { FinanceService } from "./finance.service";
import { FinanceController } from "./finance.controller";
import { AttendanceModule } from "../attendance/attendance.module";
import { PrismaService } from "../../common/prisma/prisma.service";

@Module({
  imports: [AttendanceModule],
  controllers: [FinanceController],
  providers: [FinanceService, PrismaService],
  exports: [FinanceService],
})
export class FinanceModule {}
