import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({ example: 'Admin@Sector2026', description: 'Current active password' })
  @IsNotEmpty({ message: 'Current password is required.' })
  @IsString()
  currentPassword: string;

  @ApiProperty({ example: 'NewSecurePassword2026!', description: 'New password' })
  @IsNotEmpty({ message: 'New password is required.' })
  @IsString()
  @MinLength(8, { message: 'New password must be at least 8 characters long.' })
  newPassword: string;
}
