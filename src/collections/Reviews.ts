import type { CollectionConfig } from 'payload'

import { adminOrSelf } from '@/access/adminOrSelf'
import { publicAccess } from '@/access/publicAccess'
import { anyone } from '@/access/anyone'

export const Reviews: CollectionConfig = {
  slug: 'reviews',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'rating', 'meal', 'user', 'guestName', 'createdAt'],
  },
  access: {
    read: publicAccess,
    create: anyone,
    update: adminOrSelf,
    delete: adminOrSelf,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      maxLength: 200,
      admin: {
        description: 'Brief title for the review',
      },
    },
    {
      name: 'rating',
      type: 'number',
      required: true,
      min: 1,
      max: 5,
      admin: {
        description: 'Rating from 1 to 5 stars',
        step: 1,
      },
    },
    {
      name: 'comment',
      type: 'textarea',
      required: true,
      admin: {
        description: 'Detailed review comment',
      },
    },
    {
      name: 'meal',
      type: 'relationship',
      relationTo: 'meals',
      required: true,
      admin: {
        description: 'The meal being reviewed',
      },
    },
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        condition: (data) => !data.guestName,
        description: 'User who wrote the review (for authenticated users)',
      },
    },
    {
      name: 'guestName',
      type: 'text',
      admin: {
        condition: (data) => !data.user,
        description: 'Name for guest reviewers',
      },
    },
    {
      name: 'images',
      type: 'array',
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
        {
          name: 'caption',
          type: 'text',
          admin: {
            description: 'Optional caption for the image',
          },
        },
      ],
      admin: {
        description: 'Images uploaded by the reviewer',
      },
    },
    {
      name: 'isVerifiedPurchase',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Whether the reviewer has purchased this meal',
        readOnly: true,
      },
    },
    {
      name: 'helpfulCount',
      type: 'number',
      defaultValue: 0,
      admin: {
        description: 'Number of users who found this review helpful',
        readOnly: true,
      },
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data, req }) => {
        // Set isVerifiedPurchase based on user's order history
        if (data.user && req.user) {
          try {
            const orders = await req.payload.find({
              collection: 'orders',
              where: {
                and: [
                  {
                    user: {
                      equals: data.user,
                    },
                  },
                  {
                    'items.meal': {
                      equals: data.meal,
                    },
                  },
                ],
              },
              depth: 0,
            })

            const hasPurchased = orders.docs.some((order) =>
              order.items?.some((item: any) => typeof item === 'object' && item.meal === data.meal),
            )

            data.isVerifiedPurchase = hasPurchased
          } catch (error) {
            console.error('Error checking verified purchase:', error)
            data.isVerifiedPurchase = false
          }

          // Auto-generate title if not provided
          if (!data.title) {
            const ratingWords = {
              1: 'Poor',
              2: 'Fair',
              3: 'Good',
              4: 'Very Good',
              5: 'Excellent',
            }
            data.title = `${ratingWords[data.rating as keyof typeof ratingWords] || 'Good'} - ${data.rating} stars`
          }

          return data
        }
      },
    ],
  },
}
