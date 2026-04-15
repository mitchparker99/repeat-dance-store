'use client'

import { useRouter } from 'next/navigation'

const SORT_OPTIONS = [
  { value: 'listed-desc', label: 'Newest First' },
  { value: 'price-asc', label: 'Price: Low → High' },
  { value: 'price-desc', label: 'Price: High → Low' },
  { value: 'artist-asc', label: 'Artist A → Z' },
  { value: 'item-asc', label: 'Title A → Z' },
] as const

export function SortSelect({ current }: { current: string }) {
  const router = useRouter()

  return (
    <select
      value={current}
      onChange={(e) => router.push(`/shop?sort=${e.target.value}`)}
      className="text-xs font-bold border border-black px-3 py-2 bg-white focus:outline-none cursor-pointer"
    >
      {SORT_OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  )
}
