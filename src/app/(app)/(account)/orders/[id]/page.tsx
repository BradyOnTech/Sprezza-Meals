import type { Metadata } from 'next'

import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { formatDateTime } from '@/utilities/formatDateTime'
import { Price } from '@/components/Price'
import { notFound } from 'next/navigation'
import { AddressItem } from '@/components/addresses/AddressItem'
import { Badge } from '@/components/ui/badge'
import clsx from 'clsx'

export const dynamic = 'force-dynamic'

type PageProps = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ email?: string }>
}

export default async function Order({ params }: PageProps) {
  const supabase = await createSupabaseServerClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session?.user) {
    redirect(`/login?warning=${encodeURIComponent('Please login to access your orders.')}`)
  }

  const { id } = await params

  const { data: order, error } = await supabase
    .from('orders')
    .select(
      'id, status, total_amount, currency, created_at, items_count, shipping_address, billing_address, payment_intent_id, tax_amount, tip_amount',
    )
    .eq('id', Number(id))
    .eq('user_id', session.user.id)
    .maybeSingle()

  const { data: items } = await supabase
    .from('order_items')
    .select('id, title, quantity, total_price, unit_price, meal_slug, metadata')
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
            <Price amount={Number(order.total_amount)} currencyCode="USD" inCents={false} />
          ) : (
            <p className="text-sm text-muted-foreground">Pending total</p>
          )}
          <StatusBadge status={order.status} />
        </div>
      </div>

      <div className="mt-8 space-y-6">
        <section>
          <h2 className="text-lg font-semibold mb-3">Items</h2>
          {items && items.length ? (
            <ul className="flex flex-col gap-3">
              {items.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-sm text-muted-foreground">
                      Qty {item.quantity} {item.meal_slug ? `· ${item.meal_slug}` : ''}
                    </p>
                    {item.metadata?.builder?.options ? (
                      <p className="text-xs text-muted-foreground">
                        {item.metadata.builder.options
                          .map((opt: { name: string }) => opt.name)
                          .join(', ')}
                      </p>
                    ) : null}
                  </div>
                  <div className="text-right">
                    {typeof item.total_price === 'number' ? (
                      <Price amount={Number(item.total_price)} currencyCode="USD" inCents={false} />
                    ) : (
                      <Price
                        amount={Number(item.unit_price || 0) * Number(item.quantity || 1)}
                        currencyCode="USD"
                        inCents={false}
                      />
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
            <AddressDisplay address={order.shipping_address} />
          </div>
          <div className="rounded-lg border p-4">
            <h3 className="font-semibold mb-2">Billing</h3>
            <AddressDisplay address={order.billing_address} />
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border p-4">
            <h3 className="font-semibold mb-2">Payment summary</h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Subtotal</dt>
                <dd>
                  {items && items.length ? (
                    <Price
                      amount={items.reduce((sum, item) => sum + Number(item.total_price || 0), 0)}
                      currencyCode="USD"
                      inCents={false}
                    />
                  ) : (
                    '—'
                  )}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Tax</dt>
                <dd>
                  {typeof order.tax_amount === 'number' ? (
                    <Price amount={Number(order.tax_amount)} currencyCode="USD" inCents={false} />
                  ) : (
                    '—'
                  )}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Tip</dt>
                <dd>
                  {typeof order.tip_amount === 'number' ? (
                    <Price amount={Number(order.tip_amount)} currencyCode="USD" inCents={false} />
                  ) : (
                    '—'
                  )}
                </dd>
              </div>
              <div className="flex justify-between border-t pt-2 font-semibold">
                <dt>Total</dt>
                <dd>
                  {typeof order.total_amount === 'number' ? (
                    <Price amount={Number(order.total_amount)} currencyCode="USD" inCents={false} />
                  ) : (
                    '—'
                  )}
                </dd>
              </div>
            </dl>
          </div>

          <div className="rounded-lg border p-4">
            <h3 className="font-semibold mb-2">Payment intent</h3>
            <p className="text-sm text-muted-foreground break-all">
              {order.payment_intent_id || 'Not created (mock)'}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Stripe integration deferred; this order is stored with a mock intent ID.
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}

function AddressDisplay({
  address,
}: {
  address: {
    id: string | number
    title?: string | null
    first_name?: string | null
    last_name?: string | null
    company?: string | null
    addressLine1?: string | null
    addressLine2?: string | null
    city?: string | null
    state?: string | null
    postalCode?: string | null
    country?: string | null
    phone?: string | null
  }
}) {
  if (!address) return <p className="text-sm text-muted-foreground">Not provided</p>

  const formatted = {
    id: address.id,
    title: address.title || address.title,
    firstName: address.first_name ?? address.firstName,
    lastName: address.last_name ?? address.lastName,
    company: address.company,
    addressLine1: address.address_line1 ?? address.addressLine1,
    addressLine2: address.address_line2 ?? address.addressLine2,
    city: address.city,
    state: address.state,
    postalCode: address.postal_code ?? address.postalCode,
    country: address.country,
    phone: address.phone,
  }

  return <AddressItem address={formatted} hideActions />
}

function StatusBadge({ status }: { status?: string | null }) {
  if (!status) return null
  const tone =
    status === 'paid'
      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-100'
      : status === 'pending'
        ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-100'
        : 'bg-slate-200 text-slate-800 dark:bg-slate-800/60 dark:text-slate-100'

  return (
    <Badge className={clsx('uppercase tracking-[0.12em] text-xs font-semibold', tone)}>
      {status}
    </Badge>
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
