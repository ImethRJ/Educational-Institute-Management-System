import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsDateString,
  IsOptional,
  IsEmail,
  IsNumber,
  Min,
  Max,
} from "class-validator";
import { Gender, CommissionType } from "@prisma/client";

export class CreateTeacherDto {
  @ApiProperty({ example: "Prof. A. Silva", description: "Teacher full name" })
  @IsNotEmpty({ message: "Teacher full name is required." })
  @IsString()
  fullName: string;

  @ApiProperty({
    example: "951234567V",
    description: "Sri Lankan NIC (old or 12-digit) or Passport",
  })
  @IsNotEmpty({ message: "NIC or Passport is required." })
  @IsString()
  nicOrPassport: string;

  @ApiProperty({
    example: "1985-08-20",
    description: "Date of Birth (YYYY-MM-DD)",
  })
  @IsNotEmpty({ message: "Date of birth is required." })
  @IsDateString({}, { message: "Invalid date format for date of birth." })
  dob: string;

  @ApiProperty({
    enum: Gender,
    example: Gender.MALE,
    description: "Teacher gender",
  })
  @IsNotEmpty({ message: "Gender is required." })
  @IsEnum(Gender, { message: "Invalid gender value." })
  gender: Gender;

  @ApiProperty({ example: "+94771234567", description: "Mobile phone number" })
  @IsNotEmpty({ message: "Mobile number is required." })
  @IsString()
  mobileNumber: string;

  @ApiPropertyOptional({
    example: "silva@sector.lk",
    description: "Email address",
  })
  @IsOptional()
  @IsEmail({}, { message: "Invalid email address format." })
  email?: string;

  @ApiPropertyOptional({
    example: "45, Galle Road, Colombo 03",
    description: "Home address",
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({
    example: "+94719876543 (Wife)",
    description: "Emergency contact name and number",
  })
  @IsOptional()
  @IsString()
  emergencyContact?: string;

  @ApiPropertyOptional({
    example: "2026-01-01",
    description: "Joining date (YYYY-MM-DD)",
  })
  @IsOptional()
  @IsDateString({}, { message: "Invalid date format for joining date." })
  joiningDate?: string;

  @ApiPropertyOptional({
    example: "B.Sc. (Hons) Mathematics, Ph.D.",
    description: "Qualifications & Experience",
  })
  @IsOptional()
  @IsString()
  qualifications?: string;

  @ApiPropertyOptional({
    example: "https://storage.sector.lk/photos/tch-001.jpg",
    description: "Profile photo URL",
  })
  @IsOptional()
  @IsString()
  photoUrl?: string;

  // Commission Config
  @ApiProperty({
    example: 70.0,
    description: "Default monthly tuition fee commission % (e.g. 70%)",
  })
  @IsNotEmpty({ message: "Default tuition commission percentage is required." })
  @IsNumber({}, { message: "Tuition commission percentage must be a number." })
  @Min(0, { message: "Commission cannot be negative." })
  @Max(100, { message: "Commission percentage cannot exceed 100%." })
  defaultTuitionCommissionPct: number;

  @ApiPropertyOptional({
    enum: CommissionType,
    example: CommissionType.PERCENTAGE,
    description: "Admission fee commission calculation type",
  })
  @IsOptional()
  @IsEnum(CommissionType)
  admissionCommissionType?: CommissionType;

  @ApiPropertyOptional({
    example: 20.0,
    description: "Admission fee commission value (e.g. 20% or LKR 1000)",
  })
  @IsOptional()
  @IsNumber({}, { message: "Admission commission value must be a number." })
  @Min(0, { message: "Commission value cannot be negative." })
  admissionCommissionValue?: number;

  @ApiPropertyOptional({
    example: ["uuid-1", "uuid-2"],
    description: "List of subject IDs taught by teacher",
  })
  @IsOptional()
  subjectIds?: string[];
}
