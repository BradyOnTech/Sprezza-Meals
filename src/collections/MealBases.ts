import type { CollectionConfig } from 'payload'
import { slugField } from 'payload'

export const MealBases: CollectionConfig = {
  slug: 'meal-bases',
  access: {
    read: () => true,
  },
  admin: {
    group: 'Meals',
    useAsTitle: 'name',
    defaultColumns: ['name', 'basePrice', 'isActive'],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    slugField(),
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'basePrice',
      type: 'number',
      required: true,
      admin: {
        step: 0.01,
      },
    },
    {
      name: 'weight',
      label: 'Weight',
      type: 'number',
      admin: {
        step: 1,
      },
    },
    {
      name: 'weightUnit',
      type: 'select',
      defaultValue: 'g',
      options: [
        { label: 'Grams', value: 'g' },
        { label: 'Ounces', value: 'oz' },
        { label: 'Pounds', value: 'lb' },
      ],
    },
    {
      name: 'foodType',
      type: 'text',
      admin: {
        description: 'Used for nutrition lookup, e.g. jasmine rice, cauliflower rice.',
      },
    },
    {
      name: 'useAutoNutrition',
      type: 'checkbox',
      label: 'Auto-calculate nutrition',
      defaultValue: false,
    },
    {
      name: 'nutrition',
      type: 'group',
      fields: [
        { name: 'calories', type: 'number', admin: { step: 1 } },
        { name: 'protein', type: 'number', admin: { step: 0.1 } },
        { name: 'carbs', type: 'number', admin: { step: 0.1 } },
        { name: 'fat', type: 'number', admin: { step: 0.1 } },
        { name: 'fiber', type: 'number', admin: { step: 0.1 } },
        { name: 'sugar', type: 'number', admin: { step: 0.1 } },
      ],
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
    },
  ],
  versions: {
    drafts: true,
  },
}
