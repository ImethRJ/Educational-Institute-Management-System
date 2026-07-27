import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, MinLength } from "class-validator";

export class LoginDto {
  @ApiProperty({
    example: "admin",
    description: "System Administrator username or email address",
  })
  @IsNotEmpty({ message: "Username or email is required." })
  @IsString()
  username: string;

  @ApiProperty({
    example: "Admin@Sector2026",
    description: "System Administrator password",
  })
  @IsNotEmpty({ message: "Password is required." })
  @IsString()
  @MinLength(8, { message: "Password must be at least 8 characters long." })
  password: string;
}
