import type { GlobalConfig } from 'payload'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  access: {
    read: () => true,
  },
  admin: {
    group: 'Content',
  },
  fields: [
    {
      name: 'heroTitle',
      type: 'text',
      required: true,
    },
    {
      name: 'heroSubtitle',
      type: 'textarea',
    },
    {
      type: 'row',
      fields: [
        {
          name: 'heroCtaLabel',
          type: 'text',
        },
        {
          name: 'heroCtaHref',
          type: 'text',
        },
      ],
    },
    {
      name: 'heroImage',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'howItWorks',
      type: 'array',
      labels: {
        singular: 'Step',
        plural: 'Steps',
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
            description: 'Optional icon name or emoji.',
          },
        },
      ],
    },
    {
      name: 'faq',
      type: 'array',
      labels: {
        singular: 'Question',
        plural: 'Questions',
      },
      fields: [
        {
          name: 'question',
          type: 'text',
          required: true,
        },
        {
          name: 'answer',
          type: 'textarea',
          required: true,
        },
      ],
    },
    {
      name: 'contactEmail',
      type: 'email',
    },
    {
      name: 'contactPhone',
      type: 'text',
    },
  ],
  versions: false,
}
