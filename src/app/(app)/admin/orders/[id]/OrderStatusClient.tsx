'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'

type Order = {
  id: string
  status: string
  payment_status: string
}

type OrderStatusClientProps = {
  order: Order
  possibleStatuses: string[]
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

export function OrderStatusClient({ order, possibleStatuses }: OrderStatusClientProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<string>('')

  const supabase = createSupabaseBrowserClient()

  const updateOrderStatus = async (newStatus: string) => {
    if (!newStatus || newStatus === order.status) return

    setIsUpdating(true)

    try {
      const { error } = await supabase
        .from('orders')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', order.id)

      if (error) {
        throw error
      }

      toast.success(`Order status updated to ${newStatus.replace('_', ' ')}`)
      setSelectedStatus('')

      // Refresh the page to show updated status
      window.location.reload()
    } catch (error) {
      console.error('Error updating order status:', error)
      toast.error('Failed to update order status')
    } finally {
      setIsUpdating(false)
    }
  }

  if (possibleStatuses.length === 0) {
    return (
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium">Current Status</label>
          <div className="mt-1">
            <Badge className={statusColors[order.status] || 'bg-gray-100 text-gray-800'}>
              {order.status.replace('_', ' ')}
            </Badge>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">This order is in its final status.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium">Current Status</label>
        <div className="mt-1">
          <Badge className={statusColors[order.status] || 'bg-gray-100 text-gray-800'}>
            {order.status.replace('_', ' ')}
          </Badge>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">Update Status</label>
        <div className="mt-2 space-y-2">
          <Select value={selectedStatus} onValueChange={setSelectedStatus} disabled={isUpdating}>
            <SelectTrigger>
              <SelectValue placeholder="Select new status" />
            </SelectTrigger>
            <SelectContent>
              {possibleStatuses.map((status) => (
                <SelectItem key={status} value={status}>
                  {status.replace('_', ' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            onClick={() => updateOrderStatus(selectedStatus)}
            disabled={!selectedStatus || isUpdating}
            className="w-full"
            size="sm"
          >
            {isUpdating ? 'Updating...' : 'Update Status'}
          </Button>
        </div>
      </div>
    </div>
  )
}
