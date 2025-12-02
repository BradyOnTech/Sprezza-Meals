import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const payload = await getPayload({ config })

    // Find the review
    const review = await payload.findByID({
      collection: 'reviews',
      id: parseInt(id),
      depth: 0,
    })

    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 })
    }

    // Increment helpful count
    const updatedReview = await payload.update({
      collection: 'reviews',
      id: parseInt(id),
      data: {
        helpfulCount: (review.helpfulCount || 0) + 1,
      },
    })

    return NextResponse.json(updatedReview)
  } catch (error) {
    console.error('Error updating helpful count:', error)
    return NextResponse.json({ error: 'Failed to update helpful count' }, { status: 500 })
  }
}
