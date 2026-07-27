import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsDateString,
  IsOptional,
  IsEmail,
  IsNumber,
  IsBoolean,
  IsArray,
  IsUUID,
  Min,
} from "class-validator";
import { Gender, FeeCategory } from "@prisma/client";

export class CreateStudentDto {
  @ApiPropertyOptional({
    example: "b19a82e1-4567-4b12-8901-23456789abcd",
    description: "Primary branch ID",
  })
  @IsOptional()
  @IsUUID("4", { message: "Invalid branch ID." })
  branchId?: string;

  @ApiProperty({ example: "Kasun Perera", description: "Student full name" })
  @IsNotEmpty({ message: "Student full name is required." })
  @IsString()
  fullName: string;

  @ApiProperty({
    example: "2008-05-14",
    description: "Date of Birth (YYYY-MM-DD)",
  })
  @IsNotEmpty({ message: "Date of birth is required." })
  @IsDateString({}, { message: "Invalid date format for date of birth." })
  dob: string;

  @ApiProperty({
    enum: Gender,
    example: Gender.MALE,
    description: "Student gender",
  })
  @IsNotEmpty({ message: "Gender is required." })
  @IsEnum(Gender, { message: "Invalid gender value." })
  gender: Gender;

  @ApiProperty({
    example: "123, Temple Road, Nugegoda",
    description: "Student home address",
  })
  @IsNotEmpty({ message: "Address is required." })
  @IsString()
  address: string;

  @ApiPropertyOptional({
    example: "+94771234567",
    description: "Student mobile phone number",
  })
  @IsOptional()
  @IsString()
  mobileNumber?: string;

  @ApiPropertyOptional({
    example: "kasun@gmail.com",
    description: "Student email address",
  })
  @IsOptional()
  @IsEmail({}, { message: "Invalid email address format." })
  email?: string;

  // Guardian Info
  @ApiProperty({ example: "Suneth Perera", description: "Guardian full name" })
  @IsNotEmpty({ message: "Guardian name is required." })
  @IsString()
  guardianName: string;

  @ApiProperty({ example: "Father", description: "Relationship to student" })
  @IsNotEmpty({ message: "Guardian relationship is required." })
  @IsString()
  guardianRelationship: string;

  @ApiProperty({
    example: "+94719876543",
    description: "Guardian mobile phone number",
  })
  @IsNotEmpty({ message: "Guardian mobile number is required." })
  @IsString()
  guardianMobile: string;

  @ApiPropertyOptional({
    example: "suneth.perera@gmail.com",
    description: "Guardian email address",
  })
  @IsOptional()
  @IsEmail({}, { message: "Invalid guardian email address format." })
  guardianEmail?: string;

  @ApiPropertyOptional({
    example: "123, Temple Road, Nugegoda",
    description: "Guardian home address",
  })
  @IsOptional()
  @IsString()
  guardianAddress?: string;

  // Fee Info
  @ApiProperty({
    enum: FeeCategory,
    example: FeeCategory.FULL_FEE,
    description: "Monthly fee category",
  })
  @IsNotEmpty({ message: "Fee category is required." })
  @IsEnum(FeeCategory, { message: "Invalid fee category." })
  feeCategory: FeeCategory;

  @ApiPropertyOptional({
    example: "50% Institute Merit Scholarship",
    description: "Concession explanation notes",
  })
  @IsOptional()
  @IsString()
  customConcessionNotes?: string;

  @ApiProperty({
    example: 2500.0,
    description: "One-time admission fee amount in LKR",
  })
  @IsNotEmpty({ message: "Admission fee amount is required." })
  @IsNumber({}, { message: "Admission fee amount must be a number." })
  @Min(0, { message: "Admission fee amount cannot be negative." })
  admissionFeeAmount: number;

  @ApiPropertyOptional({
    example: true,
    description: "Whether admission fee is paid upon registration",
  })
  @IsOptional()
  @IsBoolean()
  admissionFeePaid?: boolean;

  @ApiPropertyOptional({
    example: "c39a82e1-4567-4b12-8901-23456789abcd",
    description: "Referring teacher ID if applicable",
  })
  @IsOptional()
  @IsUUID("4", { message: "Invalid referring teacher ID." })
  referredByTeacherId?: string;

  @ApiPropertyOptional({
    example: ["e49a82e1-4567-4b12-8901-23456789abcd"],
    description: "Initial batch IDs to enroll student",
  })
  @IsOptional()
  @IsArray()
  @IsUUID("4", {
    each: true,
    message: "Invalid batch class ID in enrollment array.",
  })
  initialBatchIds?: string[];
}
