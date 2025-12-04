import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    alter table public.orders
      add column if not exists shipping_address jsonb,
      add column if not exists billing_address jsonb;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    alter table public.orders
      drop column if exists shipping_address,
      drop column if exists billing_address;
  `)
}
