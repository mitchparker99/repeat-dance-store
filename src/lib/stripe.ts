import Stripe from 'stripe'
import type { CartItem, ShippingAddress } from '@/types'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
  typescript: true,
})

export async function createCheckoutSession({
  items,
  shippingAddress,
  shippingCost,
  orderId,
}: {
  items: CartItem[]
  shippingAddress: ShippingAddress
  shippingCost: number
  orderId: string
}): Promise<string> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map((item) => ({
    price_data: {
      currency: 'jpy',
      product_data: {
        name: `${item.artist} – ${item.title}`,
        description: `Condition: ${item.condition} / Sleeve: ${item.sleeveCondition}`,
        images: item.imageUrl && item.imageUrl !== '/placeholder-record.svg'
          ? [item.imageUrl]
          : undefined,
        metadata: {
          listing_id: item.listingId,
          release_id: item.releaseId,
        },
      },
      unit_amount: Math.round(item.price), // JPY is a zero-decimal currency
    },
    quantity: 1,
  }))

  // Add shipping as a line item
  lineItems.push({
    price_data: {
      currency: 'jpy',
      product_data: {
        name: 'Japan Post EMS Shipping',
        description: `International shipping to ${shippingAddress.country_name}`,
      },
      unit_amount: Math.round(shippingCost),
    },
    quantity: 1,
  })

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: lineItems,
    mode: 'payment',
    success_url: `${appUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/checkout`,
    customer_email: undefined, // collected in Stripe
    metadata: {
      order_id: orderId,
    },
    payment_intent_data: {
      metadata: {
        order_id: orderId,
      },
    },
    shipping_address_collection: undefined, // we collected it already
    custom_text: {
      submit: {
        message: 'Ships from Tokyo, Japan via Japan Post EMS. All sales final.',
      },
    },
    locale: 'auto',
  })

  return session.url!
}

export function formatPrice(amountJpy: number): string {
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY',
    minimumFractionDigits: 0,
  }).format(amountJpy)
}
