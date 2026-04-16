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

    // Parse all prices to integers (JPY is zero-decimal — no fractional yen)
    const parsedItems = items.map((item) => ({
      ...item,
      price: Math.round(Number(item.price)),
    }))
    const subtotal = parsedItems.reduce((sum, i) => sum + i.price, 0)
    const shippingInt = Math.round(quote.cost)
    const total = subtotal + shippingInt

    // Create order in database (status: pending_payment)
    const order = await createOrder({
      customer_email: '', // Will be captured by Stripe
      customer_name: shippingAddress.name,
      shipping_address: shippingAddress,
      items: parsedItems.map((item) => ({
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
      shipping_cost: shippingInt,
      total,
      status: 'pending_payment',
    })

    // Create Stripe checkout session (use rounded integer items + shipping)
    const checkoutUrl = await createCheckoutSession({
      items: parsedItems,
      shippingAddress,
      shippingCost: shippingInt,
      orderId: order.id,
    })

    return NextResponse.json({ url: checkoutUrl, orderId: order.id })
  } catch (error) {
    console.error('Checkout error:', error)
    const message = error instanceof Error ? error.message : 'Checkout failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
