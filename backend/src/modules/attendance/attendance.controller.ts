import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AttendanceService } from './attendance.service';
import { MarkBulkAttendanceDto } from './dto/mark-attendance.dto';
import { AttendanceQueryDto } from './dto/attendance-query.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentAdmin } from '../../common/decorators/current-admin.decorator';

@ApiTags('Attendance')
@ApiBearerAuth()
@Controller('attendance')
@UseGuards(JwtAuthGuard)
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post('mark-bulk')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark bulk class attendance for a batch date' })
  @ApiResponse({ status: 200, description: 'Attendance marked successfully.' })
  async markBulkAttendance(
    @Body() dto: MarkBulkAttendanceDto,
    @CurrentAdmin('id') adminId: string,
  ) {
    return this.attendanceService.markBulkAttendance(dto, adminId);
  }

  @Get()
  @ApiOperation({ summary: 'Get attendance history log with filters' })
  async getAttendanceRecords(@Query() query: AttendanceQueryDto) {
    return this.attendanceService.getAttendanceRecords(query);
  }
}
