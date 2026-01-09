import { Controller, Get, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { SearchHistoryRepository } from 'src/repositories/search-history.repository';
import { SearchHistory } from 'src/models/search-history.entity';

/**
 * Search history controller - provides endpoints for search history
 */
@ApiTags('search-history')
@Controller('searches')
export class SearchHistoryController {
  constructor(private readonly searchHistoryRepo: SearchHistoryRepository) {}

  /**
   * Get user's recent searches
   * GET /searches/history?userId=xxx&limit=10
   */
  @Get('history')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get user search history',
    description: 'Retrieves recent flight searches for a specific user',
  })
  @ApiQuery({
    name: 'userId',
    required: true,
    description: 'User identifier',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Maximum number of results to return',
    example: '10',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Search history retrieved successfully',
    type: [SearchHistory],
  })
  async getHistory(
    @Query('userId') userId: string,
    @Query('limit') limit?: string,
  ): Promise<SearchHistory[]> {
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.searchHistoryRepo.findByUser(userId, limitNum);
  }

  /**
   * Get popular searches across all users
   * GET /searches/popular?limit=10
   */
  @Get('popular')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get popular flight routes',
    description: 'Retrieves the most frequently searched flight routes',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Maximum number of routes to return',
    example: '10',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Popular routes retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          origin: { type: 'string', example: 'JFK' },
          destination: { type: 'string', example: 'LHR' },
          count: { type: 'number', example: 42 },
        },
      },
    },
  })
  async getPopular(
    @Query('limit') limit?: string,
  ): Promise<Array<{ origin: string; destination: string; count: number }>> {
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.searchHistoryRepo.getPopularRoutes(limitNum);
  }
}
