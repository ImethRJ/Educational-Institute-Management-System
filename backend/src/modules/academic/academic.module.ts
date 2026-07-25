import { Module } from '@nestjs/common';
import { AcademicService } from './academic.service';
import { AcademicController } from './academic.controller';
import { PrismaService } from '../../common/prisma/prisma.service';

@Module({
  controllers: [AcademicController],
  providers: [AcademicService, PrismaService],
  exports: [AcademicService],
})
export class AcademicModule {}
