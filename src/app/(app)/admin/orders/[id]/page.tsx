import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import {
  ArrowLeft,
  Package,
  User,
  Phone,
  MapPin,
  CreditCard,
  CheckCircle,
  XCircle,
} from 'lucide-react'
import Link from 'next/link'
import { formatDateTime } from '@/utilities/formatDateTime'
import { redirect } from 'next/navigation'
import { OrderStatusClient } from './OrderStatusClient'

type OrderItem = {
  id: string
  meal_id: string
  meal_name: string
  quantity: number
  unit_price: number
  total_price: number
  customizations?: any
}

type Order = {
  id: string
  orderNumber: string
  customer_email?: string
  customer_name?: string
  customerPhone?: string
  status: string
  payment_status: string
  subtotal?: number
  tax?: number
  delivery_fee?: number
  tip?: number
  amount?: number
  deliveryDate?: string
  deliveryTimeSlot?: string
  deliveryInstructions?: string
  shipping_address?: any
  billing_address?: any
  paymentIntentId?: string
  stripe_customer_id?: string
  payment_method_id?: string
  created_at: string
  updated_at: string
  order_items?: OrderItem[]
}

async function getOrder(id: string): Promise<Order | null> {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from('orders')
    .select(
      `
      *,
      order_items (*)
    `,
    )
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching order:', error)
    return null
  }

  return data as Order
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  preparing: 'bg-purple-100 text-purple-800',
  ready_for_delivery: 'bg-indigo-100 text-indigo-800',
  out_for_delivery: 'bg-orange-100 text-orange-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  refunded: 'bg-gray-100 text-gray-800',
}

const paymentStatusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  refunded: 'bg-gray-100 text-gray-800',
  partially_refunded: 'bg-orange-100 text-orange-800',
}

const statusWorkflow: Record<string, string[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['preparing', 'cancelled'],
  preparing: ['ready_for_delivery', 'cancelled'],
  ready_for_delivery: ['out_for_delivery', 'cancelled'],
  out_for_delivery: ['delivered', 'cancelled'],
  delivered: [],
  cancelled: [],
  refunded: [],
}

export default async function AdminOrderDetailPage({
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

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/orders">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Orders
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Order {order.orderNumber}</h1>
            <p className="text-muted-foreground">
              Placed on {formatDateTime({ date: order.created_at })}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Badge className={statusColors[order.status] || 'bg-gray-100 text-gray-800'}>
            {order.status.replace('_', ' ')}
          </Badge>
          <Badge
            className={paymentStatusColors[order.payment_status] || 'bg-gray-100 text-gray-800'}
          >
            {order.payment_status.replace('_', ' ')}
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Name</label>
                  <p className="font-medium">{order.customer_name || 'Guest'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <p className="font-medium">{order.customer_email}</p>
                </div>
                {order.customerPhone && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Phone</label>
                    <p className="font-medium flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      {order.customerPhone}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Delivery Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Delivery Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Delivery Address
                </label>
                <p className="font-medium">
                  {order.shipping_address
                    ? `${order.shipping_address.street || ''}, ${order.shipping_address.city || ''}, ${order.shipping_address.state || ''} ${order.shipping_address.postal_code || ''}`.trim()
                    : 'No delivery address'}
                </p>
                <div>
                  <Badge
                    className={
                      paymentStatusColors[order.payment_status] || 'bg-gray-100 text-gray-800'
                    }
                  >
                    {order.payment_status.replace('_', ' ')}
                  </Badge>
                </div>
              </div>

              {order.paymentIntentId && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Payment Intent
                  </label>
                  <p className="font-mono text-sm">{order.paymentIntentId}</p>
                </div>
              )}

              {order.stripe_customer_id && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Stripe Customer
                  </label>
                  <p className="font-mono text-sm">{order.stripe_customer_id}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {order.status === 'pending' && (
                <Button className="w-full" asChild>
                  <Link href={`/admin/orders/${order.id}/approve`}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve Order
                  </Link>
                </Button>
              )}

              {['pending', 'confirmed', 'preparing'].includes(order.status) && (
                <Button variant="destructive" className="w-full">
                  <XCircle className="h-4 w-4 mr-2" />
                  Cancel Order
                </Button>
              )}

              <Button variant="outline" className="w-full">
                Print Order
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
