import { MigrationInterface, QueryRunner } from "typeorm";

export class AddBingoInvitation1754177924332 implements MigrationInterface {
    name = 'AddBingoInvitation1754177924332'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "bingo_team" DROP CONSTRAINT "FK_98ca671f2e30f1b7e2c01163eef"`);
        await queryRunner.query(`CREATE TABLE "bingo_invitation" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "created_by" integer, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_by" integer, "code" uuid NOT NULL, "bingo_id" integer NOT NULL, "invitee_id" integer, "role" character varying NOT NULL DEFAULT 'participant', "team_id" integer, "status" character varying NOT NULL DEFAULT 'pending', "uses" integer NOT NULL DEFAULT '0', "disabled" boolean NOT NULL DEFAULT false, CONSTRAINT "UQ_893d4569b6d82baf45924a218a5" UNIQUE ("code"), CONSTRAINT "PK_9e837d3542a4da28b4c67db5c34" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "bingo_team" ADD CONSTRAINT "FK_794d10226b82e55874737e6c89b" FOREIGN KEY ("bingo_id") REFERENCES "bingo"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "bingo_invitation" ADD CONSTRAINT "FK_929a8851bac95b5a6a9694db907" FOREIGN KEY ("bingo_id") REFERENCES "bingo"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "bingo_invitation" ADD CONSTRAINT "FK_c0e9c3adf10fd8702aec5bd7c99" FOREIGN KEY ("invitee_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "bingo_invitation" ADD CONSTRAINT "FK_f23fe6aa027b26385b2b8d40297" FOREIGN KEY ("created_by") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "bingo_invitation" ADD CONSTRAINT "FK_9527bce644809c1cdda55dda067" FOREIGN KEY ("team_id") REFERENCES "bingo_team"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "bingo_invitation" DROP CONSTRAINT "FK_9527bce644809c1cdda55dda067"`);
        await queryRunner.query(`ALTER TABLE "bingo_invitation" DROP CONSTRAINT "FK_f23fe6aa027b26385b2b8d40297"`);
        await queryRunner.query(`ALTER TABLE "bingo_invitation" DROP CONSTRAINT "FK_c0e9c3adf10fd8702aec5bd7c99"`);
        await queryRunner.query(`ALTER TABLE "bingo_invitation" DROP CONSTRAINT "FK_929a8851bac95b5a6a9694db907"`);
        await queryRunner.query(`ALTER TABLE "bingo_team" DROP CONSTRAINT "FK_794d10226b82e55874737e6c89b"`);
        await queryRunner.query(`DROP TABLE "bingo_invitation"`);
        await queryRunner.query(`ALTER TABLE "bingo_team" ADD CONSTRAINT "FK_98ca671f2e30f1b7e2c01163eef" FOREIGN KEY ("id") REFERENCES "bingo"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
