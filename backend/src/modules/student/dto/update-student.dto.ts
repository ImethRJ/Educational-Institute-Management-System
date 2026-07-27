import { PartialType } from "@nestjs/swagger";
import { CreateStudentDto } from "./create-student.dto";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsOptional } from "class-validator";
import { StudentStatus } from "@prisma/client";

export class UpdateStudentDto extends PartialType(CreateStudentDto) {
  @ApiPropertyOptional({
    enum: StudentStatus,
    example: StudentStatus.ACTIVE,
    description: "Student status",
  })
  @IsOptional()
  @IsEnum(StudentStatus, { message: "Invalid student status." })
  status?: StudentStatus;
}
