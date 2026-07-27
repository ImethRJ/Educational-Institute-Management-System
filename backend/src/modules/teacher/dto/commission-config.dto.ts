import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsNotEmpty,
  IsNumber,
  Min,
  Max,
  IsEnum,
  IsOptional,
} from "class-validator";
import { CommissionType } from "@prisma/client";

export class UpdateCommissionConfigDto {
  @ApiProperty({
    example: 75.0,
    description: "Default monthly tuition fee commission percentage (0-100)",
  })
  @IsNotEmpty({ message: "Default tuition commission percentage is required." })
  @IsNumber({}, { message: "Tuition commission percentage must be a number." })
  @Min(0, { message: "Commission percentage cannot be negative." })
  @Max(100, { message: "Commission percentage cannot exceed 100%." })
  defaultTuitionCommissionPct: number;

  @ApiPropertyOptional({
    enum: CommissionType,
    example: CommissionType.PERCENTAGE,
    description: "Admission fee commission type",
  })
  @IsOptional()
  @IsEnum(CommissionType)
  admissionCommissionType?: CommissionType;

  @ApiPropertyOptional({
    example: 20.0,
    description: "Admission fee commission value",
  })
  @IsOptional()
  @IsNumber({}, { message: "Admission commission value must be a number." })
  @Min(0, { message: "Admission commission value cannot be negative." })
  admissionCommissionValue?: number;
}
