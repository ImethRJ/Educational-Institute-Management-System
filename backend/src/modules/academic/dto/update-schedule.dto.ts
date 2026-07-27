import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsInt, Min, Max, Matches } from "class-validator";

export class UpdateScheduleDto {
  @ApiPropertyOptional({
    example: 6,
    description: "Day of week (1 = Monday, 7 = Sunday)",
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(7)
  dayOfWeek?: number;

  @ApiPropertyOptional({
    example: "08:30",
    description: "Class start time (HH:mm)",
  })
  @IsOptional()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: "Start time must be in HH:mm format.",
  })
  startTime?: string;

  @ApiPropertyOptional({
    example: "12:30",
    description: "Class end time (HH:mm)",
  })
  @IsOptional()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: "End time must be in HH:mm format.",
  })
  endTime?: string;
}
