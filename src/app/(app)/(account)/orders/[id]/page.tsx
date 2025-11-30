import type { Metadata } from 'next'

import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { formatDateTime } from '@/utilities/formatDateTime'
import { Price } from '@/components/Price'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

type PageProps = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ email?: string }>
}

export default async function Order({ params, searchParams }: PageProps) {
  const supabase = createSupabaseServerClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session?.user) {
    redirect(`/login?warning=${encodeURIComponent('Please login to access your orders.')}`)
  }

  const { id } = await params

  const { data: order, error } = await supabase
    .from('orders')
    .select('id, status, total_amount, currency, created_at, items_count, shipping_address, billing_address, payment_intent_id')
    .eq('id', Number(id))
    .eq('user_id', session.user.id)
    .maybeSingle()

  const { data: items } = await supabase
    .from('order_items')
    .select('id, title, quantity, total_price, unit_price, meal_slug')
    .eq('order_id', Number(id))

  if (error || !order) {
    notFound()
  }

  return (
    <div className="border rounded-lg bg-primary-foreground p-8">
      <div className="flex justify-between items-start gap-4">
        <div>
          <p className="font-mono uppercase text-primary/60 text-sm">Order #{order.id}</p>
          <h1 className="text-2xl font-semibold mb-2">Order details</h1>
          <p className="text-muted-foreground">
            Placed {order.created_at ? formatDateTime({ date: order.created_at }) : ''}
          </p>
        </div>
        <div className="text-right">
          {typeof order.total_amount === 'number' ? (
            <Price amount={Number(order.total_amount)} currencyCode="USD" />
          ) : (
            <p className="text-sm text-muted-foreground">Pending total</p>
          )}
          <p className="text-sm text-muted-foreground">Status: {order.status}</p>
        </div>
      </div>

      <div className="mt-8 space-y-6">
        <section>
          <h2 className="text-lg font-semibold mb-3">Items</h2>
          {items && items.length ? (
            <ul className="flex flex-col gap-3">
              {items.map((item) => (
                <li key={item.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-sm text-muted-foreground">
                      Qty {item.quantity} {item.meal_slug ? `· ${item.meal_slug}` : ''}
                    </p>
                  </div>
                  <div className="text-right">
                    {typeof item.total_price === 'number' ? (
                      <Price amount={Number(item.total_price)} currencyCode="USD" />
                    ) : (
                      <Price amount={Number(item.unit_price || 0) * Number(item.quantity || 1)} currencyCode="USD" />
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">No items recorded.</p>
          )}
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border p-4">
            <h3 className="font-semibold mb-2">Shipping</h3>
            {order.shipping_address ? (
              <pre className="text-sm text-muted-foreground whitespace-pre-wrap">
                {JSON.stringify(order.shipping_address, null, 2)}
              </pre>
            ) : (
              <p className="text-sm text-muted-foreground">Not provided</p>
            )}
          </div>
          <div className="rounded-lg border p-4">
            <h3 className="font-semibold mb-2">Billing</h3>
            {order.billing_address ? (
              <pre className="text-sm text-muted-foreground whitespace-pre-wrap">
                {JSON.stringify(order.billing_address, null, 2)}
              </pre>
            ) : (
              <p className="text-sm text-muted-foreground">Not provided</p>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params

  return {
    description: `Order details for order ${id}.`,
    openGraph: mergeOpenGraph({
      title: `Order ${id}`,
      url: `/orders/${id}`,
    }),
    title: `Order ${id}`,
  }
}
