import type { Meal, MealCategory, DietaryTag } from '@/payload-types'

import { RichText } from '@/components/RichText'
import { Price } from '@/components/Price'
import React from 'react'

type Props = {
  meal: Meal
}

export function MealSummary({ meal }: Props) {
  const categories = (meal.categories || []).filter(
    (category): category is MealCategory => typeof category === 'object',
  )
  const dietaryTags = (meal.dietaryTags || []).filter(
    (tag): tag is DietaryTag => typeof tag === 'object',
  )
  const ingredients = meal.ingredients || []
  const nutrition = meal.nutrition
  const mealBase = typeof meal.mealBase === 'object' ? meal.mealBase : undefined

  const nutritionEntries = [
    typeof nutrition?.weight === 'number'
      ? { label: 'Weight', value: `${nutrition.weight}${nutrition.weightUnit ? ` ${nutrition.weightUnit}` : ''}` }
      : null,
    typeof nutrition?.calories === 'number'
      ? { label: 'Calories', value: `${nutrition.calories} kcal` }
      : null,
    typeof nutrition?.protein === 'number' ? { label: 'Protein', value: `${nutrition.protein} g` } : null,
    typeof nutrition?.carbs === 'number' ? { label: 'Carbs', value: `${nutrition.carbs} g` } : null,
    typeof nutrition?.fat === 'number' ? { label: 'Fat', value: `${nutrition.fat} g` } : null,
    typeof nutrition?.fiber === 'number' ? { label: 'Fiber', value: `${nutrition.fiber} g` } : null,
    typeof nutrition?.sugar === 'number' ? { label: 'Sugar', value: `${nutrition.sugar} g` } : null,
  ].filter(Boolean) as { label: string; value: string }[]

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-2xl font-semibold">{meal.title}</h1>
          <Price amount={meal.price} className="text-lg font-mono text-primary" inCents={false} />
        </div>
        {meal.summary ? <p className="text-muted-foreground">{meal.summary}</p> : null}
      </div>

      {categories.length || dietaryTags.length ? (
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <span
              className="rounded-full bg-primary/5 px-3 py-1 text-xs font-medium text-primary"
              key={category.id}
            >
              {category.title}
            </span>
          ))}
          {dietaryTags.map((tag) => (
            <span
              className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-100"
              key={tag.id}
            >
              {tag.name}
            </span>
          ))}
        </div>
      ) : null}

      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
        {typeof meal.servings === 'number' ? (
          <span>
            {meal.servings} serving{meal.servings === 1 ? '' : 's'}
          </span>
        ) : null}
        {typeof meal.prepTimeMinutes === 'number' ? (
          <span>Ready in ~{meal.prepTimeMinutes} min</span>
        ) : null}
        {mealBase ? <span>Base: {mealBase.name}</span> : null}
      </div>

      {meal.description ? <RichText data={meal.description} enableGutter={false} /> : null}

      {ingredients.length ? (
        <div>
          <h3 className="mb-2 text-sm font-semibold">Ingredients</h3>
          <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
            {ingredients.map((ingredient, index) => (
              <li key={ingredient.id ?? `${ingredient.name}-${index}`}>{ingredient.name}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {nutritionEntries.length ? (
        <div className="rounded-lg border bg-primary-foreground p-4">
          <h3 className="mb-3 text-sm font-semibold">Nutrition</h3>
          <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
            {nutritionEntries.map((entry) => (
              <div key={entry.label}>
                <dt className="text-muted-foreground">{entry.label}</dt>
                <dd className="font-medium text-foreground">{entry.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      ) : null}
    </div>
  )
}
