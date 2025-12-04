import { NextRequest, NextResponse } from 'next/server'

const MAPBOX_ACCESS_TOKEN = process.env.MAPBOX_ACCESS_TOKEN

export async function POST(req: NextRequest) {
  if (!MAPBOX_ACCESS_TOKEN) {
    return NextResponse.json({ error: 'Geocoding unavailable' }, { status: 503 })
  }

  try {
    const { address } = (await req.json()) as { address?: string }
    if (!address || typeof address !== 'string' || !address.trim()) {
      return NextResponse.json({ error: 'address is required' }, { status: 400 })
    }

    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
      address,
    )}.json?access_token=${MAPBOX_ACCESS_TOKEN}&limit=1`

    const res = await fetch(url)
    if (!res.ok) {
      return NextResponse.json({ error: 'Geocoding failed' }, { status: 502 })
    }

    const data = (await res.json()) as {
      features?: Array<{ center?: [number, number]; place_name?: string }>
    }
    const first = data.features?.[0]
    const [lng, lat] = first?.center || []

    if (typeof lat !== 'number' || typeof lng !== 'number') {
      return NextResponse.json({ error: 'Geocoding not found' }, { status: 404 })
    }

    return NextResponse.json({ lat, lng, place_name: first?.place_name })
  } catch (error) {
    console.error('[geocode] error', error)
    return NextResponse.json({ error: 'Geocoding error' }, { status: 500 })
  }
}
