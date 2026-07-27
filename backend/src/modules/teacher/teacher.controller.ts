import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from "@nestjs/swagger";
import { TeacherService } from "./teacher.service";
import { CreateTeacherDto } from "./dto/create-teacher.dto";
import { UpdateTeacherDto } from "./dto/update-teacher.dto";
import { UpdateCommissionConfigDto } from "./dto/commission-config.dto";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { CurrentAdmin } from "../../common/decorators/current-admin.decorator";

@ApiTags("Teachers")
@ApiBearerAuth()
@Controller("teachers")
@UseGuards(JwtAuthGuard)
export class TeacherController {
  constructor(private readonly teacherService: TeacherService) {}

  @Post()
  @ApiOperation({ summary: "Register a new teacher profile" })
  @ApiResponse({ status: 201, description: "Teacher registered successfully." })
  async createTeacher(
    @Body() dto: CreateTeacherDto,
    @CurrentAdmin("id") adminId: string,
  ) {
    return this.teacherService.createTeacher(dto, adminId);
  }

  @Get()
  @ApiOperation({
    summary: "Get list of teachers with optional search and status filter",
  })
  @ApiQuery({ name: "search", required: false })
  @ApiQuery({ name: "status", required: false })
  async getTeachers(
    @Query("search") search?: string,
    @Query("status") status?: string,
  ) {
    return this.teacherService.getTeachers(search, status);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get teacher profile by ID" })
  async getTeacherById(@Param("id") id: string) {
    return this.teacherService.getTeacherById(id);
  }

  @Put(":id")
  @ApiOperation({ summary: "Update teacher profile details" })
  async updateTeacher(
    @Param("id") id: string,
    @Body() dto: UpdateTeacherDto,
    @CurrentAdmin("id") adminId: string,
  ) {
    return this.teacherService.updateTeacher(id, dto, adminId);
  }

  @Put(":id/commission")
  @ApiOperation({
    summary: "Configure teacher tuition and admission fee commission rules",
  })
  async updateCommissionConfig(
    @Param("id") id: string,
    @Body() dto: UpdateCommissionConfigDto,
    @CurrentAdmin("id") adminId: string,
  ) {
    return this.teacherService.updateCommissionConfig(id, dto, adminId);
  }

  @Get(":id/earnings")
  @ApiOperation({
    summary: "Get teacher earnings and commission breakdown by month",
  })
  @ApiQuery({ name: "month", required: false, example: 7 })
  @ApiQuery({ name: "year", required: false, example: 2026 })
  async getEarnings(
    @Param("id") id: string,
    @Query("month") month?: number,
    @Query("year") year?: number,
  ) {
    return this.teacherService.getTeacherEarningsSummary(id, month, year);
  }
}
