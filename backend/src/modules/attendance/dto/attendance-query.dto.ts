import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class AttendanceQueryDto {
  @ApiPropertyOptional({ example: 'c39a82e1-4567-4b12-8901-23456789abcd', description: 'Batch Class ID' })
  @IsOptional()
  @IsUUID('4')
  batchClassId?: string;

  @ApiPropertyOptional({ example: 'c39a82e1-4567-4b12-8901-23456789abcd', description: 'Student ID' })
  @IsOptional()
  @IsUUID('4')
  studentId?: string;

  @ApiPropertyOptional({ example: 7, description: 'Filter by Month (1-12)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  month?: number;

  @ApiPropertyOptional({ example: 2026, description: 'Filter by Year' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(2024)
  year?: number;
}
