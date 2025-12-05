import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

import { createSupabaseServerClient } from '@/lib/supabase/server'

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET

const getStripe = () => {
  if (!STRIPE_SECRET_KEY) {
    throw new Error('Stripe secret key not configured')
  }
  return new Stripe(STRIPE_SECRET_KEY)
}

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const supabase = await createSupabaseServerClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    const roles = (session?.user?.app_metadata?.roles as string[] | undefined) || []
    const isAdmin = roles.includes('admin')
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { data: order, error } = await supabase.from('orders').select('*').eq('id', id).single()

    if (error || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    const {
      payment_method_id,
      stripe_customer_id,
      subtotal,
      tax,
      tip,
      delivery_fee,
      status,
      payment_status,
      currency = 'USD',
    } = order as {
      payment_method_id?: string | null
      stripe_customer_id?: string | null
      subtotal?: number | null
      tax?: number | null
      tip?: number | null
      delivery_fee?: number | null
      status?: string | null
      payment_status?: string | null
      currency?: string | null
    }

    if (payment_status === 'paid') {
      return NextResponse.json({ error: 'Order already paid' }, { status: 400 })
    }

    if (!payment_method_id || !stripe_customer_id) {
      return NextResponse.json({ error: 'No payment method on file to charge' }, { status: 400 })
    }

    // Calculate total amount from order components
    const totalAmount = (subtotal || 0) + (tax || 0) + (tip || 0) + (delivery_fee || 0)
    if (totalAmount <= 0) {
      return NextResponse.json({ error: 'Order amount invalid' }, { status: 400 })
    }

    const stripe = getStripe()

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalAmount * 100),
      currency: (currency || 'USD').toLowerCase(),
      customer: stripe_customer_id,
      payment_method: payment_method_id,
      confirm: true,
      off_session: true,
      metadata: { order_id: id },
    })

    // Update order payment status and status, also set amount
    await supabase
      .from('orders')
      .update({
        amount: totalAmount,
        payment_status: paymentIntent.status === 'succeeded' ? 'paid' : payment_status,
        status: paymentIntent.status === 'succeeded' ? 'confirmed' : status,
        payment_intent_id: paymentIntent.id,
      })
      .eq('id', id)

    return NextResponse.json({ paymentIntent })
  } catch (error) {
    console.error('[order approve] error', error)
    return NextResponse.json({ error: 'Failed to approve and charge order' }, { status: 500 })
  }
}
