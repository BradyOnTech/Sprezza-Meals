'use client'

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'

export type MealCartItem = {
  id: string
  mealId?: number | string
  slug?: string
  title?: string
  price?: number
  imageUrl?: string
  quantity: number
}

type Context = {
  items: MealCartItem[]
  addItem: (item: Omit<MealCartItem, 'id' | 'quantity'>) => void
  updateQuantity: (id: string, quantity: number) => void
  removeItem: (id: string) => void
  clear: () => void
}

const MealCartContext = createContext<Context | undefined>(undefined)

const STORAGE_KEY = 'meal-cart'

export function MealCartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<MealCartItem[]>([])

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

  const addItem = (item: Omit<MealCartItem, 'id' | 'quantity'>) => {
    const generateId = () => {
      try {
        return crypto.randomUUID()
      } catch {
        return Math.random().toString(36).substr(2, 9)
      }
    }

    setItems((prev) => [...prev, { ...item, id: generateId(), quantity: 1 }])
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

  return <MealCartContext.Provider value={value}>{children}</MealCartContext.Provider>
}

export function useMealCart() {
  const ctx = useContext(MealCartContext)
  if (!ctx) throw new Error('useMealCart must be used within MealCartProvider')
  return ctx
}
