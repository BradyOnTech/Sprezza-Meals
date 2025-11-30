import * as migration_20251130_053145 from './20251130_053145';

export const migrations = [
  {
    up: migration_20251130_053145.up,
    down: migration_20251130_053145.down,
    name: '20251130_053145'
  },
];
