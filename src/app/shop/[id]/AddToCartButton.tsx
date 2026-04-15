'use client'

import { useCartStore } from '@/store/cart'
import type { CartItem } from '@/types'

interface Props {
  listingId: string
  releaseId: string
  title: string
  artist: string
  price: number
  condition: string
  sleeveCondition: string
  imageUrl: string
  format: string
  year?: number
  label?: string
  catno?: string
}

export function AddToCartButton(props: Props) {
  const { addItem, hasItem, openCart } = useCartStore()
  const inCart = hasItem(props.listingId)

  const item: CartItem = {
    listingId: props.listingId,
    releaseId: props.releaseId,
    title: props.title,
    artist: props.artist,
    price: props.price,
    currency: 'JPY',
    condition: props.condition,
    sleeveCondition: props.sleeveCondition,
    imageUrl: props.imageUrl,
    format: props.format,
    year: props.year,
    label: props.label,
    catno: props.catno,
  }

  if (inCart) {
    return (
      <button
        onClick={openCart}
        className="btn-secondary w-full text-sm"
      >
        View in Cart →
      </button>
    )
  }

  return (
    <button
      onClick={() => addItem(item)}
      className="btn-primary w-full text-sm"
    >
      Add to Cart
    </button>
  )
}
