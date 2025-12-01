'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Price } from '@/components/Price'
import { Checkbox } from '@/components/ui/checkbox'

import { Message } from '@/components/Message'
import { useBuilderCart } from '@/providers/BuilderCart'

type Base = {
  id: number
  name: string
  description?: string | null
  basePrice?: number | null
  nutrition?: Record<string, number | null>
}

type Option = {
  id: number
  name: string
  priceAdjustment?: number | null
  nutrition?: Record<string, number | null>
}

type Category = {
  id: number
  name: string
  options?: Option[]
  minSelections?: number | null
  maxSelections?: number | null
}

type BuilderProps = {
  bases: Base[]
  categories: Category[]
}

type TotalsResponse = {
  base: { id: number; name: string; price: number }
  options: { id: number; name: string; priceAdjustment: number }[]
  totals: {
    price: number
    nutrition: {
      calories: number
      protein: number
      carbs: number
      fat: number
      fiber?: number
      sugar?: number
    }
  }
}

export function BuilderClient({ bases, categories }: BuilderProps) {
  const [selectedBase, setSelectedBase] = useState<number | null>(bases?.[0]?.id ?? null)
  const [selectedOptions, setSelectedOptions] = useState<Record<number, boolean>>({})
  const [totals, setTotals] = useState<TotalsResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const { addItem } = useBuilderCart()
  const optionMap = useMemo(() => {
    const map = new Map<number, Option>()
    categories.forEach((cat) => {
      cat.options?.forEach((opt) => map.set(opt.id, opt))
    })
    return map
  }, [categories])

  const optionIds = useMemo(
    () =>
      Object.entries(selectedOptions)
        .filter(([_, value]) => value)
        .map(([key]) => Number(key)),
    [selectedOptions],
  )

  useEffect(() => {
    const fetchTotals = async () => {
      if (!selectedBase) return
      setLoading(true)
      setError(null)
      try {
        const res = await fetch('/api/builder/price', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            baseId: selectedBase,
            optionIds,
          }),
        })
        if (!res.ok) {
          const err = (await res.json().catch(() => ({}))) as { error?: string; message?: string }
          throw new Error(err.error || 'Unable to calculate totals')
        }
        const data = (await res.json()) as TotalsResponse
        setTotals(data)
      } catch (_err) {
        setError(err?.message || 'Unable to calculate totals.')
      } finally {
        setLoading(false)
      }
    }
    void fetchTotals()
  }, [selectedBase, optionIds])

  const toggleOption = (optionId: number) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [optionId]: !prev[optionId],
    }))
  }

  const validateSelections = () => {
    const errors: string[] = []
    categories.forEach((cat) => {
      const selectedCount = cat.options?.filter((opt) => selectedOptions[opt.id]).length ?? 0
      const min = cat.minSelections || 0
      const max = cat.maxSelections || undefined
      if (selectedCount < min) {
        errors.push(`${cat.name}: select at least ${min}`)
      }
      if (typeof max === 'number' && selectedCount > max) {
        errors.push(`${cat.name}: max ${max} selections`)
      }
    })
    setValidationErrors(errors)
    return errors.length === 0
  }

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>1. Choose a base</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            {bases.map((base) => (
              <label
                key={base.id}
                className="flex cursor-pointer flex-col gap-2 rounded-lg border p-4 hover:border-primary"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{base.name}</p>
                    {base.description ? (
                      <p className="text-sm text-muted-foreground">{base.description}</p>
                    ) : null}
                  </div>
                  <input
                    type="radio"
                    name="base"
                    checked={selectedBase === base.id}
                    onChange={() => setSelectedBase(base.id)}
                  />
                </div>
                <Price amount={base.basePrice || 0} inCents={false} />
              </label>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>2. Choose options</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {categories.map((cat) => (
              <div key={cat.id} className="space-y-2 rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{cat.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {cat.minSelections || cat.maxSelections
                        ? `Select ${cat.minSelections || 0}${cat.maxSelections ? `-${cat.maxSelections}` : ''}`
                        : 'Optional'}
                    </p>
                  </div>
                </div>
                <div className="grid gap-2 md:grid-cols-2">
                  {cat.options?.map((opt) => (
                    <label
                      key={opt.id}
                      className="flex cursor-pointer items-center justify-between gap-2 rounded-md border p-3 hover:border-primary"
                    >
                      <div>
                        <p className="font-medium">{opt.name}</p>
                        {opt.priceAdjustment ? (
                          <p className="text-xs text-muted-foreground">
                            +${opt.priceAdjustment.toFixed(2)}
                          </p>
                        ) : (
                          <p className="text-xs text-muted-foreground">Included</p>
                        )}
                      </div>
                      <Checkbox
                        checked={Boolean(selectedOptions[opt.id])}
                        onCheckedChange={() => toggleOption(opt.id)}
                      />
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Price & macros</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {error ? <Message error={error} /> : null}
            {validationErrors.length ? <Message error={validationErrors.join(' · ')} /> : null}
            {loading ? <p className="text-sm text-muted-foreground">Calculating...</p> : null}
            {totals ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-sm">Price</span>
                  <Price amount={totals.totals.price} inCents={false} />
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <Stat
                    label="Calories"
                    value={`${totals.totals.nutrition.calories.toFixed(0)} kcal`}
                  />
                  <Stat label="Protein" value={`${totals.totals.nutrition.protein.toFixed(1)} g`} />
                  <Stat label="Carbs" value={`${totals.totals.nutrition.carbs.toFixed(1)} g`} />
                  <Stat label="Fat" value={`${totals.totals.nutrition.fat.toFixed(1)} g`} />
                  {typeof totals.totals.nutrition.fiber === 'number' ? (
                    <Stat label="Fiber" value={`${totals.totals.nutrition.fiber.toFixed(1)} g`} />
                  ) : null}
                  {typeof totals.totals.nutrition.sugar === 'number' ? (
                    <Stat label="Sugar" value={`${totals.totals.nutrition.sugar.toFixed(1)} g`} />
                  ) : null}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Select a base to see totals.</p>
            )}
          </CardContent>
        </Card>
        <Button
          disabled={!selectedBase}
          size="lg"
          className="w-full"
          onClick={async () => {
            const ok = validateSelections()
            if (!ok || !totals || !selectedBase) return
            try {
              const base = bases.find((b) => b.id === selectedBase)
              const selectedOptionDetails = optionIds.map((id) => optionMap.get(id)).filter(Boolean)
              await addItem({
                base: { id: selectedBase, name: base?.name, price: base?.basePrice || 0 },
                options: selectedOptionDetails.map((opt) => ({
                  id: opt!.id,
                  name: opt!.name,
                  priceAdjustment: opt!.priceAdjustment || 0,
                })),
                totals: totals.totals,
              })
            } catch (err) {
              setError('Unable to add to cart.')
            }
          }}
        >
          Add to cart
        </Button>
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-primary/5 px-3 py-2">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-semibold">{value}</p>
    </div>
  )
}
