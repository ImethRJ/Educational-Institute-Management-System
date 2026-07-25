import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsInt, Min, Max, IsOptional, IsUUID } from 'class-validator';

export class GenerateMonthlyInvoicesDto {
  @ApiProperty({ example: 7, description: 'Billing month (1-12)' })
  @IsNotEmpty({ message: 'Billing month is required.' })
  @IsInt()
  @Min(1)
  @Max(12)
  billingMonth: number;

  @ApiProperty({ example: 2026, description: 'Billing year (e.g. 2026)' })
  @IsNotEmpty({ message: 'Billing year is required.' })
  @IsInt()
  @Min(2024)
  billingYear: number;

  @ApiPropertyOptional({ example: 'c39a82e1-4567-4b12-8901-23456789abcd', description: 'Optional batch class ID filter' })
  @IsOptional()
  @IsUUID('4')
  batchClassId?: string;
}
