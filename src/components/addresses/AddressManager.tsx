'use client'

import React from 'react'
import { AddressListing } from '@/components/addresses/AddressListing'
import { CreateAddressModal } from '@/components/addresses/CreateAddressModal'

export function AddressManager() {
  const [refreshKey, setRefreshKey] = React.useState(0)

  const handleSaved = () => {
    setRefreshKey((prev) => prev + 1)
  }

  return (
    <>
      <div className="mb-8">
        <AddressListing refreshKey={refreshKey} />
      </div>

      <CreateAddressModal onSaved={handleSaved} />
    </>
  )
}
