import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { updateOrderStatus, getOrderById } from '@/lib/supabase'
import { markListingAsSold } from '@/lib/discogs'
import Stripe from 'stripe'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Stripe webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const orderId = session.metadata?.order_id
        if (!orderId) break

        // Update order with payment info
        await updateOrderStatus(orderId, 'paid', {
          stripe_payment_intent_id: session.payment_intent as string,
        })

        // Update customer email (now captured by Stripe)
        const order = await getOrderById(orderId)
        if (order && session.customer_details?.email) {
          const { createSupabaseAdmin } = await import('@/lib/supabase')
          const supabase = createSupabaseAdmin()
          await supabase
            .from('orders')
            .update({ customer_email: session.customer_details.email })
            .eq('id', orderId)
        }

        // Mark all listings as sold on Discogs
        if (order) {
          const markSoldPromises = order.items.map((item) =>
            markListingAsSold(item.listingId).catch((err) =>
              console.error(`Failed to mark listing ${item.listingId} as sold:`, err)
            )
          )
          await Promise.all(markSoldPromises)
        }

        console.log(`Order ${orderId} paid successfully`)
        break
      }

      case 'checkout.session.expired': {
        const session = event.data.object as Stripe.Checkout.Session
        const orderId = session.metadata?.order_id
        if (orderId) {
          await updateOrderStatus(orderId, 'cancelled')
          console.log(`Order ${orderId} expired/cancelled`)
        }
        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        const orderId = paymentIntent.metadata?.order_id
        if (orderId) {
          await updateOrderStatus(orderId, 'cancelled')
          console.log(`Order ${orderId} payment failed`)
        }
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}
