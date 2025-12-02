import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  // Add reviews_id column to payload_locked_documents_rels table
  await db.execute(sql`
    ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "reviews_id" INTEGER;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  // Remove reviews_id column from payload_locked_documents_rels table
  await db.execute(sql`
    ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "reviews_id";
  `)
}
