import type { Metadata } from 'next'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Grid } from '@/components/Grid'
import { MealGridItem } from '@/components/ProductGridItem'
import { Media } from '@/components/Media'
import { Button } from '@/components/ui/button'

type MealFavorite = {
  id: number
  created_at: string
  meals: {
    id: number
    title: string
    slug: string
    price: number
    summary?: string | null
    media?: any
  }[]
}

type MealPlanFavorite = {
  id: number
  created_at: string
  meal_plans: {
    id: number
    title: string
    slug: string
    tagline?: string | null
    image?: any
  } | null
}

export default async function FavoritesPage() {
  const supabase = createSupabaseServerClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session?.user) {
    redirect(`/login?warning=${encodeURIComponent('Please login to view favorites.')}`)
  }

  const [mealFavoritesRes, planFavoritesRes] = await Promise.all([
    supabase
      .from('favorites_meals')
      .select('id, created_at, meals:meal_id (id, title, slug, price, summary, media)')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('favorites_meal_plans')
      .select('id, created_at, meal_plans:meal_plan_id (id, title, slug, tagline, image)')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false }),
  ])

  const mealFavorites = (mealFavoritesRes.data || []) as unknown as MealFavorite[]
  const planFavorites = (planFavoritesRes.data || []) as unknown as MealPlanFavorite[]

  const hasFavorites = mealFavorites.length > 0 || planFavorites.length > 0

  return (
    <div className="space-y-10">
      <div className="border p-8 rounded-lg bg-primary-foreground">
        <h1 className="text-3xl font-medium mb-4">Favorites</h1>
        <p className="text-muted-foreground">Meals and plans you&apos;ve saved for quick access.</p>
      </div>

      {!hasFavorites && (
        <div className="border rounded-lg bg-primary-foreground p-8">
          <p className="text-muted-foreground mb-4">
            You haven&apos;t saved any favorites yet. Browse the menu to start saving.
          </p>
          <Button asChild>
            <Link href="/shop">Browse meals</Link>
          </Button>
        </div>
      )}

      {mealFavorites.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold">Meals</h2>
              <p className="text-muted-foreground">Quick access to saved meals.</p>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link href="/shop">Shop all</Link>
            </Button>
          </div>
          <Grid className="grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {mealFavorites.map((fav) => {
              if (!fav.meals || fav.meals.length === 0) return null
              return <MealGridItem key={fav.id} meal={fav.meals[0]} />
            })}
          </Grid>
        </section>
      )}

      {planFavorites.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold">Meal plans</h2>
              <p className="text-muted-foreground">Saved weekly plans.</p>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link href="/shop?category=plans">Plans</Link>
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {planFavorites.map((fav) => {
              const plan = fav.meal_plans && fav.meal_plans.length > 0 ? fav.meal_plans[0] : null
              if (!plan) return null
              const image = plan.image && typeof plan.image !== 'number' ? plan.image : undefined
              return (
                <div
                  key={fav.id}
                  className="flex h-full flex-col overflow-hidden rounded-xl border bg-primary-foreground shadow-sm"
                >
                  {image ? (
                    <Media
                      className="h-40 w-full overflow-hidden"
                      imgClassName="h-full w-full object-cover"
                      resource={image}
                    />
                  ) : null}
                  <div className="flex flex-1 flex-col gap-3 p-4">
                    <h3 className="text-lg font-semibold">{plan.title}</h3>
                    {plan.tagline ? (
                      <p className="text-sm text-muted-foreground">{plan.tagline}</p>
                    ) : null}
                    <div className="mt-auto pt-2">
                      <Button asChild size="sm" variant="secondary">
                        <Link href={`/products/${plan.slug}`}>View plan</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}

export const metadata: Metadata = {
  description: 'View your saved meals and meal plans.',
  openGraph: mergeOpenGraph({
    title: 'Favorites',
    url: '/account/favorites',
  }),
  title: 'Favorites',
}
