import { Grid } from '@/components/Grid'
import { MealGridItem } from '@/components/ProductGridItem'
import { PlanGridItem } from '@/components/plan/PlanGridItem'
import { sorting } from '@/lib/constants'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import { ActiveFilters } from './ActiveFilters'

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
  const sortParam = Array.isArray(resolvedParams.sort)
    ? resolvedParams.sort[0]
    : resolvedParams.sort
  const categoryParam = Array.isArray(resolvedParams.category)
    ? resolvedParams.category[0]
    : resolvedParams.category
  const tagParam = Array.isArray(resolvedParams.tag) ? resolvedParams.tag[0] : resolvedParams.tag
  const payload = await getPayload({ config: configPromise })

  let categoryId: string | number | undefined
  let tagId: string | number | undefined

  if (categoryParam) {
    try {
      const categoryOr: Array<{ slug: { equals: string | number } } | { id: { equals: number } }> =
        [{ slug: { equals: categoryParam } }]
      const asNumber = Number(categoryParam)
      if (Number.isFinite(asNumber)) {
        categoryOr.push({ id: { equals: asNumber } })
      }

      const categoryLookup = await payload.find({
        collection: 'meal-categories',
        draft: true,
        limit: 1,
        overrideAccess: false,
        pagination: false,
        where: {
          or: categoryOr,
        },
      })

      categoryId = categoryLookup?.docs?.[0]?.id
    } catch (err) {
      console.error('Failed to resolve category', err)
      categoryId = undefined
    }
  }

  if (tagParam) {
    try {
      const tagOr: Array<{ slug: { equals: string | number } } | { id: { equals: number } }> = [
        { slug: { equals: tagParam } },
      ]
      const asNumber = Number(tagParam)
      if (Number.isFinite(asNumber)) {
        tagOr.push({ id: { equals: asNumber } })
      }

      const tagLookup = await payload.find({
        collection: 'dietary-tags',
        draft: true,
        limit: 1,
        overrideAccess: false,
        pagination: false,
        where: {
          or: tagOr,
        },
      })
      tagId = tagLookup?.docs?.[0]?.id
    } catch (err) {
      console.error('Failed to resolve tag', err)
      tagId = undefined
    }
  }

  const sortValue =
    typeof sortParam === 'string' && sorting.some((sortOption) => sortOption.slug === sortParam)
      ? sortParam
      : 'title'

  if (categoryParam === 'plans') {
    let plans: Array<{
      id: number
      title: string
      slug: string
      tagline?: string | null
      schedule?: any
      image?: any
      isActive?: boolean | null
      updatedAt: string
      createdAt: string
    }> = []
    let planError: string | null = null

    try {
      const res = await payload.find({
        collection: 'meal-plans',
        draft: true,
        overrideAccess: false,
        select: {
          title: true,
          slug: true,
          tagline: true,
          schedule: true,
          image: true,
          isActive: true,
        },
        where: {
          and: [
            ...(searchValue
              ? [
                  {
                    or: [{ title: { like: searchValue } }, { tagline: { like: searchValue } }],
                  },
                ]
              : []),
            ...(resolvedParams?.status === 'draft' ? [] : [{ _status: { equals: 'published' } }]),
            { isActive: { equals: true } },
          ],
        },
      })
      plans = (res.docs || []) as any
    } catch (err: unknown) {
      planError = 'Unable to load plans right now.'
      console.error(err)
    }

    const resultsText = plans.length > 1 ? 'results' : 'result'

    return (
      <div>
        {planError ? <p className="mb-4 text-red-500 text-sm">{planError}</p> : null}

        {searchValue ? (
          <p className="mb-4">
            {plans.length === 0
              ? 'There are no meal plans that match '
              : `Showing ${plans.length} ${resultsText} for `}
            <span className="font-bold">&quot;{searchValue}&quot;</span>
          </p>
        ) : null}

        {!searchValue && plans.length === 0 && (
          <p className="mb-4">No meal plans found. Please try different filters.</p>
        )}

        {plans.length > 0 ? (
          <Grid className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map((plan) => {
              return <PlanGridItem key={plan.id} plan={plan as any} />
            })}
          </Grid>
        ) : null}
      </div>
    )
  }

  let meals: Array<{
    id: string | number
    title: string
    slug: string
    price: number
    summary?: string | null
    media?: any
    categories?: any
    dietaryTags?: any
    mealBase?: any
    customizationCategories?: any
    prepTimeMinutes?: number
    servings?: number
    flags?: any
    nutrition?: any
  }> = []
  let mealError: string | null = null
  try {
    const res = await payload.find({
      collection: 'meals',
      depth: 2,
      draft: true,
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
          { 'flags.isActive': { equals: true } },
          ...(searchValue
            ? [
                {
                  or: [{ title: { like: searchValue } }, { summary: { like: searchValue } }],
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
          ...(tagId
            ? [
                {
                  dietaryTags: {
                    contains: tagId,
                  },
                },
              ]
            : []),
        ],
      },
    })
    meals = res.docs || []
  } catch (err: any) {
    mealError = 'Unable to load meals right now.'
    console.error(err)
  }

  const resultsText = meals.length > 1 ? 'results' : 'result'

  return (
    <div>
      <ActiveFilters search={searchValue} category={categoryParam} tag={tagParam} />
      {mealError ? <p className="mb-4 text-red-500 text-sm">{mealError}</p> : null}

      {searchValue ? (
        <p className="mb-4">
          {meals.length === 0
            ? 'There are no meals that match '
            : `Showing ${meals.length} ${resultsText} for `}
          <span className="font-bold">&quot;{searchValue}&quot;</span>
        </p>
      ) : null}

      {!searchValue && meals.length === 0 && (
        <p className="mb-4">No meals found. Please try different filters.</p>
      )}

      {meals.length > 0 ? (
        <Grid className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {meals.map((meal) => {
            return <MealGridItem key={meal.id} meal={meal as any} />
          })}
        </Grid>
      ) : null}
    </div>
  )
}
