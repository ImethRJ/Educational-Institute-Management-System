import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty } from "class-validator";

export class ForgotPasswordDto {
  @ApiProperty({
    example: "admin@sector.lk",
    description: "Registered administrator email address",
  })
  @IsNotEmpty({ message: "Email address is required." })
  @IsEmail({}, { message: "Invalid email address format." })
  email: string;
}
