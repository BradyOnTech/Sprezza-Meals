import type { Metadata } from 'next'

import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { formatDateTime } from '@/utilities/formatDateTime'
import { Price } from '@/components/Price'

export default async function Orders() {
  const supabase = createSupabaseServerClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session?.user) {
    redirect(`/login?warning=${encodeURIComponent('Please login to access your orders.')}`)
  }

  const { data: orders } = await supabase
    .from('orders')
    .select('id, status, total_amount, currency, created_at, items_count')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false })

  return (
    <>
      <div className="border p-8 rounded-lg bg-primary-foreground w-full">
        <h1 className="text-3xl font-medium mb-8">Orders</h1>
        {orders && orders.length ? (
          <ul className="flex flex-col gap-4">
            {orders.map((order) => (
              <li
                key={order.id}
                className="flex items-center justify-between rounded-lg border bg-white/5 p-4"
              >
                <div className="space-y-1">
                  <p className="text-sm font-mono uppercase text-primary/60">Order #{order.id}</p>
                  <p className="text-sm text-muted-foreground">
                    Placed {order.created_at ? formatDateTime({ date: order.created_at }) : ''}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Items: {order.items_count ?? 0} · Status: {order.status}
                  </p>
                </div>
                <div className="text-right">
                  {typeof order.total_amount === 'number' ? (
                    <Price amount={Number(order.total_amount)} currencyCode="USD" inCents={false} />
                  ) : (
                    <p className="text-sm text-muted-foreground">Pending total</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground">You have no orders yet.</p>
        )}
      </div>
    </>
  )
}

export const metadata: Metadata = {
  description: 'Your orders.',
  openGraph: mergeOpenGraph({
    title: 'Orders',
    url: '/orders',
  }),
  title: 'Orders',
}
