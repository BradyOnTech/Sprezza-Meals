import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET

const getStripe = () => {
  if (!STRIPE_SECRET_KEY) {
    throw new Error('Stripe secret key not configured')
  }
  return new Stripe(STRIPE_SECRET_KEY)
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { email?: string; customerId?: string }
    const email = body.email?.trim()
    const stripe = getStripe()

    let customerId = body.customerId
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: email || undefined,
      })
      customerId = customer.id
    }

    const setupIntent = await stripe.setupIntents.create({
      customer: customerId,
      payment_method_types: ['card'],
    })

    return NextResponse.json({
      clientSecret: setupIntent.client_secret,
      customerId,
    })
  } catch (error) {
    console.error('[setup-intent] error', error)
    return NextResponse.json({ error: 'Failed to create setup intent' }, { status: 500 })
  }
}
