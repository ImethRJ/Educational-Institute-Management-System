import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AcademicService } from './academic.service';
import { CreateGradeDto } from './dto/create-grade.dto';
import { UpdateGradeDto } from './dto/update-grade.dto';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';
import { CreateBatchDto } from './dto/create-batch.dto';
import { UpdateBatchDto } from './dto/update-batch.dto';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentAdmin } from '../../common/decorators/current-admin.decorator';

@ApiTags('Academic & Timetable')
@ApiBearerAuth()
@Controller('academic')
@UseGuards(JwtAuthGuard)
export class AcademicController {
  constructor(private readonly academicService: AcademicService) {}

  // Grades
  @Post('grades')
  @ApiOperation({ summary: 'Create a new grade level' })
  async createGrade(@Body() dto: CreateGradeDto) {
    return this.academicService.createGrade(dto);
  }

  @Get('grades')
  @ApiOperation({ summary: 'Get list of all grade levels' })
  async getGrades() {
    return this.academicService.getAllGrades();
  }

  @Put('grades/:id')
  @ApiOperation({ summary: 'Update a grade level' })
  async updateGrade(@Param('id') id: string, @Body() dto: UpdateGradeDto) {
    return this.academicService.updateGrade(id, dto);
  }

  @Delete('grades/:id')
  @ApiOperation({ summary: 'Delete a grade level' })
  async deleteGrade(@Param('id') id: string) {
    return this.academicService.deleteGrade(id);
  }

  // Branches
  @Get('branches')
  @ApiOperation({ summary: 'Get list of active institute branches' })
  async getBranches() {
    return this.academicService.getAllBranches();
  }

  // Subjects
  @Post('subjects')
  @ApiOperation({ summary: 'Create a new subject' })
  async createSubject(@Body() dto: CreateSubjectDto) {
    return this.academicService.createSubject(dto);
  }

  @Get('subjects')
  @ApiOperation({ summary: 'Get list of subjects with optional grade level filter' })
  @ApiQuery({ name: 'gradeLevelId', required: false })
  async getSubjects(@Query('gradeLevelId') gradeLevelId?: string) {
    return this.academicService.getAllSubjects(gradeLevelId);
  }

  @Put('subjects/:id')
  @ApiOperation({ summary: 'Update a subject profile' })
  async updateSubject(@Param('id') id: string, @Body() dto: UpdateSubjectDto) {
    return this.academicService.updateSubject(id, dto);
  }

  @Delete('subjects/:id')
  @ApiOperation({ summary: 'Delete a subject' })
  async deleteSubject(@Param('id') id: string) {
    return this.academicService.deleteSubject(id);
  }

  // Batches
  @Post('batches')
  @ApiOperation({ summary: 'Create a new batch class' })
  async createBatch(
    @Body() dto: CreateBatchDto,
    @CurrentAdmin('id') adminId: string,
  ) {
    return this.academicService.createBatch(dto, adminId);
  }

  @Get('batches')
  @ApiOperation({ summary: 'Get list of batch classes' })
  @ApiQuery({ name: 'subjectId', required: false })
  @ApiQuery({ name: 'teacherId', required: false })
  async getBatches(
    @Query('subjectId') subjectId?: string,
    @Query('teacherId') teacherId?: string,
  ) {
    return this.academicService.getAllBatches(subjectId, teacherId);
  }

  @Get('batches/:id')
  @ApiOperation({ summary: 'Get detailed batch class profile and enrolled students' })
  async getBatchById(@Param('id') id: string) {
    return this.academicService.getBatchById(id);
  }

  @Put('batches/:id')
  @ApiOperation({ summary: 'Update batch class details' })
  async updateBatch(
    @Param('id') id: string,
    @Body() dto: UpdateBatchDto,
    @CurrentAdmin('id') adminId: string,
  ) {
    return this.academicService.updateBatch(id, dto, adminId);
  }

  @Delete('batches/:id')
  @ApiOperation({ summary: 'Delete batch class' })
  async deleteBatch(
    @Param('id') id: string,
    @CurrentAdmin('id') adminId: string,
  ) {
    return this.academicService.deleteBatch(id, adminId);
  }

  // Timetable Schedules
  @Post('schedules')
  @ApiOperation({ summary: 'Create a timetable class schedule slot with collision detection' })
  async createSchedule(@Body() dto: CreateScheduleDto) {
    return this.academicService.createClassSchedule(dto);
  }

  @Get('timetable')
  @ApiOperation({ summary: 'Get weekly timetable matrix' })
  @ApiQuery({ name: 'dayOfWeek', required: false, example: 6 })
  @ApiQuery({ name: 'hallNumber', required: false, example: 'Hall A' })
  async getTimetable(
    @Query('dayOfWeek') dayOfWeek?: number,
    @Query('hallNumber') hallNumber?: string,
  ) {
    return this.academicService.getWeeklyTimetable(dayOfWeek ? Number(dayOfWeek) : undefined, hallNumber);
  }

  @Put('schedules/:id')
  @ApiOperation({ summary: 'Update timetable schedule slot' })
  async updateSchedule(@Param('id') id: string, @Body() dto: UpdateScheduleDto) {
    return this.academicService.updateSchedule(id, dto);
  }

  @Delete('schedules/:id')
  @ApiOperation({ summary: 'Delete timetable schedule slot' })
  async deleteSchedule(@Param('id') id: string) {
    return this.academicService.deleteSchedule(id);
  }
}
