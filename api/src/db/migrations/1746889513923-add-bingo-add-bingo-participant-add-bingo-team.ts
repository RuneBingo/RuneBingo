import { MigrationInterface, QueryRunner } from "typeorm";

export class AddBingoAddBingoParticipantAddBingoTeam1746889513923 implements MigrationInterface {
    name = 'AddBingoAddBingoParticipantAddBingoTeam1746889513923'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "session" DROP CONSTRAINT "FK_3d2f174ef04fb312fdebd0ddc53"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_694ca5a10460827a3564e66023"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_86550f6be89fca233ac583238a"`);
        await queryRunner.query(`CREATE TABLE "bingo_team" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "created_by" integer, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_by" integer, "deleted_at" TIMESTAMP WITH TIME ZONE, "deleted_by" integer, "bingo_id" integer NOT NULL, "name" character varying NOT NULL, "name_normalized" character varying NOT NULL, "captain_id" integer NOT NULL, "points" integer NOT NULL DEFAULT '0', CONSTRAINT "UQ_eb671da92929629ba1d6c012a64" UNIQUE ("bingo_id", "name_normalized"), CONSTRAINT "UQ_3c35d2eace475865e44f023f080" UNIQUE ("bingo_id", "name"), CONSTRAINT "REL_4215ce5c904794a3bb44c13a89" UNIQUE ("captain_id"), CONSTRAINT "PK_98ca671f2e30f1b7e2c01163eef" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_8bb183c51ad3a2091795b6e988" ON "bingo_team" ("deleted_at") WHERE "deleted_at" IS NOT NULL`);
        await queryRunner.query(`CREATE INDEX "IDX_69855350c914f4145ec0342da2" ON "bingo_team" ("deleted_at") WHERE "deleted_at" IS NULL`);
        await queryRunner.query(`CREATE TABLE "bingo_participant" ("user_id" integer NOT NULL, "bingo_id" integer NOT NULL, "role" character varying NOT NULL DEFAULT 'participant', "team_id" integer, CONSTRAINT "PK_c6d4381dbbf4ebf3f02eb8d95f6" PRIMARY KEY ("user_id", "bingo_id"))`);
        await queryRunner.query(`CREATE TABLE "bingo" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "created_by" integer, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_by" integer, "deleted_at" TIMESTAMP WITH TIME ZONE, "deleted_by" integer, "language" character varying NOT NULL DEFAULT 'en', "title" character varying NOT NULL, "slug" character varying NOT NULL, "description" character varying NOT NULL, "private" boolean NOT NULL, "width" integer NOT NULL DEFAULT '5', "height" integer NOT NULL DEFAULT '5', "full_line_value" integer NOT NULL, "start_date" date NOT NULL, "end_date" date NOT NULL, "started_at" TIMESTAMP WITH TIME ZONE, "started_by" integer, "ended_at" TIMESTAMP WITH TIME ZONE, "ended_by" integer, "canceled_at" TIMESTAMP WITH TIME ZONE, "canceled_by" integer, "max_registration_date" date, CONSTRAINT "PK_852d0aee265c4f8df4d04873f21" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_6aa272dc908ff1a20a3f38d2ce" ON "bingo" ("deleted_at") WHERE "deleted_at" IS NOT NULL`);
        await queryRunner.query(`CREATE INDEX "IDX_ef43e9b55583c5a8c26b0e7d84" ON "bingo" ("deleted_at") WHERE "deleted_at" IS NULL`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_UNIQUE_SLUG_WHEN_NOT_DELETED" ON "bingo" ("slug") WHERE "deleted_at" IS NULL`);
        await queryRunner.query(`ALTER TABLE "session" DROP COLUMN "userId"`);
        await queryRunner.query(`CREATE INDEX "IDX_52f62a9a442b3e45f942f1ff0c" ON "user" ("deleted_at") WHERE "deleted_at" IS NOT NULL`);
        await queryRunner.query(`CREATE INDEX "IDX_f15a1e032b752248437bd1e17b" ON "user" ("deleted_at") WHERE "deleted_at" IS NULL`);
        await queryRunner.query(`ALTER TABLE "session" ADD CONSTRAINT "FK_30e98e8746699fb9af235410aff" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "bingo_team" ADD CONSTRAINT "FK_794d10226b82e55874737e6c89b" FOREIGN KEY ("bingo_id") REFERENCES "bingo"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "bingo_team" ADD CONSTRAINT "FK_4215ce5c904794a3bb44c13a896" FOREIGN KEY ("captain_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "bingo_participant" ADD CONSTRAINT "FK_2000857c368f6de826b909031fe" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "bingo_participant" ADD CONSTRAINT "FK_64b426622b8103171665645d9f2" FOREIGN KEY ("bingo_id") REFERENCES "bingo"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "bingo_participant" ADD CONSTRAINT "FK_b67447cf05f18fbe7fdd77a3fb7" FOREIGN KEY ("team_id") REFERENCES "bingo_team"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "bingo" ADD CONSTRAINT "FK_dbf0d646482b24af7471ea410d4" FOREIGN KEY ("created_by") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "bingo" ADD CONSTRAINT "FK_2776f0f7f3f4d716ce0fe126007" FOREIGN KEY ("updated_by") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "bingo" ADD CONSTRAINT "FK_7a5186900bca7e36c353716723e" FOREIGN KEY ("started_by") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "bingo" ADD CONSTRAINT "FK_b8c09a534d6b55512001510e349" FOREIGN KEY ("ended_by") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "bingo" ADD CONSTRAINT "FK_e1492766d93dfc46722ba9688aa" FOREIGN KEY ("canceled_by") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "bingo" ADD CONSTRAINT "FK_c5601c0da9c898c6c0ed96d8c87" FOREIGN KEY ("deleted_by") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "bingo" DROP CONSTRAINT "FK_c5601c0da9c898c6c0ed96d8c87"`);
        await queryRunner.query(`ALTER TABLE "bingo" DROP CONSTRAINT "FK_e1492766d93dfc46722ba9688aa"`);
        await queryRunner.query(`ALTER TABLE "bingo" DROP CONSTRAINT "FK_b8c09a534d6b55512001510e349"`);
        await queryRunner.query(`ALTER TABLE "bingo" DROP CONSTRAINT "FK_7a5186900bca7e36c353716723e"`);
        await queryRunner.query(`ALTER TABLE "bingo" DROP CONSTRAINT "FK_2776f0f7f3f4d716ce0fe126007"`);
        await queryRunner.query(`ALTER TABLE "bingo" DROP CONSTRAINT "FK_dbf0d646482b24af7471ea410d4"`);
        await queryRunner.query(`ALTER TABLE "bingo_participant" DROP CONSTRAINT "FK_b67447cf05f18fbe7fdd77a3fb7"`);
        await queryRunner.query(`ALTER TABLE "bingo_participant" DROP CONSTRAINT "FK_64b426622b8103171665645d9f2"`);
        await queryRunner.query(`ALTER TABLE "bingo_participant" DROP CONSTRAINT "FK_2000857c368f6de826b909031fe"`);
        await queryRunner.query(`ALTER TABLE "bingo_team" DROP CONSTRAINT "FK_4215ce5c904794a3bb44c13a896"`);
        await queryRunner.query(`ALTER TABLE "bingo_team" DROP CONSTRAINT "FK_794d10226b82e55874737e6c89b"`);
        await queryRunner.query(`ALTER TABLE "session" DROP CONSTRAINT "FK_30e98e8746699fb9af235410aff"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_f15a1e032b752248437bd1e17b"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_52f62a9a442b3e45f942f1ff0c"`);
        await queryRunner.query(`ALTER TABLE "session" ADD "userId" integer`);
        await queryRunner.query(`DROP INDEX "public"."IDX_UNIQUE_SLUG_WHEN_NOT_DELETED"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_ef43e9b55583c5a8c26b0e7d84"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_6aa272dc908ff1a20a3f38d2ce"`);
        await queryRunner.query(`DROP TABLE "bingo"`);
        await queryRunner.query(`DROP TABLE "bingo_participant"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_69855350c914f4145ec0342da2"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_8bb183c51ad3a2091795b6e988"`);
        await queryRunner.query(`DROP TABLE "bingo_team"`);
        await queryRunner.query(`CREATE INDEX "IDX_86550f6be89fca233ac583238a" ON "user" ("deleted_at") WHERE (deleted_at IS NULL)`);
        await queryRunner.query(`CREATE INDEX "IDX_694ca5a10460827a3564e66023" ON "user" ("deleted_at") WHERE (deleted_at IS NOT NULL)`);
        await queryRunner.query(`ALTER TABLE "session" ADD CONSTRAINT "FK_3d2f174ef04fb312fdebd0ddc53" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
