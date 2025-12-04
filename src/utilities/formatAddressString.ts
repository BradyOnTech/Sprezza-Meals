import type { SavedAddress } from '@/components/addresses/AddressListing'

export const formatAddressString = (addr?: SavedAddress | null) => {
  if (!addr) return ''
  const parts = [
    addr.addressLine1,
    addr.addressLine2,
    [addr.city, addr.state].filter(Boolean).join(', '),
    addr.postalCode,
    addr.country,
  ]
  return parts.filter(Boolean).join(', ')
}
