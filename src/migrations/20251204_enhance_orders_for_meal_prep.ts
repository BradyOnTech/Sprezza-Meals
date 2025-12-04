import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  // Add meal prep specific fields to orders table
  await db.execute(sql`
    ALTER TABLE orders 
    ADD COLUMN IF NOT EXISTS order_number VARCHAR UNIQUE,
    ADD COLUMN IF NOT EXISTS customer_phone VARCHAR,
    ADD COLUMN IF NOT EXISTS delivery_instructions TEXT,
    ADD COLUMN IF NOT EXISTS delivery_date TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS delivery_time_slot VARCHAR,
    ADD COLUMN IF NOT EXISTS payment_intent_id VARCHAR,
    ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS subtotal NUMERIC DEFAULT 0 NOT NULL,
    ADD COLUMN IF NOT EXISTS tax NUMERIC DEFAULT 0 NOT NULL,
    ADD COLUMN IF NOT EXISTS delivery_fee NUMERIC DEFAULT 0 NOT NULL,
    ADD COLUMN IF NOT EXISTS tip NUMERIC DEFAULT 0 NOT NULL,
    ADD COLUMN IF NOT EXISTS payment_status VARCHAR DEFAULT 'pending';
  `)

  // Update status enum to include meal prep workflow
  await db.execute(sql`
    DO $$ BEGIN
        ALTER TYPE enum_orders_status ADD VALUE IF NOT EXISTS 'pending';
    EXCEPTION
        WHEN duplicate_object THEN null;
    END $$;

    DO $$ BEGIN
        ALTER TYPE enum_orders_status ADD VALUE IF NOT EXISTS 'confirmed';
    EXCEPTION
        WHEN duplicate_object THEN null;
    END $$;

    DO $$ BEGIN
        ALTER TYPE enum_orders_status ADD VALUE IF NOT EXISTS 'preparing';
    EXCEPTION
        WHEN duplicate_object THEN null;
    END $$;

    DO $$ BEGIN
        ALTER TYPE enum_orders_status ADD VALUE IF NOT EXISTS 'ready_for_delivery';
    EXCEPTION
        WHEN duplicate_object THEN null;
    END $$;

    DO $$ BEGIN
        ALTER TYPE enum_orders_status ADD VALUE IF NOT EXISTS 'out_for_delivery';
    EXCEPTION
        WHEN duplicate_object THEN null;
    END $$;

    DO $$ BEGIN
        ALTER TYPE enum_orders_status ADD VALUE IF NOT EXISTS 'delivered';
    EXCEPTION
        WHEN duplicate_object THEN null;
    END $$;

    DO $$ BEGIN
        ALTER TYPE enum_orders_status ADD VALUE IF NOT EXISTS 'cancelled';
    EXCEPTION
        WHEN duplicate_object THEN null;
    END $$;

    DO $$ BEGIN
        ALTER TYPE enum_orders_status ADD VALUE IF NOT EXISTS 'refunded';
    EXCEPTION
        WHEN duplicate_object THEN null;
    END $$;
  `)

  // Create payment status enum
  await db.execute(sql`
    DO $$ BEGIN
        CREATE TYPE enum_orders_payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded', 'partially_refunded');
    EXCEPTION
        WHEN duplicate_object THEN null;
    END $$;
    
    -- Ensure existing rows have a value before casting to the enum
    UPDATE orders SET payment_status = COALESCE(payment_status, 'pending');

    ALTER TABLE orders ALTER COLUMN payment_status DROP DEFAULT;

    ALTER TABLE orders 
    ALTER COLUMN payment_status TYPE enum_orders_payment_status 
    USING payment_status::enum_orders_payment_status;

    ALTER TABLE orders ALTER COLUMN payment_status SET DEFAULT 'pending';
  `)

  // Add meal plan support to order_items
  await db.execute(sql`
    ALTER TABLE orders_items 
    ADD COLUMN IF NOT EXISTS meal_plan_id INTEGER,
    ADD COLUMN IF NOT EXISTS unit_price NUMERIC DEFAULT 0 NOT NULL,
    ADD COLUMN IF NOT EXISTS total_price NUMERIC DEFAULT 0 NOT NULL,
    ADD COLUMN IF NOT EXISTS special_instructions TEXT;
  `)

  // Create trigger to generate order numbers for new orders
  await db.execute(sql`
    CREATE OR REPLACE FUNCTION generate_order_number()
    RETURNS TRIGGER AS $$
    BEGIN
        IF NEW.order_number IS NULL THEN
            NEW.order_number := 'SP-' || to_char(now(), 'YYYY-MM-DD') || '-' || 
                             LPAD((random() * 10000)::integer::text, 4, '0');
        END IF;
        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    DROP TRIGGER IF EXISTS trigger_generate_order_number ON orders;
    CREATE TRIGGER trigger_generate_order_number
        BEFORE INSERT ON orders
        FOR EACH ROW
        EXECUTE FUNCTION generate_order_number();
  `)

  // Create trigger to calculate order totals
  await db.execute(sql`
    CREATE OR REPLACE FUNCTION calculate_order_totals()
    RETURNS TRIGGER AS $$
    BEGIN
        -- Calculate total from pricing breakdown
        NEW.amount := COALESCE(NEW.subtotal, 0) + 
                     COALESCE(NEW.tax, 0) + 
                     COALESCE(NEW.delivery_fee, 0) + 
                     COALESCE(NEW.tip, 0);
        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    DROP TRIGGER IF EXISTS trigger_calculate_order_totals ON orders;
    CREATE TRIGGER trigger_calculate_order_totals
        BEFORE INSERT OR UPDATE ON orders
        FOR EACH ROW
        EXECUTE FUNCTION calculate_order_totals();
  `)

  // Create trigger to calculate order item totals
  await db.execute(sql`
    CREATE OR REPLACE FUNCTION calculate_order_item_totals()
    RETURNS TRIGGER AS $$
    BEGIN
        -- Calculate total price from unit price and quantity
        NEW.total_price := COALESCE(NEW.unit_price, 0) * COALESCE(NEW.quantity, 1);
        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    DROP TRIGGER IF EXISTS trigger_calculate_order_item_totals ON orders_items;
    CREATE TRIGGER trigger_calculate_order_item_totals
        BEFORE INSERT OR UPDATE ON orders_items
        FOR EACH ROW
        EXECUTE FUNCTION calculate_order_item_totals();
  `)

  // Add indexes for performance
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
    CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);
    CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
    CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
    CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
    CREATE INDEX IF NOT EXISTS idx_orders_delivery_date ON orders(delivery_date);
    
    CREATE INDEX IF NOT EXISTS idx_orders_items_order_id ON orders_items(_parent_id);
    CREATE INDEX IF NOT EXISTS idx_orders_items_meal_id ON orders_items(product_id);
    CREATE INDEX IF NOT EXISTS idx_orders_items_meal_plan_id ON orders_items(meal_plan_id);
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  // Drop indexes
  await db.execute(sql`
    DROP INDEX IF EXISTS idx_orders_customer_id;
    DROP INDEX IF EXISTS idx_orders_customer_email;
    DROP INDEX IF EXISTS idx_orders_status;
    DROP INDEX IF EXISTS idx_orders_payment_status;
    DROP INDEX IF EXISTS idx_orders_order_number;
    DROP INDEX IF EXISTS idx_orders_delivery_date;
    DROP INDEX IF EXISTS idx_orders_items_order_id;
    DROP INDEX IF EXISTS idx_orders_items_meal_id;
    DROP INDEX IF EXISTS idx_orders_items_meal_plan_id;
  `)

  // Drop triggers
  await db.execute(sql`
    DROP TRIGGER IF EXISTS trigger_generate_order_number ON orders;
    DROP FUNCTION IF EXISTS generate_order_number();
    
    DROP TRIGGER IF EXISTS trigger_calculate_order_totals ON orders;
    DROP FUNCTION IF EXISTS calculate_order_totals();
    
    DROP TRIGGER IF EXISTS trigger_calculate_order_item_totals ON orders_items;
    DROP FUNCTION IF EXISTS calculate_order_item_totals();
  `)

  // Remove columns from orders_items
  await db.execute(sql`
    ALTER TABLE orders_items 
    DROP COLUMN IF EXISTS meal_plan_id,
    DROP COLUMN IF EXISTS unit_price, 
    DROP COLUMN IF EXISTS total_price,
    DROP COLUMN IF EXISTS special_instructions;
  `)

  // Remove columns from orders
  await db.execute(sql`
    ALTER TABLE orders 
    DROP COLUMN IF EXISTS order_number,
    DROP COLUMN IF EXISTS customer_phone,
    DROP COLUMN IF EXISTS delivery_instructions, 
    DROP COLUMN IF EXISTS delivery_date,
    DROP COLUMN IF EXISTS delivery_time_slot,
    DROP COLUMN IF EXISTS payment_intent_id,
    DROP COLUMN IF EXISTS delivered_at,
    DROP COLUMN IF EXISTS subtotal,
    DROP COLUMN IF EXISTS tax,
    DROP COLUMN IF EXISTS delivery_fee,
    DROP COLUMN IF EXISTS tip,
    DROP COLUMN IF EXISTS payment_status;
  `)

  // Drop payment status enum
  await db.execute(sql`DROP TYPE IF EXISTS enum_orders_payment_status`)
}
