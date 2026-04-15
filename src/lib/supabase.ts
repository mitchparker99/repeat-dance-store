import { createClient } from '@supabase/supabase-js'
import type { Order, OrderStatus } from '@/types'

// Public client (for client-side use, read-only operations)
export function createSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) throw new Error('Supabase environment variables are not configured')
  return createClient(url, key)
}

// Admin client (server-side only, full access)
export function createSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Supabase service role key is not configured')
  return createClient(url, key)
}

// ─── Order Operations ─────────────────────────────────────────────────────────

export async function createOrder(
  orderData: Omit<Order, 'id' | 'created_at' | 'updated_at'>
): Promise<Order> {
  const supabase = createSupabaseAdmin()
  const { data, error } = await supabase
    .from('orders')
    .insert(orderData)
    .select()
    .single()

  if (error) throw new Error(`Failed to create order: ${error.message}`)
  return data as Order
}

export async function getOrderById(id: string): Promise<Order | null> {
  const supabase = createSupabaseAdmin()
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .single()

  if (error) return null
  return data as Order
}

export async function getOrderByStripeSession(sessionId: string): Promise<Order | null> {
  const supabase = createSupabaseAdmin()
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('stripe_session_id', sessionId)
    .single()

  if (error) return null
  return data as Order
}

export async function updateOrderStatus(
  id: string,
  status: OrderStatus,
  extra?: { tracking_number?: string; carrier?: string; notes?: string; stripe_payment_intent_id?: string }
): Promise<void> {
  const supabase = createSupabaseAdmin()
  const { error } = await supabase
    .from('orders')
    .update({ status, updated_at: new Date().toISOString(), ...extra })
    .eq('id', id)

  if (error) throw new Error(`Failed to update order: ${error.message}`)
}

export async function getAllOrders(options?: {
  status?: OrderStatus
  page?: number
  perPage?: number
}): Promise<{ orders: Order[]; total: number }> {
  const supabase = createSupabaseAdmin()
  const { status, page = 1, perPage = 25 } = options || {}

  let query = supabase
    .from('orders')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((page - 1) * perPage, page * perPage - 1)

  if (status) {
    query = query.eq('status', status)
  }

  const { data, error, count } = await query

  if (error) throw new Error(`Failed to fetch orders: ${error.message}`)
  return { orders: (data || []) as Order[], total: count || 0 }
}

export async function getOrderStats(): Promise<{
  total: number
  pending: number
  paid: number
  shipped: number
  revenue: number
}> {
  const supabase = createSupabaseAdmin()
  const { data, error } = await supabase
    .from('orders')
    .select('status, total')

  if (error) throw new Error(`Failed to fetch order stats: ${error.message}`)

  const orders = data || []
  return {
    total: orders.length,
    pending: orders.filter((o) => o.status === 'pending_payment').length,
    paid: orders.filter((o) => ['paid', 'processing'].includes(o.status)).length,
    shipped: orders.filter((o) => o.status === 'shipped').length,
    revenue: orders
      .filter((o) => !['pending_payment', 'cancelled'].includes(o.status))
      .reduce((sum, o) => sum + (o.total || 0), 0),
  }
}
