// storage-adapter-import-placeholder
import { postgresAdapter } from '@payloadcms/db-postgres'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'

import {
  BoldFeature,
  EXPERIMENTAL_TableFeature,
  IndentFeature,
  ItalicFeature,
  LinkFeature,
  OrderedListFeature,
  UnderlineFeature,
  UnorderedListFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'

import { Categories } from '@/collections/Categories'
import { CustomizationCategories } from '@/collections/CustomizationCategories'
import { CustomizationOptions } from '@/collections/CustomizationOptions'
import { DietaryTags } from '@/collections/DietaryTags'
import { MealBases } from '@/collections/MealBases'
import { MealCategories } from '@/collections/MealCategories'
import { MealPlans } from '@/collections/MealPlans'
import { Meals } from '@/collections/Meals'
import { Media } from '@/collections/Media'
import { Pages } from '@/collections/Pages'
import { Testimonials } from '@/collections/Testimonials'
import { Users } from '@/collections/Users'
import { Footer } from '@/globals/Footer'
import { Header } from '@/globals/Header'
import { SiteSettings } from '@/globals/SiteSettings'
import { plugins } from './plugins'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    components: {
      // The `BeforeLogin` component renders a message that you see while logging into your admin panel.
      // Feel free to delete this at any time. Simply remove the line below and the import `BeforeLogin` statement on line 15.
      beforeLogin: ['@/components/BeforeLogin#BeforeLogin'],
      // The `BeforeDashboard` component renders the 'welcome' block that you see after logging into your admin panel.
      // Feel free to delete this at any time. Simply remove the line below and the import `BeforeDashboard` statement on line 15.
      beforeDashboard: ['@/components/BeforeDashboard#BeforeDashboard'],
    },
    user: Users.slug,
  },
  collections: [
    Users,
    Pages,
    MealCategories,
    DietaryTags,
    MealBases,
    CustomizationCategories,
    CustomizationOptions,
    Meals,
    MealPlans,
    Testimonials,
    Categories,
    Media,
  ],
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || '',
      // Supabase requires SSL; disable cert validation for pooled connection
      ssl: { rejectUnauthorized: false },
      // Keep pool small and avoid idle timeouts to reduce dropped connections
      max: 5,
      idleTimeoutMillis: 0,
      connectionTimeoutMillis: 10000,
    },
    // Prevent dev-time schema "push" so we rely on migrations.
    push: false,
    migrationDir: path.resolve(dirname, 'migrations'),
  }),
  editor: lexicalEditor({
    features: () => {
      return [
        UnderlineFeature(),
        BoldFeature(),
        ItalicFeature(),
        OrderedListFeature(),
        UnorderedListFeature(),
        LinkFeature({
          enabledCollections: ['pages'],
          fields: ({ defaultFields }) => {
            const defaultFieldsWithoutUrl = defaultFields.filter((field) => {
              if ('name' in field && field.name === 'url') return false
              return true
            })

            return [
              ...defaultFieldsWithoutUrl,
              {
                name: 'url',
                type: 'text',
                admin: {
                  condition: ({ linkType }) => linkType !== 'internal',
                },
                label: ({ t }) => t('fields:enterURL'),
                required: true,
              },
            ]
          },
        }),
        IndentFeature(),
        EXPERIMENTAL_TableFeature(),
      ]
    },
  }),
  //email: nodemailerAdapter(),
  endpoints: [],
  globals: [Header, Footer, SiteSettings],
  plugins: [
    ...plugins,
    // storage-adapter-placeholder
    vercelBlobStorage({
      collections: {
        media: true,
      },
      token: process.env.SPREZZA_READ_WRITE_TOKEN,
    }),
  ],
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  // Sharp is now an optional dependency -
  // if you want to resize images, crop, set focal point, etc.
  // make sure to install it and pass it to the config.
  // sharp,
})
