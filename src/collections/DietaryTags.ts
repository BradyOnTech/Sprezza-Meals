import type { CollectionConfig } from 'payload'
import { slugField } from 'payload'

export const DietaryTags: CollectionConfig = {
  slug: 'dietary-tags',
  access: {
    read: () => true,
  },
  admin: {
    group: 'Meals',
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug'],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
    },
    slugField(),
  ],
  versions: {
    drafts: true,
  },
}
