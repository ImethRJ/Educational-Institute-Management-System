import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID, IsNumber, Min, IsOptional } from 'class-validator';

export class CreateBatchDto {
  @ApiProperty({ example: 'c39a82e1-4567-4b12-8901-23456789abcd', description: 'Branch ID' })
  @IsNotEmpty({ message: 'Branch ID is required.' })
  @IsUUID('4', { message: 'Invalid branch UUID.' })
  branchId: string;

  @ApiProperty({ example: '00000000-0000-0000-0000-000000002026', description: 'Academic Year ID' })
  @IsNotEmpty({ message: 'Academic Year ID is required.' })
  @IsUUID('4', { message: 'Invalid academic year UUID.' })
  academicYearId: string;

  @ApiProperty({ example: 'c39a82e1-4567-4b12-8901-23456789abcd', description: 'Subject ID' })
  @IsNotEmpty({ message: 'Subject ID is required.' })
  @IsUUID('4', { message: 'Invalid subject UUID.' })
  subjectId: string;

  @ApiProperty({ example: 'c39a82e1-4567-4b12-8901-23456789abcd', description: 'Assigned Teacher ID' })
  @IsNotEmpty({ message: 'Teacher ID is required.' })
  @IsUUID('4', { message: 'Invalid teacher UUID.' })
  teacherId: string;

  @ApiProperty({ example: '2026 Grade 11 Combined Maths - Batch A', description: 'Batch class display name' })
  @IsNotEmpty({ message: 'Batch name is required.' })
  @IsString()
  batchName: string;

  @ApiProperty({ example: 3500.0, description: 'Batch monthly fee in LKR' })
  @IsNotEmpty({ message: 'Monthly fee is required.' })
  @IsNumber({}, { message: 'Monthly fee must be a number.' })
  @Min(0, { message: 'Monthly fee cannot be negative.' })
  monthlyFee: number;

  @ApiPropertyOptional({ example: 'Hall A (Main Building)', description: 'Assigned hall or room' })
  @IsOptional()
  @IsString()
  hallNumber?: string;
}
