import { Metadata } from 'next'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import { PlanGridItem } from '@/components/plan/PlanGridItem'

export default async function PlansPage() {
  const supabase = createSupabaseServerClient()
  const { data: plans } = await supabase
    .from('meal_plans')
    .select('*')
    .order('schedule->>startDate', { ascending: false })
    .limit(12)

  return (
    <div className="container py-12 space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Meal plans</h1>
        <p className="text-muted-foreground">Weekly lineups with ready-to-eat meals.</p>
      </div>

      {plans && plans.length ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <PlanGridItem key={plan.id} plan={plan as any} />
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground">No plans available yet.</p>
      )}
    </div>
  )
}

export const metadata: Metadata = {
  description: 'Browse weekly meal plans.',
  openGraph: mergeOpenGraph({
    title: 'Meal Plans',
    url: '/plans',
  }),
  title: 'Meal Plans',
}
