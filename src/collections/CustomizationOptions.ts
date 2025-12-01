import type { CollectionConfig } from 'payload'
import { slugField } from 'payload'

export const CustomizationOptions: CollectionConfig = {
  slug: 'customization-options',
  access: {
    read: () => true,
  },
  admin: {
    group: 'Meals',
    useAsTitle: 'name',
    defaultColumns: ['name', 'category', 'priceAdjustment', 'isDefault', 'isActive'],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    slugField(),
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'customization-categories',
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'priceAdjustment',
      type: 'number',
      required: true,
      defaultValue: 0,
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
        description: 'Used for nutrition lookup, e.g. chicken breast, rice, black beans.',
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
      name: 'isDefault',
      type: 'checkbox',
      defaultValue: false,
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
  versions: false,
}
