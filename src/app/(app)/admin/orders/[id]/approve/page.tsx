import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { ArrowLeft, CheckCircle, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import { ApproveOrderClient } from './ApproveOrderClient'

type Order = {
  id: string
  orderNumber: string
  customer_email?: string
  customer_name?: string
  status: string
  payment_status: string
  amount?: number
  subtotal?: number
  tax?: number
  delivery_fee?: number
  tip?: number
  payment_method_id?: string
  stripe_customer_id?: string
  created_at: string
}

async function getOrder(id: string): Promise<Order | null> {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase.from('orders').select('*').eq('id', id).single()

  if (error) {
    console.error('Error fetching order:', error)
    return null
  }

  return data as Order
}

export default async function AdminApproveOrderPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  // TODO: Add proper admin access check
  // For now, we'll assume admin access for development

  const { id } = await params
  const order = await getOrder(id)

  if (!order) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Order Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The order you&apos;re looking for doesn&apos;t exist.
          </p>
          <Button asChild>
            <Link href="/admin/orders">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Orders
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  if (order.status !== 'pending') {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4">Order Cannot Be Approved</h1>
          <p className="text-muted-foreground mb-6">
            This order is already {order.status.replace('_', ' ')} and cannot be approved.
          </p>
          <Button asChild>
            <Link href={`/admin/orders/${order.id}`}>View Order</Link>
          </Button>
        </div>
      </div>
    )
  }

  if (order.payment_status === 'paid') {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4">Order Already Paid</h1>
          <p className="text-muted-foreground mb-6">
            This order has already been paid for. You can update its status to &quot;confirmed&quot;
            instead.
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild>
              <Link href={`/admin/orders/${order.id}`}>View Order</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/admin/orders">Back to Orders</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/orders">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Approve Order {order.orderNumber}</h1>
          <p className="text-muted-foreground">Review and approve this pending order</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Order Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
            <CardDescription>Review the order details before approval</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Customer</label>
                <p className="font-medium">{order.customer_name || 'Guest'}</p>
                <p className="text-sm text-muted-foreground">{order.customer_email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Order Amount</label>
                <p className="text-2xl font-bold">${(order.amount || 0).toFixed(2)}</p>
                <div className="text-sm text-muted-foreground space-y-1">
                  <div>Subtotal: ${(order.subtotal || 0).toFixed(2)}</div>
                  <div>Tax: ${(order.tax || 0).toFixed(2)}</div>
                  <div>Delivery: ${(order.delivery_fee || 0).toFixed(2)}</div>
                  <div>Tip: ${(order.tip || 0).toFixed(2)}</div>
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Current Status</label>
                <div className="flex gap-2 mt-1">
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-sm">
                    {order.status}
                  </span>
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-sm">
                    {order.payment_status}
                  </span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Order Date</label>
                <p className="font-medium">{new Date(order.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Information */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Information</CardTitle>
            <CardDescription>Payment method on file for this order</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Payment Method</label>
              <div className="mt-1">
                {order.payment_method_id ? (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Payment method on file</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    <span>No payment method on file</span>
                  </div>
                )}
              </div>
            </div>

            {order.stripe_customer_id && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Stripe Customer</label>
                <p className="font-mono text-sm bg-gray-100 p-2 rounded">
                  {order.stripe_customer_id}
                </p>
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-800 mb-2">Approval Process</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>
                  &bull; Order status will change from &quot;pending&quot; to &quot;confirmed&quot;
                </li>
                <li>&bull; Customer will be charged the order amount</li>
                <li>&bull; Payment status will update to &quot;paid&quot; (if successful)</li>
                <li>&bull; Order will move to the preparation workflow</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Approval Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Approval Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <ApproveOrderClient order={order} />
        </CardContent>
      </Card>
    </div>
  )
}
