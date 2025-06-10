import { MigrationInterface, QueryRunner } from "typeorm";

export class AddOsrsItemTable1749497028578 implements MigrationInterface {
    name = 'AddOsrsItemTable1749497028578'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "osrs_item" ("id" integer NOT NULL, "name" character varying NOT NULL, "config_name" character varying NOT NULL, "category" integer NOT NULL, "exchangeable" boolean NOT NULL, "members" boolean NOT NULL, "examine" character varying NOT NULL, "image_url" character varying NOT NULL, "enabled" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_5dc6adaef90e494c1afe87dd628" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_e2215da459408a9ae094b7fd5b" ON "osrs_item" ("enabled") `);
        await queryRunner.query(`CREATE INDEX "IDX_a3a0fb68d83f16ccbfddc79385" ON "osrs_item" ("category") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_a3a0fb68d83f16ccbfddc79385"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e2215da459408a9ae094b7fd5b"`);
        await queryRunner.query(`DROP TABLE "osrs_item"`);
    }

}
