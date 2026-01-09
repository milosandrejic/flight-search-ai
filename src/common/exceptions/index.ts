import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * Thrown when external API call fails (Duffel, OpenAI, etc.)
 */
export class ExternalApiException extends HttpException {
  constructor(
    public readonly provider: string,
    public readonly originalError: unknown,
    message?: string,
  ) {
    super(
      {
        statusCode: HttpStatus.BAD_GATEWAY,
        error: 'ExternalApiError',
        message: message || `External API error: ${provider}`,
        provider,
      },
      HttpStatus.BAD_GATEWAY,
    );
  }
}

/**
 * Thrown when AI output validation fails
 */
export class AiValidationException extends HttpException {
  constructor(message: string, public readonly rawOutput?: unknown) {
    super(
      {
        statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        error: 'AiValidationError',
        message,
      },
      HttpStatus.UNPROCESSABLE_ENTITY,
    );
  }
}

/**
 * Thrown when flight search parameters are invalid
 */
export class InvalidFlightSearchException extends HttpException {
  constructor(message: string, public readonly field?: string) {
    super(
      {
        statusCode: HttpStatus.BAD_REQUEST,
        error: 'InvalidFlightSearch',
        message,
        field,
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}

/**
 * Thrown when rate limit is exceeded
 */
export class RateLimitException extends HttpException {
  constructor(
    public readonly retryAfter?: number, // seconds
  ) {
    super(
      {
        statusCode: HttpStatus.TOO_MANY_REQUESTS,
        error: 'RateLimitExceeded',
        message: 'Too many requests. Please try again later.',
        retryAfter,
      },
      HttpStatus.TOO_MANY_REQUESTS,
    );
  }
}

/**
 * Thrown when conversation is not found
 */
export class ConversationNotFoundException extends HttpException {
  constructor(conversationId: string) {
    super(
      {
        statusCode: HttpStatus.NOT_FOUND,
        error: 'ConversationNotFound',
        message: `Conversation ${conversationId} not found`,
      },
      HttpStatus.NOT_FOUND,
    );
  }
}
