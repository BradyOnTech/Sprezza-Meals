import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import type { Review } from '@/payload-types'

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({ config })
    const formData = await request.formData()

    // Extract form data
    const title = formData.get('title') as string
    const rating = parseInt(formData.get('rating') as string)
    const comment = formData.get('comment') as string
    const mealId = formData.get('meal') as string
    const userId = formData.get('user') as string
    const guestName = formData.get('guestName') as string

    // Validate required fields
    if (!rating || !comment || !mealId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (!userId && !guestName) {
      return NextResponse.json({ error: 'User or guest name is required' }, { status: 400 })
    }

    // Handle image uploads
    const images = []
    const imageKeys = Array.from(formData.keys()).filter(
      (key) => key.startsWith('images[') && key.endsWith('].image'),
    )

    for (const key of imageKeys) {
      const file = formData.get(key) as File
      if (file && file.size > 0) {
        try {
          const buffer = await file.arrayBuffer()
          const fileData = {
            name: file.name,
            data: Buffer.from(buffer),
            mimetype: file.type,
            size: file.size,
          }
          const uploadResult = await payload.create({
            collection: 'media',
            data: { alt: file.name },
            file: fileData,
            draft: false,
          })

          const indexMatch = key.match(/images\[(\d+)\]/)
          const index = indexMatch ? indexMatch[1] : '0'
          const captionKey = `images[${index}].caption`
          const caption = formData.get(captionKey) as string

          images.push({
            image: uploadResult.id,
            caption: caption || undefined,
          })
        } catch (uploadError) {
          console.error('Error uploading image:', uploadError)
          // Continue with other images if one fails
        }
      }
    }

    // Create the review
    const reviewData: any = {
      title,
      rating,
      comment,
      meal: mealId,
      images,
    }

    if (userId) {
      reviewData.user = userId
    } else {
      reviewData.guestName = guestName
    }

    const review = await payload.create({
      collection: 'reviews',
      data: reviewData,
    })

    return NextResponse.json(review, { status: 201 })
  } catch (error) {
    console.error('Error creating review:', error)
    return NextResponse.json({ error: 'Failed to create review' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const payload = await getPayload({ config })
    const { searchParams } = new URL(request.url)

    const mealId = searchParams.get('meal')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    if (!mealId) {
      return NextResponse.json({ error: 'Meal ID is required' }, { status: 400 })
    }

    const reviews = await payload.find({
      collection: 'reviews',
      where: {
        meal: {
          equals: mealId,
        },
      },
      sort: '-createdAt',
      page,
      limit,
      depth: 2, // Populate related data
    })

    return NextResponse.json(reviews)
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 })
  }
}
