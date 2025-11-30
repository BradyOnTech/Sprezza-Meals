import type { Media, Meal, MealPlan } from '@/payload-types'

import { Grid } from '@/components/Grid'
import { MealGridItem } from '@/components/ProductGridItem'
import { Button } from '@/components/ui/button'
import { Media as MediaComponent } from '@/components/Media'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export const metadata = {
  description: 'Chef-prepped meals and weekly plans built for Scottsdale schedules.',
  title: 'Sprezza Meals | Scottsdale Meal Prep',
}

const formatWindow = (schedule?: MealPlan['schedule']) => {
  if (!schedule?.startDate || !schedule?.endDate) return null

  const formatter = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' })
  return `${formatter.format(new Date(schedule.startDate))} – ${formatter.format(new Date(schedule.endDate))}`
}

export default async function HomePage() {
  const payload = await getPayload({ config: configPromise })

  const [featuredMeals, featuredPlans] = await Promise.all([
    payload.find({
      collection: 'meals',
      depth: 1,
      limit: 6,
      overrideAccess: false,
      select: {
        id: true,
        slug: true,
        title: true,
        summary: true,
        price: true,
        media: true,
        flags: true,
      },
      sort: '-updatedAt',
      where: {
        and: [
          { _status: { equals: 'published' } },
          { 'flags.isActive': { equals: true } },
          { 'flags.isFeatured': { equals: true } },
        ],
      },
    }),
    payload.find({
      collection: 'meal-plans',
      depth: 1,
      limit: 3,
      overrideAccess: false,
      select: {
        id: true,
        slug: true,
        title: true,
        tagline: true,
        schedule: true,
        image: true,
        isFeatured: true,
      },
      sort: '-schedule.startDate',
      where: {
        and: [
          { _status: { equals: 'published' } },
          { isActive: { equals: true } },
          { isFeatured: { equals: true } },
        ],
      },
    }),
  ])

  return (
    <div className="space-y-16 pb-16">
      <section className="border-b bg-gradient-to-br from-primary/10 via-background to-background">
        <div className="container flex flex-col gap-6 py-16 md:py-24">
          <p className="text-sm uppercase tracking-[0.2em] text-primary/70">Scottsdale meal prep</p>
          <h1 className="text-4xl font-semibold leading-tight md:text-5xl">
            Chef-prepped meals, ready when you are.
          </h1>
          <p className="max-w-2xl text-lg text-muted-foreground">
            Rotating bowls and tacos with macro-friendly builds, delivered on your schedule.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Button asChild size="lg">
              <Link href="/shop">Shop meals</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/shop">View weekly menu</Link>
            </Button>
          </div>
          <div className="flex flex-wrap gap-6 pt-4 text-sm text-muted-foreground">
            <div>
              <span className="font-semibold text-foreground">High protein</span> · 35g+ options
            </div>
            <div>
              <span className="font-semibold text-foreground">Custom builds</span> · swap bases and
              sauces
            </div>
            <div>
              <span className="font-semibold text-foreground">Local</span> · Scottsdale prep + delivery
            </div>
          </div>
        </div>
      </section>

      <section className="container space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold">Featured meals</h2>
            <p className="text-muted-foreground">Handpicked from this week&apos;s lineup.</p>
          </div>
          <Button asChild size="sm" variant="ghost">
            <Link className="inline-flex items-center gap-2" href="/shop">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {featuredMeals.docs.length ? (
          <Grid className="grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuredMeals.docs.map((meal) => (
              <MealGridItem key={meal.id} meal={meal as Meal} />
            ))}
          </Grid>
        ) : (
          <div className="rounded-lg border bg-primary-foreground p-6">
            <p className="text-muted-foreground">
              No featured meals yet. Head to the shop to browse the full menu.
            </p>
          </div>
        )}
      </section>

      <section className="container space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold">Weekly plan highlights</h2>
            <p className="text-muted-foreground">Preview what&apos;s slotted for this week.</p>
          </div>
          <Button asChild size="sm" variant="outline">
            <Link href="/shop">See menu</Link>
          </Button>
        </div>

        {featuredPlans.docs.length ? (
          <div className="grid gap-4 md:grid-cols-3">
            {featuredPlans.docs.map((plan) => (
              <MealPlanCard key={plan.id} plan={plan as MealPlan} />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border bg-primary-foreground p-6">
            <p className="text-muted-foreground">
              Weekly plans are coming soon. In the meantime, shop individual meals.
            </p>
          </div>
        )}
      </section>
    </div>
  )
}

function MealPlanCard({ plan }: { plan: MealPlan }) {
  const image = plan.image && typeof plan.image !== 'number' ? (plan.image as Media) : undefined
  const windowLabel = formatWindow(plan.schedule)

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border bg-primary-foreground shadow-sm">
      {image ? (
        <MediaComponent
          className="h-40 w-full overflow-hidden"
          imgClassName="h-full w-full object-cover"
          resource={image}
        />
      ) : null}
      <div className="flex flex-1 flex-col gap-3 p-4">
        {windowLabel ? <p className="text-xs uppercase text-muted-foreground">{windowLabel}</p> : null}
        <h3 className="text-lg font-semibold">{plan.title}</h3>
        {plan.tagline ? <p className="text-sm text-muted-foreground">{plan.tagline}</p> : null}
        <div className="mt-auto pt-2">
          <Button asChild size="sm" variant="secondary">
            <Link href="/shop">View meals</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
