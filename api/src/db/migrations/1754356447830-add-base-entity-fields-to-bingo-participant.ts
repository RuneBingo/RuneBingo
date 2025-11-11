import { MigrationInterface, QueryRunner } from "typeorm";

export class AddBaseEntityFieldsToBingoParticipant1754356447830 implements MigrationInterface {
    name = 'AddBaseEntityFieldsToBingoParticipant1754356447830'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "bingo_team" DROP CONSTRAINT "FK_98ca671f2e30f1b7e2c01163eef"`);
        await queryRunner.query(`ALTER TABLE "bingo_participant" ADD "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "bingo_participant" ADD "created_by" integer`);
        await queryRunner.query(`ALTER TABLE "bingo_participant" ADD "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "bingo_participant" ADD "updated_by" integer`);
        await queryRunner.query(`ALTER TABLE "bingo_participant" ADD "points" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "bingo_team" ADD CONSTRAINT "FK_794d10226b82e55874737e6c89b" FOREIGN KEY ("bingo_id") REFERENCES "bingo"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "bingo_participant" ADD CONSTRAINT "FK_71ac305403f15c9774a56cae058" FOREIGN KEY ("created_by") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "bingo_participant" DROP CONSTRAINT "FK_71ac305403f15c9774a56cae058"`);
        await queryRunner.query(`ALTER TABLE "bingo_team" DROP CONSTRAINT "FK_794d10226b82e55874737e6c89b"`);
        await queryRunner.query(`ALTER TABLE "bingo_participant" DROP COLUMN "points"`);
        await queryRunner.query(`ALTER TABLE "bingo_participant" DROP COLUMN "updated_by"`);
        await queryRunner.query(`ALTER TABLE "bingo_participant" DROP COLUMN "updated_at"`);
        await queryRunner.query(`ALTER TABLE "bingo_participant" DROP COLUMN "created_by"`);
        await queryRunner.query(`ALTER TABLE "bingo_participant" DROP COLUMN "created_at"`);
        await queryRunner.query(`ALTER TABLE "bingo_team" ADD CONSTRAINT "FK_98ca671f2e30f1b7e2c01163eef" FOREIGN KEY ("id") REFERENCES "bingo"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
