import { MigrationInterface, QueryRunner } from 'typeorm';

export class MakeSessionIdColumnUnique1742666388332 implements MigrationInterface {
  name = 'MakeSessionIdColumnUnique1742666388332';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "session" ADD CONSTRAINT "UQ_8ba62b11184a8d3312278d4d1ac" UNIQUE ("session_id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "session" DROP CONSTRAINT "UQ_8ba62b11184a8d3312278d4d1ac"`);
  }
}
