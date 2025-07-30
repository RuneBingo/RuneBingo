import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBingoTilesTables1751051930934 implements MigrationInterface {
  name = 'AddBingoTilesTables1751051930934';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "bingo_tile_item" ("created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "created_by" integer, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_by" integer, "bingo_tile_id" integer NOT NULL, "osrs_item_id" integer NOT NULL, "index" integer NOT NULL, "quantity" integer NOT NULL, CONSTRAINT "PK_af728de250a1c96dfc5ef68c6a7" PRIMARY KEY ("bingo_tile_id", "osrs_item_id", "index"))`,
    );
    await queryRunner.query(`CREATE TYPE "public"."bingo_tile_completion_mode_enum" AS ENUM('all', 'any')`);
    await queryRunner.query(
      `CREATE TABLE "bingo_tile" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "created_by" integer, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_by" integer, "bingo_id" integer NOT NULL, "x" integer NOT NULL, "y" integer NOT NULL, "value" integer NOT NULL, "free" boolean NOT NULL DEFAULT false, "title" character varying NOT NULL, "description" character varying NOT NULL, "completion_mode" "public"."bingo_tile_completion_mode_enum" NOT NULL, "media_id" integer, "image_url" character varying, CONSTRAINT "UQ_7fd0045f5091f77044acdf957a6" UNIQUE ("bingo_id", "x", "y"), CONSTRAINT "PK_c457d5503d65dced1824de32e03" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`ALTER TABLE "osrs_item" ADD "icon_url" character varying`);
    await queryRunner.query(`UPDATE "osrs_item" SET "icon_url" = ''`);
    await queryRunner.query(`ALTER TABLE "osrs_item" ALTER COLUMN "icon_url" SET NOT NULL`);
    await queryRunner.query(`ALTER TABLE "bingo_team" DROP CONSTRAINT "FK_4215ce5c904794a3bb44c13a896"`);
    await queryRunner.query(`ALTER TABLE "bingo_team" DROP CONSTRAINT "REL_4215ce5c904794a3bb44c13a89"`);
    await queryRunner.query(
      `ALTER TABLE "bingo_team" ADD CONSTRAINT "FK_4215ce5c904794a3bb44c13a896" FOREIGN KEY ("captain_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "bingo_tile_item" ADD CONSTRAINT "FK_4a262a025110a89f70b7bdd15d5" FOREIGN KEY ("bingo_tile_id") REFERENCES "bingo_tile"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "bingo_tile_item" ADD CONSTRAINT "FK_b5fc6242cdf641655119ecbc3ab" FOREIGN KEY ("osrs_item_id") REFERENCES "osrs_item"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "bingo_tile_item" ADD CONSTRAINT "FK_87138f9bb77c308e3c773f59db2" FOREIGN KEY ("created_by") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "bingo_tile_item" ADD CONSTRAINT "FK_baf87aa96f994722662dfae4899" FOREIGN KEY ("updated_by") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "bingo_tile" ADD CONSTRAINT "FK_1d41349e9425dcec86babc412c6" FOREIGN KEY ("created_by") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "bingo_tile" ADD CONSTRAINT "FK_5174bee0a966e6bfd84df5f30f4" FOREIGN KEY ("updated_by") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "bingo_tile" ADD CONSTRAINT "FK_973875aa5c7f10a2b8df5e47103" FOREIGN KEY ("bingo_id") REFERENCES "bingo"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "bingo_tile" ADD CONSTRAINT "FK_855a1acf27dac3155cbfb2b08ca" FOREIGN KEY ("media_id") REFERENCES "media"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "bingo_tile" DROP CONSTRAINT "FK_855a1acf27dac3155cbfb2b08ca"`);
    await queryRunner.query(`ALTER TABLE "bingo_tile" DROP CONSTRAINT "FK_973875aa5c7f10a2b8df5e47103"`);
    await queryRunner.query(`ALTER TABLE "bingo_tile" DROP CONSTRAINT "FK_5174bee0a966e6bfd84df5f30f4"`);
    await queryRunner.query(`ALTER TABLE "bingo_tile" DROP CONSTRAINT "FK_1d41349e9425dcec86babc412c6"`);
    await queryRunner.query(`ALTER TABLE "bingo_tile_item" DROP CONSTRAINT "FK_baf87aa96f994722662dfae4899"`);
    await queryRunner.query(`ALTER TABLE "bingo_tile_item" DROP CONSTRAINT "FK_87138f9bb77c308e3c773f59db2"`);
    await queryRunner.query(`ALTER TABLE "bingo_tile_item" DROP CONSTRAINT "FK_b5fc6242cdf641655119ecbc3ab"`);
    await queryRunner.query(`ALTER TABLE "bingo_tile_item" DROP CONSTRAINT "FK_4a262a025110a89f70b7bdd15d5"`);
    await queryRunner.query(`ALTER TABLE "bingo_team" DROP CONSTRAINT "FK_4215ce5c904794a3bb44c13a896"`);
    await queryRunner.query(
      `ALTER TABLE "bingo_team" ADD CONSTRAINT "REL_4215ce5c904794a3bb44c13a89" UNIQUE ("captain_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "bingo_team" ADD CONSTRAINT "FK_4215ce5c904794a3bb44c13a896" FOREIGN KEY ("captain_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(`ALTER TABLE "osrs_item" DROP COLUMN "icon_url"`);
    await queryRunner.query(`DROP TABLE "bingo_tile"`);
    await queryRunner.query(`DROP TYPE "public"."bingo_tile_completion_mode_enum"`);
    await queryRunner.query(`DROP TABLE "bingo_tile_item"`);
  }
}
