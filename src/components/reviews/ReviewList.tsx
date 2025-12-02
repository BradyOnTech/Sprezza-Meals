'use client'

import React from 'react'
import Image from 'next/image'
import { StarIcon } from '@/components/icons/StarIcon'
import { Button } from '@/components/ui/button'
import type { Review } from '@/payload-types'

interface ReviewListProps {
  reviews: Review[]
  onHelpfulClick?: (reviewId: number) => void
}

export const ReviewList: React.FC<ReviewListProps> = ({ reviews, onHelpfulClick }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <StarIcon
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    )
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No reviews yet. Be the first to review this meal!
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {reviews.map((review) => (
        <div key={review.id} className="border-b pb-6 last:border-b-0">
          {/* Review Header */}
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                {renderStars(review.rating)}
                {review.isVerifiedPurchase && (
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                    Verified Purchase
                  </span>
                )}
              </div>
              <div className="font-medium text-gray-900">
                {typeof review.user === 'object' && review.user
                  ? review.user.name
                  : review.guestName || 'Anonymous'}
              </div>
              <div className="text-sm text-gray-500">{formatDate(review.createdAt)}</div>
            </div>
          </div>

          {/* Review Title */}
          {review.title && <h4 className="font-semibold text-gray-900 mb-2">{review.title}</h4>}

          {/* Review Comment */}
          <p className="text-gray-700 mb-4 whitespace-pre-wrap">{review.comment}</p>

          {/* Review Images */}
          {review.images && review.images.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mb-4">
              {review.images.map((image, index) => (
                <div key={index} className="relative">
                  {typeof image.image === 'object' ? (
                    <Image
                      src={image.image.url || ''}
                      alt={image.image.alt || image.caption || `Review image ${index + 1}`}
                      width={150}
                      height={150}
                      className="w-full h-32 object-cover rounded"
                    />
                  ) : (
                    <div className="w-full h-32 bg-gray-200 rounded flex items-center justify-center">
                      <span className="text-gray-500 text-sm">Image</span>
                    </div>
                  )}
                  {image.caption && (
                    <div className="text-xs text-gray-600 mt-1 text-center">{image.caption}</div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Helpful Button */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onHelpfulClick?.(review.id)}
              className="text-gray-600 hover:text-gray-900"
            >
              Helpful ({review.helpfulCount})
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}
