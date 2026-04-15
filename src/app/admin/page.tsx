import Link from 'next/link'
import { getOrderStats } from '@/lib/supabase'
import { getAllOrders } from '@/lib/supabase'
import { formatPrice } from '@/lib/stripe'
import type { Order } from '@/types'

export const dynamic = 'force-dynamic'

const STATUS_COLORS: Record<string, string> = {
  pending_payment: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-blue-100 text-blue-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-gray-100 text-gray-600',
  refunded: 'bg-red-100 text-red-800',
}

export default async function AdminDashboard() {
  const [stats, { orders: recentOrders }] = await Promise.all([
    getOrderStats().catch(() => ({ total: 0, pending: 0, paid: 0, shipped: 0, revenue: 0 })),
    getAllOrders({ perPage: 10 }).catch(() => ({ orders: [], total: 0 })),
  ])

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-black uppercase tracking-tight">Dashboard</h1>
        <span className="text-xs text-gray-400">
          {new Date().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        <StatCard label="Total Orders" value={stats.total.toString()} />
        <StatCard label="Awaiting Payment" value={stats.pending.toString()} highlight />
        <StatCard label="To Ship" value={stats.paid.toString()} highlight />
        <StatCard label="Revenue" value={formatPrice(stats.revenue)} />
      </div>

      {/* Recent orders */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-black uppercase tracking-widest">Recent Orders</h2>
          <Link href="/admin/orders" className="text-xs font-bold uppercase tracking-widest hover:underline">
            View All →
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="border border-dashed border-gray-300 p-10 text-center text-sm text-gray-400">
            No orders yet
          </div>
        ) : (
          <div className="border border-gray-200 divide-y divide-gray-100">
            {recentOrders.map((order) => (
              <OrderRow key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`border p-4 ${highlight ? 'border-black bg-black text-white' : 'border-gray-200 bg-white'}`}>
      <p className={`text-xs font-bold uppercase tracking-widest mb-1 ${highlight ? 'text-white/60' : 'text-gray-500'}`}>
        {label}
      </p>
      <p className="text-2xl font-black">{value}</p>
    </div>
  )
}

function OrderRow({ order }: { order: Order }) {
  const statusColor = STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600'
  return (
    <Link href={`/admin/orders/${order.id}`} className="flex items-center gap-4 px-4 py-3 hover:bg-gray-50 transition-colors">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold truncate">{order.customer_name || order.customer_email}</p>
        <p className="text-xs text-gray-500">
          {order.items.length} item{order.items.length !== 1 ? 's' : ''} ·{' '}
          {order.shipping_address.country_name}
        </p>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="text-sm font-black">{formatPrice(order.total)}</p>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor}`}>
          {order.status.replace('_', ' ')}
        </span>
      </div>
      <p className="text-xs text-gray-400 flex-shrink-0 w-24 text-right">
        {new Date(order.created_at).toLocaleDateString('en-GB')}
      </p>
    </Link>
  )
}
