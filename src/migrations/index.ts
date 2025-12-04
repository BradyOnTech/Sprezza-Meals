import * as migration_20251130_053145 from './20251130_053145';
import * as migration_20251204_enhance_orders_for_meal_prep from './20251204_enhance_orders_for_meal_prep';
import * as migration_20251205_supabase_alignment from './20251205_supabase_alignment';

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
];
