import {
  Controller,
  Post,
  Body,
  Get,
  Put,
  Res,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { Response, Request } from "express";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { ChangePasswordDto } from "./dto/change-password.dto";
import { ForgotPasswordDto } from "./dto/forgot-password.dto";
import { Public } from "../../common/decorators/public.decorator";
import { CurrentAdmin } from "../../common/decorators/current-admin.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";

@ApiTags("Authentication")
@Controller("auth")
@UseGuards(JwtAuthGuard)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post("login")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Authenticate System Administrator" })
  @ApiResponse({
    status: 200,
    description: "Login successful. Returns JWT cookie and admin profile.",
  })
  @ApiResponse({
    status: 401,
    description: "Invalid credentials or account locked.",
  })
  async login(
    @Body() loginDto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const ipAddress = req.ip || req.connection.remoteAddress || "127.0.0.1";
    const result = await this.authService.login(loginDto, ipAddress);

    // Set HTTP-Only, SameSite=Strict, Secure cookie
    res.cookie("admin_session", result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    return result;
  }

  @Post("logout")
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Log out current System Administrator" })
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie("admin_session");
    return { message: "Logged out successfully." };
  }

  @Get("me")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get current authenticated admin profile" })
  async getProfile(@CurrentAdmin() admin: any) {
    return { admin };
  }

  @Put("change-password")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Change administrator password" })
  async changePassword(
    @CurrentAdmin("id") adminId: string,
    @Body() dto: ChangePasswordDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.changePassword(adminId, dto);
    res.clearCookie("admin_session");
    return result;
  }

  @Public()
  @Post("forgot-password")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Request password reset token" })
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }
}
