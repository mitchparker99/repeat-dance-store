import { NextRequest, NextResponse } from 'next/server'
import { calculateShipping } from '@/lib/shipping'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { countryCode, items } = body as {
      countryCode: string
      items: { format: string }[]
    }

    if (!countryCode || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'countryCode and items are required' }, { status: 400 })
    }

    const quote = calculateShipping(items, countryCode)
    if (!quote) {
      return NextResponse.json(
        { error: 'Shipping not available to this country' },
        { status: 422 }
      )
    }

    return NextResponse.json({ shipping: quote })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to calculate shipping' }, { status: 500 })
  }
}
