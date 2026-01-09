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
  @Column({ type: 'uuid', nullable: true })
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
  @Column({ type: 'date' })
  departureDate!: Date;

  /**
   * Return date (nullable for one-way)
   */
  @Column({ type: 'date', nullable: true })
  returnDate?: Date;

  /**
   * Number of results returned
   */
  @Column({ type: 'int' })
  resultsCount!: number;

  /**
   * Search time in milliseconds
   */
  @Column({ type: 'int' })
  searchTimeMs!: number;

  /**
   * Cabin class searched
   */
  @Column({ type: 'varchar', length: 50 })
  cabinClass!: string;

  /**
   * Number of passengers
   */
  @Column({ type: 'int', default: 1 })
  passengers!: number;

  @CreateDateColumn()
  @Index()
  createdAt!: Date;
}
