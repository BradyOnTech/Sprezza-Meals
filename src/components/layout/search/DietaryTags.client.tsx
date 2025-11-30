'use client'

import { DietaryTag } from '@/payload-types'
import { usePathname, useSearchParams, useRouter } from 'next/navigation'
import clsx from 'clsx'
import React, { useCallback, useMemo } from 'react'

type Props = {
  tag: DietaryTag
}

export const DietaryTagItem: React.FC<Props> = ({ tag }) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const isActive = useMemo(() => {
    return searchParams.get('tag') === String(tag.slug)
  }, [tag.slug, searchParams])

  const setQuery = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString())

    if (isActive || !tag.slug) {
      params.delete('tag')
    } else {
      params.set('tag', String(tag.slug))
    }

    const newParams = params.toString()

    router.push(pathname + '?' + newParams)
  }, [tag.slug, isActive, pathname, router, searchParams])

  return (
    <button
      onClick={() => setQuery()}
      className={clsx('hover:cursor-pointer text-sm', {
        ' underline': isActive,
      })}
    >
      {tag.name}
    </button>
  )
}
