import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  // Allow guest orders (user_id null) while keeping ownership rules for authed users/service_role.
  await db.execute(sql`
    do $$ begin
      if exists (select 1 from pg_policies where schemaname='public' and tablename='orders' and policyname='orders_insert_self') then
        drop policy orders_insert_self on public.orders;
      end if;
      create policy orders_insert_self on public.orders
        for insert with check (
          user_id is null
          or auth.uid() = user_id
          or auth.role() = 'service_role'
        );
    end $$;

    do $$ begin
      if exists (select 1 from pg_policies where schemaname='public' and tablename='orders_items' and policyname='orders_items_insert_self') then
        drop policy orders_items_insert_self on public.orders_items;
      end if;
      create policy orders_items_insert_self on public.orders_items
        for insert with check (
          exists (
            select 1 from public.orders o
            where o.id = _parent_id
              and (
                o.user_id is null
                or o.user_id = auth.uid()
                or auth.role() = 'service_role'
              )
          )
        );
    end $$;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  // Revert to requiring user_id match or service_role for inserts.
  await db.execute(sql`
    do $$ begin
      if exists (select 1 from pg_policies where schemaname='public' and tablename='orders' and policyname='orders_insert_self') then
        drop policy orders_insert_self on public.orders;
      end if;
      create policy orders_insert_self on public.orders
        for insert with check (auth.uid() = user_id or auth.role() = 'service_role');
    end $$;

    do $$ begin
      if exists (select 1 from pg_policies where schemaname='public' and tablename='orders_items' and policyname='orders_items_insert_self') then
        drop policy orders_items_insert_self on public.orders_items;
      end if;
      create policy orders_items_insert_self on public.orders_items
        for insert with check (
          exists (
            select 1 from public.orders o
            where o.id = _parent_id
              and (o.user_id = auth.uid() or auth.role() = 'service_role')
          )
        );
    end $$;
  `)
}
