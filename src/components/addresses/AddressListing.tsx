'use client'

import React from 'react'
import { AddressItem } from '@/components/addresses/AddressItem'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { useAuth } from '@/providers/Auth'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export type SavedAddress = {
  id: number | string
  title?: string | null
  firstName?: string | null
  lastName?: string | null
  company?: string | null
  addressLine1?: string | null
  addressLine2?: string | null
  city?: string | null
  state?: string | null
  postalCode?: string | null
  country?: string | null
  phone?: string | null
  isDefault?: boolean | null
}

export const AddressListing: React.FC<{ refreshKey?: number }> = ({ refreshKey }) => {
  const { user } = useAuth()
  const [addresses, setAddresses] = React.useState<SavedAddress[]>([])
  const supabase = React.useMemo(() => createSupabaseBrowserClient(), [])
  const router = useRouter()

  const fetchAddresses = React.useCallback(async () => {
    if (!user) return
    const { data, error } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', user.id)
      .order('is_default', { ascending: false })
      .order('updated_at', { ascending: false })

    if (error) {
      toast.error('Unable to load addresses.')
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

  React.useEffect(() => {
    void fetchAddresses()
  }, [fetchAddresses, refreshKey])

  React.useEffect(() => {
    if (!user) {
      router.push('/login')
    }
  }, [user, router])

  if (!addresses || addresses.length === 0) {
    return <p>No addresses found.</p>
  }

  return (
    <div>
      <ul className="flex flex-col gap-8">
        {addresses.map((address) => (
          <li key={address.id} className="border-b pb-8 last:border-none">
            <AddressItem address={address} />
          </li>
        ))}
      </ul>
    </div>
  )
}
