import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'

import { format } from 'date-fns'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

type Params = {
  params: Promise<{ slug: string }>
}

const formatWindow = (schedule?: { startDate?: string | null; endDate?: string | null }) => {
  if (!schedule?.startDate || !schedule?.endDate) return null
  try {
    const start = format(new Date(schedule.startDate), 'MMMM d')
    const end = format(new Date(schedule.endDate), 'MMMM d')
    return `${start} – ${end}`
  } catch {
    return null
  }
}

export default async function PlanDetail({ params }: Params) {
  const { slug } = await params
  const supabase = await createSupabaseServerClient()
  const { data: plan } = await supabase
    .from('meal_plans')
    .select('*, items:items(*, meal:meal_id (title, slug, media))')
    .eq('slug', slug)
    .maybeSingle()

  if (!plan) return notFound()

  const windowLabel = formatWindow(plan.schedule)

  return (
    <div className="container py-12 space-y-8">
      <Button asChild variant="ghost">
        <Link href="/plans">
          <ChevronLeft className="h-4 w-4" />
          All plans
        </Link>
      </Button>
      <div className="rounded-2xl border bg-primary-foreground p-6 shadow-sm">
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Meal plan</p>
        <h1 className="text-3xl font-semibold mb-2">{plan.title}</h1>
        {plan.tagline ? <p className="text-muted-foreground mb-2">{plan.tagline}</p> : null}
        {windowLabel ? (
          <p className="text-sm font-mono uppercase tracking-[0.18em] text-primary/70">
            {windowLabel}
          </p>
        ) : null}
      </div>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Schedule</h2>
        {plan.items && plan.items.length ? (
          <ul className="grid gap-3 md:grid-cols-2">
            {plan.items.map(
              (item: {
                id: string | number
                dayOfWeek: string
                mealTime: string
                meal?: { title: string } | null
              }) => (
                <li key={item.id} className="rounded-lg border p-4 bg-primary-foreground">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground mb-1">
                    {item.dayOfWeek} · {item.mealTime}
                  </p>
                  <h3 className="text-lg font-semibold">
                    {item.meal && typeof item.meal === 'object' ? item.meal.title : 'Meal'}
                  </h3>
                  {item.meal && typeof item.meal === 'object' && (
                    <Link
                      href={`/products/${(item.meal as any)?.slug}`}
                      className="text-sm text-primary underline"
                    >
                      View meal
                    </Link>
                  )}
                  {(item as any).notes ? (
                    <p className="mt-2 text-sm text-muted-foreground">{(item as any).notes}</p>
                  ) : null}
                </li>
              ),
            )}
          </ul>
        ) : (
          <p className="text-muted-foreground">No items scheduled.</p>
        )}
      </section>
    </div>
  )
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createSupabaseServerClient()
  const { data: plan } = await supabase
    .from('meal_plans')
    .select('title, tagline')
    .eq('slug', slug)
    .maybeSingle()

  if (!plan) return notFound()

  return {
    title: plan.title,
    description: plan.tagline || '',
    openGraph: mergeOpenGraph({
      title: plan.title,
      description: plan.tagline || '',
      url: `/plans/${slug}`,
    }),
  }
}
