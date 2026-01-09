import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

/**
 * Search history - tracks all flight searches for history and analytics
 */
@Entity('search_history')
export class SearchHistory {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  /**
   * User identifier (optional, for personalized history)
   */
  @Index()
  @Column({ type: 'uuid', nullable: true, name: 'user_id' })
  userId?: string;

  /**
   * Original natural language query
   */
  @Column({ type: 'text' })
  query!: string;

  /**
   * Parsed origin IATA code
   */
  @Index()
  @Column({ type: 'varchar', length: 3 })
  origin!: string;

  /**
   * Parsed destination IATA code
   */
  @Index()
  @Column({ type: 'varchar', length: 3 })
  destination!: string;

  /**
   * Departure date
   */
  @Column({ type: 'date', name: 'departure_date' })
  departureDate!: Date;

  /**
   * Return date (nullable for one-way)
   */
  @Column({ type: 'date', nullable: true, name: 'return_date' })
  returnDate?: Date;

  /**
   * Number of results returned
   */
  @Column({ type: 'int', name: 'results_count' })
  resultsCount!: number;

  /**
   * Search time in milliseconds
   */
  @Column({ type: 'int', name: 'search_time_ms' })
  searchTimeMs!: number;

  /**
   * Cabin class searched
   */
  @Column({ type: 'varchar', length: 50, name: 'cabin_class' })
  cabinClass!: string;

  /**
   * Number of passengers
   */
  @Column({ type: 'int', default: 1 })
  passengers!: number;

  @CreateDateColumn({ name: 'created_at' })
  @Index()
  createdAt!: Date;
}
