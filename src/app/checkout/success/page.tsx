'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useCartStore } from '@/store/cart'
import { Logo } from '@/components/Logo'
import { Suspense } from 'react'

function SuccessContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const { clearCart } = useCartStore()
  const [cleared, setCleared] = useState(false)

  useEffect(() => {
    if (!cleared && sessionId) {
      clearCart()
      setCleared(true)
    }
  }, [cleared, sessionId, clearCart])

  return (
    <div className="max-w-lg mx-auto px-4 py-20 text-center">
      <div className="mb-8">
        <Logo size="lg" className="justify-center mb-6" />
        <div className="w-16 h-16 border-2 border-black rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
      </div>

      <h1 className="text-2xl font-black uppercase tracking-tight mb-3">
        Order Confirmed
      </h1>
      <p className="text-sm text-gray-600 mb-8 leading-relaxed">
        Thank you for your order! You should receive a confirmation email shortly.
        Your records will be shipped from Tokyo via Japan Post EMS.
      </p>

      {sessionId && (
        <p className="text-xs text-gray-400 font-mono mb-8 border border-gray-200 p-3 break-all">
          Order ref: {sessionId.slice(-12)}
        </p>
      )}

      <div className="space-y-3">
        <Link href="/shop" className="btn-primary block">
          Continue Shopping →
        </Link>
        <Link href="/" className="btn-secondary block text-xs">
          Back to Home
        </Link>
      </div>
    </div>
  )
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-sm text-gray-500">Loading…</div>}>
      <SuccessContent />
    </Suspense>
  )
}
