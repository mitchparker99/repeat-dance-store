'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartItem } from '@/types'

interface CartStore {
  items: CartItem[]
  isOpen: boolean
  addItem: (item: CartItem) => void
  removeItem: (listingId: string) => void
  clearCart: () => void
  openCart: () => void
  closeCart: () => void
  toggleCart: () => void
  total: () => number
  itemCount: () => number
  hasItem: (listingId: string) => boolean
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (item) =>
        set((state) => {
          // Each vinyl record is a unique item — prevent duplicates
          if (state.items.find((i) => i.listingId === item.listingId)) {
            return { ...state, isOpen: true }
          }
          return { items: [...state.items, item], isOpen: true }
        }),

      removeItem: (listingId) =>
        set((state) => ({
          items: state.items.filter((i) => i.listingId !== listingId),
        })),

      clearCart: () => set({ items: [] }),

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

      total: () => get().items.reduce((sum, item) => sum + item.price, 0),
      itemCount: () => get().items.length,
      hasItem: (listingId) => !!get().items.find((i) => i.listingId === listingId),
    }),
    {
      name: 'repeat-dance-cart',
      // Only persist items, not UI state
      partialize: (state) => ({ items: state.items }),
    }
  )
)
