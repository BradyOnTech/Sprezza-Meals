import type { Media, Meal } from '@/payload-types'

import { GridTileImage } from '@/components/Grid/tile'
import { Gallery } from '@/components/product/Gallery'
import { MealSummary } from '@/components/meal/MealSummary'
import { FavoriteToggle } from '@/components/favorites/FavoriteToggle'
import { AddToCart } from '@/components/Cart/AddToCart'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { draftMode } from 'next/headers'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import React, { Suspense } from 'react'
import { Button } from '@/components/ui/button'
import { ChevronLeftIcon } from 'lucide-react'
import { Metadata } from 'next'

type Args = {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug } = await params
  const meal = await queryMealBySlug({ slug })

  if (!meal) return notFound()

  const heroImage = typeof meal.media?.image === 'object' ? (meal.media.image as Media) : undefined
  const canIndex = meal.flags?.isActive !== false

  return {
    description: meal.summary || undefined,
    openGraph: heroImage?.url
      ? {
          images: [
            {
              alt: heroImage?.alt,
              height: heroImage.height || undefined,
              url: heroImage.url,
              width: heroImage.width || undefined,
            },
          ],
        }
      : undefined,
    robots: {
      follow: canIndex,
      googleBot: {
        follow: canIndex,
        index: canIndex,
      },
      index: canIndex,
    },
    title: meal.title,
  }
}

export default async function MealPage({ params }: Args) {
  const { slug } = await params
  const meal = await queryMealBySlug({ slug })

  if (!meal) return notFound()

  const heroImage = typeof meal.media?.image === 'object' ? (meal.media.image as Media) : undefined

  const galleryImages =
    meal.media?.gallery
      ?.filter((item) => typeof item.image === 'object')
      .map((item) => ({
        image: item.image as Media,
      })) || []

  const gallery = heroImage ? [{ image: heroImage }, ...galleryImages] : galleryImages

  const mealJsonLd = {
    name: meal.title,
    '@context': 'https://schema.org',
    '@type': 'Product',
    description: meal.summary || '',
    image: heroImage?.url,
    offers: {
      '@type': 'Offer',
      availability:
        meal.flags?.isActive === false
          ? 'https://schema.org/OutOfStock'
          : 'https://schema.org/InStock',
      price: meal.price,
      priceCurrency: 'USD',
    },
  }

  const relatedMeals =
    meal.relatedMeals?.filter(
      (relatedMeal): relatedMeal is Meal => typeof relatedMeal === 'object',
    ) ?? []

  return (
    <React.Fragment>
      <script
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(mealJsonLd),
        }}
        type="application/ld+json"
      />
      <div className="container pt-8 pb-8">
        <Button asChild variant="ghost" className="mb-4">
          <Link href="/shop">
            <ChevronLeftIcon />
            All meals
          </Link>
        </Button>
        <div className="flex flex-col gap-12 rounded-lg border p-8 md:py-12 lg:flex-row lg:gap-8 bg-primary-foreground">
          <div className="h-full w-full basis-full lg:basis-1/2">
            <Suspense
              fallback={
                <div className="relative aspect-square h-full max-h-[550px] w-full overflow-hidden" />
              }
            >
              {gallery.length ? <Gallery gallery={gallery} /> : null}
            </Suspense>
          </div>

          <div className="basis-full lg:basis-1/2">
            <MealSummary meal={meal} />
            <div className="mt-4 flex items-center justify-between gap-4">
              <FavoriteToggle mealId={meal.id} />
              <AddToCart product={meal} />
            </div>
          </div>
        </div>
      </div>

      {relatedMeals.length ? (
        <div className="container">
          <RelatedMeals meals={relatedMeals} />
        </div>
      ) : null}
    </React.Fragment>
  )
}

function RelatedMeals({ meals }: { meals: Meal[] }) {
  if (!meals.length) return null

  return (
    <div className="py-8">
      <h2 className="mb-4 text-2xl font-bold">Related Meals</h2>
      <ul className="flex w-full gap-4 overflow-x-auto pt-1">
        {meals.map((meal) => {
          const relatedImage =
            typeof meal.media?.image === 'object' ? (meal.media.image as Media) : undefined

          if (!relatedImage) return null

          return (
            <li
              className="aspect-square w-full flex-none min-[475px]:w-1/2 sm:w-1/3 md:w-1/4 lg:w-1/5"
              key={meal.id}
            >
              <Link className="relative h-full w-full" href={`/products/${meal.slug}`}>
                <GridTileImage
                  label={{
                    amount: meal.price,
                    title: meal.title,
                  }}
                  media={relatedImage}
                />
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

const queryMealBySlug = async ({ slug }: { slug: string }) => {
  const {} = await draftMode()

  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'meals',
    depth: 3,
    draft: true,
    limit: 1,
    overrideAccess: true,
    pagination: false,
    where: {
      and: [
        {
          slug: {
            equals: slug,
          },
        },
        {
          'flags.isActive': { equals: true },
        },
      ],
    },
  })

  return result.docs?.[0] || null
}
