import { MigrationInterface, QueryRunner } from "typeorm";

export class AddBingoResetAtAndMakeBingoTeamCaptainNullable1751417271509 implements MigrationInterface {
    name = 'AddBingoResetAtAndMakeBingoTeamCaptainNullable1751417271509'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "bingo" ADD "reset_at" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`ALTER TABLE "bingo" ADD "reset_by" integer`);
        await queryRunner.query(`ALTER TABLE "bingo_team" DROP CONSTRAINT "FK_4215ce5c904794a3bb44c13a896"`);
        await queryRunner.query(`ALTER TABLE "bingo_team" ALTER COLUMN "captain_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "bingo_team" ADD CONSTRAINT "FK_4215ce5c904794a3bb44c13a896" FOREIGN KEY ("captain_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "bingo" ADD CONSTRAINT "FK_ad74131cadf8a42ded86a0b1dbd" FOREIGN KEY ("reset_by") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "bingo" DROP CONSTRAINT "FK_ad74131cadf8a42ded86a0b1dbd"`);
        await queryRunner.query(`ALTER TABLE "bingo_team" DROP CONSTRAINT "FK_4215ce5c904794a3bb44c13a896"`);
        await queryRunner.query(`ALTER TABLE "bingo_team" ALTER COLUMN "captain_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "bingo_team" ADD CONSTRAINT "FK_4215ce5c904794a3bb44c13a896" FOREIGN KEY ("captain_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "bingo" DROP COLUMN "reset_by"`);
        await queryRunner.query(`ALTER TABLE "bingo" DROP COLUMN "reset_at"`);
    }

}
