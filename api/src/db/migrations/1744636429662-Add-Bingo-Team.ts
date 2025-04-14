import { MigrationInterface, QueryRunner } from "typeorm";

export class AddBingoTeam1744636429662 implements MigrationInterface {
    name = 'AddBingoTeam1744636429662'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "bingo_team" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "created_by" integer, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_by" integer, "deleted_at" TIMESTAMP WITH TIME ZONE, "deleted_by" integer, "bingo_id" integer NOT NULL, "name" character varying NOT NULL, "name_normalized" character varying NOT NULL, "captain_id" integer NOT NULL, "points" integer NOT NULL DEFAULT '0', CONSTRAINT "UQ_eb671da92929629ba1d6c012a64" UNIQUE ("bingo_id", "name_normalized"), CONSTRAINT "UQ_3c35d2eace475865e44f023f080" UNIQUE ("bingo_id", "name"), CONSTRAINT "REL_4215ce5c904794a3bb44c13a89" UNIQUE ("captain_id"), CONSTRAINT "PK_98ca671f2e30f1b7e2c01163eef" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_8bb183c51ad3a2091795b6e988" ON "bingo_team" ("deleted_at") WHERE "deleted_at" IS NOT NULL`);
        await queryRunner.query(`CREATE INDEX "IDX_69855350c914f4145ec0342da2" ON "bingo_team" ("deleted_at") WHERE "deleted_at" IS NULL`);
        await queryRunner.query(`ALTER TABLE "bingo_team" ADD CONSTRAINT "FK_794d10226b82e55874737e6c89b" FOREIGN KEY ("bingo_id") REFERENCES "bingo"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "bingo_team" ADD CONSTRAINT "FK_4215ce5c904794a3bb44c13a896" FOREIGN KEY ("captain_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "bingo_participant" ADD CONSTRAINT "FK_b67447cf05f18fbe7fdd77a3fb7" FOREIGN KEY ("team_id") REFERENCES "bingo_team"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "bingo_participant" DROP CONSTRAINT "FK_b67447cf05f18fbe7fdd77a3fb7"`);
        await queryRunner.query(`ALTER TABLE "bingo_team" DROP CONSTRAINT "FK_4215ce5c904794a3bb44c13a896"`);
        await queryRunner.query(`ALTER TABLE "bingo_team" DROP CONSTRAINT "FK_794d10226b82e55874737e6c89b"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_69855350c914f4145ec0342da2"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_8bb183c51ad3a2091795b6e988"`);
        await queryRunner.query(`DROP TABLE "bingo_team"`);
    }

}
