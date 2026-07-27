import { PartialType } from "@nestjs/swagger";
import { CreateTeacherDto } from "./create-teacher.dto";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsOptional } from "class-validator";
import { TeacherStatus } from "@prisma/client";

export class UpdateTeacherDto extends PartialType(CreateTeacherDto) {
  @ApiPropertyOptional({
    enum: TeacherStatus,
    example: TeacherStatus.ACTIVE,
    description: "Teacher status",
  })
  @IsOptional()
  @IsEnum(TeacherStatus)
  status?: TeacherStatus;
}
