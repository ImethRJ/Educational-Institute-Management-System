import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse: any =
      exception instanceof HttpException
        ? exception.getResponse()
        : { message: 'Internal server error occurred.' };

    const errorDetails =
      typeof exceptionResponse === 'object' && exceptionResponse !== null
        ? exceptionResponse.message || exceptionResponse
        : exceptionResponse;

    this.logger.error(
      `HTTP ${status} Error on ${request.method} ${request.url}: ${JSON.stringify(errorDetails)}`,
      exception instanceof Error ? exception.stack : '',
    );

    response.status(status).json({
      success: false,
      statusCode: status,
      error: {
        code:
          status === HttpStatus.UNPROCESSABLE_ENTITY || status === HttpStatus.BAD_REQUEST
            ? 'VALIDATION_ERROR'
            : status === HttpStatus.UNAUTHORIZED
            ? 'UNAUTHORIZED'
            : status === HttpStatus.FORBIDDEN
            ? 'FORBIDDEN'
            : status === HttpStatus.NOT_FOUND
            ? 'NOT_FOUND'
            : 'INTERNAL_SERVER_ERROR',
        message: Array.isArray(errorDetails)
          ? 'Validation failed for request payload.'
          : typeof errorDetails === 'string'
          ? errorDetails
          : errorDetails.message || 'An error occurred.',
        details: Array.isArray(errorDetails) ? errorDetails : undefined,
      },
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
