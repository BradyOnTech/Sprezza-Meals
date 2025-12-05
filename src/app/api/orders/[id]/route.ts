import { NextRequest, NextResponse } from 'next/server'

import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  try {
    const supabase = await createSupabaseServerClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items:orders_items(*)')
      .eq('id', id)
      .eq('user_id', session.user.id)
      .single()

    if (error) {
      console.error('[order GET] supabase error', error)
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    return NextResponse.json({ order: data })
  } catch (error) {
    console.error('[order GET] unexpected error', error)
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 })
  }
}

type UpdateOrderBody = {
  status?: string
  payment_status?: string
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  try {
    const supabase = await createSupabaseServerClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = (await req.json()) as UpdateOrderBody
    const updates: UpdateOrderBody = {}

    const allowedStatus = new Set([
      'pending',
      'pending_approval',
      'confirmed',
      'preparing',
      'ready_for_delivery',
      'out_for_delivery',
      'delivered',
      'cancelled',
      'refunded',
    ])
    const allowedPaymentStatus = new Set([
      'pending',
      'paid',
      'failed',
      'refunded',
      'partially_refunded',
    ])

    if (body.status) {
      if (!allowedStatus.has(body.status)) {
        return NextResponse.json({ error: 'Invalid status transition' }, { status: 400 })
      }
      updates.status = body.status
    }

    if (body.payment_status) {
      if (!allowedPaymentStatus.has(body.payment_status)) {
        return NextResponse.json({ error: 'Invalid payment status transition' }, { status: 400 })
      }
      updates.payment_status = body.payment_status
    }

    if (!Object.keys(updates).length) {
      return NextResponse.json({ error: 'No changes provided' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', id)
      .eq('user_id', session.user.id)
      .select()
      .single()

    if (error) {
      console.error('[order PATCH] supabase error', error)
      return NextResponse.json({ error: 'Failed to update order' }, { status: 400 })
    }

    return NextResponse.json({ order: data })
  } catch (error) {
    console.error('[order PATCH] unexpected error', error)
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
  }
}
