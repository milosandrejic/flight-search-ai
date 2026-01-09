import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSearchHistoryTable1767955074918 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE search_history (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID,
                query TEXT NOT NULL,
                origin VARCHAR(3) NOT NULL,
                destination VARCHAR(3) NOT NULL,
                departure_date DATE NOT NULL,
                return_date DATE,
                results_count INT NOT NULL,
                search_time_ms INT NOT NULL,
                cabin_class VARCHAR(50) NOT NULL,
                passengers INT NOT NULL DEFAULT 1,
                created_at TIMESTAMP NOT NULL DEFAULT NOW()
            )
        `);

    await queryRunner.query(`
            CREATE INDEX idx_search_history_user_id ON search_history(user_id)
        `);

    await queryRunner.query(`
            CREATE INDEX idx_search_history_origin ON search_history(origin)
        `);

    await queryRunner.query(`
            CREATE INDEX idx_search_history_destination ON search_history(destination)
        `);

    await queryRunner.query(`
            CREATE INDEX idx_search_history_created_at ON search_history(created_at)
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS search_history');
  }

}
