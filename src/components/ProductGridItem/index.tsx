import type { Meal } from '@/payload-types'

import Link from 'next/link'
import React from 'react'
import clsx from 'clsx'
import { Media } from '@/components/Media'
import { Price } from '@/components/Price'

type Props = {
  meal: Partial<Meal>
}

export const MealGridItem: React.FC<Props> = ({ meal }) => {
  const { media, price, title, summary } = meal

  const image = media?.image && typeof media.image !== 'string' ? media.image : null

  return (
    <Link className="relative inline-block h-full w-full group" href={`/products/${meal.slug}`}>
      {image ? (
        <Media
          className={clsx(
            'relative aspect-square object-cover border rounded-2xl p-8 bg-primary-foreground',
          )}
          height={80}
          imgClassName={clsx('h-full w-full object-cover rounded-2xl', {
            'transition duration-300 ease-in-out group-hover:scale-102': true,
          })}
          resource={image}
          width={80}
        />
      ) : null}

      <div className="mt-4 flex flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <div className="font-mono text-primary/50 group-hover:text-primary/100">{title}</div>
          {typeof price === 'number' ? (
            <Price amount={price} className="text-primary" />
          ) : null}
        </div>
        {summary ? (
          <p className="text-sm text-muted-foreground line-clamp-2">{summary}</p>
        ) : null}
      </div>
    </Link>
  )
}

export const ProductGridItem = MealGridItem
