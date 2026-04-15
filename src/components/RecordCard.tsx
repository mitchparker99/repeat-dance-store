'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useCartStore } from '@/store/cart'
import type { CartItem } from '@/types'
import { formatPrice } from '@/lib/stripe'

interface RecordCardProps {
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

const SHORT_CONDITION: Record<string, string> = {
  'Mint (M)': 'M',
  'Near Mint (NM or M-)': 'NM',
  'Very Good Plus (VG+)': 'VG+',
  'Very Good (VG)': 'VG',
  'Good Plus (G+)': 'G+',
  'Good (G)': 'G',
  'Fair (F)': 'F',
  'Poor (P)': 'P',
}

export function RecordCard({
  listingId,
  releaseId,
  title,
  artist,
  price,
  condition,
  sleeveCondition,
  imageUrl,
  format,
  year,
  label,
  catno,
}: RecordCardProps) {
  const { addItem, hasItem } = useCartStore()
  const inCart = hasItem(listingId)

  const item: CartItem = {
    listingId,
    releaseId,
    title,
    artist,
    price,
    currency: 'JPY',
    condition,
    sleeveCondition,
    imageUrl,
    format,
    year,
    label,
    catno,
  }

  const shortCondition = SHORT_CONDITION[condition] || condition

  return (
    <div className="group border border-black hover:bg-black hover:text-white transition-colors duration-150">
      {/* Album art */}
      <Link href={`/shop/${listingId}`} className="block aspect-square overflow-hidden relative bg-gray-100">
        {imageUrl && imageUrl !== '/placeholder-record.svg' ? (
          <Image
            src={imageUrl}
            alt={`${artist} – ${title}`}
            fill
            className="object-cover group-hover:opacity-90 transition-opacity"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <PlaceholderArt title={title} artist={artist} />
        )}
      </Link>

      {/* Info */}
      <div className="p-3">
        <Link href={`/shop/${listingId}`} className="block">
          <p className="text-xs font-bold uppercase tracking-wide truncate mb-0.5">
            {artist}
          </p>
          <p className="text-xs truncate text-gray-600 group-hover:text-gray-300 mb-2">
            {title}
            {year ? ` (${year})` : ''}
          </p>
        </Link>

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-black">{formatPrice(price)}</span>
            <span className="text-xs font-bold border border-current px-1 py-0.5 leading-none">
              {shortCondition}
            </span>
          </div>

          <button
            onClick={() => !inCart && addItem(item)}
            disabled={inCart}
            className={`text-xs font-bold uppercase tracking-widest px-2 py-1.5 border transition-all duration-150 ${
              inCart
                ? 'border-current opacity-50 cursor-default'
                : 'border-current hover:bg-white hover:text-black group-hover:hover:bg-black group-hover:hover:text-white'
            }`}
          >
            {inCart ? 'In Cart' : '+ Add'}
          </button>
        </div>

        {label && (
          <p className="text-xs text-gray-400 group-hover:text-gray-500 mt-1 truncate">
            {label}{catno ? ` · ${catno}` : ''}
          </p>
        )}
      </div>
    </div>
  )
}

function PlaceholderArt({ title, artist }: { title: string; artist: string }) {
  // Generate a deterministic "color" from the title for visual variety
  const hash = (title + artist).split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  const grays = ['#e5e5e5', '#d4d4d4', '#c4c4c4', '#a3a3a3', '#737373']
  const bg = grays[hash % grays.length]

  return (
    <div
      className="w-full h-full flex items-center justify-center"
      style={{ backgroundColor: bg }}
    >
      <svg
        viewBox="0 0 80 80"
        className="w-16 h-16 text-white opacity-50"
        fill="currentColor"
        aria-hidden="true"
      >
        <circle cx="40" cy="40" r="32" />
        <circle cx="40" cy="40" r="8" fill="#888" />
        <circle cx="40" cy="40" r="3" fill="#aaa" />
      </svg>
    </div>
  )
}
