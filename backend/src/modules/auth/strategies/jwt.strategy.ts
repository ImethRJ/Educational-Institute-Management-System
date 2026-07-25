import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { PrismaService } from '../../../common/prisma/prisma.service';

export interface JwtPayload {
  sub: string;
  username: string;
  email: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          let token = null;
          if (request && request.cookies) {
            token = request.cookies['admin_session'];
          }
          if (!token && request.headers.authorization) {
            token = request.headers.authorization.replace('Bearer ', '');
          }
          return token;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET', 'super_secret_enterprise_jwt_signing_key_sector_2026'),
    });
  }

  async validate(payload: JwtPayload) {
    const admin = await this.prisma.systemAdmin.findUnique({
      where: { id: payload.sub },
    });

    if (!admin) {
      throw new UnauthorizedException('Admin session is invalid or user has been removed.');
    }

    if (admin.lockedUntil && admin.lockedUntil > new Date()) {
      throw new UnauthorizedException('Account is temporarily locked due to security policy.');
    }

    return {
      id: admin.id,
      username: admin.username,
      email: admin.email,
      fullName: admin.fullName,
    };
  }
}
