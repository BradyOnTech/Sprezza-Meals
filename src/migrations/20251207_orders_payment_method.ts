import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    alter table public.orders
      add column if not exists payment_method_id text,
      add column if not exists stripe_customer_id text;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    alter table public.orders
      drop column if exists payment_method_id,
      drop column if exists stripe_customer_id;
  `)
}
