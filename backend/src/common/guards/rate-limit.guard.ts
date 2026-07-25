import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(private readonly redisService: RedisService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const clientIp = req.ip || req.connection?.remoteAddress || '127.0.0.1';
    const key = `ratelimit:${clientIp}:${req.path}`;

    const limit = 100; // max requests
    const windowSeconds = 60; // per 1 minute window

    const currentRequests = await this.redisService.incr(key);

    if (currentRequests === 1) {
      await this.redisService.expire(key, windowSeconds);
    }

    if (currentRequests > limit) {
      throw new HttpException(
        'Too many requests sent from this IP address. Please slow down and try again in 1 minute.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return true;
  }
}
