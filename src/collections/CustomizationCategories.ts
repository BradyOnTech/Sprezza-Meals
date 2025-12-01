import type { CollectionConfig } from 'payload'
import { slugField } from 'payload'

export const CustomizationCategories: CollectionConfig = {
  slug: 'customization-categories',
  access: {
    read: () => true,
  },
  admin: {
    group: 'Meals',
    useAsTitle: 'name',
    defaultColumns: ['name', 'displayOrder', 'isActive'],
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
    {
      name: 'displayOrder',
      type: 'number',
      defaultValue: 0,
      admin: {
        step: 1,
      },
    },
    {
      name: 'minSelections',
      type: 'number',
      admin: {
        description: 'Optional: set a minimum selections rule for this category.',
      },
    },
    {
      name: 'maxSelections',
      type: 'number',
      admin: {
        description: 'Optional: set a maximum selections rule for this category.',
      },
    },
    {
      name: 'isRequired',
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
  versions: false,
}
