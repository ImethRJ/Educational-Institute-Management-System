import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsInt, Min } from 'class-validator';

export class CreateGradeDto {
  @ApiProperty({ example: 'Grade 11 (O/L)', description: 'Grade level display name' })
  @IsNotEmpty({ message: 'Grade name is required.' })
  @IsString()
  name: string;

  @ApiProperty({ example: 11, description: 'Numeric ordering position for sorting' })
  @IsNotEmpty({ message: 'Numeric order is required.' })
  @IsInt({ message: 'Numeric order must be an integer.' })
  @Min(1)
  numericOrder: number;
}
