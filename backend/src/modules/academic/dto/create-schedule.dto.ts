import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID, IsInt, Min, Max, Matches } from 'class-validator';

export class CreateScheduleDto {
  @ApiProperty({ example: 'c39a82e1-4567-4b12-8901-23456789abcd', description: 'Batch Class ID' })
  @IsNotEmpty({ message: 'Batch class ID is required.' })
  @IsUUID('4', { message: 'Invalid batch class UUID.' })
  batchClassId: string;

  @ApiProperty({ example: 6, description: 'Day of week (1=Monday, 6=Saturday, 7=Sunday)' })
  @IsNotEmpty({ message: 'Day of week is required.' })
  @IsInt()
  @Min(1)
  @Max(7)
  dayOfWeek: number;

  @ApiProperty({ example: '08:00', description: 'Class start time in HH:mm 24-hour format' })
  @IsNotEmpty({ message: 'Start time is required.' })
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Start time must be a valid 24-hour time format (HH:mm).',
  })
  startTime: string;

  @ApiProperty({ example: '10:30', description: 'Class end time in HH:mm 24-hour format' })
  @IsNotEmpty({ message: 'End time is required.' })
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'End time must be a valid 24-hour time format (HH:mm).',
  })
  endTime: string;
}
