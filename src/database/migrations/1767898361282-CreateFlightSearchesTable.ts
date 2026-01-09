import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateFlightSearchesTable1767898361282 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE flight_searches (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        origin VARCHAR(3) NOT NULL,
        destination VARCHAR(3) NOT NULL,
        departure_date DATE NOT NULL,
        return_date DATE,
        results_count INTEGER NOT NULL DEFAULT 0,
        search_time_ms INTEGER NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    await queryRunner.query(`
      CREATE INDEX idx_flight_searches_route ON flight_searches(origin, destination)
    `);

    await queryRunner.query(`
      CREATE INDEX idx_flight_searches_created_at ON flight_searches(created_at)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS flight_searches CASCADE');
  }

}
