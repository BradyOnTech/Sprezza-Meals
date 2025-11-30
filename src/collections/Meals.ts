import {
  FixedToolbarFeature,
  HeadingFeature,
  HorizontalRuleFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import type { Where } from 'payload'
import { slugField } from 'payload'
import type { CollectionConfig } from 'payload'

const descriptionEditor = lexicalEditor({
  features: ({ rootFeatures }) => {
    return [
      ...rootFeatures,
      HeadingFeature({ enabledHeadingSizes: ['h2', 'h3', 'h4'] }),
      FixedToolbarFeature(),
      InlineToolbarFeature(),
      HorizontalRuleFeature(),
    ]
  },
})

export const Meals: CollectionConfig = {
  slug: 'meals',
  access: {
    read: () => true,
  },
  admin: {
    group: 'Meals',
    useAsTitle: 'title',
    defaultColumns: ['title', 'price', 'flags.isFeatured', 'flags.isActive'],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    slugField(),
    {
      name: 'summary',
      type: 'textarea',
    },
    {
      name: 'description',
      type: 'richText',
      editor: descriptionEditor,
    },
    {
      name: 'ingredients',
      type: 'array',
      labels: {
        singular: 'Ingredient',
        plural: 'Ingredients',
      },
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'categories',
      type: 'relationship',
      relationTo: 'meal-categories',
      hasMany: true,
      required: true,
    },
    {
      name: 'dietaryTags',
      type: 'relationship',
      relationTo: 'dietary-tags',
      hasMany: true,
    },
    {
      name: 'mealBase',
      type: 'relationship',
      relationTo: 'meal-bases',
      admin: {
        description: 'Optional base to pair with customizations.',
      },
    },
    {
      name: 'customizationCategories',
      type: 'relationship',
      relationTo: 'customization-categories',
      hasMany: true,
      admin: {
        description: 'Limit builder options for this meal (otherwise use all active categories).',
      },
    },
    {
      name: 'price',
      type: 'number',
      required: true,
      admin: {
        step: 0.01,
      },
    },
    {
      name: 'prepTimeMinutes',
      type: 'number',
      admin: {
        step: 5,
      },
    },
    {
      name: 'servings',
      type: 'number',
      admin: {
        step: 1,
      },
    },
    {
      name: 'availability',
      type: 'group',
      fields: [
        {
          name: 'startDate',
          type: 'date',
        },
        {
          name: 'endDate',
          type: 'date',
        },
      ],
    },
    {
      name: 'flags',
      type: 'group',
      fields: [
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
      ],
    },
    {
      name: 'nutrition',
      type: 'group',
      fields: [
        {
          name: 'useAutoNutrition',
          type: 'checkbox',
          label: 'Auto-calculate nutrition',
          defaultValue: false,
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
        { name: 'calories', type: 'number', admin: { step: 1 } },
        { name: 'protein', type: 'number', admin: { step: 0.1 } },
        { name: 'carbs', type: 'number', admin: { step: 0.1 } },
        { name: 'fat', type: 'number', admin: { step: 0.1 } },
        { name: 'fiber', type: 'number', admin: { step: 0.1 } },
        { name: 'sugar', type: 'number', admin: { step: 0.1 } },
      ],
    },
    {
      name: 'media',
      type: 'group',
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
        {
          name: 'gallery',
          type: 'array',
          labels: {
            singular: 'Image',
            plural: 'Gallery',
          },
          fields: [
            {
              name: 'image',
              type: 'upload',
              relationTo: 'media',
              required: true,
            },
          ],
        },
      ],
    },
    {
      name: 'relatedMeals',
      type: 'relationship',
      relationTo: 'meals',
      hasMany: true,
      filterOptions: ({ id }) => {
        if (id) {
          return {
            id: {
              not_in: [id],
            },
          }
        }

        const query: Where = {
          id: {
            exists: true,
          },
        }

        return query
      },
    },
  ],
  versions: {
    drafts: {
      autosave: true,
    },
  },
}
