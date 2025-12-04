import type { GlobalConfig } from 'payload'

export const DeliverySettings: GlobalConfig = {
  slug: 'delivery-settings',
  access: { read: () => true },
  admin: {
    group: 'Operations',
  },
  fields: [
    {
      label: 'Home Location',
      type: 'group',
      fields: [
        {
          name: 'homeAddress',
          type: 'text',
          required: true,
          admin: { description: 'Postal address for delivery origin (used for display).' },
        },
        {
          type: 'row',
          fields: [
            {
              name: 'homeLat',
              type: 'number',
              required: true,
              admin: { description: 'Latitude of home location (decimal degrees).' },
            },
            {
              name: 'homeLng',
              type: 'number',
              required: true,
              admin: { description: 'Longitude of home location (decimal degrees).' },
            },
          ],
        },
      ],
    },
    {
      name: 'radiusMiles',
      type: 'number',
      required: true,
      admin: { description: 'Max delivery radius in miles.' },
    },
    {
      name: 'notes',
      type: 'textarea',
      admin: { description: 'Optional note shown to admins (not exposed to customers).' },
    },
  ],
  versions: false,
}
