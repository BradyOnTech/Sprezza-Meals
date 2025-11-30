'use client'

import { Button } from '@/components/ui/button'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { useAuth } from '@/providers/Auth'
import { Heart, HeartOff } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

type Props =
  | {
      mealId: number
      mealPlanId?: never
      className?: string
    }
  | {
    mealPlanId: number
    mealId?: never
    className?: string
  }

export const FavoriteToggle: React.FC<Props> = ({ mealId, mealPlanId, className }) => {
  const supabase = useMemo(() => createSupabaseBrowserClient(), [])
  const { user } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  const [loading, setLoading] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)

  const table = mealId ? 'favorites_meals' : 'favorites_meal_plans'
  const column = mealId ? 'meal_id' : 'meal_plan_id'
  const targetId = mealId ?? mealPlanId!

  const fetchFavorite = useCallback(async () => {
    if (!user) return
    setLoading(true)
    const { data, error } = await supabase
      .from(table)
      .select('id')
      .eq('user_id', user.id)
      .eq(column, targetId)
      .maybeSingle()
    if (!error && data?.id) {
      setIsFavorite(true)
    } else {
      setIsFavorite(false)
    }
    setLoading(false)
  }, [supabase, table, column, targetId, user])

  useEffect(() => {
    void fetchFavorite()
  }, [fetchFavorite])

  const toggleFavorite = useCallback(async () => {
    if (!user) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`)
      return
    }

    setLoading(true)
    if (isFavorite) {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('user_id', user.id)
        .eq(column, targetId)

      if (error) {
        toast.error('Unable to remove favorite. Please try again.')
      } else {
        setIsFavorite(false)
        toast.success('Removed from favorites.')
      }
    } else {
      const { error } = await supabase.from(table).insert({
        user_id: user.id,
        [column]: targetId,
      })

      if (error) {
        toast.error('Unable to save favorite. Please try again.')
      } else {
        setIsFavorite(true)
        toast.success('Saved to favorites.')
      }
    }
    setLoading(false)
  }, [column, isFavorite, supabase, table, targetId, user, router, pathname])

  return (
    <Button
      variant={isFavorite ? 'default' : 'outline'}
      size="sm"
      disabled={loading}
      onClick={toggleFavorite}
      className={className}
    >
      {isFavorite ? <Heart className="h-4 w-4 fill-current mr-2" /> : <HeartOff className="h-4 w-4 mr-2" />}
      {isFavorite ? 'Favorited' : 'Save to favorites'}
    </Button>
  )
}
