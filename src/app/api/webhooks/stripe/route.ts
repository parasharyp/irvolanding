import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createAdminClient } from '@/lib/supabase/server'
import { isWebhookAlreadyProcessed, clearWebhookProcessed } from '@/lib/ratelimit'

export async function POST(request: NextRequest) {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    console.error('[stripe webhook] Missing required environment variables')
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
  }

  const starterPrice = process.env.STRIPE_PRICE_STARTER
  const growthPrice = process.env.STRIPE_PRICE_GROWTH
  const plusPrice = process.env.STRIPE_PRICE_PLUS
  if (!starterPrice || !growthPrice || !plusPrice) {
    console.error('[stripe webhook] Missing STRIPE_PRICE_* env vars')
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
  }
  const PLAN_MAP: Record<string, string> = {
    [starterPrice]: 'starter',
    [growthPrice]: 'growth',
    [plusPrice]: 'plus',
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2026-02-25.clover' })

  const body = await request.text()
  const sig = request.headers.get('stripe-signature')
  if (!sig) return NextResponse.json({ error: 'Webhook verification failed' }, { status: 400 })

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch {
    return NextResponse.json({ error: 'Webhook verification failed' }, { status: 400 })
  }

  if (await isWebhookAlreadyProcessed(event.id)) {
    return NextResponse.json({ received: true })
  }

  const admin = await createAdminClient()

  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription
      const customerId = sub.customer as string
      const priceId = sub.items.data[0]?.price.id
      const plan = PLAN_MAP[priceId]
      if (!plan) {
        console.error('[stripe webhook] Unknown price ID:', priceId)
        await clearWebhookProcessed(event.id).catch(() => {})
        return NextResponse.json({ error: 'Unknown price' }, { status: 500 })
      }

      const { error: updateError } = await admin
        .from('organizations')
        .update({ plan, stripe_subscription_id: sub.id })
        .eq('stripe_customer_id', customerId)
      if (updateError) {
        console.error('[stripe webhook] DB update failed:', updateError.message)
        await clearWebhookProcessed(event.id).catch(() => {})
        return NextResponse.json({ error: 'Processing failed' }, { status: 500 })
      }
      break
    }
    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription
      const { error: deleteError } = await admin
        .from('organizations')
        .update({ plan: 'starter', stripe_subscription_id: null })
        .eq('stripe_customer_id', sub.customer as string)
      if (deleteError) {
        console.error('[stripe webhook] DB update failed:', deleteError.message)
        await clearWebhookProcessed(event.id).catch(() => {})
        return NextResponse.json({ error: 'Processing failed' }, { status: 500 })
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}
