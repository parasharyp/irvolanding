import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-02-25.clover' })

const PRICE_IDS: Record<string, string> = {
  starter: process.env.STRIPE_PRICE_STARTER!,
  studio: process.env.STRIPE_PRICE_STUDIO!,
  firm: process.env.STRIPE_PRICE_FIRM!,
}

const Schema = z.object({ plan: z.enum(['starter', 'studio', 'firm']) })

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const parsed = Schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid plan' }, { status: 422 })

  const { data: userData } = await supabase.from('users').select('organization_id').eq('id', user.id).single()
  const orgId = userData?.organization_id
  if (!orgId) return NextResponse.json({ error: 'No organization' }, { status: 400 })

  const { data: org } = await supabase.from('organizations').select('*').eq('id', orgId).single()
  if (!org) return NextResponse.json({ error: 'Organization not found' }, { status: 404 })

  // Create Stripe customer if not exists
  let customerId = org.stripe_customer_id
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: org.name,
      metadata: { organization_id: orgId },
    })
    customerId = customer.id
    await supabase.from('organizations').update({ stripe_customer_id: customerId }).eq('id', orgId)
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    line_items: [{ price: PRICE_IDS[parsed.data.plan], quantity: 1 }],
    success_url: `${process.env.APP_URL}/settings?billing=success`,
    cancel_url: `${process.env.APP_URL}/settings?billing=cancelled`,
  })

  return NextResponse.json({ url: session.url })
}
