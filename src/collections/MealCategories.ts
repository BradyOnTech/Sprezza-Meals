import type { CollectionConfig } from 'payload'
import { slugField } from 'payload'

export const MealCategories: CollectionConfig = {
  slug: 'meal-categories',
  access: {
    read: () => true,
  },
  admin: {
    group: 'Meals',
    useAsTitle: 'title',
    defaultColumns: ['title', 'displayOrder', 'isFeatured', 'isActive'],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'icon',
      type: 'text',
      admin: {
        description: 'Optional icon name or emoji to display with the category.',
      },
    },
    {
      name: 'displayOrder',
      type: 'number',
      defaultValue: 0,
      admin: {
        step: 1,
      },
    },
    {
      name: 'isFeatured',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
    },
    slugField(),
  ],
  versions: {
    drafts: true,
  },
}
