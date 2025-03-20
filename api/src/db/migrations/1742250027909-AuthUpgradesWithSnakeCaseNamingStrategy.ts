import { MigrationInterface, QueryRunner } from 'typeorm';

export class AuthUpgradesWithSnakeCaseNamingStrategy1742250027909 implements MigrationInterface {
  name = 'AuthUpgradesWithSnakeCaseNamingStrategy1742250027909';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_83aeb8193e1e98de29e2be2205"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_915108ba20912c6119c621f760"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_e84d87037ff1274918c7b2f871"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_a61cb8d191cd7e21cbce349a03"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_67ce0ac571b48623338209708b"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_a0b80835e18d19fe988fb99a73"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_eb67bfc6f7b8045d4498e37b7d"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_564f72e973c25fff816ea6cb34"`);
    await queryRunner.query(`ALTER TABLE "activity" DROP COLUMN "createdAt"`);
    await queryRunner.query(`ALTER TABLE "activity" DROP COLUMN "createdBy"`);
    await queryRunner.query(`ALTER TABLE "activity" DROP COLUMN "updatedAt"`);
    await queryRunner.query(`ALTER TABLE "activity" DROP COLUMN "updatedBy"`);
    await queryRunner.query(`ALTER TABLE "activity" DROP COLUMN "trackableType"`);
    await queryRunner.query(`ALTER TABLE "activity" DROP COLUMN "trackableId"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "createdAt"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "createdBy"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "updatedAt"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "updatedBy"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "deletedAt"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "deletedBy"`);
    await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "UQ_a95e949168be7b7ece1a2382fed"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "uuid"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "disabledAt"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "disabledBy"`);
    await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "UQ_1889d3aecbe55fcf0c45ab233d4"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "emailNormalized"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "emailVerified"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "isSuperAdmin"`);
    await queryRunner.query(`ALTER TABLE "session" DROP COLUMN "createdAt"`);
    await queryRunner.query(`ALTER TABLE "session" DROP COLUMN "createdBy"`);
    await queryRunner.query(`ALTER TABLE "session" DROP COLUMN "updatedAt"`);
    await queryRunner.query(`ALTER TABLE "session" DROP COLUMN "updatedBy"`);
    await queryRunner.query(`ALTER TABLE "session" DROP COLUMN "sessionID"`);
    await queryRunner.query(`ALTER TABLE "session" DROP COLUMN "ipAddress"`);
    await queryRunner.query(`ALTER TABLE "session" DROP COLUMN "userAgent"`);
    await queryRunner.query(`ALTER TABLE "session" DROP COLUMN "deviceType"`);
    await queryRunner.query(`ALTER TABLE "session" DROP COLUMN "signedOutAt"`);
    await queryRunner.query(`ALTER TABLE "session" DROP COLUMN "expiresAt"`);
    await queryRunner.query(`ALTER TABLE "session" DROP COLUMN "lastSeenAt"`);
    await queryRunner.query(`ALTER TABLE "activity" ADD "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
    await queryRunner.query(`ALTER TABLE "activity" ADD "created_by" integer`);
    await queryRunner.query(`ALTER TABLE "activity" ADD "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
    await queryRunner.query(`ALTER TABLE "activity" ADD "updated_by" integer`);
    await queryRunner.query(`ALTER TABLE "activity" ADD "trackable_type" character varying NOT NULL`);
    await queryRunner.query(`ALTER TABLE "activity" ADD "trackable_id" integer NOT NULL`);
    await queryRunner.query(`ALTER TABLE "user" ADD "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
    await queryRunner.query(`ALTER TABLE "user" ADD "created_by" integer`);
    await queryRunner.query(`ALTER TABLE "user" ADD "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
    await queryRunner.query(`ALTER TABLE "user" ADD "updated_by" integer`);
    await queryRunner.query(`ALTER TABLE "user" ADD "deleted_at" TIMESTAMP WITH TIME ZONE`);
    await queryRunner.query(`ALTER TABLE "user" ADD "deleted_by" integer`);
    await queryRunner.query(`ALTER TABLE "user" ADD "disabled_at" TIMESTAMP WITH TIME ZONE`);
    await queryRunner.query(`ALTER TABLE "user" ADD "disabled_by" integer`);
    await queryRunner.query(`ALTER TABLE "user" ADD "email_normalized" character varying(255) NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "UQ_0101db7b2640f3fa251137e02e9" UNIQUE ("email_normalized")`,
    );
    await queryRunner.query(`ALTER TABLE "user" ADD "email_verified" boolean NOT NULL DEFAULT false`);
    await queryRunner.query(`ALTER TABLE "user" ADD "username" character varying(25) NOT NULL`);
    await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "UQ_78a916df40e02a9deb1c4b75edb" UNIQUE ("username")`);
    await queryRunner.query(`ALTER TABLE "user" ADD "username_normalized" character varying(25) NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "UQ_7317af16573fa25a2f49b5195d1" UNIQUE ("username_normalized")`,
    );
    await queryRunner.query(`ALTER TABLE "user" ADD "gravatar_hash" character(64)`);
    await queryRunner.query(`ALTER TABLE "user" ADD "role" character varying NOT NULL DEFAULT 'user'`);
    await queryRunner.query(`ALTER TABLE "session" ADD "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
    await queryRunner.query(`ALTER TABLE "session" ADD "created_by" integer`);
    await queryRunner.query(`ALTER TABLE "session" ADD "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
    await queryRunner.query(`ALTER TABLE "session" ADD "updated_by" integer`);
    await queryRunner.query(`ALTER TABLE "session" ADD "session_id" character varying(255) NOT NULL`);
    await queryRunner.query(`ALTER TABLE "session" ADD "ip_address" character varying(64) NOT NULL`);
    await queryRunner.query(`ALTER TABLE "session" ADD "user_agent" character varying(255) NOT NULL`);
    await queryRunner.query(`ALTER TABLE "session" ADD "device_type" character varying(255) NOT NULL`);
    await queryRunner.query(`ALTER TABLE "session" ADD "signed_out_at" TIMESTAMP WITH TIME ZONE`);
    await queryRunner.query(`ALTER TABLE "session" ADD "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL`);
    await queryRunner.query(`ALTER TABLE "session" ADD "last_seen_at" TIMESTAMP WITH TIME ZONE NOT NULL`);
    await queryRunner.query(`ALTER TABLE "session" ADD "user_id" integer NOT NULL`);
    await queryRunner.query(`ALTER TABLE "session" DROP CONSTRAINT "FK_3d2f174ef04fb312fdebd0ddc53"`);
    await queryRunner.query(`ALTER TABLE "session" ALTER COLUMN "userId" DROP NOT NULL`);
    await queryRunner.query(
      `CREATE INDEX "IDX_8c1b68165f693a6cc6cc28c9f8" ON "activity" ("trackable_type", "trackable_id", "key") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_203fe36da75d447d23bc403103" ON "activity" ("trackable_type", "trackable_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_694ca5a10460827a3564e66023" ON "user" ("deleted_at") WHERE "deleted_at" IS NOT NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_86550f6be89fca233ac583238a" ON "user" ("deleted_at") WHERE "deleted_at" IS NULL`,
    );
    await queryRunner.query(`CREATE INDEX "IDX_8fa3be9a36045b0feb7fc3361f" ON "session" ("user_id", "last_seen_at") `);
    await queryRunner.query(`CREATE INDEX "IDX_ab1072acf422ff778797f1d6e9" ON "session" ("user_id", "expires_at") `);
    await queryRunner.query(`CREATE INDEX "IDX_5c884581f7481fca670ba755ac" ON "session" ("user_id", "signed_out_at") `);
    await queryRunner.query(
      `CREATE INDEX "IDX_693f6b7303d1ec073989ef9411" ON "session" ("user_id", "signed_out_at", "expires_at") `,
    );
    await queryRunner.query(
      `ALTER TABLE "session" ADD CONSTRAINT "FK_3d2f174ef04fb312fdebd0ddc53" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "session" DROP CONSTRAINT "FK_3d2f174ef04fb312fdebd0ddc53"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_693f6b7303d1ec073989ef9411"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_5c884581f7481fca670ba755ac"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_ab1072acf422ff778797f1d6e9"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_8fa3be9a36045b0feb7fc3361f"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_86550f6be89fca233ac583238a"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_694ca5a10460827a3564e66023"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_203fe36da75d447d23bc403103"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_8c1b68165f693a6cc6cc28c9f8"`);
    await queryRunner.query(`ALTER TABLE "session" ALTER COLUMN "userId" SET NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "session" ADD CONSTRAINT "FK_3d2f174ef04fb312fdebd0ddc53" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(`ALTER TABLE "session" DROP COLUMN "user_id"`);
    await queryRunner.query(`ALTER TABLE "session" DROP COLUMN "last_seen_at"`);
    await queryRunner.query(`ALTER TABLE "session" DROP COLUMN "expires_at"`);
    await queryRunner.query(`ALTER TABLE "session" DROP COLUMN "signed_out_at"`);
    await queryRunner.query(`ALTER TABLE "session" DROP COLUMN "device_type"`);
    await queryRunner.query(`ALTER TABLE "session" DROP COLUMN "user_agent"`);
    await queryRunner.query(`ALTER TABLE "session" DROP COLUMN "ip_address"`);
    await queryRunner.query(`ALTER TABLE "session" DROP COLUMN "session_id"`);
    await queryRunner.query(`ALTER TABLE "session" DROP COLUMN "updated_by"`);
    await queryRunner.query(`ALTER TABLE "session" DROP COLUMN "updated_at"`);
    await queryRunner.query(`ALTER TABLE "session" DROP COLUMN "created_by"`);
    await queryRunner.query(`ALTER TABLE "session" DROP COLUMN "created_at"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "role"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "gravatar_hash"`);
    await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "UQ_7317af16573fa25a2f49b5195d1"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "username_normalized"`);
    await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "UQ_78a916df40e02a9deb1c4b75edb"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "username"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "email_verified"`);
    await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "UQ_0101db7b2640f3fa251137e02e9"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "email_normalized"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "disabled_by"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "disabled_at"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "deleted_by"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "deleted_at"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "updated_by"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "updated_at"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "created_by"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "created_at"`);
    await queryRunner.query(`ALTER TABLE "activity" DROP COLUMN "trackable_id"`);
    await queryRunner.query(`ALTER TABLE "activity" DROP COLUMN "trackable_type"`);
    await queryRunner.query(`ALTER TABLE "activity" DROP COLUMN "updated_by"`);
    await queryRunner.query(`ALTER TABLE "activity" DROP COLUMN "updated_at"`);
    await queryRunner.query(`ALTER TABLE "activity" DROP COLUMN "created_by"`);
    await queryRunner.query(`ALTER TABLE "activity" DROP COLUMN "created_at"`);
    await queryRunner.query(`ALTER TABLE "session" ADD "lastSeenAt" TIMESTAMP WITH TIME ZONE NOT NULL`);
    await queryRunner.query(`ALTER TABLE "session" ADD "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL`);
    await queryRunner.query(`ALTER TABLE "session" ADD "signedOutAt" TIMESTAMP WITH TIME ZONE`);
    await queryRunner.query(`ALTER TABLE "session" ADD "deviceType" character varying(255) NOT NULL`);
    await queryRunner.query(`ALTER TABLE "session" ADD "userAgent" character varying(255) NOT NULL`);
    await queryRunner.query(`ALTER TABLE "session" ADD "ipAddress" character varying(64) NOT NULL`);
    await queryRunner.query(`ALTER TABLE "session" ADD "sessionID" character varying(255) NOT NULL`);
    await queryRunner.query(`ALTER TABLE "session" ADD "updatedBy" integer`);
    await queryRunner.query(`ALTER TABLE "session" ADD "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
    await queryRunner.query(`ALTER TABLE "session" ADD "createdBy" integer`);
    await queryRunner.query(`ALTER TABLE "session" ADD "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
    await queryRunner.query(`ALTER TABLE "user" ADD "isSuperAdmin" boolean NOT NULL DEFAULT false`);
    await queryRunner.query(`ALTER TABLE "user" ADD "emailVerified" boolean NOT NULL DEFAULT false`);
    await queryRunner.query(`ALTER TABLE "user" ADD "emailNormalized" character varying(255) NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "UQ_1889d3aecbe55fcf0c45ab233d4" UNIQUE ("emailNormalized")`,
    );
    await queryRunner.query(`ALTER TABLE "user" ADD "disabledBy" integer`);
    await queryRunner.query(`ALTER TABLE "user" ADD "disabledAt" TIMESTAMP WITH TIME ZONE`);
    await queryRunner.query(`ALTER TABLE "user" ADD "uuid" uuid NOT NULL DEFAULT uuid_generate_v4()`);
    await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "UQ_a95e949168be7b7ece1a2382fed" UNIQUE ("uuid")`);
    await queryRunner.query(`ALTER TABLE "user" ADD "deletedBy" integer`);
    await queryRunner.query(`ALTER TABLE "user" ADD "deletedAt" TIMESTAMP WITH TIME ZONE`);
    await queryRunner.query(`ALTER TABLE "user" ADD "updatedBy" integer`);
    await queryRunner.query(`ALTER TABLE "user" ADD "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
    await queryRunner.query(`ALTER TABLE "user" ADD "createdBy" integer`);
    await queryRunner.query(`ALTER TABLE "user" ADD "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
    await queryRunner.query(`ALTER TABLE "activity" ADD "trackableId" integer NOT NULL`);
    await queryRunner.query(`ALTER TABLE "activity" ADD "trackableType" character varying NOT NULL`);
    await queryRunner.query(`ALTER TABLE "activity" ADD "updatedBy" integer`);
    await queryRunner.query(`ALTER TABLE "activity" ADD "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
    await queryRunner.query(`ALTER TABLE "activity" ADD "createdBy" integer`);
    await queryRunner.query(`ALTER TABLE "activity" ADD "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
    await queryRunner.query(
      `CREATE INDEX "IDX_564f72e973c25fff816ea6cb34" ON "session" ("expiresAt", "signedOutAt", "userId") `,
    );
    await queryRunner.query(`CREATE INDEX "IDX_eb67bfc6f7b8045d4498e37b7d" ON "session" ("signedOutAt", "userId") `);
    await queryRunner.query(`CREATE INDEX "IDX_a0b80835e18d19fe988fb99a73" ON "session" ("expiresAt", "userId") `);
    await queryRunner.query(`CREATE INDEX "IDX_67ce0ac571b48623338209708b" ON "session" ("lastSeenAt", "userId") `);
    await queryRunner.query(
      `CREATE INDEX "IDX_a61cb8d191cd7e21cbce349a03" ON "user" ("deletedAt") WHERE ("deletedAt" IS NULL)`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_e84d87037ff1274918c7b2f871" ON "user" ("deletedAt") WHERE ("deletedAt" IS NOT NULL)`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_915108ba20912c6119c621f760" ON "activity" ("trackableId", "trackableType") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_83aeb8193e1e98de29e2be2205" ON "activity" ("key", "trackableId", "trackableType") `,
    );
  }
}
