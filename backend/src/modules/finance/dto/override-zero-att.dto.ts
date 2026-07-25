import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class OverrideZeroAttendanceDto {
  @ApiProperty({
    example: 'Admin approved medical exemption invoice generation for student Kasun Perera',
    description: 'Mandatory justification for overriding zero attendance rule',
  })
  @IsNotEmpty({ message: 'Override justification reason is mandatory for audit compliance.' })
  @IsString()
  @MinLength(10, { message: 'Override reason must be at least 10 characters long.' })
  overrideReason: string;
}
