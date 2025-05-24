import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSessionCurrentBingo1748047777303 implements MigrationInterface {
    name = 'AddSessionCurrentBingo1748047777303'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "session" ADD "current_bingo_id" integer`);
        await queryRunner.query(`ALTER TABLE "session" ADD CONSTRAINT "FK_2030a82dd0e60914f53ce77f87a" FOREIGN KEY ("current_bingo_id") REFERENCES "bingo"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "session" DROP CONSTRAINT "FK_2030a82dd0e60914f53ce77f87a"`);
        await queryRunner.query(`ALTER TABLE "session" DROP COLUMN "current_bingo_id"`);
    }

}
