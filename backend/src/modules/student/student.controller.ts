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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { StudentService } from './student.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { StudentQueryDto } from './dto/student-query.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentAdmin } from '../../common/decorators/current-admin.decorator';

@ApiTags('Students')
@ApiBearerAuth()
@Controller('students')
@UseGuards(JwtAuthGuard)
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Post()
  @ApiOperation({ summary: 'Register a new student admission' })
  @ApiResponse({ status: 201, description: 'Student registered successfully.' })
  async createStudent(
    @Body() createStudentDto: CreateStudentDto,
    @CurrentAdmin('id') adminId: string,
  ) {
    return this.studentService.createStudent(createStudentDto, adminId);
  }

  @Get()
  @ApiOperation({ summary: 'Get paginated list of students with search and filters' })
  async getStudents(@Query() query: StudentQueryDto) {
    return this.studentService.getStudents(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get 360 degree student profile by ID' })
  async getStudentById(@Param('id') id: string) {
    return this.studentService.getStudentById(id);
  }

  @Get('code/:code')
  @ApiOperation({ summary: 'Get student by student code (e.g. SEC-2026-COL-0001)' })
  async getStudentByCode(@Param('code') code: string) {
    return this.studentService.getStudentByCode(code);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update student profile details and fee category' })
  async updateStudent(
    @Param('id') id: string,
    @Body() updateStudentDto: UpdateStudentDto,
    @CurrentAdmin('id') adminId: string,
  ) {
    return this.studentService.updateStudent(id, updateStudentDto, adminId);
  }

  @Post(':id/enroll/:batchId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Enroll student into a batch class' })
  async enrollBatch(
    @Param('id') id: string,
    @Param('batchId') batchId: string,
    @CurrentAdmin('id') adminId: string,
  ) {
    return this.studentService.enrollStudentInBatch(id, batchId, adminId);
  }
}
