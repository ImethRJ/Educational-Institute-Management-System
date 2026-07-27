import { ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsOptional,
  IsString,
  IsNumber,
  Matches,
  Min,
  IsArray,
  ValidateIf,
} from "class-validator";

const UUID_REGEX = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

export class UpdateBatchDto {
  @ApiPropertyOptional({
    example: "2026 A/L Combined Maths Revision",
    description: "Batch class name",
  })
  @IsOptional()
  @IsString()
  batchName?: string;

  @ApiPropertyOptional({ example: 3500.0, description: "Monthly fee in LKR" })
  @IsOptional()
  @IsNumber()
  @Min(0)
  monthlyFee?: number;

  @ApiPropertyOptional({
    example: "Hall B",
    description: "Assigned hall / room number",
  })
  @IsOptional()
  @IsString()
  hallNumber?: string;

  @ApiPropertyOptional({
    example: "c39a82e1-4567-4b12-8901-23456789abcd",
    description: "Teacher ID",
  })
  @IsOptional()
  @Matches(UUID_REGEX, { message: "Invalid teacher UUID." })
  teacherId?: string;

  @ApiPropertyOptional({
    example: "d39a82e1-4567-4b12-8901-23456789abcd",
    description: "Branch ID",
  })
  @IsOptional()
  @Matches(UUID_REGEX, { message: "Invalid branch UUID." })
  branchId?: string;

  @ApiPropertyOptional({
    example: "c39a82e1-4567-4b12-8901-23456789abcd",
    description: "Grade Level ID",
  })
  @ValidateIf((o, val) => val !== null && val !== undefined && val !== "")
  @IsOptional()
  @Matches(UUID_REGEX, { message: "Invalid grade level UUID." })
  gradeLevelId?: string | null;

  @ApiPropertyOptional({
    example: "c39a82e1-4567-4b12-8901-23456789abcd",
    description: "Subject ID",
  })
  @IsOptional()
  @Matches(UUID_REGEX, { message: "Invalid subject UUID." })
  subjectId?: string;

  @ApiPropertyOptional({
    example: ["uuid-1", "uuid-2"],
    description: "Multiple Target Grade Level IDs",
  })
  @IsOptional()
  @IsArray()
  @Matches(UUID_REGEX, { each: true, message: "Invalid grade level UUID in list." })
  gradeLevelIds?: string[];
}
