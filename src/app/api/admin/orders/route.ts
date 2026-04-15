import { NextRequest, NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/auth'
import { getAllOrders } from '@/lib/supabase'
import type { OrderStatus } from '@/types'

export async function GET(request: NextRequest) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1', 10)
  const perPage = parseInt(searchParams.get('per_page') || '25', 10)
  const status = searchParams.get('status') as OrderStatus | null

  try {
    const result = await getAllOrders({ status: status || undefined, page, perPage })
    return NextResponse.json(result)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch orders'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
