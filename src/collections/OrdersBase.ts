import type { CollectionConfig } from 'payload'

export const Orders: CollectionConfig = {
  slug: 'orders',
  admin: {
    useAsTitle: 'orderNumber',
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
  access: {
    read: () => true, // For now, allow read access
    create: () => true, // For now, allow create access
    update: () => true, // For now, allow update access
    delete: () => true, // For now, allow delete access
  },
  fields: [
    // Basic order fields will be added by migrations
    // This is a minimal collection for Payload admin integration
  ],
}
