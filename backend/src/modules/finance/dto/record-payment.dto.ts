import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsUUID,
  IsNumber,
  Min,
  IsEnum,
  IsOptional,
  IsBoolean,
  IsString,
} from 'class-validator';
import { PaymentMethod } from '@prisma/client';

export class RecordPaymentDto {
  @ApiProperty({ example: 'c39a82e1-4567-4b12-8901-23456789abcd', description: 'Student ID' })
  @IsNotEmpty({ message: 'Student ID is required.' })
  @IsUUID('4', { message: 'Invalid student UUID.' })
  studentId: string;

  @ApiPropertyOptional({ example: 'c39a82e1-4567-4b12-8901-23456789abcd', description: 'Monthly Invoice ID if paying tuition invoice' })
  @IsOptional()
  @IsUUID('4', { message: 'Invalid invoice UUID.' })
  invoiceId?: string;

  @ApiPropertyOptional({ example: false, description: 'True if paying one-time admission fee' })
  @IsOptional()
  @IsBoolean()
  isAdmissionFee?: boolean;

  @ApiProperty({ example: 3500.0, description: 'Amount paid in LKR' })
  @IsNotEmpty({ message: 'Amount paid is required.' })
  @IsNumber({}, { message: 'Amount paid must be a number.' })
  @Min(0.01, { message: 'Payment amount must be greater than zero.' })
  amountPaid: number;

  @ApiProperty({ enum: PaymentMethod, example: PaymentMethod.CASH, description: 'Payment method' })
  @IsNotEmpty({ message: 'Payment method is required.' })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ApiPropertyOptional({ example: 'Payment received at counter', description: 'Administrative remarks' })
  @IsOptional()
  @IsString()
  remarks?: string;
}
