import { NextRequest, NextResponse } from 'next/server'

import { createSupabaseServerClient } from '@/lib/supabase/server'

type OrderItemInput = {
  product_id?: number
  meal_plan_id?: number
  variant_id?: number
  quantity?: number
  unit_price?: number
  total_price?: number
  special_instructions?: string
}

type CreateOrderBody = {
  customer_email?: string
  customer_phone?: string
  delivery_instructions?: string
  delivery_date?: string
  delivery_time_slot?: string
  payment_intent_id?: string
  tip?: number
  tax?: number
  delivery_fee?: number
  items?: OrderItemInput[]
}

const numberOrZero = (value: unknown) =>
  typeof value === 'number' && !Number.isNaN(value) ? value : 0

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

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

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
    } = body

    if (!customer_email && !session.user.email) {
      return NextResponse.json({ error: 'customer_email is required' }, { status: 400 })
    }

    const preparedItems = Array.isArray(items) ? items : []

    const subtotal = preparedItems.reduce((sum, item) => {
      const quantity = numberOrZero(item.quantity) || 1
      const unitPrice = numberOrZero(item.unit_price)
      return sum + unitPrice * quantity
    }, 0)

    const normalizedTax = numberOrZero(tax)
    const normalizedDeliveryFee = numberOrZero(delivery_fee)
    const normalizedTip = numberOrZero(tip)

    const { data: createdOrders, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: session.user.id,
        customer_email: customer_email || session.user.email,
        customer_phone,
        delivery_instructions,
        delivery_date,
        delivery_time_slot,
        payment_intent_id,
        subtotal,
        tax: normalizedTax,
        delivery_fee: normalizedDeliveryFee,
        tip: normalizedTip,
        payment_status: payment_intent_id ? 'pending' : 'pending',
        status: 'pending',
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
