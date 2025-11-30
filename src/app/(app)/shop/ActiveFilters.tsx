import Link from 'next/link'
import { X } from 'lucide-react'
import React from 'react'

type Props = {
  search?: string
  category?: string
  tag?: string
}

export function ActiveFilters({ search, category, tag }: Props) {
  const chips = []

  if (search) {
    chips.push({
      label: `Search: ${search}`,
      href: buildHref({ category, tag }),
    })
  }

  if (category) {
    chips.push({
      label: category === 'plans' ? 'Category: Meal Plans' : `Category: ${category}`,
      href: buildHref({ search, tag }),
    })
  }

  if (tag) {
    chips.push({
      label: `Dietary: ${tag}`,
      href: buildHref({ search, category }),
    })
  }

  if (!chips.length) return null

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      {chips.map((chip, idx) => (
        <Link
          key={idx}
          href={chip.href}
          className="inline-flex items-center gap-1 rounded-full border px-3 py-1 text-sm hover:border-primary"
        >
          <span>{chip.label}</span>
          <X className="h-3 w-3" />
        </Link>
      ))}
      <Link href="/shop" className="text-sm text-primary underline underline-offset-4">
        Clear all
      </Link>
    </div>
  )
}

function buildHref({ search, category, tag }: { search?: string; category?: string; tag?: string }) {
  const params = new URLSearchParams()
  if (search) params.set('q', search)
  if (category) params.set('category', category)
  if (tag) params.set('tag', tag)
  const query = params.toString()
  return query ? `/shop?${query}` : '/shop'
}
