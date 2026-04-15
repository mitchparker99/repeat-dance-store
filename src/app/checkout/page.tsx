'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/store/cart'
import { formatPrice } from '@/lib/stripe'
import { getCountryList } from '@/lib/shipping'
import type { ShippingAddress, ShippingQuote } from '@/types'

const EMPTY_ADDRESS: ShippingAddress = {
  name: '',
  line1: '',
  line2: '',
  city: '',
  state: '',
  postal_code: '',
  country: '',
  country_name: '',
  phone: '',
}

export default function CheckoutPage() {
  const { items, total, clearCart } = useCartStore()
  const router = useRouter()
  const [address, setAddress] = useState<ShippingAddress>(EMPTY_ADDRESS)
  const [shipping, setShipping] = useState<ShippingQuote | null>(null)
  const [loadingShipping, setLoadingShipping] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const countries = getCountryList()
  const subtotal = total()

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0) router.push('/shop')
  }, [items.length, router])

  // Calculate shipping when country changes
  useEffect(() => {
    if (!address.country) {
      setShipping(null)
      return
    }
    setLoadingShipping(true)
    fetch('/api/shipping', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        countryCode: address.country,
        items: items.map((i) => ({ format: i.format })),
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        setShipping(data.shipping || null)
        setLoadingShipping(false)
      })
      .catch(() => setLoadingShipping(false))
  }, [address.country, items])

  const handleCountryChange = (code: string) => {
    const country = countries.find((c) => c.code === code)
    setAddress((prev) => ({
      ...prev,
      country: code,
      country_name: country?.name || code,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!shipping) return
    setSubmitting(true)
    setError('')

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, shippingAddress: address, shippingCost: shipping.cost }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Checkout failed')
      window.location.href = data.url
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setSubmitting(false)
    }
  }

  const grandTotal = subtotal + (shipping?.cost || 0)

  if (items.length === 0) return null

  return (
    <div className="max-w-screen-lg mx-auto px-4 sm:px-6 py-8">
      <nav className="text-xs text-gray-500 mb-8">
        <Link href="/shop" className="hover:underline">Shop</Link>
        {' / '}
        <span className="text-black">Checkout</span>
      </nav>

      <h1 className="heading-lg mb-8">Checkout</h1>

      <form onSubmit={handleSubmit}>
        <div className="grid md:grid-cols-3 gap-8">
          {/* ── Shipping Address ───────────────────────────────────────── */}
          <div className="md:col-span-2 space-y-6">
            <div className="border border-black p-6">
              <h2 className="text-xs font-black uppercase tracking-widest mb-6">
                Shipping Address
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="label" htmlFor="name">Full Name *</label>
                  <input
                    id="name"
                    type="text"
                    required
                    className="input"
                    value={address.name}
                    onChange={(e) => setAddress((p) => ({ ...p, name: e.target.value }))}
                    placeholder="Your full name"
                  />
                </div>

                <div>
                  <label className="label" htmlFor="country">Country *</label>
                  <select
                    id="country"
                    required
                    className="input"
                    value={address.country}
                    onChange={(e) => handleCountryChange(e.target.value)}
                  >
                    <option value="">Select country…</option>
                    {countries.map((c) => (
                      <option key={c.code} value={c.code}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label" htmlFor="line1">Address Line 1 *</label>
                  <input
                    id="line1"
                    type="text"
                    required
                    className="input"
                    value={address.line1}
                    onChange={(e) => setAddress((p) => ({ ...p, line1: e.target.value }))}
                    placeholder="Street address, building, apartment"
                  />
                </div>

                <div>
                  <label className="label" htmlFor="line2">Address Line 2</label>
                  <input
                    id="line2"
                    type="text"
                    className="input"
                    value={address.line2}
                    onChange={(e) => setAddress((p) => ({ ...p, line2: e.target.value }))}
                    placeholder="Optional"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label" htmlFor="city">City *</label>
                    <input
                      id="city"
                      type="text"
                      required
                      className="input"
                      value={address.city}
                      onChange={(e) => setAddress((p) => ({ ...p, city: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="label" htmlFor="state">State / Region</label>
                    <input
                      id="state"
                      type="text"
                      className="input"
                      value={address.state}
                      onChange={(e) => setAddress((p) => ({ ...p, state: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label" htmlFor="postal_code">Postal Code *</label>
                    <input
                      id="postal_code"
                      type="text"
                      required
                      className="input"
                      value={address.postal_code}
                      onChange={(e) => setAddress((p) => ({ ...p, postal_code: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="label" htmlFor="phone">Phone (optional)</label>
                    <input
                      id="phone"
                      type="tel"
                      className="input"
                      value={address.phone}
                      onChange={(e) => setAddress((p) => ({ ...p, phone: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Shipping method */}
            {address.country && (
              <div className="border border-black p-6">
                <h2 className="text-xs font-black uppercase tracking-widest mb-4">
                  Shipping Method
                </h2>
                {loadingShipping ? (
                  <p className="text-sm text-gray-500">Calculating shipping…</p>
                ) : shipping ? (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold">{shipping.service}</p>
                      <p className="text-xs text-gray-500">{shipping.estimatedDays}</p>
                    </div>
                    <span className="text-sm font-black">{formatPrice(shipping.cost)}</span>
                  </div>
                ) : (
                  <p className="text-sm text-red-600">
                    Sorry, we cannot ship to this country at this time.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* ── Order Summary ────────────────────────────────────────────── */}
          <div className="space-y-4">
            <div className="border border-black">
              <h2 className="text-xs font-black uppercase tracking-widest p-4 border-b border-black">
                Order Summary
              </h2>

              <ul className="divide-y divide-gray-100">
                {items.map((item) => (
                  <li key={item.listingId} className="flex gap-3 p-4">
                    <div className="relative w-12 h-12 flex-shrink-0 border border-gray-200">
                      {item.imageUrl && item.imageUrl !== '/placeholder-record.svg' ? (
                        <Image src={item.imageUrl} alt={item.title} fill className="object-cover" sizes="48px" />
                      ) : (
                        <div className="w-full h-full bg-gray-200" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold truncate">{item.artist}</p>
                      <p className="text-xs text-gray-500 truncate">{item.title}</p>
                    </div>
                    <span className="text-xs font-black flex-shrink-0">{formatPrice(item.price)}</span>
                  </li>
                ))}
              </ul>

              <div className="p-4 border-t border-black space-y-2">
                <div className="flex justify-between text-xs">
                  <span>Subtotal</span>
                  <span className="font-bold">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>Shipping (EMS)</span>
                  <span className="font-bold">
                    {loadingShipping ? '…' : shipping ? formatPrice(shipping.cost) : '—'}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-black border-t border-black pt-2 mt-2">
                  <span>Total</span>
                  <span>{formatPrice(shipping ? grandTotal : subtotal)}</span>
                </div>
              </div>
            </div>

            {error && (
              <div className="border border-red-500 p-4 text-xs text-red-600 font-medium">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={!shipping || submitting}
              className="btn-primary w-full disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {submitting ? 'Redirecting…' : 'Proceed to Payment →'}
            </button>

            <p className="text-xs text-gray-500 text-center">
              Secure payment via Stripe. All major cards accepted.
            </p>
          </div>
        </div>
      </form>
    </div>
  )
}
