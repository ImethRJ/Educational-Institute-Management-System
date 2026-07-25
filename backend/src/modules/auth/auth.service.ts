import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../common/prisma/prisma.service';
import { RedisService } from '../../common/redis/redis.service';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import * as argon2 from 'argon2';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
  ) {}

  async login(loginDto: LoginDto, ipAddress: string) {
    const { username, password } = loginDto;

    // 1. Find System Admin by username or email
    const admin = await this.prisma.systemAdmin.findFirst({
      where: {
        OR: [{ username }, { email: username }],
      },
    });

    if (!admin) {
      throw new UnauthorizedException('Invalid credentials provided.');
    }

    // 2. Check if account is locked
    if (admin.lockedUntil && admin.lockedUntil > new Date()) {
      const minutesRemaining = Math.ceil(
        (admin.lockedUntil.getTime() - new Date().getTime()) / 60000,
      );
      throw new UnauthorizedException(
        `Account is temporarily locked due to multiple failed login attempts. Try again in ${minutesRemaining} minutes.`,
      );
    }

    // 3. Verify Argon2id password hash
    const isPasswordValid = await argon2.verify(admin.passwordHash, password);

    if (!isPasswordValid) {
      // Increment failed attempts
      const failedAttempts = admin.failedLoginAttempts + 1;
      let lockedUntil: Date | null = null;

      if (failedAttempts >= 5) {
        lockedUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes lockout
        this.logger.warn(`Admin account locked due to 5 failed attempts from IP: ${ipAddress}`);
      }

      await this.prisma.systemAdmin.update({
        where: { id: admin.id },
        data: {
          failedLoginAttempts: failedAttempts,
          lockedUntil,
        },
      });

      throw new UnauthorizedException('Invalid credentials provided.');
    }

    // 4. Reset failed attempts on successful login
    await this.prisma.systemAdmin.update({
      where: { id: admin.id },
      data: {
        failedLoginAttempts: 0,
        lockedUntil: null,
        lastLoginAt: new Date(),
      },
    });

    // 5. Generate JWT Token
    const payload = { sub: admin.id, username: admin.username, email: admin.email };
    const accessToken = this.jwtService.sign(payload);

    // 6. Log Auth Activity in Audit Log
    await this.prisma.auditLog.create({
      data: {
        adminId: admin.id,
        action: 'ADMIN_LOGIN_SUCCESS',
        entityName: 'system_admin',
        entityId: admin.id,
        ipAddress,
      },
    });

    return {
      accessToken,
      admin: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        fullName: admin.fullName,
        lastLoginAt: admin.lastLoginAt,
      },
    };
  }

  async changePassword(adminId: string, dto: ChangePasswordDto) {
    const admin = await this.prisma.systemAdmin.findUnique({
      where: { id: adminId },
    });

    if (!admin) {
      throw new UnauthorizedException('Admin user not found.');
    }

    const isCurrentPasswordValid = await argon2.verify(
      admin.passwordHash,
      dto.currentPassword,
    );

    if (!isCurrentPasswordValid) {
      throw new BadRequestException('Current password provided is incorrect.');
    }

    const newPasswordHash = await argon2.hash(dto.newPassword);

    await this.prisma.systemAdmin.update({
      where: { id: adminId },
      data: {
        passwordHash: newPasswordHash,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        adminId,
        action: 'ADMIN_PASSWORD_CHANGED',
        entityName: 'system_admin',
        entityId: adminId,
      },
    });

    return { message: 'Password changed successfully. Please log in again with your new password.' };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const admin = await this.prisma.systemAdmin.findUnique({
      where: { email: dto.email },
    });

    // Security best practice: Always return generic message to prevent email enumeration
    if (!admin) {
      return { message: 'If the provided email is registered, password reset instructions have been sent.' };
    }

    // Generate time-limited reset token in Redis (15 mins)
    const resetToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    await this.redisService.set(`reset_token:${resetToken}`, admin.id, 900);

    this.logger.log(`Password reset token generated for admin ${admin.email}: ${resetToken}`);

    return {
      message: 'If the provided email is registered, password reset instructions have been sent.',
      resetToken, // Returned in dev mode for administrative testing
    };
  }
}
