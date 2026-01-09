import { IsString, IsNotEmpty, MaxLength, IsOptional, IsUUID } from 'class-validator';

/**
 * Chat request - natural language flight search query
 */
export class ChatRequest {
  /**
   * Natural language query (e.g., "cheap flight from NYC to London next week")
   */
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  query!: string;

  /**
   * Optional user identifier for search history
   */
  @IsOptional()
  @IsUUID()
  userId?: string;
}
