import { Metadata } from 'next'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import { BuilderClient } from './BuilderClient'

export default async function BuilderPage() {
  const payload = await getPayload({ config: configPromise })

  const [basesRes, categoriesRes] = await Promise.all([
    payload.find({
      collection: 'meal-bases',
      limit: 100,
      pagination: false,
      where: { _status: { equals: 'published' } },
    }),
    payload.find({
      collection: 'customization-categories',
      depth: 2,
      limit: 100,
      pagination: false,
      where: { _status: { equals: 'published' }, isActive: { equals: true } },
    }),
  ])

  const bases = basesRes.docs || []
  const categories = categoriesRes.docs || []

  return (
    <div className="container py-12 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold">Build your meal</h1>
        <p className="text-muted-foreground">
          Choose a base and toppings to see price and macros update in real time.
        </p>
      </div>

      <BuilderClient bases={bases as any[]} categories={categories as any[]} />
    </div>
  )
}

export const metadata: Metadata = {
  description: 'Custom meal builder with live price and macros.',
  openGraph: mergeOpenGraph({
    title: 'Meal Builder',
    url: '/builder',
  }),
  title: 'Meal Builder',
}
