import Link from 'next/link'
import { getAllOrders } from '@/lib/supabase'
import { formatPrice } from '@/lib/stripe'
import type { Order, OrderStatus } from '@/types'

export const dynamic = 'force-dynamic'

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'All Orders' },
  { value: 'pending_payment', label: 'Pending Payment' },
  { value: 'paid', label: 'Paid' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'refunded', label: 'Refunded' },
]

const STATUS_COLORS: Record<string, string> = {
  pending_payment: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-blue-100 text-blue-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-gray-100 text-gray-600',
  refunded: 'bg-red-100 text-red-800',
}

interface OrdersPageProps {
  searchParams: Promise<{ status?: string; page?: string }>
}

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
  const params = await searchParams
  const page = parseInt(params.page || '1', 10)
  const status = params.status as OrderStatus | undefined

  const { orders, total } = await getAllOrders({ status, page, perPage: 25 }).catch(() => ({
    orders: [],
    total: 0,
  }))

  const totalPages = Math.ceil(total / 25)

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-black uppercase tracking-tight">Orders</h1>
        <span className="text-xs text-gray-400">{total} total</span>
      </div>

      {/* Status filter tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {STATUS_OPTIONS.map((opt) => (
          <Link
            key={opt.value}
            href={`/admin/orders${opt.value ? `?status=${opt.value}` : ''}`}
            className={`text-xs font-bold uppercase tracking-widest px-3 py-1.5 border transition-colors ${
              (status || '') === opt.value
                ? 'bg-black text-white border-black'
                : 'bg-white text-black border-gray-300 hover:border-black'
            }`}
          >
            {opt.label}
          </Link>
        ))}
      </div>

      {/* Orders table */}
      {orders.length === 0 ? (
        <div className="border border-dashed border-gray-300 p-16 text-center text-sm text-gray-400">
          No orders found
        </div>
      ) : (
        <div className="border border-gray-200">
          {/* Table header */}
          <div className="grid grid-cols-12 gap-4 px-4 py-2 bg-gray-50 text-xs font-bold uppercase tracking-widest text-gray-500 border-b border-gray-200">
            <span className="col-span-3">Customer</span>
            <span className="col-span-2">Items</span>
            <span className="col-span-2">Total</span>
            <span className="col-span-2">Status</span>
            <span className="col-span-2">Country</span>
            <span className="col-span-1">Date</span>
          </div>

          <div className="divide-y divide-gray-100">
            {orders.map((order) => (
              <OrderTableRow key={order.id} order={order} />
            ))}
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          {page > 1 && (
            <Link href={`/admin/orders?${status ? `status=${status}&` : ''}page=${page - 1}`}
              className="text-xs font-bold border border-gray-300 px-3 py-1.5 hover:border-black">
              ← Prev
            </Link>
          )}
          <span className="text-xs font-bold px-4">{page} / {totalPages}</span>
          {page < totalPages && (
            <Link href={`/admin/orders?${status ? `status=${status}&` : ''}page=${page + 1}`}
              className="text-xs font-bold border border-gray-300 px-3 py-1.5 hover:border-black">
              Next →
            </Link>
          )}
        </div>
      )}
    </div>
  )
}

function OrderTableRow({ order }: { order: Order }) {
  const statusColor = STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600'
  return (
    <Link
      href={`/admin/orders/${order.id}`}
      className="grid grid-cols-12 gap-4 px-4 py-3 hover:bg-gray-50 transition-colors items-center"
    >
      <div className="col-span-3 min-w-0">
        <p className="text-sm font-bold truncate">{order.customer_name || '—'}</p>
        <p className="text-xs text-gray-500 truncate">{order.customer_email}</p>
      </div>
      <div className="col-span-2 text-xs text-gray-600">
        {order.items.length} record{order.items.length !== 1 ? 's' : ''}
      </div>
      <div className="col-span-2 text-sm font-black">{formatPrice(order.total)}</div>
      <div className="col-span-2">
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor}`}>
          {order.status.replace('_', ' ')}
        </span>
      </div>
      <div className="col-span-2 text-xs text-gray-600">
        {order.shipping_address.country_name}
      </div>
      <div className="col-span-1 text-xs text-gray-400">
        {new Date(order.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' })}
      </div>
    </Link>
  )
}
