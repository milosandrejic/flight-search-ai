import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { PinoLogger } from 'nestjs-pino';
import { ChatRequest } from 'src/types/chat-request';
import { ChatResponse } from 'src/types/chat-response';
import { SearchHistoryRepository } from 'src/repositories/search-history.repository';
import { FlightQueryParser } from 'src/repositories/flight-query-parser';
import { DuffelRepository } from 'src/repositories/duffel.repository';
import { randomUUID } from 'crypto';

/**
 * Chat controller - handles flight search via natural language
 */
@ApiTags('chat')
@Controller('chat')
export class ChatController {
  constructor(
    private readonly logger: PinoLogger,
    private readonly searchHistoryRepo: SearchHistoryRepository,
    private readonly queryParser: FlightQueryParser,
    private readonly duffelRepo: DuffelRepository,
  ) {
    this.logger.setContext(ChatController.name);
  }

  /**
   * Process natural language flight search query
   * 1. Parse query with AI
   * 2. Search flights via Duffel API
   * 3. Save to history
   */
  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Search flights using natural language',
    description: 'Converts natural language query into structured flight search parameters and returns matching flights from Duffel API',
  })
  @ApiBody({ type: ChatRequest })
  @ApiResponse({
    status: 200,
    description: 'Flight search completed successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request or malformed query',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error or external API failure',
  })
  async chat(@Body() request: ChatRequest): Promise<ChatResponse> {
    const startTime = Date.now();
    const searchId = randomUUID();

    this.logger.info(
      {
        searchId,
        userId: request.userId,
        queryLength: request.query.length,
      },
      'Processing flight search query',
    );

    try {
      // Parse natural language query using OpenAI
      const parsedQuery = await this.queryParser.parse(request.query);

      // Search flights using Duffel API
      const results = await this.duffelRepo.searchFlights(parsedQuery);

      const searchTime = Date.now() - startTime;

      const response: ChatResponse = {
        parsedQuery,
        results,
        metadata: {
          searchId,
          resultsCount: results.length,
          searchTime,
          timestamp: new Date().toISOString(),
        },
      };

      // Save to search history
      await this.searchHistoryRepo.create({
        userId: request.userId,
        query: request.query,
        origin: parsedQuery.origin,
        destination: parsedQuery.destination,
        departureDate: new Date(parsedQuery.departureDate),
        returnDate: parsedQuery.returnDate ? new Date(parsedQuery.returnDate) : undefined,
        resultsCount: response.results.length,
        searchTimeMs: searchTime,
        cabinClass: parsedQuery.cabinClass,
        passengers:
          (parsedQuery.passengers.adults || 0) +
          (parsedQuery.passengers.children || 0) +
          (parsedQuery.passengers.infants || 0),
      });

      this.logger.info(
        {
          searchId,
          resultsCount: response.results.length,
          searchTime,
        },
        'Flight search completed',
      );

      return response;
    } catch (error) {
      this.logger.error(
        {
          searchId,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        'Flight search failed',
      );
      throw error;
    }
  }
}
