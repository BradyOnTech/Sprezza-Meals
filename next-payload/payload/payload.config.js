import path from 'path';
import { fileURLToPath } from 'url';
import { buildConfig } from 'payload';
import { postgresAdapter } from '@payloadcms/db-postgres';

import Users from './collections/Users.js';
import Media from './collections/Media.js';
import MealCategories from './collections/MealCategories.js';
import Meals from './collections/Meals.js';
import CustomizationCategories from './collections/CustomizationCategories.js';
import CustomizationOptions from './collections/CustomizationOptions.js';
import MealBases from './collections/MealBases.js';
import MealPlans from './collections/MealPlans.js';
import Testimonials from './collections/Testimonials.js';
import Settings from './globals/Settings.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const connectionString = process.env.DATABASE_URI || process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URI or DATABASE_URL is required to start Payload (Postgres)');
}

export default buildConfig({
  serverURL: process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:4000',
  secret: process.env.PAYLOAD_SECRET || 'change-me',
  admin: {
    user: 'users'
  },
  collections: [
    Users,
    Media,
    MealCategories,
    Meals,
    CustomizationCategories,
    CustomizationOptions,
    MealBases,
    MealPlans,
    Testimonials
  ],
  globals: [Settings],
  db: postgresAdapter({
    pool: {
      connectionString
    },
    disableCreateDatabase: true
  }),
  typescript: {
    outputFile: path.resolve(__dirname, 'payload-types.ts')
  }
});
