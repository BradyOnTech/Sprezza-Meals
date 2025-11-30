import configPromise from '@payload-config'
import { getPayload } from 'payload'
import clsx from 'clsx'
import React, { Suspense } from 'react'
import { DietaryTagItem } from './DietaryTags.client'

async function DietaryList() {
  const payload = await getPayload({ config: configPromise })

  const tags = await payload.find({
    collection: 'dietary-tags',
    draft: true,
    sort: 'name',
    select: {
      id: true,
      slug: true,
      name: true,
    },
  })

  return (
    <div>
      <h3 className="text-xs mb-2 text-neutral-500 dark:text-neutral-400">Dietary</h3>

      <ul>
        <li key="all-tags">
          <DietaryTagItem tag={{ id: 'all', slug: '', name: 'All diets' } as any} />
        </li>
        {tags.docs.map((tag) => {
          return (
            <li key={tag.id}>
              <DietaryTagItem tag={tag} />
            </li>
          )
        })}
      </ul>
    </div>
  )
}

const skeleton = 'mb-3 h-4 w-5/6 animate-pulse rounded'
const activeAndTitles = 'bg-neutral-800 dark:bg-neutral-300'
const items = 'bg-neutral-400 dark:bg-neutral-700'

export function DietaryTags() {
  return (
    <Suspense
      fallback={
        <div className="col-span-2 hidden h-[200px] w-full flex-none py-4 lg:block">
          <div className={clsx(skeleton, activeAndTitles)} />
          <div className={clsx(skeleton, items)} />
          <div className={clsx(skeleton, items)} />
          <div className={clsx(skeleton, items)} />
        </div>
      }
    >
      <DietaryList />
    </Suspense>
  )
}
