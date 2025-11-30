'use client'

import { AddressItem } from '@/components/addresses/AddressItem'
import { CreateAddressModal } from '@/components/addresses/CreateAddressModal'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useState } from 'react'
import type { SavedAddress } from '@/components/addresses/AddressListing'

type Props = {
  addresses: SavedAddress[]
  setAddress: React.Dispatch<React.SetStateAction<SavedAddress | undefined>>
  heading?: string
  description?: string
  onRefresh?: () => void
}

export const CheckoutAddresses: React.FC<Props> = ({
  addresses,
  setAddress,
  heading = 'Addresses',
  description = 'Please select or add your shipping and billing addresses.',
  onRefresh,
}) => {
  if (!addresses || addresses.length === 0) {
    return (
      <div>
        <p>No addresses found. Please add an address.</p>

        <CreateAddressModal onSaved={onRefresh} />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h3 className="text-xl font-medium mb-2">{heading}</h3>
        <p className="text-muted-foreground">{description}</p>
      </div>
      <AddressesModal addresses={addresses} onRefresh={onRefresh} setAddress={setAddress} />
    </div>
  )
}

const AddressesModal: React.FC<Props> = ({ addresses, setAddress, onRefresh }) => {
  const [open, setOpen] = useState(false)
  const handleOpenChange = (state: boolean) => {
    setOpen(state)
  }

  const closeModal = () => {
    setOpen(false)
  }

  if (!addresses || addresses.length === 0) {
    return <p>No addresses found. Please add an address.</p>
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant={'outline'}>{'Select an address'}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{'Select an address'}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-12">
          <ul className="flex flex-col gap-8">
            {addresses.map((address) => (
              <li key={address.id} className="border-b pb-8 last:border-none">
                <AddressItem
                  address={address}
                  beforeActions={
                    <Button
                      onClick={(e) => {
                        e.preventDefault()
                        setAddress(address)
                        closeModal()
                      }}
                    >
                      Select
                    </Button>
                  }
                />
              </li>
            ))}
          </ul>

          <CreateAddressModal onSaved={onRefresh} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
