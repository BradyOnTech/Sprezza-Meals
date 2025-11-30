'use client'

import { Button } from '@/components/ui/button'
import type { Product, Variant } from '@/payload-types'

import { useMealCart } from '@/providers/MealCart'
import clsx from 'clsx'
import { useSearchParams } from 'next/navigation'
import React, { useCallback, useMemo } from 'react'
import { toast } from 'sonner'
type Props = {
  product: Product
}

export function AddToCart({ product }: Props) {
  const { addItem } = useMealCart()
  const searchParams = useSearchParams()

  const variants = product.variants?.docs || []

  const selectedVariant = useMemo<Variant | undefined>(() => {
    if (product.enableVariants && variants.length) {
      const variantId = searchParams.get('variant')

      const validVariant = variants.find((variant) => {
        if (typeof variant === 'object') {
          return String(variant.id) === variantId
        }
        return String(variant) === variantId
      })

      if (validVariant && typeof validVariant === 'object') {
        return validVariant
      }
    }

    return undefined
  }, [product.enableVariants, searchParams, variants])

  const addToCart = useCallback(
    (e: React.FormEvent<HTMLButtonElement>) => {
      e.preventDefault()

      addItem({
        mealId: product.id,
        slug: product.slug,
        title: product.title,
        price:
          (selectedVariant && typeof selectedVariant?.priceInUSD === 'number'
            ? selectedVariant.priceInUSD
            : undefined) ??
          (typeof product.price === 'number' ? product.price : undefined) ??
          (typeof (product as any).priceInUSD === 'number' ? (product as any).priceInUSD : 0),
      })
      toast.success('Item added to cart.')
    },
    [addItem, product, selectedVariant],
  )

  const disabled = useMemo<boolean>(() => {
    if (product.enableVariants) {
      if (!selectedVariant) return true
      if (selectedVariant.inventory === 0) return true
    } else {
      if (product.inventory === 0) return true
    }
    return false
  }, [selectedVariant, product])

  return (
    <Button
      aria-label="Add to cart"
      variant={'outline'}
      className={clsx({
        'hover:opacity-90': true,
      })}
      disabled={disabled}
      onClick={addToCart}
      type="submit"
    >
      Add To Cart
    </Button>
  )
}
