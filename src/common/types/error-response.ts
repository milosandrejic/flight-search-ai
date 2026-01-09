/**
 * Structured error response following RFC 7807 (Problem Details for HTTP APIs)
 * Ensures consistent error format across all endpoints
 */
export interface ErrorResponse {
  /**
   * HTTP status code
   */
  statusCode: number;

  /**
   * Error type/category (e.g., 'ValidationError', 'NotFoundError')
   */
  error: string;

  /**
   * Human-readable error message
   */
  message: string | string[];

  /**
   * ISO 8601 timestamp
   */
  timestamp: string;

  /**
   * Request path that caused the error
   */
  path: string;

  /**
   * Optional correlation ID for tracing
   */
  correlationId?: string;

  /**
   * Optional additional context (only in development)
   */
  details?: unknown;
}
