import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, IsUUID, Min } from 'class-validator';

export class UpdateBatchDto {
  @ApiPropertyOptional({ example: '2026 A/L Combined Maths Revision', description: 'Batch class name' })
  @IsOptional()
  @IsString()
  batchName?: string;

  @ApiPropertyOptional({ example: 3500.0, description: 'Monthly fee in LKR' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  monthlyFee?: number;

  @ApiPropertyOptional({ example: 'Hall B', description: 'Assigned hall / room number' })
  @IsOptional()
  @IsString()
  hallNumber?: string;

  @ApiPropertyOptional({ example: 'c39a82e1-4567-4b12-8901-23456789abcd', description: 'Teacher ID' })
  @IsOptional()
  @IsUUID('4')
  teacherId?: string;

  @ApiPropertyOptional({ example: 'd39a82e1-4567-4b12-8901-23456789abcd', description: 'Branch ID' })
  @IsOptional()
  @IsUUID('4')
  branchId?: string;

  @ApiPropertyOptional({ example: 'c39a82e1-4567-4b12-8901-23456789abcd', description: 'Grade Level ID' })
  @IsOptional()
  @IsUUID('4')
  gradeLevelId?: string;

  @ApiPropertyOptional({ example: 'c39a82e1-4567-4b12-8901-23456789abcd', description: 'Subject ID' })
  @IsOptional()
  @IsUUID('4')
  subjectId?: string;
}
