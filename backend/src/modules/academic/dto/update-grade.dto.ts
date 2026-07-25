import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber } from 'class-validator';

export class UpdateGradeDto {
  @ApiPropertyOptional({ example: 'Grade 11 (O/L)', description: 'Grade level display name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 11, description: 'Numeric order for sorting' })
  @IsOptional()
  @IsNumber()
  numericOrder?: number;
}
