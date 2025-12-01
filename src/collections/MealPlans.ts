import {
  FixedToolbarFeature,
  HeadingFeature,
  HorizontalRuleFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
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

export const MealPlans: CollectionConfig = {
  slug: 'meal-plans',
  access: {
    read: () => true,
  },
  admin: {
    group: 'Meals',
    useAsTitle: 'title',
    defaultColumns: ['title', 'schedule.startDate', 'schedule.endDate', 'isActive'],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    slugField(),
    {
      name: 'tagline',
      type: 'text',
    },
    {
      name: 'description',
      type: 'richText',
      editor: descriptionEditor,
    },
    {
      name: 'schedule',
      type: 'group',
      fields: [
        {
          name: 'startDate',
          type: 'date',
          required: true,
          admin: {
            date: {
              pickerAppearance: 'dayAndTime',
            },
          },
        },
        {
          name: 'endDate',
          type: 'date',
          required: true,
          admin: {
            date: {
              pickerAppearance: 'dayAndTime',
            },
          },
        },
      ],
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
    {
      name: 'items',
      type: 'array',
      labels: {
        singular: 'Scheduled meal',
        plural: 'Scheduled meals',
      },
      fields: [
        {
          name: 'dayOfWeek',
          type: 'select',
          options: [
            { label: 'Monday', value: 'monday' },
            { label: 'Tuesday', value: 'tuesday' },
            { label: 'Wednesday', value: 'wednesday' },
            { label: 'Thursday', value: 'thursday' },
            { label: 'Friday', value: 'friday' },
            { label: 'Saturday', value: 'saturday' },
            { label: 'Sunday', value: 'sunday' },
          ],
          required: true,
        },
        {
          name: 'mealTime',
          type: 'select',
          options: [
            { label: 'Breakfast', value: 'breakfast' },
            { label: 'Lunch', value: 'lunch' },
            { label: 'Dinner', value: 'dinner' },
            { label: 'Snack', value: 'snack' },
          ],
          required: true,
        },
        {
          name: 'meal',
          type: 'relationship',
          relationTo: 'meals',
          required: true,
        },
        {
          name: 'notes',
          type: 'text',
        },
        {
          name: 'displayOrder',
          type: 'number',
          admin: {
            step: 1,
          },
        },
      ],
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
    },
  ],
  versions: false,
}
