import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { getOrderById } from '@/lib/supabase'
import { formatPrice } from '@/lib/stripe'
import { UpdateOrderForm } from './UpdateOrderForm'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ id: string }>
}

const STATUS_COLORS: Record<string, string> = {
  pending_payment: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-blue-100 text-blue-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-gray-100 text-gray-600',
  refunded: 'bg-red-100 text-red-800',
}

export default async function OrderDetailPage({ params }: Props) {
  const { id } = await params
  const order = await getOrderById(id)
  if (!order) notFound()

  const statusColor = STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600'

  return (
    <div className="max-w-4xl">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/orders" className="text-xs font-bold uppercase tracking-widest hover:underline">
          ← Orders
        </Link>
        <span className="text-gray-300">/</span>
        <h1 className="text-sm font-black uppercase tracking-widest text-gray-500">
          Order {order.id.slice(0, 8).toUpperCase()}
        </h1>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Left: Order details */}
        <div className="md:col-span-2 space-y-6">

          {/* Items */}
          <div className="border border-gray-200 bg-white">
            <h2 className="text-xs font-black uppercase tracking-widest p-4 border-b border-gray-200">
              Items ({order.items.length})
            </h2>
            <ul className="divide-y divide-gray-100">
              {order.items.map((item, i) => (
                <li key={i} className="flex items-center gap-4 p-4">
                  <div className="relative w-12 h-12 flex-shrink-0 bg-gray-100 border border-gray-200">
                    {item.imageUrl && item.imageUrl !== '/placeholder-record.svg' ? (
                      <Image src={item.imageUrl} alt={item.title} fill className="object-cover" sizes="48px" />
                    ) : (
                      <div className="w-full h-full bg-gray-200" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate">{item.artist}</p>
                    <p className="text-xs text-gray-500 truncate">{item.title}</p>
                    <p className="text-xs text-gray-400">{item.condition}</p>
                  </div>
                  <span className="text-sm font-black flex-shrink-0">{formatPrice(item.price)}</span>
                </li>
              ))}
            </ul>
            <div className="p-4 border-t border-gray-200 space-y-1">
              <div className="flex justify-between text-xs text-gray-500">
                <span>Subtotal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>Shipping (EMS)</span>
                <span>{formatPrice(order.shipping_cost)}</span>
              </div>
              <div className="flex justify-between text-sm font-black border-t border-gray-200 pt-2 mt-2">
                <span>Total</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Shipping address */}
          <div className="border border-gray-200 bg-white p-4">
            <h2 className="text-xs font-black uppercase tracking-widest mb-3">Ship To</h2>
            <address className="text-sm not-italic leading-relaxed text-gray-700">
              <strong>{order.shipping_address.name}</strong><br />
              {order.shipping_address.line1}<br />
              {order.shipping_address.line2 && <>{order.shipping_address.line2}<br /></>}
              {order.shipping_address.city}
              {order.shipping_address.state ? `, ${order.shipping_address.state}` : ''}{' '}
              {order.shipping_address.postal_code}<br />
              <strong>{order.shipping_address.country_name}</strong>
            </address>
            {order.shipping_address.phone && (
              <p className="text-xs text-gray-500 mt-1">📞 {order.shipping_address.phone}</p>
            )}
          </div>
        </div>

        {/* Right: Status & update */}
        <div className="space-y-4">
          {/* Current status */}
          <div className="border border-gray-200 bg-white p-4">
            <h2 className="text-xs font-black uppercase tracking-widest mb-3">Status</h2>
            <span className={`text-xs px-3 py-1 rounded-full font-bold ${statusColor}`}>
              {order.status.replace('_', ' ').toUpperCase()}
            </span>
            {order.tracking_number && (
              <div className="mt-3">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">Tracking</p>
                <p className="text-sm font-mono">{order.tracking_number}</p>
                {order.carrier && <p className="text-xs text-gray-400">{order.carrier}</p>}
              </div>
            )}
          </div>

          {/* Customer */}
          <div className="border border-gray-200 bg-white p-4">
            <h2 className="text-xs font-black uppercase tracking-widest mb-3">Customer</h2>
            <p className="text-sm font-bold">{order.customer_name}</p>
            <p className="text-xs text-gray-500">{order.customer_email}</p>
            <p className="text-xs text-gray-400 mt-2">
              Ordered {new Date(order.created_at).toLocaleDateString('en-GB', {
                year: 'numeric', month: 'long', day: 'numeric'
              })}
            </p>
            {order.stripe_payment_intent_id && (
              <p className="text-xs font-mono text-gray-400 mt-1 break-all">
                {order.stripe_payment_intent_id}
              </p>
            )}
          </div>

          {/* Update form */}
          <div className="border border-gray-200 bg-white p-4">
            <h2 className="text-xs font-black uppercase tracking-widest mb-4">Update Order</h2>
            <UpdateOrderForm
              orderId={order.id}
              currentStatus={order.status}
              currentTracking={order.tracking_number}
              currentCarrier={order.carrier}
              currentNotes={order.notes}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
