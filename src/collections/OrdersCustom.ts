import type { CollectionConfig } from 'payload'

export const Orders: CollectionConfig = {
  slug: 'orders',
  admin: {
    useAsTitle: 'orderNumber',
    defaultColumns: [
      'id',
      'orderNumber',
      'customerEmail',
      'customer_name',
      'customerPhone',
      'status',
      'payment_status',
      'amount',
      'subtotal',
      'tax',
      'delivery_fee',
      'tip',
      'deliveryDate',
      'deliveryTimeSlot',
      'deliveryInstructions',
      'paymentIntentId',
      'stripe_customer_id',
      'payment_method_id',
      'createdAt',
      'updatedAt',
    ],
  },
  access: {
    read: () => true, // For now, allow read access
    create: () => true, // For now, allow create access
    update: () => true, // For now, allow update access
    delete: () => true, // For now, allow delete access
  },
  fields: [
    // Basic order information
    {
      name: 'orderNumber',
      label: 'Order Number',
      type: 'text',
      unique: true,
      required: true,
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
      name: 'customer_email',
      label: 'Customer Email',
      type: 'text',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'customer_name',
      label: 'Customer Name',
      type: 'text',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'customerPhone',
      label: 'Customer Phone',
      type: 'text',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'status',
      label: 'Order Status',
      type: 'select',
      defaultValue: 'pending',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Confirmed', value: 'confirmed' },
        { label: 'Preparing', value: 'preparing' },
        { label: 'Ready for Delivery', value: 'ready_for_delivery' },
        { label: 'Out for Delivery', value: 'out_for_delivery' },
        { label: 'Delivered', value: 'delivered' },
        { label: 'Cancelled', value: 'cancelled' },
        { label: 'Refunded', value: 'refunded' },
      ],
    },
    {
      name: 'payment_status',
      label: 'Payment Status',
      type: 'select',
      defaultValue: 'pending',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Paid', value: 'paid' },
        { label: 'Failed', value: 'failed' },
        { label: 'Refunded', value: 'refunded' },
        { label: 'Partially Refunded', value: 'partially_refunded' },
      ],
    },
    {
      name: 'subtotal',
      label: 'Subtotal',
      type: 'number',
      defaultValue: 0,
      admin: {
        step: 0.01,
      },
    },
    {
      name: 'tax',
      label: 'Tax',
      type: 'number',
      defaultValue: 0,
      admin: {
        step: 0.01,
      },
    },
    {
      name: 'delivery_fee',
      label: 'Delivery Fee',
      type: 'number',
      defaultValue: 0,
      admin: {
        step: 0.01,
      },
    },
    {
      name: 'tip',
      label: 'Tip',
      type: 'number',
      defaultValue: 0,
      admin: {
        step: 0.01,
      },
    },
    {
      name: 'amount',
      label: 'Total Amount',
      type: 'number',
      defaultValue: 0,
      admin: {
        step: 0.01,
      },
    },
    // Meal prep specific fields
    {
      name: 'deliveryDate',
      label: 'Delivery Date',
      type: 'date',
      admin: {
        date: {
          displayFormat: 'yyyy-MM-dd HH:mm',
        },
      },
    },
    {
      name: 'deliveryTimeSlot',
      label: 'Delivery Time Slot',
      type: 'text',
    },
    {
      name: 'deliveryInstructions',
      label: 'Delivery Instructions',
      type: 'textarea',
    },
    // Payment fields
    {
      name: 'paymentIntentId',
      label: 'Payment Intent ID',
      type: 'text',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'stripe_customer_id',
      label: 'Stripe Customer ID',
      type: 'text',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'payment_method_id',
      label: 'Payment Method ID',
      type: 'text',
      admin: {
        readOnly: true,
      },
    },
    // Timestamps
    {
      name: 'createdAt',
      label: 'Created At',
      type: 'date',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'updatedAt',
      label: 'Updated At',
      type: 'date',
      admin: {
        readOnly: true,
      },
    },
  ],
}
