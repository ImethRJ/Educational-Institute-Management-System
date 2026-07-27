import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { RedisService } from '../../common/redis/redis.service';
import { UnauthorizedException } from '@nestjs/common';
import * as argon2 from 'argon2';

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: jest.Mocked<any>;
  let jwtService: jest.Mocked<any>;
  let redisService: jest.Mocked<any>;

  beforeEach(async () => {
    prismaService = {
      systemAdmin: {
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      auditLog: {
        create: jest.fn(),
      },
    };

    jwtService = {
      sign: jest.fn().mockReturnValue('mock_jwt_token'),
    };

    redisService = {
      set: jest.fn().mockResolvedValue('OK'),
      get: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prismaService },
        { provide: JwtService, useValue: jwtService },
        { provide: RedisService, useValue: redisService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('login', () => {
    it('should authenticate valid admin credentials and return access token', async () => {
      const passwordHash = await argon2.hash('admin123');
      const mockAdmin = {
        id: 'admin-uuid',
        username: 'admin',
        email: 'admin@sector.lk',
        passwordHash,
        failedLoginAttempts: 0,
        lockedUntil: null,
        fullName: 'System Admin',
        lastLoginAt: null,
      };

      prismaService.systemAdmin.findFirst.mockResolvedValue(mockAdmin);

      const result = await service.login(
        { username: 'admin', password: 'admin123' },
        '127.0.0.1',
      );

      expect(result).toHaveProperty('accessToken', 'mock_jwt_token');
      expect(result.admin.username).toBe('admin');
      expect(prismaService.auditLog.create).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when admin user is not found', async () => {
      prismaService.systemAdmin.findFirst.mockResolvedValue(null);

      await expect(
        service.login({ username: 'nonexistent', password: 'password' }, '127.0.0.1'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if account is locked', async () => {
      const futureDate = new Date(Date.now() + 15 * 60 * 1000);
      prismaService.systemAdmin.findFirst.mockResolvedValue({
        id: 'locked-admin',
        username: 'locked',
        lockedUntil: futureDate,
      });

      await expect(
        service.login({ username: 'locked', password: 'password' }, '127.0.0.1'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('forgotPassword', () => {
    it('should generate secure reset token in redis without exposing token in response', async () => {
      prismaService.systemAdmin.findUnique.mockResolvedValue({
        id: 'admin-uuid',
        email: 'admin@sector.lk',
      });

      const result = await service.forgotPassword({ email: 'admin@sector.lk' });

      expect(result.message).toContain('password reset instructions have been sent');
      expect(result).not.toHaveProperty('resetToken');
      expect(redisService.set).toHaveBeenCalledWith(
        expect.stringMatching(/^reset_token:[a-f0-9]{64}$/),
        'admin-uuid',
        900,
      );
    });
  });
});
