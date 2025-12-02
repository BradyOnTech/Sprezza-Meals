import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  // Create reviews table with Payload naming conventions
  await db.execute(sql`
    CREATE TABLE "reviews" (
      "id" SERIAL PRIMARY KEY,
      "title" VARCHAR(200) NOT NULL,
      "rating" INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
      "comment" TEXT NOT NULL,
      "meal" INTEGER NOT NULL REFERENCES "meals"("id") ON DELETE CASCADE,
      "user_id" INTEGER REFERENCES "users"("id") ON DELETE SET NULL,
      "guest_name" VARCHAR(255),
      "is_verified_purchase" BOOLEAN DEFAULT FALSE,
      "helpful_count" INTEGER DEFAULT 0,
      "created_at" TIMESTAMP(3) WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      "updated_at" TIMESTAMP(3) WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `)

  // Create reviews_images table with correct column names
  await db.execute(sql`
    CREATE TABLE "reviews_images" (
      "id" SERIAL PRIMARY KEY,
      "_parent_id" INTEGER NOT NULL REFERENCES "reviews"("id") ON DELETE CASCADE,
      "image" INTEGER NOT NULL REFERENCES "media"("id") ON DELETE CASCADE,
      "caption" TEXT,
      "_order" INTEGER DEFAULT 0
    );
  `)

  // Add reviews relationship to meals_rels table
  await db.execute(sql`
    ALTER TABLE "meals_rels" ADD COLUMN IF NOT EXISTS "reviews_id" INTEGER REFERENCES "reviews"("id") ON DELETE CASCADE;
  `)

  // Add reviews relationship to payload_locked_documents_rels for admin access
  await db.execute(sql`
    ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "reviews_id" INTEGER;
  `)

  // Create indexes
  await db.execute(sql`CREATE INDEX IF NOT EXISTS "reviews_meal_idx" ON "reviews"("meal");`)
  await db.execute(sql`CREATE INDEX IF NOT EXISTS "reviews_user_idx" ON "reviews"("user_id");`)
  await db.execute(
    sql`CREATE INDEX IF NOT EXISTS "reviews_images_parent_id_idx" ON "reviews_images"("_parent_id");`,
  )
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  // Drop indexes
  await db.execute(sql`DROP INDEX IF EXISTS "reviews_images_parent_id_idx";`)
  await db.execute(sql`DROP INDEX IF EXISTS "reviews_user_idx";`)
  await db.execute(sql`DROP INDEX IF EXISTS "reviews_meal_idx";`)

  // Remove reviews relationship from meals_rels table
  await db.execute(sql`ALTER TABLE "meals_rels" DROP COLUMN IF EXISTS "reviews_id";`)

  // Remove reviews relationship from payload_locked_documents_rels table
  await db.execute(
    sql`ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "reviews_id";`,
  )

  // Drop tables
  await db.execute(sql`DROP TABLE IF EXISTS "reviews_images";`)
  await db.execute(sql`DROP TABLE IF EXISTS "reviews";`)
}
