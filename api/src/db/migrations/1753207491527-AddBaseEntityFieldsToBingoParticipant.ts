import { MigrationInterface, QueryRunner } from "typeorm";

export class AddBaseEntityFieldsToBingoParticipant1753207491527 implements MigrationInterface {
    name = 'AddBaseEntityFieldsToBingoParticipant1753207491527'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "bingo_participant" ADD "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "bingo_participant" ADD "created_by" integer`);
        await queryRunner.query(`ALTER TABLE "bingo_participant" ADD "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "bingo_participant" ADD "updated_by" integer`);
        await queryRunner.query(`ALTER TABLE "bingo_participant" ADD "points" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "bingo_participant" ADD CONSTRAINT "FK_71ac305403f15c9774a56cae058" FOREIGN KEY ("created_by") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "bingo_participant" DROP CONSTRAINT "FK_71ac305403f15c9774a56cae058"`);
        await queryRunner.query(`ALTER TABLE "bingo_participant" DROP COLUMN "points"`);
        await queryRunner.query(`ALTER TABLE "bingo_participant" DROP COLUMN "updated_by"`);
        await queryRunner.query(`ALTER TABLE "bingo_participant" DROP COLUMN "updated_at"`);
        await queryRunner.query(`ALTER TABLE "bingo_participant" DROP COLUMN "created_by"`);
        await queryRunner.query(`ALTER TABLE "bingo_participant" DROP COLUMN "created_at"`);
    }

}
