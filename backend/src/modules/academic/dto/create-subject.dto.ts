import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID, IsNumber, Min, IsOptional, IsArray, ValidateIf } from 'class-validator';

export class CreateSubjectDto {
  @ApiPropertyOptional({ example: 'c39a82e1-4567-4b12-8901-23456789abcd', description: 'Optional single grade level ID' })
  @ValidateIf((o, val) => val !== null && val !== undefined && val !== '')
  @IsOptional()
  @IsUUID('4', { message: 'Invalid grade level UUID.' })
  gradeLevelId?: string | null;

  @ApiPropertyOptional({ example: ['uuid-1', 'uuid-2'], description: 'Optional multiple grade level IDs' })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true, message: 'Invalid grade level UUID in list.' })
  gradeLevelIds?: string[];

  @ApiProperty({ example: 'ALG-13', description: 'Unique subject code' })
  @IsNotEmpty({ message: 'Subject code is required.' })
  @IsString()
  code: string;

  @ApiProperty({ example: 'Combined Mathematics (A/L)', description: 'Subject name' })
  @IsNotEmpty({ message: 'Subject name is required.' })
  @IsString()
  name: string;

  @ApiProperty({ example: 3500.0, description: 'Standard monthly tuition fee in LKR' })
  @IsNotEmpty({ message: 'Standard monthly fee is required.' })
  @IsNumber({}, { message: 'Standard monthly fee must be a number.' })
  @Min(0, { message: 'Monthly fee cannot be negative.' })
  standardMonthlyFee: number;
}
