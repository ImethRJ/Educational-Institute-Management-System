import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, IsUUID, Min, ValidateIf } from 'class-validator';

export class UpdateSubjectDto {
  @ApiPropertyOptional({ example: 'MATH-G11', description: 'Unique subject code' })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional({ example: 'Mathematics (O/L)', description: 'Subject display name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 2800.0, description: 'Standard monthly tuition fee in LKR' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  standardMonthlyFee?: number;

  @ApiPropertyOptional({ example: 'b19a82e1-4567-4b12-8901-23456789abcd', description: 'Grade level ID' })
  @ValidateIf((o, val) => val !== null && val !== undefined && val !== '')
  @IsOptional()
  @IsUUID('4')
  gradeLevelId?: string | null;
}
