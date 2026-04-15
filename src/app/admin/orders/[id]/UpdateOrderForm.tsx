'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { OrderStatus } from '@/types'

const STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: 'pending_payment', label: 'Pending Payment' },
  { value: 'paid', label: 'Paid' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'refunded', label: 'Refunded' },
]

interface Props {
  orderId: string
  currentStatus: string
  currentTracking?: string
  currentCarrier?: string
  currentNotes?: string
}

export function UpdateOrderForm({ orderId, currentStatus, currentTracking, currentCarrier, currentNotes }: Props) {
  const router = useRouter()
  const [status, setStatus] = useState<OrderStatus>(currentStatus as OrderStatus)
  const [tracking, setTracking] = useState(currentTracking || '')
  const [carrier, setCarrier] = useState(currentCarrier || 'Japan Post EMS')
  const [notes, setNotes] = useState(currentNotes || '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, tracking_number: tracking, carrier, notes }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Update failed')
      }
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="label text-xs" htmlFor="status">Status</label>
        <select
          id="status"
          className="input text-xs"
          value={status}
          onChange={(e) => setStatus(e.target.value as OrderStatus)}
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="label text-xs" htmlFor="tracking">Tracking Number</label>
        <input
          id="tracking"
          type="text"
          className="input text-xs"
          value={tracking}
          onChange={(e) => setTracking(e.target.value)}
          placeholder="e.g. EJ123456789JP"
        />
      </div>

      <div>
        <label className="label text-xs" htmlFor="carrier">Carrier</label>
        <input
          id="carrier"
          type="text"
          className="input text-xs"
          value={carrier}
          onChange={(e) => setCarrier(e.target.value)}
        />
      </div>

      <div>
        <label className="label text-xs" htmlFor="notes">Notes</label>
        <textarea
          id="notes"
          className="input text-xs resize-none"
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Internal notes…"
        />
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={saving}
        className={`btn-primary w-full text-xs disabled:opacity-50 ${saved ? 'bg-green-700' : ''}`}
      >
        {saving ? 'Saving…' : saved ? 'Saved ✓' : 'Update Order'}
      </button>
    </form>
  )
}
