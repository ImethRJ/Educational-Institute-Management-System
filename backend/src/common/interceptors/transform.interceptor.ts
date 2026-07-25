import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ResponseEnvelope<T> {
  success: boolean;
  statusCode: number;
  message?: string;
  data: T;
  meta?: any;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, ResponseEnvelope<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ResponseEnvelope<T>> {
    const response = context.switchToHttp().getResponse();
    const statusCode = response.statusCode;

    return next.handle().pipe(
      map((res) => {
        // If response already has a custom envelope structure (e.g. paginated result with meta)
        if (res && typeof res === 'object' && 'data' in res && 'meta' in res) {
          return {
            success: true,
            statusCode,
            message: res.message || 'Operation successful.',
            data: res.data,
            meta: {
              ...res.meta,
              timestamp: new Date().toISOString(),
            },
          };
        }

        return {
          success: true,
          statusCode,
          message:
            res && typeof res === 'object' && res.message
              ? res.message
              : 'Operation successful.',
          data: res && typeof res === 'object' && 'data' in res ? res.data : res,
          meta: {
            timestamp: new Date().toISOString(),
          },
        };
      }),
    );
  }
}
