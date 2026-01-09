import { IsString, IsNotEmpty, MaxLength, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Chat request - natural language flight search query
 */
export class ChatRequest {
  /**
   * Natural language query (e.g., "cheap flight from NYC to London next week")
   */
  @ApiProperty({
    description: 'Natural language flight search query',
    example: 'cheap flight from New York to London next week',
    maxLength: 500,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  query!: string;

  /**
   * Optional user identifier for search history
   */
  @ApiPropertyOptional({
    description: 'Optional user identifier for tracking search history',
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  userId?: string;
}
