import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AcademicService } from './academic.service';
import { CreateGradeDto } from './dto/create-grade.dto';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { CreateBatchDto } from './dto/create-batch.dto';
import { CreateScheduleDto } from './dto/create-schedule.dto';
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
}
