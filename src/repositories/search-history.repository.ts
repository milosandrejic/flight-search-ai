import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SearchHistory } from 'src/models/search-history.entity';

/**
 * Search history repository - exposes database operations
 */
@Injectable()
export class SearchHistoryRepository {
  constructor(
    @InjectRepository(SearchHistory)
    private readonly repo: Repository<SearchHistory>,
  ) {}

  /**
   * Create and save a search record
   */
  async create(data: Partial<SearchHistory>): Promise<SearchHistory> {
    const search = this.repo.create(data);
    return this.repo.save(search);
  }

  /**
   * Get recent searches for a user
   */
  async findByUser(userId: string, limit = 10): Promise<SearchHistory[]> {
    return this.repo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  /**
   * Get popular routes (most searched origin-destination pairs)
   */
  async getPopularRoutes(limit = 10): Promise<{
    origin: string;
    destination: string;
    count: number;
  }[]> {
    const results = await this.repo
      .createQueryBuilder('search')
      .select('search.origin', 'origin')
      .addSelect('search.destination', 'destination')
      .addSelect('COUNT(*)', 'count')
      .groupBy('search.origin')
      .addGroupBy('search.destination')
      .orderBy('count', 'DESC')
      .limit(limit)
      .getRawMany();

    return results.map((r) => ({
      origin: r.origin,
      destination: r.destination,
      count: parseInt(r.count, 10),
    }));
  }
}
