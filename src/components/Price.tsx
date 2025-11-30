'use client'
import { useCurrency } from '@payloadcms/plugin-ecommerce/client/react'
import React, { useMemo } from 'react'

type BaseProps = {
  className?: string
  currencyCodeClassName?: string
  as?: 'span' | 'p'
  /**
   * Plugin currency formatter expects minor units (cents).
   * Set to false when you already have dollar amounts.
   */
  inCents?: boolean
}

type PriceFixed = {
  amount: number
  currencyCode?: string
  highestAmount?: never
  lowestAmount?: never
}

type PriceRange = {
  amount?: never
  currencyCode?: string
  highestAmount: number
  lowestAmount: number
}

type Props = BaseProps & (PriceFixed | PriceRange)

export const Price = ({
  amount,
  className,
  highestAmount,
  lowestAmount,
  currencyCode: currencyCodeFromProps,
  as = 'p',
  inCents = true,
}: Props & React.ComponentProps<'p'>) => {
  const { formatCurrency, supportedCurrencies } = useCurrency()

  const Element = as

  const currencyToUse = useMemo(() => {
    if (currencyCodeFromProps) {
      return supportedCurrencies.find((currency) => currency.code === currencyCodeFromProps)
    }
    return undefined
  }, [currencyCodeFromProps, supportedCurrencies])

  const toMinorUnits = (value?: number) => {
    if (typeof value !== 'number') return value
    return inCents ? value : Math.round(value * 100)
  }

  const amountInMinor = toMinorUnits(amount)
  const highestInMinor = toMinorUnits(highestAmount)
  const lowestInMinor = toMinorUnits(lowestAmount)

  if (typeof amountInMinor === 'number') {
    return (
      <Element className={className} suppressHydrationWarning>
        {formatCurrency(amountInMinor, { currency: currencyToUse })}
      </Element>
    )
  }

  if (
    typeof highestInMinor === 'number' &&
    typeof lowestInMinor === 'number' &&
    highestInMinor !== lowestInMinor
  ) {
    return (
      <Element className={className} suppressHydrationWarning>
        {`${formatCurrency(lowestInMinor, { currency: currencyToUse })} - ${formatCurrency(highestInMinor, { currency: currencyToUse })}`}
      </Element>
    )
  }

  if (typeof lowestInMinor === 'number') {
    return (
      <Element className={className} suppressHydrationWarning>
        {`${formatCurrency(lowestInMinor, { currency: currencyToUse })}`}
      </Element>
    )
  }

  return null
}
