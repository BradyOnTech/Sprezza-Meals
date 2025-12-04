import type { CollectionConfig } from 'payload'

type OverrideArgs = {
  defaultCollection: CollectionConfig
}

export const ordersCollectionOverride = ({ defaultCollection }: OverrideArgs): CollectionConfig => {
  const fieldsWithEnhancedStatus = defaultCollection.fields?.map((field) => {
    if ('name' in field && field.name === 'status' && field.type === 'select') {
      return {
        ...field,
        defaultValue: 'pending',
        options: [
          { label: 'Pending', value: 'pending' },
          { label: 'Confirmed', value: 'confirmed' },
          { label: 'Preparing', value: 'preparing' },
          { label: 'Ready for delivery', value: 'ready_for_delivery' },
          { label: 'Out for delivery', value: 'out_for_delivery' },
          { label: 'Delivered', value: 'delivered' },
          ...(Array.isArray(field.options) ? field.options : []),
        ],
      }
    }
    return field
  })

  const additionalFields: CollectionConfig['fields'] = [
    {
      name: 'orderNumber',
      label: 'Order Number',
      type: 'text',
      unique: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'customerPhone',

      type: 'text',
    },
    {
      name: 'deliveryInstructions',

      type: 'textarea',
    },
    {
      name: 'deliveryDate',

      type: 'date',
      admin: {
        date: {
          displayFormat: 'yyyy-MM-dd HH:mm',
        },
      },
    },
    {
      name: 'deliveryTimeSlot',

      type: 'text',
    },
    {
      name: 'paymentIntentId',

      type: 'text',
    },
    {
      name: 'deliveredAt',

      type: 'date',
      admin: {
        date: {
          displayFormat: 'yyyy-MM-dd HH:mm',
        },
      },
    },
    {
      name: 'paymentStatus',

      type: 'select',
      defaultValue: 'pending',
      options: ['pending', 'paid', 'failed', 'refunded', 'partially_refunded'],
    },
    {
      name: 'subtotal',

      type: 'number',
      defaultValue: 0,
      admin: {
        step: 0.01,
      },
    },
    {
      name: 'tax',

      type: 'number',
      defaultValue: 0,
      admin: {
        step: 0.01,
      },
    },
    {
      name: 'deliveryFee',

      type: 'number',
      defaultValue: 0,
      admin: {
        step: 0.01,
      },
    },
    {
      name: 'tip',

      type: 'number',
      defaultValue: 0,
      admin: {
        step: 0.01,
      },
    },
  ]

  return {
    ...defaultCollection,
    admin: {
      ...defaultCollection.admin,
      defaultColumns: [
        'id',
        'orderNumber',
        'customerEmail',
        'status',
        'paymentStatus',
        'amount',
        'createdAt',
      ],
    },
    fields: [...(fieldsWithEnhancedStatus || defaultCollection.fields || []), ...additionalFields],
  }
}
