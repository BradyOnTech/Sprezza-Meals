import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  // Add image_id column to reviews_images table to match Payload's naming convention
  await db.execute(sql`
    ALTER TABLE "reviews_images" ADD COLUMN "image_id" INTEGER REFERENCES "media"("id") ON DELETE CASCADE;
  `)

  // Copy data from image column to image_id if needed
  await db.execute(sql`
    UPDATE "reviews_images" SET "image_id" = "image" WHERE "image_id" IS NULL;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  // Remove image_id column from reviews_images table
  await db.execute(sql`
    ALTER TABLE "reviews_images" DROP COLUMN IF EXISTS "image_id";
  `)
}
