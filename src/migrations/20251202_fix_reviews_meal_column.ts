import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  // Add meal_id column to reviews table to match Payload's naming convention
  await db.execute(sql`
    ALTER TABLE "reviews" ADD COLUMN "meal_id" INTEGER REFERENCES "meals"("id") ON DELETE CASCADE;
  `)

  // Copy data from meal column to meal_id if needed
  await db.execute(sql`
    UPDATE "reviews" SET "meal_id" = "meal" WHERE "meal_id" IS NULL;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  // Remove meal_id column from reviews table
  await db.execute(sql`
    ALTER TABLE "reviews" DROP COLUMN IF EXISTS "meal_id";
  `)
}
