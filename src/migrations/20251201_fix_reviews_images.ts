import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  // Create reviews_images table with correct column names
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "reviews_images" (
      "id" SERIAL PRIMARY KEY,
      "_parent_id" INTEGER NOT NULL REFERENCES "reviews"("id") ON DELETE CASCADE,
      "image" INTEGER NOT NULL REFERENCES "media"("id") ON DELETE CASCADE,
      "caption" TEXT,
      "_order" INTEGER DEFAULT 0
    );
  `)

  // Create index with correct column name
  await db.execute(
    sql`CREATE INDEX IF NOT EXISTS "reviews_images_parent_id_idx" ON "reviews_images"("_parent_id");`,
  )
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  // Drop index
  await db.execute(sql`DROP INDEX IF EXISTS "reviews_images_parent_id_idx";`)

  // Drop table
  await db.execute(sql`DROP TABLE IF EXISTS "reviews_images";`)
}
