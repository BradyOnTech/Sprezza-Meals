import { NextRequest, NextResponse } from 'next/server'

import { createSupabaseServerClient } from '@/lib/supabase/server'
import type { CreateOrderBody } from './types'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

const numberOrZero = (value: unknown) =>
  typeof value === 'number' && !Number.isNaN(value) ? value : 0

const toMiles = (meters: number) => meters / 1609.344

const haversineMiles = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const R = 6371000 // meters
  const φ1 = toRad(lat1)
  const φ2 = toRad(lat2)
  const Δφ = toRad(lat2 - lat1)
  const Δλ = toRad(lon2 - lon1)

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const d = R * c
  return toMiles(d)
}

export async function GET(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const includeItems = searchParams.get('include') === 'items'

    const columns = includeItems ? '*, order_items:orders_items(*)' : '*'

    const { data, error } = await supabase
      .from('orders')
      .select(columns)
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[orders GET] supabase error', error)
      return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
    }

    return NextResponse.json({ orders: data ?? [] })
  } catch (error) {
    console.error('[orders GET] unexpected error', error)
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    const body = (await req.json()) as CreateOrderBody
    const {
      customer_email,
      customer_phone,
      delivery_instructions,
      delivery_date,
      delivery_time_slot,
      payment_intent_id,
      tip,
      tax,
      delivery_fee,
      items = [],
      shipping_address,
      billing_address,
      request_approval,
      payment_method_id,
      stripe_customer_id,
    } = body

    if (!customer_email && !session?.user?.email) {
      return NextResponse.json({ error: 'customer_email is required' }, { status: 400 })
    }

    // Distance enforcement (if settings configured and shipping lat/lng present)
    let allowCreation = true
    let distanceMiles: number | null = null
    let settings: any = null

    if (shipping_address?.lat && shipping_address?.lng) {
      const payload = await getPayload({ config: configPromise })
      settings = await payload.findGlobal({ slug: 'delivery-settings' }).catch(() => null)
      const radiusMiles = settings?.radiusMiles
      const homeLat = settings?.homeLat
      const homeLng = settings?.homeLng

      if (
        typeof radiusMiles === 'number' &&
        typeof homeLat === 'number' &&
        typeof homeLng === 'number'
      ) {
        distanceMiles = haversineMiles(homeLat, homeLng, shipping_address.lat, shipping_address.lng)
        if (distanceMiles > radiusMiles && !request_approval) {
          allowCreation = false
        }
      }
    }

    if (!allowCreation && distanceMiles !== null) {
      return NextResponse.json(
        {
          error: 'out_of_radius',
          message: `Delivery address is ${distanceMiles.toFixed(
            1,
          )} miles away; maximum allowed is within service radius.`,
          distanceMiles,
          allowedMiles: settings?.radiusMiles ?? null,
        },
        { status: 400 },
      )
    }

    const preparedItems = Array.isArray(items) ? items : []

    for (const item of preparedItems) {
      const quantity = numberOrZero(item.quantity) || 1
      const unitPrice = numberOrZero(item.unit_price)
      if (unitPrice < 0 || quantity <= 0) {
        return NextResponse.json({ error: 'Invalid item pricing or quantity' }, { status: 400 })
      }
      if (!item.product_id && !item.meal_plan_id) {
        return NextResponse.json({ error: 'Item must reference a meal or meal plan' }, { status: 400 })
      }
    }

    const subtotal = preparedItems.reduce((sum, item) => {
      const quantity = numberOrZero(item.quantity) || 1
      const unitPrice = numberOrZero(item.unit_price)
      return sum + unitPrice * quantity
    }, 0)

    const normalizedTax = numberOrZero(tax)
    const normalizedDeliveryFee = numberOrZero(delivery_fee)
    const normalizedTip = numberOrZero(tip)
    const totalAmount = subtotal + normalizedTax + normalizedDeliveryFee + normalizedTip

    const { data: createdOrders, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: session?.user?.id || null,
        customer_email: customer_email || session?.user?.email,
        customer_phone,
        delivery_instructions,
        delivery_date,
        delivery_time_slot,
        payment_intent_id,
        amount: totalAmount,
        subtotal,
        tax: normalizedTax,
        delivery_fee: normalizedDeliveryFee,
        tip: normalizedTip,
        shipping_address: shipping_address ?? null,
        billing_address: billing_address ?? null,
        payment_status: payment_intent_id ? 'pending' : 'pending',
        status: request_approval || !allowCreation ? 'pending_approval' : 'pending',
        payment_method_id: payment_method_id || null,
        stripe_customer_id: stripe_customer_id || null,
      })
      .select()
      .single()

    if (orderError || !createdOrders) {
      console.error('[orders POST] order insert error', orderError)
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
    }

    const orderId = createdOrders.id

    if (preparedItems.length) {
      const itemsToInsert = preparedItems.map((item, index) => {
        const quantity = numberOrZero(item.quantity) || 1
        const unitPrice = numberOrZero(item.unit_price)
        const totalPrice =
          typeof item.total_price === 'number' && !Number.isNaN(item.total_price)
            ? item.total_price
            : unitPrice * quantity

        return {
          id: crypto.randomUUID(),
          _order: index,
          _parent_id: orderId,
          product_id: item.product_id ?? null,
          meal_plan_id: item.meal_plan_id ?? null,
          variant_id: item.variant_id ?? null,
          quantity,
          unit_price: unitPrice,
          total_price: totalPrice,
          special_instructions: item.special_instructions ?? null,
        }
      })

      const { error: itemsError } = await supabase.from('orders_items').insert(itemsToInsert)

      if (itemsError) {
        console.error('[orders POST] order items insert error', itemsError)
        // Best-effort rollback to avoid orphaned order
        await supabase.from('orders').delete().eq('id', orderId)
        return NextResponse.json(
          { error: 'Order created but items failed to save' },
          { status: 500 },
        )
      }
    }

    return NextResponse.json({ order: createdOrders })
  } catch (error) {
    console.error('[orders POST] unexpected error', error)
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }
}
