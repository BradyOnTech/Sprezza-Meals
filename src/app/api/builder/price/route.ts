import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

type RequestBody = {
  baseId?: number | string
  baseSlug?: string
  optionIds?: Array<number | string>
}

type MacroTotals = {
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber?: number
  sugar?: number
}

const emptyTotals: MacroTotals = {
  calories: 0,
  protein: 0,
  carbs: 0,
  fat: 0,
  fiber: 0,
  sugar: 0,
}

const addTotals = (a: MacroTotals, b: Partial<MacroTotals>) => ({
  calories: a.calories + (b.calories || 0),
  protein: a.protein + (b.protein || 0),
  carbs: a.carbs + (b.carbs || 0),
  fat: a.fat + (b.fat || 0),
  fiber: a.fiber + (b.fiber || 0),
  sugar: a.sugar + (b.sugar || 0),
})

export async function POST(req: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })
    const body = (await req.json()) as RequestBody
    const { baseId, baseSlug, optionIds = [] } = body

    if (!baseId && !baseSlug) {
      return NextResponse.json({ error: 'baseId or baseSlug is required' }, { status: 400 })
    }

    // Fetch base
    const baseResult = await payload.find({
      collection: 'meal-bases',
      draft: true,
      limit: 1,
      pagination: false,
      where: {
        and: [
          ...(baseId
            ? [
                {
                  id: {
                    equals: baseId,
                  },
                },
              ]
            : []),
          ...(baseSlug
            ? [
                {
                  slug: {
                    equals: baseSlug,
                  },
                },
              ]
            : []),
        ],
      },
    })

    const base = baseResult.docs?.[0]

    if (!base) {
      return NextResponse.json({ error: 'Base not found' }, { status: 404 })
    }

    // Fetch options
    const optionsResult = optionIds.length
      ? await payload.find({
          collection: 'customization-options',
          draft: true,
          limit: optionIds.length,
          pagination: false,
          where: {
            id: {
              in: optionIds,
            },
          },
        })
      : { docs: [] }

    const options = optionsResult.docs || []

    const basePrice = typeof base.basePrice === 'number' ? base.basePrice : 0
    const optionsPrice = options.reduce((sum, opt) => {
      const adj = typeof opt.priceAdjustment === 'number' ? opt.priceAdjustment : 0
      return sum + adj
    }, 0)

    const totalPrice = Number((basePrice + optionsPrice).toFixed(2))

    let totals = { ...emptyTotals }

    const baseNutrition = base.nutrition || {}
    totals = addTotals(totals, baseNutrition as Partial<MacroTotals>)

    options.forEach((opt) => {
      totals = addTotals(totals, opt.nutrition as Partial<MacroTotals>)
    })

    return NextResponse.json({
      base: {
        id: base.id,
        name: base.name,
        price: basePrice,
      },
      options: options.map((opt) => ({
        id: opt.id,
        name: opt.name,
        priceAdjustment: opt.priceAdjustment || 0,
      })),
      totals: {
        price: totalPrice,
        nutrition: totals,
      },
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Unable to calculate builder totals' }, { status: 500 })
  }
}
