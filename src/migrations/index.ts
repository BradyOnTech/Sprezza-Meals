import * as migration_20251130_053145 from './20251130_053145';
import * as migration_20251204_enhance_orders_for_meal_prep from './20251204_enhance_orders_for_meal_prep';
import * as migration_20251205_supabase_alignment from './20251205_supabase_alignment';
import * as migration_20251206_orders_guest_access from './20251206_orders_guest_access';
import * as migration_20251206_orders_address_snapshots from './20251206_orders_address_snapshots';
import * as migration_20251206_orders_pending_approval from './20251206_orders_pending_approval';
import * as migration_20251207_orders_payment_method from './20251207_orders_payment_method';

export const migrations = [
  {
    up: migration_20251130_053145.up,
    down: migration_20251130_053145.down,
    name: '20251130_053145'
  },
  {
    up: migration_20251204_enhance_orders_for_meal_prep.up,
    down: migration_20251204_enhance_orders_for_meal_prep.down,
    name: '20251204_enhance_orders_for_meal_prep'
  },
  {
    up: migration_20251205_supabase_alignment.up,
    down: migration_20251205_supabase_alignment.down,
    name: '20251205_supabase_alignment'
  },
  {
    up: migration_20251206_orders_guest_access.up,
    down: migration_20251206_orders_guest_access.down,
    name: '20251206_orders_guest_access'
  },
  {
    up: migration_20251206_orders_address_snapshots.up,
    down: migration_20251206_orders_address_snapshots.down,
    name: '20251206_orders_address_snapshots'
  },
  {
    up: migration_20251206_orders_pending_approval.up,
    down: migration_20251206_orders_pending_approval.down,
    name: '20251206_orders_pending_approval'
  },
  {
    up: migration_20251207_orders_payment_method.up,
    down: migration_20251207_orders_payment_method.down,
    name: '20251207_orders_payment_method'
  },
];
