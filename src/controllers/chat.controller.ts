import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import { ChatRequest } from 'src/types/chat-request';
import { ChatResponse } from 'src/types/chat-response';
import { SearchHistoryRepository } from 'src/repositories/search-history.repository';
import { FlightQueryParser } from 'src/repositories/flight-query-parser';
import { randomUUID } from 'crypto';

/**
 * Chat controller - handles flight search via natural language
 */
@Controller('chat')
export class ChatController {
  constructor(
    private readonly logger: PinoLogger,
    private readonly searchHistoryRepo: SearchHistoryRepository,
    private readonly queryParser: FlightQueryParser,
  ) {
    this.logger.setContext(ChatController.name);
  }

  /**
   * Process natural language flight search query
   * 1. Parse query with AI (TODO Phase 2)
   * 2. Search flights (TODO Phase 3)
   * 3. Save to history
   */
  @Post()
  @HttpCode(HttpStatus.OK)
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

      console.log(parsedQuery);

      // TODO Phase 3: Search flights using Duffel API
      // const results = await this.flightService.search(parsedQuery);

      // Mock response for now
      const searchTime = Date.now() - startTime;

      const response: ChatResponse = {
        parsedQuery,
        results: [],
        metadata: {
          searchId,
          resultsCount: 0,
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
