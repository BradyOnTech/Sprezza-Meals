import { Grid } from '@/components/Grid'
import { MealGridItem } from '@/components/ProductGridItem'
import { sorting } from '@/lib/constants'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'

export const metadata = {
  description: 'Search for meals in the store.',
  title: 'Shop',
}

type SearchParams = { [key: string]: string | string[] | undefined }

type Props = {
  searchParams: Promise<SearchParams>
}

export default async function ShopPage({ searchParams }: Props) {
  const resolvedParams = await searchParams
  const searchValue = Array.isArray(resolvedParams.q) ? resolvedParams.q[0] : resolvedParams.q
  const sortParam = Array.isArray(resolvedParams.sort) ? resolvedParams.sort[0] : resolvedParams.sort
  const categoryParam = Array.isArray(resolvedParams.category)
    ? resolvedParams.category[0]
    : resolvedParams.category
  const payload = await getPayload({ config: configPromise })

  let categoryId: string | number | undefined

  if (categoryParam) {
    const categoryLookup = await payload.find({
      collection: 'meal-categories',
      draft: false,
      limit: 1,
      overrideAccess: false,
      pagination: false,
      select: {
        id: true,
      },
      where: {
        or: [
          { slug: { equals: categoryParam } },
          { id: { equals: categoryParam } },
        ],
      },
    })

    categoryId = categoryLookup?.docs?.[0]?.id
  }

  const sortValue =
    typeof sortParam === 'string' && sorting.some((sortOption) => sortOption.slug === sortParam)
      ? sortParam
      : 'title'

  const meals = await payload.find({
    collection: 'meals',
    depth: 2,
    draft: false,
    overrideAccess: false,
    select: {
      title: true,
      slug: true,
      media: true,
      price: true,
      summary: true,
      categories: true,
      dietaryTags: true,
      flags: true,
    },
    sort: sortValue,
    where: {
      and: [
        { _status: { equals: 'published' } },
        { 'flags.isActive': { equals: true } },
        ...(searchValue
          ? [
              {
                or: [
                  { title: { like: searchValue } },
                  { summary: { like: searchValue } },
                ],
              },
            ]
          : []),
        ...(categoryId
          ? [
              {
                categories: {
                  contains: categoryId,
                },
              },
            ]
          : []),
      ],
    },
  })

  const resultsText = meals.docs.length > 1 ? 'results' : 'result'

  return (
    <div>
      {searchValue ? (
        <p className="mb-4">
          {meals.docs?.length === 0
            ? 'There are no meals that match '
            : `Showing ${meals.docs.length} ${resultsText} for `}
          <span className="font-bold">&quot;{searchValue}&quot;</span>
        </p>
      ) : null}

      {!searchValue && meals.docs?.length === 0 && (
        <p className="mb-4">No meals found. Please try different filters.</p>
      )}

      {meals?.docs.length > 0 ? (
        <Grid className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {meals.docs.map((meal) => {
            return <MealGridItem key={meal.id} meal={meal} />
          })}
        </Grid>
      ) : null}
    </div>
  )
}
