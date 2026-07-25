import { Module } from '@nestjs/common';
import { TeacherService } from './teacher.service';
import { TeacherController } from './teacher.controller';
import { TeacherRepository } from './teacher.repository';
import { PrismaService } from '../../common/prisma/prisma.service';

@Module({
  controllers: [TeacherController],
  providers: [TeacherService, TeacherRepository, PrismaService],
  exports: [TeacherService, TeacherRepository],
})
export class TeacherModule {}
