import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { FeeCategory, StudentStatus } from '@prisma/client';

export class StudentQueryDto {
  @ApiPropertyOptional({ example: 'Kasun', description: 'Search by student name, code, or mobile number' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: StudentStatus, description: 'Filter by student status' })
  @IsOptional()
  @IsEnum(StudentStatus)
  status?: StudentStatus;

  @ApiPropertyOptional({ enum: FeeCategory, description: 'Filter by fee category' })
  @IsOptional()
  @IsEnum(FeeCategory)
  feeCategory?: FeeCategory;

  @ApiPropertyOptional({ example: 'e49a82e1-4567-4b12-8901-23456789abcd', description: 'Filter by batch class ID' })
  @IsOptional()
  @IsString()
  batchClassId?: string;

  @ApiPropertyOptional({ example: 1, default: 1, description: 'Page number' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 20, default: 20, description: 'Page size limit' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}
