import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

const REL_TABLES = ['payload_locked_documents_rels', 'payload_locked_documents__rels']

export async function up({ db }: MigrateUpArgs): Promise<void> {
  // Align Payload lock relationships with the order items collection
  await db.execute(sql`
    DO $$
    DECLARE
      rel_table text;
      idx_name text;
      fk_name text;
    BEGIN
      FOR rel_table IN SELECT unnest(ARRAY['payload_locked_documents_rels', 'payload_locked_documents__rels']) LOOP
        -- Only operate on tables that exist in the current schema
        IF to_regclass('public.' || rel_table) IS NOT NULL THEN
          -- Add the missing relationship column for order items
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public'
              AND table_name = rel_table
              AND column_name = 'orders_items_id'
          ) THEN
            EXECUTE format('ALTER TABLE public.%I ADD COLUMN orders_items_id varchar', rel_table);
          END IF;

          idx_name := rel_table || '_orders_items_id_idx';
          fk_name := rel_table || '_orders_items_fk';

          -- Create index to match Payload's relationship lookup pattern
          EXECUTE format('CREATE INDEX IF NOT EXISTS %I ON public.%I ("orders_items_id")', idx_name, rel_table);

          -- Add foreign key back to orders_items for referential integrity
          IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = fk_name) THEN
            EXECUTE format(
              'ALTER TABLE public.%I ADD CONSTRAINT %I FOREIGN KEY ("orders_items_id") REFERENCES public.orders_items("id") ON DELETE CASCADE ON UPDATE NO ACTION',
              rel_table,
              fk_name
            );
          END IF;
        END IF;
      END LOOP;
    END $$;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  // Remove the relationship column, index, and constraint if rolling back
  await db.execute(sql`
    DO $$
    DECLARE
      rel_table text;
      idx_name text;
      fk_name text;
    BEGIN
      FOR rel_table IN SELECT unnest(ARRAY['payload_locked_documents_rels', 'payload_locked_documents__rels']) LOOP
        IF to_regclass('public.' || rel_table) IS NOT NULL THEN
          idx_name := rel_table || '_orders_items_id_idx';
          fk_name := rel_table || '_orders_items_fk';

          EXECUTE format('DROP INDEX IF EXISTS %I', idx_name);

          IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = fk_name) THEN
            EXECUTE format('ALTER TABLE public.%I DROP CONSTRAINT %I', rel_table, fk_name);
          END IF;

          IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public'
              AND table_name = rel_table
              AND column_name = 'orders_items_id'
          ) THEN
            EXECUTE format('ALTER TABLE public.%I DROP COLUMN orders_items_id', rel_table);
          END IF;
        END IF;
      END LOOP;
    END $$;
  `)
}
