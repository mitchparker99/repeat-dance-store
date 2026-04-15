'use client'

import Link from 'next/link'
import { useCartStore } from '@/store/cart'
import { Logo } from './Logo'

export function Navigation() {
  const { itemCount, toggleCart } = useCartStore()
  const count = itemCount()

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-black">
      <nav className="max-w-screen-xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex-shrink-0">
          <Logo size="sm" />
        </Link>

        {/* Nav links */}
        <div className="hidden sm:flex items-center gap-8">
          <Link
            href="/shop"
            className="text-xs font-bold uppercase tracking-widest hover:opacity-50 transition-opacity"
          >
            Shop
          </Link>
          <Link
            href="/shop?new=true"
            className="text-xs font-bold uppercase tracking-widest hover:opacity-50 transition-opacity"
          >
            New Arrivals
          </Link>
        </div>

        {/* Cart button */}
        <button
          onClick={toggleCart}
          className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest hover:opacity-50 transition-opacity"
          aria-label={`Cart — ${count} item${count !== 1 ? 's' : ''}`}
        >
          <CartIcon />
          <span className="hidden sm:inline">Cart</span>
          {count > 0 && (
            <span className="inline-flex items-center justify-center w-5 h-5 bg-black text-white text-xs font-bold rounded-full">
              {count}
            </span>
          )}
        </button>
      </nav>
    </header>
  )
}

function CartIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M6 2 3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 01-8 0" />
    </svg>
  )
}
