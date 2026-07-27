import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsNotEmpty,
  IsUUID,
  IsInt,
  Min,
  Max,
  IsOptional,
  IsString,
} from "class-validator";

export class ProcessTeacherPayoutDto {
  @ApiProperty({
    example: "c39a82e1-4567-4b12-8901-23456789abcd",
    description: "Teacher ID",
  })
  @IsNotEmpty({ message: "Teacher ID is required." })
  @IsUUID("4")
  teacherId: string;

  @ApiProperty({ example: 7, description: "Payout period month (1-12)" })
  @IsNotEmpty({ message: "Period month is required." })
  @IsInt()
  @Min(1)
  @Max(12)
  periodMonth: number;

  @ApiProperty({ example: 2026, description: "Payout period year" })
  @IsNotEmpty({ message: "Period year is required." })
  @IsInt()
  @Min(2024)
  periodYear: number;

  @ApiPropertyOptional({
    example: "Monthly earnings settled via bank transfer",
    description: "Payout notes",
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
