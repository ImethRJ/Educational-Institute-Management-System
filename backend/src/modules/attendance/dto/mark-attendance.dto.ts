import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsNotEmpty,
  IsUUID,
  IsDateString,
  IsEnum,
  IsArray,
  ValidateNested,
  IsOptional,
  IsString,
} from "class-validator";
import { Type } from "class-transformer";
import { AttendanceStatus } from "@prisma/client";

export class SingleStudentAttendanceDto {
  @ApiProperty({
    example: "c39a82e1-4567-4b12-8901-23456789abcd",
    description: "Student ID",
  })
  @IsNotEmpty({ message: "Student ID is required." })
  @IsUUID("4", { message: "Invalid student UUID." })
  studentId: string;

  @ApiProperty({
    enum: AttendanceStatus,
    example: AttendanceStatus.PRESENT,
    description: "Attendance status",
  })
  @IsNotEmpty({ message: "Attendance status is required." })
  @IsEnum(AttendanceStatus)
  status: AttendanceStatus;

  @ApiPropertyOptional({
    example: "Medical excuse note attached",
    description: "Optional remarks",
  })
  @IsOptional()
  @IsString()
  remarks?: string;
}

export class MarkBulkAttendanceDto {
  @ApiProperty({
    example: "c39a82e1-4567-4b12-8901-23456789abcd",
    description: "Batch Class ID",
  })
  @IsNotEmpty({ message: "Batch class ID is required." })
  @IsUUID("4", { message: "Invalid batch class UUID." })
  batchClassId: string;

  @ApiProperty({
    example: "2026-07-25",
    description: "Attendance date (YYYY-MM-DD)",
  })
  @IsNotEmpty({ message: "Attendance date is required." })
  @IsDateString({}, { message: "Invalid attendance date format." })
  attendanceDate: string;

  @ApiProperty({
    type: [SingleStudentAttendanceDto],
    description: "Array of student attendance records",
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SingleStudentAttendanceDto)
  records: SingleStudentAttendanceDto[];
}
