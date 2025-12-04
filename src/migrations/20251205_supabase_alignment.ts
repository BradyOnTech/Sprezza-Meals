import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  // Shared updated_at helper
  await db.execute(sql`
    create or replace function public.update_timestamp()
    returns trigger
    language plpgsql
    as $$
    begin
      new.updated_at = now();
      return new;
    end;
    $$;
  `)

  // Profiles
  await db.execute(sql`
    create table if not exists public.profiles (
      user_id uuid primary key references auth.users(id) on delete cascade,
      full_name text,
      phone text,
      marketing_opt_in boolean default false,
      dietary_preferences text[] default '{}'::text[],
      delivery_notes text,
      address_line1 text,
      address_line2 text,
      city text,
      state text,
      postal_code text,
      created_at timestamptz default now(),
      updated_at timestamptz default now()
    );

    do $$
    begin
      if not exists (select 1 from pg_trigger where tgname = 'profiles_set_updated_at') then
        create trigger profiles_set_updated_at
        before update on public.profiles
        for each row
        execute function public.update_timestamp();
      end if;
    end;
    $$;

    alter table public.profiles enable row level security;

    do $$ begin
      if exists (select 1 from pg_policies where schemaname='public' and tablename='profiles' and policyname='profiles_select_self') then
        drop policy profiles_select_self on public.profiles;
      end if;
      create policy profiles_select_self on public.profiles
        for select using (auth.uid() = user_id or auth.role() = 'service_role');
    end $$;

    do $$ begin
      if exists (select 1 from pg_policies where schemaname='public' and tablename='profiles' and policyname='profiles_insert_self') then
        drop policy profiles_insert_self on public.profiles;
      end if;
      create policy profiles_insert_self on public.profiles
        for insert with check (auth.uid() = user_id or auth.role() = 'service_role');
    end $$;

    do $$ begin
      if exists (select 1 from pg_policies where schemaname='public' and tablename='profiles' and policyname='profiles_update_self') then
        drop policy profiles_update_self on public.profiles;
      end if;
      create policy profiles_update_self on public.profiles
        for update using (auth.uid() = user_id or auth.role() = 'service_role')
        with check (auth.uid() = user_id or auth.role() = 'service_role');
    end $$;

    do $$ begin
      if exists (select 1 from pg_policies where schemaname='public' and tablename='profiles' and policyname='profiles_delete_self') then
        drop policy profiles_delete_self on public.profiles;
      end if;
      create policy profiles_delete_self on public.profiles
        for delete using (auth.uid() = user_id or auth.role() = 'service_role');
    end $$;
  `)

  // Favorites: meals
  await db.execute(sql`
    create table if not exists public.favorites_meals (
      id bigserial primary key,
      user_id uuid not null references auth.users(id) on delete cascade,
      meal_id integer not null references public.meals(id) on delete cascade,
      created_at timestamptz default now(),
      unique (user_id, meal_id)
    );

    alter table public.favorites_meals enable row level security;

    do $$ begin
      if exists (select 1 from pg_policies where schemaname='public' and tablename='favorites_meals' and policyname='favorites_meals_select_self') then
        drop policy favorites_meals_select_self on public.favorites_meals;
      end if;
      create policy favorites_meals_select_self on public.favorites_meals
        for select using (auth.uid() = user_id or auth.role() = 'service_role');
    end $$;

    do $$ begin
      if exists (select 1 from pg_policies where schemaname='public' and tablename='favorites_meals' and policyname='favorites_meals_insert_self') then
        drop policy favorites_meals_insert_self on public.favorites_meals;
      end if;
      create policy favorites_meals_insert_self on public.favorites_meals
        for insert with check (auth.uid() = user_id or auth.role() = 'service_role');
    end $$;

    do $$ begin
      if exists (select 1 from pg_policies where schemaname='public' and tablename='favorites_meals' and policyname='favorites_meals_delete_self') then
        drop policy favorites_meals_delete_self on public.favorites_meals;
      end if;
      create policy favorites_meals_delete_self on public.favorites_meals
        for delete using (auth.uid() = user_id or auth.role() = 'service_role');
    end $$;
  `)

  // Favorites: meal plans
  await db.execute(sql`
    create table if not exists public.favorites_meal_plans (
      id bigserial primary key,
      user_id uuid not null references auth.users(id) on delete cascade,
      meal_plan_id integer not null references public.meal_plans(id) on delete cascade,
      created_at timestamptz default now(),
      unique (user_id, meal_plan_id)
    );

    alter table public.favorites_meal_plans enable row level security;

    do $$ begin
      if exists (select 1 from pg_policies where schemaname='public' and tablename='favorites_meal_plans' and policyname='favorites_meal_plans_select_self') then
        drop policy favorites_meal_plans_select_self on public.favorites_meal_plans;
      end if;
      create policy favorites_meal_plans_select_self on public.favorites_meal_plans
        for select using (auth.uid() = user_id or auth.role() = 'service_role');
    end $$;

    do $$ begin
      if exists (select 1 from pg_policies where schemaname='public' and tablename='favorites_meal_plans' and policyname='favorites_meal_plans_insert_self') then
        drop policy favorites_meal_plans_insert_self on public.favorites_meal_plans;
      end if;
      create policy favorites_meal_plans_insert_self on public.favorites_meal_plans
        for insert with check (auth.uid() = user_id or auth.role() = 'service_role');
    end $$;

    do $$ begin
      if exists (select 1 from pg_policies where schemaname='public' and tablename='favorites_meal_plans' and policyname='favorites_meal_plans_delete_self') then
        drop policy favorites_meal_plans_delete_self on public.favorites_meal_plans;
      end if;
      create policy favorites_meal_plans_delete_self on public.favorites_meal_plans
        for delete using (auth.uid() = user_id or auth.role() = 'service_role');
    end $$;
  `)

  // Addresses: add Supabase auth linkage and default handling
  await db.execute(sql`
    alter table public.addresses
      add column if not exists user_id uuid references auth.users(id) on delete cascade,
      add column if not exists is_default boolean default false;

    create or replace function public.addresses_set_updated_at()
    returns trigger
    language plpgsql
    as $$
    begin
      new.updated_at = now();
      if new.is_default is true and new.user_id is not null then
        update public.addresses
        set is_default = false
        where user_id = new.user_id
          and id <> new.id;
      end if;
      return new;
    end;
    $$;

    do $$
    begin
      if not exists (select 1 from pg_trigger where tgname = 'addresses_set_updated_at') then
        create trigger addresses_set_updated_at
        before update on public.addresses
        for each row
        execute function public.addresses_set_updated_at();
      end if;
    end;
    $$;

    alter table public.addresses enable row level security;

    do $$ begin
      if exists (select 1 from pg_policies where schemaname='public' and tablename='addresses' and policyname='addresses_select_self') then
        drop policy addresses_select_self on public.addresses;
      end if;
      create policy addresses_select_self on public.addresses
        for select using (auth.uid() = user_id or auth.role() = 'service_role');
    end $$;

    do $$ begin
      if exists (select 1 from pg_policies where schemaname='public' and tablename='addresses' and policyname='addresses_insert_self') then
        drop policy addresses_insert_self on public.addresses;
      end if;
      create policy addresses_insert_self on public.addresses
        for insert with check (auth.uid() = user_id or auth.role() = 'service_role');
    end $$;

    do $$ begin
      if exists (select 1 from pg_policies where schemaname='public' and tablename='addresses' and policyname='addresses_update_self') then
        drop policy addresses_update_self on public.addresses;
      end if;
      create policy addresses_update_self on public.addresses
        for update using (auth.uid() = user_id or auth.role() = 'service_role')
        with check (auth.uid() = user_id or auth.role() = 'service_role');
    end $$;

    do $$ begin
      if exists (select 1 from pg_policies where schemaname='public' and tablename='addresses' and policyname='addresses_delete_self') then
        drop policy addresses_delete_self on public.addresses;
      end if;
      create policy addresses_delete_self on public.addresses
        for delete using (auth.uid() = user_id or auth.role() = 'service_role');
    end $$;
  `)

  // Orders: user linkage + RLS/policies
  await db.execute(sql`
    alter table public.orders
      add column if not exists user_id uuid references auth.users(id) on delete set null;

    create index if not exists idx_orders_user_id on public.orders(user_id);

    alter table public.orders enable row level security;

    do $$ begin
      if exists (select 1 from pg_policies where schemaname='public' and tablename='orders' and policyname='orders_select_self') then
        drop policy orders_select_self on public.orders;
      end if;
      create policy orders_select_self on public.orders
        for select using (user_id is null or auth.uid() = user_id or auth.role() = 'service_role');
    end $$;

    do $$ begin
      if exists (select 1 from pg_policies where schemaname='public' and tablename='orders' and policyname='orders_insert_self') then
        drop policy orders_insert_self on public.orders;
      end if;
      create policy orders_insert_self on public.orders
        for insert with check (auth.uid() = user_id or auth.role() = 'service_role');
    end $$;

    do $$ begin
      if exists (select 1 from pg_policies where schemaname='public' and tablename='orders' and policyname='orders_update_self') then
        drop policy orders_update_self on public.orders;
      end if;
      create policy orders_update_self on public.orders
        for update using (auth.uid() = user_id or auth.role() = 'service_role')
        with check (auth.uid() = user_id or auth.role() = 'service_role');
    end $$;

    do $$ begin
      if exists (select 1 from pg_policies where schemaname='public' and tablename='orders' and policyname='orders_delete_self') then
        drop policy orders_delete_self on public.orders;
      end if;
      create policy orders_delete_self on public.orders
        for delete using (auth.uid() = user_id or auth.role() = 'service_role');
    end $$;
  `)

  // Orders items: RLS/policies aligned with parent order ownership
  await db.execute(sql`
    alter table public.orders_items enable row level security;

    do $$ begin
      if exists (select 1 from pg_policies where schemaname='public' and tablename='orders_items' and policyname='orders_items_select_self') then
        drop policy orders_items_select_self on public.orders_items;
      end if;
      create policy orders_items_select_self on public.orders_items
        for select using (
          exists (
            select 1 from public.orders o
            where o.id = _parent_id
              and (o.user_id is null or o.user_id = auth.uid() or auth.role() = 'service_role')
          )
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
              and (o.user_id = auth.uid() or auth.role() = 'service_role')
          )
        );
    end $$;

    do $$ begin
      if exists (select 1 from pg_policies where schemaname='public' and tablename='orders_items' and policyname='orders_items_update_self') then
        drop policy orders_items_update_self on public.orders_items;
      end if;
      create policy orders_items_update_self on public.orders_items
        for update using (
          exists (
            select 1 from public.orders o
            where o.id = _parent_id
              and (o.user_id = auth.uid() or auth.role() = 'service_role')
          )
        )
        with check (
          exists (
            select 1 from public.orders o
            where o.id = _parent_id
              and (o.user_id = auth.uid() or auth.role() = 'service_role')
          )
        );
    end $$;

    do $$ begin
      if exists (select 1 from pg_policies where schemaname='public' and tablename='orders_items' and policyname='orders_items_delete_self') then
        drop policy orders_items_delete_self on public.orders_items;
      end if;
      create policy orders_items_delete_self on public.orders_items
        for delete using (
          exists (
            select 1 from public.orders o
            where o.id = _parent_id
              and (o.user_id = auth.uid() or auth.role() = 'service_role')
          )
        );
    end $$;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  // Orders items policies/RLS
  await db.execute(sql`
    do $$ begin
      if exists (select 1 from pg_policies where schemaname='public' and tablename='orders_items' and policyname='orders_items_select_self') then
        drop policy orders_items_select_self on public.orders_items;
      end if;
      if exists (select 1 from pg_policies where schemaname='public' and tablename='orders_items' and policyname='orders_items_insert_self') then
        drop policy orders_items_insert_self on public.orders_items;
      end if;
      if exists (select 1 from pg_policies where schemaname='public' and tablename='orders_items' and policyname='orders_items_update_self') then
        drop policy orders_items_update_self on public.orders_items;
      end if;
      if exists (select 1 from pg_policies where schemaname='public' and tablename='orders_items' and policyname='orders_items_delete_self') then
        drop policy orders_items_delete_self on public.orders_items;
      end if;
    end $$;
    alter table public.orders_items disable row level security;
  `)

  // Orders policies/RLS and user_id/index
  await db.execute(sql`
    do $$ begin
      if exists (select 1 from pg_policies where schemaname='public' and tablename='orders' and policyname='orders_select_self') then
        drop policy orders_select_self on public.orders;
      end if;
      if exists (select 1 from pg_policies where schemaname='public' and tablename='orders' and policyname='orders_insert_self') then
        drop policy orders_insert_self on public.orders;
      end if;
      if exists (select 1 from pg_policies where schemaname='public' and tablename='orders' and policyname='orders_update_self') then
        drop policy orders_update_self on public.orders;
      end if;
      if exists (select 1 from pg_policies where schemaname='public' and tablename='orders' and policyname='orders_delete_self') then
        drop policy orders_delete_self on public.orders;
      end if;
    end $$;
    alter table public.orders disable row level security;
    drop index if exists idx_orders_user_id;
    alter table public.orders drop column if exists user_id;
  `)

  // Addresses policies/RLS/trigger/columns
  await db.execute(sql`
    do $$ begin
      if exists (select 1 from pg_policies where schemaname='public' and tablename='addresses' and policyname='addresses_select_self') then
        drop policy addresses_select_self on public.addresses;
      end if;
      if exists (select 1 from pg_policies where schemaname='public' and tablename='addresses' and policyname='addresses_insert_self') then
        drop policy addresses_insert_self on public.addresses;
      end if;
      if exists (select 1 from pg_policies where schemaname='public' and tablename='addresses' and policyname='addresses_update_self') then
        drop policy addresses_update_self on public.addresses;
      end if;
      if exists (select 1 from pg_policies where schemaname='public' and tablename='addresses' and policyname='addresses_delete_self') then
        drop policy addresses_delete_self on public.addresses;
      end if;
    end $$;
    alter table public.addresses disable row level security;
    drop trigger if exists addresses_set_updated_at on public.addresses;
    drop function if exists public.addresses_set_updated_at();
    alter table public.addresses drop column if exists user_id;
    alter table public.addresses drop column if exists is_default;
  `)

  // Favorites tables
  await db.execute(sql`
    drop table if exists public.favorites_meal_plans cascade;
    drop table if exists public.favorites_meals cascade;
  `)

  // Profiles
  await db.execute(sql`
    drop table if exists public.profiles cascade;
  `)
}
