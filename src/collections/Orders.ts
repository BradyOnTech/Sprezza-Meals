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
      name: 'customer',
      label: 'Customer',
      type: 'relationship',
      relationTo: 'users',
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
    {
      name: 'shipping_address',
      label: 'Shipping Address',
      type: 'json',
      admin: {
        readOnly: true,
        description: 'Read-only snapshot stored on the order',
      },
    },
    {
      name: 'billing_address',
      label: 'Billing Address',
      type: 'json',
      admin: {
        readOnly: true,
        description: 'Read-only snapshot stored on the order',
      },
    },
  ]

  const existingFieldNames = new Set(
    (fieldsWithEnhancedStatus || defaultCollection.fields || [])
      .filter((field) => 'name' in field)
      .map((field) => (field as { name: string }).name),
  )

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
    // Only append missing fields to avoid DuplicateFieldName errors when the base
    // collection already defines them.
    fields: [
      ...(fieldsWithEnhancedStatus || defaultCollection.fields || []),
      ...additionalFields.filter((field) => 'name' in field && !existingFieldNames.has(field.name)),
    ],
  }
}
