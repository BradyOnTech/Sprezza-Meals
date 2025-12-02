import { handleUpload } from '@vercel/blob/client'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const body = (await request.json()) as any

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        return {
          allowedContentTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/avif'],
          addRandomSuffix: true,
        }
      },
    })

    return NextResponse.json(jsonResponse)
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 })
  }
}
