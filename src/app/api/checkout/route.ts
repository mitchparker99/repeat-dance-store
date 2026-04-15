import { NextRequest, NextResponse } from 'next/server'
import { createCheckoutSession } from '@/lib/stripe'
import { createOrder } from '@/lib/supabase'
import { calculateShipping } from '@/lib/shipping'
import type { CartItem, ShippingAddress } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { items, shippingAddress, shippingCost } = body as {
      items: CartItem[]
      shippingAddress: ShippingAddress
      shippingCost: number
    }

    // Validate inputs
    if (!items?.length) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
    }
    if (!shippingAddress?.country) {
      return NextResponse.json({ error: 'Shipping address is required' }, { status: 400 })
    }

    // Re-validate shipping cost server-side (don't trust client)
    const quote = calculateShipping(
      items.map((i) => ({ format: i.format })),
      shippingAddress.country
    )
    if (!quote) {
      return NextResponse.json(
        { error: 'Shipping not available to this country' },
        { status: 422 }
      )
    }

    const subtotal = items.reduce((sum, i) => sum + i.price, 0)
    const total = subtotal + quote.cost

    // Create order in database (status: pending_payment)
    const order = await createOrder({
      customer_email: '', // Will be captured by Stripe
      customer_name: shippingAddress.name,
      shipping_address: shippingAddress,
      items: items.map((item) => ({
        listingId: item.listingId,
        releaseId: item.releaseId,
        title: item.title,
        artist: item.artist,
        price: item.price,
        condition: item.condition,
        sleeveCondition: item.sleeveCondition,
        imageUrl: item.imageUrl,
        format: item.format,
      })),
      subtotal,
      shipping_cost: quote.cost,
      total,
      status: 'pending_payment',
    })

    // Create Stripe checkout session
    const checkoutUrl = await createCheckoutSession({
      items,
      shippingAddress,
      shippingCost: quote.cost,
      orderId: order.id,
    })

    return NextResponse.json({ url: checkoutUrl, orderId: order.id })
  } catch (error) {
    console.error('Checkout error:', error)
    const message = error instanceof Error ? error.message : 'Checkout failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
