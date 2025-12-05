'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { CheckCircle, AlertTriangle, Loader2 } from 'lucide-react'

type Order = {
  id: string
  orderNumber: string
  payment_method_id?: string
  stripe_customer_id?: string
  amount?: number
}

type ApproveOrderClientProps = {
  order: Order
}

export function ApproveOrderClient({ order }: ApproveOrderClientProps) {
  const [isApproving, setIsApproving] = useState(false)

  const approveOrder = async () => {
    if (!order.payment_method_id || !order.stripe_customer_id) {
      toast.error('This order cannot be approved because it has no payment method on file.')
      return
    }

    setIsApproving(true)

    try {
      // Call the approve endpoint
      const response = await fetch(`/api/orders/${order.id}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to approve order')
      }

      await response.json()

      toast.success('Order approved and charged successfully!')

      // Redirect to order detail page
      window.location.href = `/admin/orders/${order.id}`
    } catch (error) {
      console.error('Error approving order:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to approve order')
    } finally {
      setIsApproving(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Status Check */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            {order.payment_method_id && order.stripe_customer_id ? (
              <>
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <p className="font-medium">Ready for Approval</p>
                  <p className="text-sm text-muted-foreground">
                    This order has a payment method on file and can be approved.
                  </p>
                </div>
              </>
            ) : (
              <>
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                <div>
                  <p className="font-medium">Cannot Approve</p>
                  <p className="text-sm text-muted-foreground">
                    This order is missing payment information and cannot be automatically approved.
                  </p>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Payment Method Details */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="p-4">
            <label className="text-sm font-medium text-muted-foreground">Payment Method</label>
            <div className="mt-1">
              {order.payment_method_id ? (
                <Badge className="bg-green-100 text-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  On File
                </Badge>
              ) : (
                <Badge className="bg-red-100 text-red-800">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Missing
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <label className="text-sm font-medium text-muted-foreground">Stripe Customer</label>
            <div className="mt-1">
              {order.stripe_customer_id ? (
                <Badge className="bg-green-100 text-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  On File
                </Badge>
              ) : (
                <Badge className="bg-red-100 text-red-800">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Missing
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Approval Button */}
      <div className="flex flex-col items-center space-y-4">
        <div className="text-center">
          <p className="text-lg font-medium">Order Total: ${(order.amount || 0).toFixed(2)}</p>
          <p className="text-sm text-muted-foreground">
            This amount will be charged to the customer&apos;s payment method on file.
          </p>
        </div>

        <Button
          onClick={approveOrder}
          disabled={isApproving || !order.payment_method_id || !order.stripe_customer_id}
          size="lg"
          className="w-full md:w-auto"
        >
          {isApproving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Approving & Charging...
            </>
          ) : (
            <>
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve & Charge Order
            </>
          )}
        </Button>

        {!order.payment_method_id || !order.stripe_customer_id ? (
          <div className="text-center text-sm text-muted-foreground">
            <p>This order cannot be automatically approved because:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              {!order.payment_method_id && <li>No payment method on file</li>}
              {!order.stripe_customer_id && <li>No Stripe customer account</li>}
            </ul>
            <p className="mt-2">
              You may need to contact the customer to collect payment information.
            </p>
          </div>
        ) : (
          <div className="text-center text-sm text-muted-foreground">
            <p>Clicking &quot;Approve &amp; Charge Order&quot; will:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Update order status to &quot;confirmed&quot;</li>
              <li>Charge the customer&apos;s payment method</li>
              <li>Update payment status to &quot;paid&quot;</li>
              <li>Send confirmation to the customer</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
