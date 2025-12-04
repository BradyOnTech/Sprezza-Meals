import type { CollectionConfig } from 'payload'
import { adminOrSelf } from '@/access/adminOrSelf'

export const OrderItems: CollectionConfig = {
  slug: 'order-items',
  dbName: 'orders_items',
  access: {
    read: adminOrSelf, // Only admins or order owners can read order items
    create: () => false, // Created through orders collection
    update: () => false, // Updated through orders collection
    delete: () => false, // Deleted through orders collection
  },
  admin: {
    group: 'Orders',
    useAsTitle: 'id',
    defaultColumns: ['product_id', 'meal_plan_id', 'quantity', 'total_price'],
    hidden: true, // Hide from admin menu, only accessible through orders
  },
  fields: [
    {
      name: 'product_id',
      type: 'relationship',
      relationTo: 'meals',
      label: 'Meal',
      admin: {
        condition: (data, siblingData) => !siblingData.meal_plan_id,
      },
    },
    {
      name: 'meal_plan_id',
      type: 'relationship',
      relationTo: 'meal-plans',
      label: 'Meal Plan',
      admin: {
        condition: (data, siblingData) => !siblingData.product_id,
      },
    },
    {
      name: 'quantity',
      type: 'number',
      required: true,
      min: 1,
      defaultValue: 1,
    },
    {
      name: 'unit_price',
      type: 'number',
      required: true,
      min: 0,
      defaultValue: 0,
      admin: {
        step: 0.01,
      },
    },
    {
      name: 'total_price',
      type: 'number',
      required: true,
      min: 0,
      defaultValue: 0,
      admin: {
        readOnly: true,
        step: 0.01,
      },
    },
    {
      name: 'special_instructions',
      type: 'textarea',
      admin: {
        description: 'Special instructions for this item',
      },
    },
    // Legacy fields for compatibility
    {
      name: 'variant_id',
      type: 'relationship',
      relationTo: 'variants',
      admin: {
        condition: () => false, // Hide for now
      },
    },
  ],
  hooks: {
    beforeChange: [
      ({ siblingData }) => {
        // Calculate total price
        if (siblingData.unit_price && siblingData.quantity) {
          siblingData.total_price = siblingData.unit_price * siblingData.quantity
        }
        return siblingData
      },
    ],
  },
}
