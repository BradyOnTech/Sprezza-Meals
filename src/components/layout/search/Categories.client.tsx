'use client'
import React, { useCallback, useMemo } from 'react'

import { MealCategory } from '@/payload-types'
import { usePathname, useSearchParams, useRouter } from 'next/navigation'
import clsx from 'clsx'

type Props = {
  category: MealCategory
}

export const CategoryItem: React.FC<Props> = ({ category }) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const isActive = useMemo(() => {
    return searchParams.get('category') === String(category.slug)
  }, [category.slug, searchParams])

  const setQuery = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString())

    if (isActive || !category.slug) {
      params.delete('category')
    } else {
      params.set('category', String(category.slug))
    }

    const newParams = params.toString()

    router.push(pathname + '?' + newParams)
  }, [category.slug, isActive, pathname, router, searchParams])

  return (
    <button
      onClick={() => setQuery()}
      className={clsx('hover:cursor-pointer', {
        ' underline': isActive,
      })}
    >
      {category.title}
    </button>
  )
}
