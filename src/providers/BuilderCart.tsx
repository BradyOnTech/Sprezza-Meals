'use client'

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'

export type BuilderCartItem = {
  id: string
  base: { id: number; name?: string; price?: number }
  options: { id: number; name?: string; priceAdjustment?: number }[]
  totals: {
    price: number
    nutrition: {
      calories: number
      protein: number
      carbs: number
      fat: number
      fiber?: number
      sugar?: number
    }
  }
  quantity: number
}

type Context = {
  items: BuilderCartItem[]
  addItem: (item: Omit<BuilderCartItem, 'id' | 'quantity'>) => void
  updateQuantity: (id: string, quantity: number) => void
  removeItem: (id: string) => void
  clear: () => void
}

const BuilderCartContext = createContext<Context | undefined>(undefined)

const STORAGE_KEY = 'builder-cart'

export function BuilderCartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<BuilderCartItem[]>([])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        setItems(JSON.parse(stored))
      } catch {
        setItems([])
      }
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  const addItem = (item: Omit<BuilderCartItem, 'id' | 'quantity'>) => {
    setItems((prev) => [
      ...prev,
      {
        ...item,
        id: crypto.randomUUID(),
        quantity: 1,
      },
    ])
  }

  const updateQuantity = (id: string, quantity: number) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item)),
    )
  }

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }

  const clear = () => setItems([])

  const value = useMemo(
    () => ({
      items,
      addItem,
      updateQuantity,
      removeItem,
      clear,
    }),
    [items],
  )

  return <BuilderCartContext.Provider value={value}>{children}</BuilderCartContext.Provider>
}

export function useBuilderCart() {
  const ctx = useContext(BuilderCartContext)
  if (!ctx) throw new Error('useBuilderCart must be used within BuilderCartProvider')
  return ctx
}
