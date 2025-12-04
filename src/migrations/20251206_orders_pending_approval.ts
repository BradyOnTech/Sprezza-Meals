import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    do $$ begin
      alter type enum_orders_status add value if not exists 'pending_approval';
    exception
      when duplicate_object then null;
    end $$;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  // Cannot drop enum values safely; document-only noop.
  await db.execute(sql`select 1;`)
}
