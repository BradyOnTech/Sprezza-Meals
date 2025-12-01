import type { Metadata } from 'next'

import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import React from 'react'
import { ConfirmOrder } from '@/components/checkout/ConfirmOrder'

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

export default async function ConfirmOrderPage({
  searchParams: _searchParamsPromise,
}: {
  searchParams: SearchParams
}) {
  const _searchParams = await _searchParamsPromise

  return (
    <div className="container min-h-[90vh] flex py-12">
      <ConfirmOrder />
    </div>
  )
}

export const metadata: Metadata = {
  description: 'Confirm order.',
  openGraph: mergeOpenGraph({
    title: 'Confirming order',
    url: '/checkout/confirm-order',
  }),
  title: 'Confirming order',
}
