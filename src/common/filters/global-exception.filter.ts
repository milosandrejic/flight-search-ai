import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { PinoLogger } from 'nestjs-pino';
import { ErrorResponse } from '../types/error-response';
import { randomUUID } from 'crypto';

/**
 * Global exception filter that catches all exceptions
 * Provides structured error responses and comprehensive logging
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: PinoLogger) {
    this.logger.setContext(GlobalExceptionFilter.name);
  }

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const correlationId = randomUUID();

    const { statusCode, error, message, details } = this.parseException(exception);

    const errorResponse: ErrorResponse = {
      statusCode,
      error,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
      correlationId,
      // Only include details in development
      ...(process.env.NODE_ENV === 'development' && details ? { details } : {}),
    };

    // Log error with context
    this.logError(exception, request, correlationId, statusCode);

    response.status(statusCode).json(errorResponse);
  }

  /**
   * Parse exception into structured error components
   */
  private parseException(exception: unknown): {
    statusCode: number;
    error: string;
    message: string | string[];
    details?: unknown;
  } {
    // Handle NestJS HttpException
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const response = exception.getResponse();

      // Handle structured response from class-validator
      if (typeof response === 'object' && response !== null) {
        const responseObj = response as Record<string, unknown>;
        return {
          statusCode: status,
          error: (responseObj.error as string) || this.getErrorName(status),
          message: (responseObj.message as string | string[]) || exception.message,
          details: responseObj,
        };
      }

      return {
        statusCode: status,
        error: this.getErrorName(status),
        message: exception.message,
      };
    }

    // Handle standard Error
    if (exception instanceof Error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        error: 'InternalServerError',
        message: 'An unexpected error occurred',
        details: {
          name: exception.name,
          // Only expose stack in development
          ...(process.env.NODE_ENV === 'development' ? { stack: exception.stack } : {}),
        },
      };
    }

    // Handle unknown exceptions
    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      error: 'UnknownError',
      message: 'An unexpected error occurred',
      details: process.env.NODE_ENV === 'development' ? exception : undefined,
    };
  }

  /**
   * Get human-readable error name from HTTP status code
   */
  private getErrorName(status: number): string {
    const errorNames: Record<number, string> = {
      400: 'BadRequest',
      401: 'Unauthorized',
      403: 'Forbidden',
      404: 'NotFound',
      409: 'Conflict',
      422: 'UnprocessableEntity',
      429: 'TooManyRequests',
      500: 'InternalServerError',
      502: 'BadGateway',
      503: 'ServiceUnavailable',
      504: 'GatewayTimeout',
    };

    return errorNames[status] || 'HttpException';
  }

  /**
   * Log error with full context for debugging and monitoring
   */
  private logError(
    exception: unknown,
    request: Request,
    correlationId: string,
    statusCode: number,
  ): void {
    const logContext = {
      correlationId,
      path: request.url,
      method: request.method,
      statusCode,
      userAgent: request.headers['user-agent'],
      ip: request.ip,
    };

    // Log as error for 5xx, warn for 4xx
    if (statusCode >= 500) {
      this.logger.error(
        {
          ...logContext,
          error: exception instanceof Error ? {
            name: exception.name,
            message: exception.message,
            stack: exception.stack,
          } : exception,
        },
        'Unhandled exception occurred',
      );
    } else {
      this.logger.warn(
        {
          ...logContext,
          message: exception instanceof Error ? exception.message : 'Client error',
        },
        'Client error occurred',
      );
    }
  }
}
