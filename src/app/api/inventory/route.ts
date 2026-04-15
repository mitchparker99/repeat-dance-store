import { NextRequest, NextResponse } from 'next/server'
import { getInventory } from '@/lib/discogs'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1', 10)
  const perPage = Math.min(parseInt(searchParams.get('per_page') || '24', 10), 100)
  const sort = (searchParams.get('sort') || 'listed') as 'listed' | 'price' | 'item' | 'artist'
  const sortOrder = (searchParams.get('sort_order') || 'desc') as 'asc' | 'desc'

  try {
    const data = await getInventory({ page, perPage, sort, sortOrder })
    return NextResponse.json(data)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch inventory'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
