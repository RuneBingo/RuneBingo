import { MigrationInterface, QueryRunner } from "typeorm";

export class AddMediaTable1748799005713 implements MigrationInterface {
    name = 'AddMediaTable1748799005713'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "media" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "created_by" integer, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_by" integer, "deleted_at" TIMESTAMP WITH TIME ZONE, "deleted_by" integer, "asset_id" character varying NOT NULL, "public_id" character varying NOT NULL, "original_name" character varying NOT NULL, "size" integer NOT NULL, "width" integer NOT NULL, "height" integer NOT NULL, "format" character varying NOT NULL, "url" character varying NOT NULL, "metadata" jsonb, CONSTRAINT "PK_f4e0fcac36e050de337b670d8bd" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_f9fa6db24b5469f096ac358fc9" ON "media" ("deleted_at") WHERE "deleted_at" IS NOT NULL`);
        await queryRunner.query(`CREATE INDEX "IDX_e6674279e2d445236be72dec15" ON "media" ("deleted_at") WHERE "deleted_at" IS NULL`);
        await queryRunner.query(`ALTER TABLE "media" ADD CONSTRAINT "FK_d28b47b98808a620a766196d676" FOREIGN KEY ("created_by") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "media" ADD CONSTRAINT "FK_c3ca437d7eada60f42fe1272a2c" FOREIGN KEY ("updated_by") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "media" DROP CONSTRAINT "FK_c3ca437d7eada60f42fe1272a2c"`);
        await queryRunner.query(`ALTER TABLE "media" DROP CONSTRAINT "FK_d28b47b98808a620a766196d676"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e6674279e2d445236be72dec15"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_f9fa6db24b5469f096ac358fc9"`);
        await queryRunner.query(`DROP TABLE "media"`);
    }

}
