'use client'

import { Media } from '@/components/Media'
import { Message } from '@/components/Message'
import { Price } from '@/components/Price'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/providers/Auth'
import { useTheme } from '@/providers/Theme'
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { Suspense, useCallback, useEffect, useMemo, useState } from 'react'

import { cssVariables } from '@/cssVariables'
import { CheckoutForm } from '@/components/forms/CheckoutForm'
import { useCart, usePayments } from '@payloadcms/plugin-ecommerce/client/react'
import { CheckoutAddresses } from '@/components/checkout/CheckoutAddresses'
import { CreateAddressModal } from '@/components/addresses/CreateAddressModal'
import { Checkbox } from '@/components/ui/checkbox'
import { AddressItem } from '@/components/addresses/AddressItem'
import { FormItem } from '@/components/forms/FormItem'
import { toast } from 'sonner'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import type { SavedAddress } from '@/components/addresses/AddressListing'

const apiKey = `${process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY}`
const stripe = loadStripe(apiKey)
const TAX_RATE = 0.081 // Scottsdale, AZ approximate

export const CheckoutPage: React.FC = () => {
  const { user } = useAuth()
  const router = useRouter()
  const { cart } = useCart()
  const [error, setError] = useState<null | string>(null)
  const { theme } = useTheme()
  /**
   * State to manage the email input for guest checkout.
   */
  const [email, setEmail] = useState('')
  const [emailEditable, setEmailEditable] = useState(true)
  const [paymentData, setPaymentData] = useState<null | Record<string, unknown>>(null)
  const { initiatePayment } = usePayments()
  const [addresses, setAddresses] = useState<SavedAddress[]>([])
  const [shippingAddress, setShippingAddress] = useState<SavedAddress>()
  const [billingAddress, setBillingAddress] = useState<SavedAddress>()
  const [billingAddressSameAsShipping, setBillingAddressSameAsShipping] = useState(true)
  const [isProcessingPayment, setProcessingPayment] = useState(false)
  const supabase = React.useMemo(() => createSupabaseBrowserClient(), [])
  const [tipAmount, setTipAmount] = useState<number>(0)

  const cartIsEmpty = !cart || !cart.items || !cart.items.length

  const canGoToPayment = Boolean(
    (email || user) && billingAddress && (billingAddressSameAsShipping || shippingAddress),
  )

  const refreshAddresses = useCallback(async () => {
    if (!user) {
      setAddresses([])
      return
    }

    const { data, error } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', user.id)
      .order('is_default', { ascending: false })
      .order('updated_at', { ascending: false })

    if (error) {
      toast.error('Unable to load saved addresses.')
      return
    }

    const mapped = (data || []).map((row) => ({
      id: row.id,
      title: row.title,
      firstName: row.first_name,
      lastName: row.last_name,
      company: row.company,
      addressLine1: row.address_line1,
      addressLine2: row.address_line2,
      city: row.city,
      state: row.state,
      postalCode: row.postal_code,
      country: row.country,
      phone: row.phone,
      isDefault: row.is_default,
    }))

    setAddresses(mapped)
  }, [supabase, user])

  // Load saved addresses for logged-in users
  useEffect(() => {
    void refreshAddresses()
  }, [refreshAddresses])

  // Prefill billing/shipping when addresses load
  useEffect(() => {
    if (!billingAddress && addresses.length) {
      const preferred =
        addresses.find((addr) => addr.isDefault) ||
        addresses.find((addr) => addr.is_default) ||
        addresses[0]
      setBillingAddress(preferred)
    }
    if (!billingAddressSameAsShipping && !shippingAddress && addresses.length) {
      const preferred =
        addresses.find((addr) => addr.isDefault) ||
        addresses.find((addr) => addr.is_default) ||
        addresses[0]
      setShippingAddress(preferred)
    }
  }, [addresses, billingAddress, billingAddressSameAsShipping, shippingAddress])

  useEffect(() => {
    return () => {
      setShippingAddress(undefined)
      setBillingAddress(undefined)
      setBillingAddressSameAsShipping(true)
      setEmail('')
      setEmailEditable(true)
    }
  }, [])

  const subtotal = useMemo(() => {
    return (
      cart?.items?.reduce((sum, item) => {
        const product = typeof item.product === 'object' ? item.product : undefined
        const price = product && typeof product.priceInUSD === 'number' ? product.priceInUSD : 0
        const qty = item.quantity || 1
        return sum + price * qty
      }, 0) || 0
    )
  }, [cart?.items])

  const initiatePaymentIntent = useCallback(async (_paymentID: string) => {
    try {
      const lineItems =
        cart?.items?.map((item) => {
          const quantity = item.quantity || 1
          const product = typeof item.product === 'object' ? item.product : undefined
          const price = product && typeof product.priceInUSD === 'number' ? product.priceInUSD : 0
          return {
            title: product?.title || 'Item',
            quantity,
            unit_price: price,
            total_price: price * quantity,
            meal_slug: product?.slug,
          }
        }) || []

      const tax = subtotal * TAX_RATE
      const total = subtotal + tax + (tipAmount || 0)

      if (user) {
        const { error: orderError, data: createdOrders } = await supabase
          .from('orders')
          .insert({
            user_id: user.id,
            customer_email: user.email ?? email,
            status: 'pending',
            total_amount: total,
            tax_amount: tax,
            tip_amount: tipAmount || 0,
            items_count: lineItems.length,
            shipping_address: billingAddressSameAsShipping ? shippingAddress ?? billingAddress : shippingAddress,
            billing_address: billingAddress,
            payment_intent_id: `mock_${crypto.randomUUID()}`,
          })
          .select('id')
          .limit(1)

        if (orderError) {
          throw orderError
        }

        const orderRecord = createdOrders?.[0]
        const orderDbId = orderRecord?.id

        if (orderDbId) {
          const { error: itemsError } = await supabase
            .from('order_items')
            .insert(
              lineItems.map((li) => ({
                order_id: orderDbId,
                title: li.title,
                quantity: li.quantity,
                unit_price: li.unit_price,
                total_price: li.total_price,
                meal_slug: li.meal_slug,
              })),
            )

          if (itemsError) {
            throw itemsError
          }
        }
      }

      const mockPaymentData = {
        clientSecret: `mock_secret_${crypto.randomUUID().slice(0, 8)}`,
      }

      setPaymentData(mockPaymentData)
    } catch (error) {
      const errorData = error instanceof Error ? JSON.parse(error.message) : {}
      let errorMessage = 'An error occurred while initiating payment.'

      if (errorData?.cause?.code === 'OutOfStock') {
        errorMessage = 'One or more items in your cart are out of stock.'
      }

      setError(errorMessage)
      toast.error(errorMessage)
    }
  }, [billingAddress, billingAddressSameAsShipping, cart?.items, email, shippingAddress, supabase, tipAmount, user])

  if (!stripe) return null

  if (cartIsEmpty && isProcessingPayment) {
    return (
      <div className="py-12 w-full items-center justify-center">
        <div className="prose dark:prose-invert text-center max-w-none self-center mb-8">
          <p>Processing your payment...</p>
        </div>
        <LoadingSpinner />
      </div>
    )
  }

  if (cartIsEmpty) {
    return (
      <div className="prose dark:prose-invert py-12 w-full items-center">
        <p>Your cart is empty.</p>
        <Link href="/search">Continue shopping?</Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-stretch justify-stretch my-8 md:flex-row grow gap-10 md:gap-6 lg:gap-8">
      <div className="basis-full lg:basis-2/3 flex flex-col gap-8 justify-stretch">
        <h2 className="font-medium text-3xl">Contact</h2>
        {!user && (
          <div className=" bg-accent dark:bg-black rounded-lg p-4 w-full flex items-center">
            <div className="prose dark:prose-invert">
              <Button asChild className="no-underline text-inherit" variant="outline">
                <Link href="/login">Log in</Link>
              </Button>
              <p className="mt-0">
                <span className="mx-2">or</span>
                <Link href="/create-account">create an account</Link>
              </p>
            </div>
          </div>
        )}
        {user ? (
          <div className="bg-accent dark:bg-card rounded-lg p-4 ">
            <div>
              <p>{user.email}</p>{' '}
              <p>
                Not you?{' '}
                <Link className="underline" href="/logout">
                  Log out
                </Link>
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-accent dark:bg-black rounded-lg p-4 ">
            <div>
              <p className="mb-4">Enter your email to checkout as a guest.</p>

              <FormItem className="mb-6">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  disabled={!emailEditable}
                  id="email"
                  name="email"
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  type="email"
                />
              </FormItem>

              <Button
                disabled={!email || !emailEditable}
                onClick={(e) => {
                  e.preventDefault()
                  setEmailEditable(false)
                }}
                variant="default"
              >
                Continue as guest
              </Button>
            </div>
          </div>
        )}

        <h2 className="font-medium text-3xl">Address</h2>

        {billingAddress ? (
          <div>
            <AddressItem
              actions={
                <Button
                  variant={'outline'}
                  disabled={Boolean(paymentData)}
                  onClick={(e) => {
                    e.preventDefault()
                    setBillingAddress(undefined)
                  }}
                >
                  Remove
                </Button>
              }
              address={billingAddress}
            />
          </div>
        ) : user ? (
          <CheckoutAddresses
            addresses={addresses}
            heading="Billing address"
            setAddress={setBillingAddress}
            onRefresh={refreshAddresses}
          />
        ) : (
          <CreateAddressModal
            disabled={!email || Boolean(emailEditable)}
            callback={(address) => {
              setBillingAddress(address)
            }}
            skipSubmission={!user}
          />
        )}

        <div className="flex gap-4 items-center">
          <Checkbox
            id="shippingTheSameAsBilling"
            checked={billingAddressSameAsShipping}
            disabled={Boolean(paymentData || (!user && (!email || Boolean(emailEditable))))}
            onCheckedChange={(state) => {
              setBillingAddressSameAsShipping(state as boolean)
            }}
          />
          <Label htmlFor="shippingTheSameAsBilling">Shipping is the same as billing</Label>
        </div>

        {!billingAddressSameAsShipping && (
          <>
            {shippingAddress ? (
              <div>
                <AddressItem
                  actions={
                    <Button
                      variant={'outline'}
                      disabled={Boolean(paymentData)}
                      onClick={(e) => {
                        e.preventDefault()
                        setShippingAddress(undefined)
                      }}
                    >
                      Remove
                    </Button>
                  }
                  address={shippingAddress}
                />
              </div>
            ) : user ? (
              <CheckoutAddresses
                addresses={addresses}
                heading="Shipping address"
                description="Please select a shipping address."
                setAddress={setShippingAddress}
                onRefresh={refreshAddresses}
              />
            ) : (
              <CreateAddressModal
                callback={(address) => {
                  setShippingAddress(address)
                }}
                disabled={!email || Boolean(emailEditable)}
                skipSubmission={!user}
              />
            )}
          </>
        )}

        {!paymentData && (
          <div className="flex flex-col gap-4">
            <div className="w-full max-w-sm">
              <Label htmlFor="tip">Add a tip (optional)</Label>
              <Input
                id="tip"
                type="number"
                min={0}
                step={0.5}
                value={tipAmount}
                onChange={(e) => setTipAmount(Number(e.target.value) || 0)}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Tip is added to your total. You can adjust this anytime before payment.
              </p>
            </div>

            <Button
              className="self-start"
              disabled={!canGoToPayment}
              onClick={(e) => {
                e.preventDefault()
                void initiatePaymentIntent('stripe')
              }}
            >
              Go to payment
            </Button>
          </div>
        )}

        {!paymentData?.['clientSecret'] && error && (
          <div className="my-8">
            <Message error={error} />

            <Button
              onClick={(e) => {
                e.preventDefault()
                router.refresh()
              }}
              variant="default"
            >
              Try again
            </Button>
          </div>
        )}

        <Suspense fallback={<React.Fragment />}>
          {/* @ts-ignore */}
          {paymentData && paymentData?.['clientSecret'] && (
            <div className="pb-16">
              <h2 className="font-medium text-3xl">Payment</h2>
              {error && <p>{`Error: ${error}`}</p>}
              <Elements
                options={{
                  appearance: {
                    theme: 'stripe',
                    variables: {
                      borderRadius: '6px',
                      colorPrimary: '#858585',
                      gridColumnSpacing: '20px',
                      gridRowSpacing: '20px',
                      colorBackground: theme === 'dark' ? '#0a0a0a' : cssVariables.colors.base0,
                      colorDanger: cssVariables.colors.error500,
                      colorDangerText: cssVariables.colors.error500,
                      colorIcon:
                        theme === 'dark' ? cssVariables.colors.base0 : cssVariables.colors.base1000,
                      colorText: theme === 'dark' ? '#858585' : cssVariables.colors.base1000,
                      colorTextPlaceholder: '#858585',
                      fontFamily: 'Geist, sans-serif',
                      fontSizeBase: '16px',
                      fontWeightBold: '600',
                      fontWeightNormal: '500',
                      spacingUnit: '4px',
                    },
                  },
                  clientSecret: paymentData['clientSecret'] as string,
                }}
                stripe={stripe}
              >
                <div className="flex flex-col gap-8">
                  <CheckoutForm
                    customerEmail={email}
                    billingAddress={billingAddress}
                    setProcessingPayment={setProcessingPayment}
                  />
                  <Button
                    variant="ghost"
                    className="self-start"
                    onClick={() => setPaymentData(null)}
                  >
                    Cancel payment
                  </Button>
                </div>
              </Elements>
            </div>
          )}
        </Suspense>
      </div>

      {!cartIsEmpty && (
        <div className="basis-full lg:basis-1/3 lg:pl-8 p-8 border-none bg-primary/5 flex flex-col gap-8 rounded-lg">
          <h2 className="text-3xl font-medium">Your cart</h2>
          <div className="rounded-lg border bg-white/70 dark:bg-black/30 p-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>
                <Price
                  amount={
                    (cart?.items || []).reduce((sum, item) => {
                      const product = typeof item.product === 'object' ? item.product : undefined
                      const price =
                        product && typeof product.priceInUSD === 'number' ? product.priceInUSD : 0
                      const qty = item.quantity || 1
                      return sum + price * qty
                    }, 0) || 0
                  }
                />
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Estimated tax ({(TAX_RATE * 100).toFixed(1)}%)</span>
              <span>
                <Price
                  amount={
                    ((cart?.items || []).reduce((sum, item) => {
                      const product = typeof item.product === 'object' ? item.product : undefined
                      const price =
                        product && typeof product.priceInUSD === 'number' ? product.priceInUSD : 0
                      const qty = item.quantity || 1
                      return sum + price * qty
                    }, 0) || 0) * TAX_RATE
                  }
                />
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Tip</span>
              <span>
                <Price amount={tipAmount || 0} />
              </span>
            </div>
            <div className="flex items-center justify-between text-base font-semibold pt-2 border-t">
              <span>Total</span>
              <span>
                <Price
                  amount={
                    ((cart?.items || []).reduce((sum, item) => {
                      const product = typeof item.product === 'object' ? item.product : undefined
                      const price =
                        product && typeof product.priceInUSD === 'number' ? product.priceInUSD : 0
                      const qty = item.quantity || 1
                      return sum + price * qty
                    }, 0) || 0) *
                      (1 + TAX_RATE) +
                    (tipAmount || 0)
                  }
                />
              </span>
            </div>
          </div>
          {cart?.items?.map((item, index) => {
            if (typeof item.product === 'object' && item.product) {
              const {
                product,
                product: { id, meta, title, gallery },
                quantity,
                variant,
              } = item

              if (!quantity) return null

              let image = gallery?.[0]?.image || meta?.image
              let price = product?.priceInUSD

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

                if (imageVariant && typeof imageVariant.image !== 'string') {
                  image = imageVariant.image
                }
              }

              return (
                <div className="flex items-start gap-4" key={index}>
                  <div className="flex items-stretch justify-stretch h-20 w-20 p-2 rounded-lg border">
                    <div className="relative w-full h-full">
                      {image && typeof image !== 'string' && (
                        <Media className="" fill imgClassName="rounded-lg" resource={image} />
                      )}
                    </div>
                  </div>
                  <div className="flex grow justify-between items-center">
                    <div className="flex flex-col gap-1">
                      <p className="font-medium text-lg">{title}</p>
                      {variant && typeof variant === 'object' && (
                        <p className="text-sm font-mono text-primary/50 tracking-[0.1em]">
                          {variant.options
                            ?.map((option) => {
                              if (typeof option === 'object') return option.label
                              return null
                            })
                            .join(', ')}
                        </p>
                      )}
                      <div>
                        {'x'}
                        {quantity}
                      </div>
                    </div>

                    {typeof price === 'number' && <Price amount={price} />}
                  </div>
                </div>
              )
            }
            return null
          })}
          <hr />
          <div className="flex justify-between items-center gap-2">
            <span className="uppercase">Total</span>{' '}
            <Price className="text-3xl font-medium" amount={cart.subtotal || 0} />
          </div>
        </div>
      )}
    </div>
  )
}
