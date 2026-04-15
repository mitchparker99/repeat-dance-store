'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useCartStore } from '@/store/cart'
import { formatPrice } from '@/lib/stripe'

export function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, total, itemCount } = useCartStore()
  const count = itemCount()
  const cartTotal = total()

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 z-50 animate-fade-in"
        onClick={closeCart}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside
        className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-white border-l border-black z-50 flex flex-col animate-slide-in-right"
        aria-label="Shopping cart"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-black">
          <h2 className="text-sm font-black uppercase tracking-widest">
            Cart {count > 0 ? `(${count})` : ''}
          </h2>
          <button
            onClick={closeCart}
            className="p-1 hover:opacity-50 transition-opacity"
            aria-label="Close cart"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 px-5 text-center">
              <p className="text-sm font-bold uppercase tracking-widest">Your cart is empty</p>
              <button
                onClick={closeCart}
                className="btn-secondary text-xs"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <ul className="divide-y divide-black">
              {items.map((item) => (
                <li key={item.listingId} className="flex gap-3 p-4">
                  {/* Thumbnail */}
                  <div className="relative w-16 h-16 flex-shrink-0 bg-gray-100 border border-black">
                    {item.imageUrl && item.imageUrl !== '/placeholder-record.svg' ? (
                      <Image
                        src={item.imageUrl}
                        alt={item.title}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-200">
                        <svg viewBox="0 0 40 40" className="w-8 h-8 text-gray-400" fill="currentColor">
                          <circle cx="20" cy="20" r="16" />
                          <circle cx="20" cy="20" r="4" fill="white" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold uppercase truncate">{item.artist}</p>
                    <p className="text-xs truncate text-gray-500 mb-1">{item.title}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black">{formatPrice(item.price)}</span>
                      <span className="text-xs border border-black px-1 leading-5">
                        {item.condition.split(' ')[0]}
                      </span>
                    </div>
                  </div>

                  {/* Remove */}
                  <button
                    onClick={() => removeItem(item.listingId)}
                    className="flex-shrink-0 p-1 hover:opacity-50 transition-opacity self-start"
                    aria-label={`Remove ${item.title}`}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-black p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest">Subtotal</span>
              <span className="text-lg font-black">{formatPrice(cartTotal)}</span>
            </div>
            <p className="text-xs text-gray-500">Shipping calculated at checkout</p>
            <Link
              href="/checkout"
              className="btn-primary w-full text-center"
              onClick={closeCart}
            >
              Checkout →
            </Link>
            <button
              onClick={closeCart}
              className="btn-secondary w-full text-xs"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </aside>
    </>
  )
}
