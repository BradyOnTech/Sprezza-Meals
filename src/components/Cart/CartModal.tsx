'use client'

import { Price } from '@/components/Price'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { useCart } from '@payloadcms/plugin-ecommerce/client/react'
import { ShoppingCart } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect, useMemo, useState } from 'react'

import { DeleteItemButton } from './DeleteItemButton'
import { EditItemQuantityButton } from './EditItemQuantityButton'
import { OpenCartButton } from './OpenCart'
import { Button } from '@/components/ui/button'
import { Product } from '@/payload-types'
import { useBuilderCart } from '@/providers/BuilderCart'
import { useMealCart } from '@/providers/MealCart'

export function CartModal() {
  const { cart } = useCart()
  const { items: builderItems, updateQuantity: updateBuilderQty, removeItem: removeBuilder } =
    useBuilderCart()
  const { items: mealItems, updateQuantity: updateMealQty, removeItem: removeMeal } = useMealCart()
  const [isOpen, setIsOpen] = useState(false)

  const pathname = usePathname()

  useEffect(() => {
    // Close the cart modal when the pathname changes.
    setIsOpen(false)
  }, [pathname])

  const totalQuantity = useMemo(() => {
    const base = cart?.items?.reduce((quantity, item) => (item.quantity || 0) + quantity, 0) || 0
    const builderCount = builderItems?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0
    const mealCount = mealItems?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0
    const total = base + builderCount + mealCount
    return total || undefined
  }, [cart, builderItems, mealItems])

  const fallbackTotal = useMemo(() => {
    const productTotal =
      cart?.items?.reduce((sum, item) => {
        const product = item.product
        const qty = item.quantity || 1
        if (typeof product === 'object' && typeof product?.priceInUSD === 'number')
          return sum + (product.priceInUSD / 100) * qty
        return sum
      }, 0) || 0
    const builderTotal =
      builderItems?.reduce((sum, item) => sum + item.totals.price * (item.quantity || 1), 0) || 0
    const mealTotal =
      mealItems?.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0) || 0
    return productTotal + builderTotal + mealTotal
  }, [cart?.items, builderItems, mealItems])

  const hasItems = Boolean(totalQuantity && totalQuantity > 0)

  return (
    <Sheet onOpenChange={setIsOpen} open={isOpen}>
      <SheetTrigger asChild>
        <OpenCartButton quantity={totalQuantity} />
      </SheetTrigger>

      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle>My Cart</SheetTitle>

          <SheetDescription>Manage your cart here, add items to view the total.</SheetDescription>
        </SheetHeader>

        {!hasItems ? (
          <div className="text-center flex flex-col items-center gap-2">
            <ShoppingCart className="h-16" />
            <p className="text-center text-2xl font-bold">Your cart is empty.</p>
          </div>
        ) : (
          <div className="grow flex px-4">
            <div className="flex flex-col justify-between w-full">
              <ul className="grow overflow-auto py-4">
                {mealItems.map((meal) => {
                  const qty = meal.quantity || 1
                  return (
                    <li className="flex w-full flex-col" key={meal.id}>
                      <div className="relative flex w-full flex-row justify-between px-1 py-4">
                        <div className="absolute z-40 -mt-2 ml-[55px]">
                          <button
                            aria-label="Remove meal"
                            onClick={(e) => {
                              e.preventDefault()
                              removeMeal(meal.id)
                            }}
                            className="rounded-full bg-neutral-500 px-2 py-1 text-white text-xs"
                          >
                            ✕
                          </button>
                        </div>
                        <div className="z-30 flex flex-row space-x-4 w-full">
                          <div className="relative h-16 w-16 cursor-pointer overflow-hidden rounded-md border border-neutral-300 bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-900" />
                          <div className="flex flex-1 flex-col text-base">
                            <span className="leading-tight font-semibold">{meal.title || 'Meal'}</span>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400">{meal.slug}</p>
                          </div>
                        </div>
                        <div className="flex h-16 flex-col justify-between">
                          <Price
                            amount={meal.price || 0}
                            className="flex justify-end space-y-2 text-right text-sm"
                            inCents={false}
                          />
                          <div className="ml-auto flex h-9 flex-row items-center rounded-lg border">
                            <button
                              className="px-2"
                              onClick={(e) => {
                                e.preventDefault()
                                updateMealQty(meal.id, Math.max(1, qty - 1))
                              }}
                            >
                              -
                            </button>
                            <p className="w-6 text-center">
                              <span className="w-full text-sm">{qty}</span>
                            </p>
                            <button
                              className="px-2"
                              onClick={(e) => {
                                e.preventDefault()
                                updateMealQty(meal.id, qty + 1)
                              }}
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    </li>
                  )
                })}
                {builderItems.map((builder) => {
                  const qty = builder.quantity || 1
                  const price = builder.totals.price || 0
                  return (
                    <li className="flex w-full flex-col" key={builder.id}>
                      <div className="relative flex w-full flex-row justify-between px-1 py-4">
                        <div className="absolute z-40 -mt-2 ml-[55px]">
                          <button
                            aria-label="Remove builder item"
                            onClick={(e) => {
                              e.preventDefault()
                              removeBuilder(builder.id)
                            }}
                            className="rounded-full bg-neutral-500 px-2 py-1 text-white text-xs"
                          >
                            ✕
                          </button>
                        </div>
                        <div className="z-30 flex flex-row space-x-4 w-full">
                          <div className="relative h-16 w-16 cursor-pointer overflow-hidden rounded-md border border-neutral-300 bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-900" />
                          <div className="flex flex-1 flex-col text-base">
                            <span className="leading-tight font-semibold">Custom meal</span>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">
                              Base: {builder.base?.name || 'Selected'}
                            </p>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400">
                              {builder.options.map((opt) => opt.name).join(', ')}
                            </p>
                          </div>
                        </div>
                        <div className="flex h-16 flex-col justify-between">
                          <Price
                            amount={price}
                            className="flex justify-end space-y-2 text-right text-sm"
                            inCents={false}
                          />
                          <div className="ml-auto flex h-9 flex-row items-center rounded-lg border">
                            <button
                              className="px-2"
                              onClick={(e) => {
                                e.preventDefault()
                                updateBuilderQty(builder.id, Math.max(1, qty - 1))
                              }}
                            >
                              -
                            </button>
                            <p className="w-6 text-center">
                              <span className="w-full text-sm">{qty}</span>
                            </p>
                            <button
                              className="px-2"
                              onClick={(e) => {
                                e.preventDefault()
                                updateBuilderQty(builder.id, qty + 1)
                              }}
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    </li>
                  )
                })}
                {cart?.items?.map((item, i) => {
                  const product = item.product
                  const variant = item.variant

                  if (typeof product !== 'object' || !item || !product || !product.slug)
                    return <React.Fragment key={i} />

                  const metaImage =
                    product.meta?.image && typeof product.meta?.image === 'object'
                      ? product.meta.image
                      : undefined

                  const firstGalleryImage =
                    typeof product.gallery?.[0]?.image === 'object'
                      ? product.gallery?.[0]?.image
                      : undefined

                  let image = firstGalleryImage || metaImage
                  let price = product.priceInUSD

                  const isVariant = Boolean(variant) && typeof variant === 'object'

                  if (isVariant) {
                    price = variant?.priceInUSD

                    const imageVariant = product.gallery?.find((item) => {
                      if (!item.variantOption) return false
                      const variantOptionID =
                        typeof item.variantOption === 'object'
                          ? item.variantOption.id
                          : item.variantOption

                      const hasMatch = variant?.options?.some((option) => {
                        if (typeof option === 'object') return option.id === variantOptionID
                        else return option === variantOptionID
                      })

                      return hasMatch
                    })

                    if (imageVariant && typeof imageVariant.image === 'object') {
                      image = imageVariant.image
                    }
                  }

                  return (
                    <li className="flex w-full flex-col" key={i}>
                      <div className="relative flex w-full flex-row justify-between px-1 py-4">
                        <div className="absolute z-40 -mt-2 ml-[55px]">
                          <DeleteItemButton item={item} />
                        </div>
                        <Link
                          className="z-30 flex flex-row space-x-4"
                          href={`/products/${(item.product as Product)?.slug}`}
                        >
                          <div className="relative h-16 w-16 cursor-pointer overflow-hidden rounded-md border border-neutral-300 bg-neutral-300 dark:border-neutral-700 dark:bg-neutral-900 dark:hover:bg-neutral-800">
                            {image?.url && (
                              <Image
                                alt={image?.alt || product?.title || ''}
                                className="h-full w-full object-cover"
                                height={94}
                                src={image.url}
                                width={94}
                              />
                            )}
                          </div>

                          <div className="flex flex-1 flex-col text-base">
                            <span className="leading-tight">{product?.title}</span>
                            {isVariant && variant ? (
                              <p className="text-sm text-neutral-500 dark:text-neutral-400 capitalize">
                                {variant.options
                                  ?.map((option) => {
                                    if (typeof option === 'object') return option.label
                                    return null
                                  })
                                  .join(', ')}
                              </p>
                            ) : null}
                          </div>
                        </Link>
                        <div className="flex h-16 flex-col justify-between">
                          {typeof price === 'number' && (
                            <Price
                              amount={price}
                              className="flex justify-end space-y-2 text-right text-sm"
                            />
                          )}
                          <div className="ml-auto flex h-9 flex-row items-center rounded-lg border">
                            <EditItemQuantityButton item={item} type="minus" />
                            <p className="w-6 text-center">
                              <span className="w-full text-sm">{item.quantity}</span>
                            </p>
                            <EditItemQuantityButton item={item} type="plus" />
                          </div>
                        </div>
                      </div>
                    </li>
                  )
                })}
              </ul>

              <div className="px-4">
                <div className="py-4 text-sm text-neutral-500 dark:text-neutral-400">
                  <div className="mb-3 flex items-center justify-between border-b border-neutral-200 pb-1 pt-1 dark:border-neutral-700">
                    <p>Total</p>
                    <Price
                      amount={
                        typeof cart?.subtotal === 'number' ? cart.subtotal / 100 : fallbackTotal
                      }
                      className="text-right text-base text-black dark:text-white"
                      inCents={false}
                    />
                  </div>

                  <Button asChild>
                    <Link className="w-full" href="/checkout">
                      Proceed to Checkout
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
