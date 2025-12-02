import type { Media, Meal, MealPlan, SiteSetting } from '@/payload-types'

import { Grid } from '@/components/Grid'
import { MealGridItem } from '@/components/ProductGridItem'
import { Button } from '@/components/ui/button'
import { Media as MediaComponent } from '@/components/Media'
import { getCachedGlobal } from '@/utilities/getGlobals'
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
  const [payload, siteSettings] = await Promise.all([
    getPayload({ config: configPromise }),
    getCachedGlobal('site-settings', 1)(),
  ])

  const [featuredMeals, featuredPlans] = await Promise.all([
    payload.find({
      collection: 'meals',
      depth: 1,
      limit: 6,
      overrideAccess: false,
      sort: '-updatedAt',
      where: {
        and: [{ 'flags.isActive': { equals: true } }, { 'flags.isFeatured': { equals: true } }],
      },
    }),
    payload.find({
      collection: 'meal-plans',
      depth: 1,
      limit: 3,
      overrideAccess: false,
      sort: '-schedule.startDate',
      where: {
        and: [{ isActive: { equals: true } }, { isFeatured: { equals: true } }],
      },
    }),
  ])

  return (
    <div className="space-y-16 pb-16">
      <section className="border-b bg-gradient-to-br from-primary/10 via-background to-background">
        <div className="container flex flex-col gap-6 py-16 md:py-24">
          {siteSettings.heroSubtitle && (
            <p className="text-sm uppercase tracking-[0.2em] text-primary/70">
              {siteSettings.heroSubtitle}
            </p>
          )}
          <h1 className="text-4xl font-semibold leading-tight md:text-5xl">
            {siteSettings.heroTitle || 'Chef-prepped meals, ready when you are.'}
          </h1>
          {siteSettings.heroImage && typeof siteSettings.heroImage !== 'number' && (
            <div className="my-8">
              <MediaComponent
                className="h-64 w-full max-w-2xl rounded-lg"
                imgClassName="object-cover"
                resource={siteSettings.heroImage}
              />
            </div>
          )}
          <div className="flex flex-wrap items-center gap-3">
            <Button asChild size="lg">
              <Link href={siteSettings.heroCtaHref || '/shop'}>
                {siteSettings.heroCtaLabel || 'Shop meals'}
              </Link>
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
              <span className="font-semibold text-foreground">Local</span> · Scottsdale prep +
              delivery
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

      {siteSettings.howItWorks && siteSettings.howItWorks.length > 0 && (
        <section className="container space-y-8 py-16">
          <div className="text-center">
            <h2 className="text-3xl font-bold">How It Works</h2>
            <p className="mt-2 text-muted-foreground">Simple steps to fresh, chef-prepped meals</p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {siteSettings.howItWorks.map((step, index) => (
              <div key={index} className="text-center">
                {step.icon && <div className="mb-4 text-4xl">{step.icon}</div>}
                <h3 className="mb-2 text-lg font-semibold">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

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
        {windowLabel ? (
          <p className="text-xs uppercase text-muted-foreground">{windowLabel}</p>
        ) : null}
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
