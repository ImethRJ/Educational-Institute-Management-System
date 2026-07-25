import { Module } from '@nestjs/common';
import { StudentService } from './student.service';
import { StudentController } from './student.controller';
import { StudentRepository } from './student.repository';
import { PrismaService } from '../../common/prisma/prisma.service';

@Module({
  controllers: [StudentController],
  providers: [StudentService, StudentRepository, PrismaService],
  exports: [StudentService, StudentRepository],
})
export class StudentModule {}
