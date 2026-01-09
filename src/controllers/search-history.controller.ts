import { Controller, Get, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { SearchHistoryRepository } from 'src/repositories/search-history.repository';
import { SearchHistory } from 'src/models/search-history.entity';

/**
 * Search history controller - provides endpoints for search history
 */
@Controller('searches')
export class SearchHistoryController {
  constructor(private readonly searchHistoryRepo: SearchHistoryRepository) {}

  /**
   * Get user's recent searches
   * GET /searches/history?userId=xxx&limit=10
   */
  @Get('history')
  @HttpCode(HttpStatus.OK)
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
  async getPopular(
    @Query('limit') limit?: string,
  ): Promise<Array<{ origin: string; destination: string; count: number }>> {
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.searchHistoryRepo.getPopularRoutes(limitNum);
  }
}
