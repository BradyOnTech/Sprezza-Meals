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
      dbName: 'order_number',
      type: 'text',
      unique: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'customerPhone',
      dbName: 'customer_phone',
      type: 'text',
    },
    {
      name: 'deliveryInstructions',
      dbName: 'delivery_instructions',
      type: 'textarea',
    },
    {
      name: 'deliveryDate',
      dbName: 'delivery_date',
      type: 'date',
      admin: {
        date: {
          displayFormat: 'yyyy-MM-dd HH:mm',
        },
      },
    },
    {
      name: 'deliveryTimeSlot',
      dbName: 'delivery_time_slot',
      type: 'text',
    },
    {
      name: 'paymentIntentId',
      dbName: 'payment_intent_id',
      type: 'text',
    },
    {
      name: 'deliveredAt',
      dbName: 'delivered_at',
      type: 'date',
      admin: {
        date: {
          displayFormat: 'yyyy-MM-dd HH:mm',
        },
      },
    },
    {
      name: 'paymentStatus',
      dbName: 'payment_status',
      type: 'select',
      defaultValue: 'pending',
      options: ['pending', 'paid', 'failed', 'refunded', 'partially_refunded'],
    },
    {
      name: 'subtotal',
      dbName: 'subtotal',
      type: 'number',
      defaultValue: 0,
      admin: {
        step: 0.01,
      },
    },
    {
      name: 'tax',
      dbName: 'tax',
      type: 'number',
      defaultValue: 0,
      admin: {
        step: 0.01,
      },
    },
    {
      name: 'deliveryFee',
      dbName: 'delivery_fee',
      type: 'number',
      defaultValue: 0,
      admin: {
        step: 0.01,
      },
    },
    {
      name: 'tip',
      dbName: 'tip',
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
