import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { z } from 'zod'
import { rateLimited } from '@/lib/api-error'
import { getAuthContext } from '@/lib/auth'
import { checkAuthenticatedRateLimit } from '@/lib/ratelimit'
import { parseBody, requireJson } from '@/lib/validate-body'

const PRICE_IDS: Record<string, string> = {
  starter: process.env.STRIPE_PRICE_STARTER!,
  growth: process.env.STRIPE_PRICE_GROWTH!,
  plus: process.env.STRIPE_PRICE_PLUS!,
}

const Schema = z.object({ plan: z.enum(['starter', 'growth', 'plus']) })

export async function POST(request: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-02-25.clover' })
  const auth = await getAuthContext()
  if ('error' in auth) return auth.error
  const { supabase, user, orgId } = auth

  const rateCheck = await checkAuthenticatedRateLimit(user.id)
  if (!rateCheck.allowed) {
    return rateLimited(rateCheck.resetAt)
  }

  const ctErr = requireJson(request); if (ctErr) return ctErr
  const { data: body, error: bodyErr } = await parseBody(request); if (bodyErr) return bodyErr
  const parsed = Schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid plan' }, { status: 422 })

  const { data: org } = await supabase.from('organizations').select('*').eq('id', orgId).single()
  if (!org) return NextResponse.json({ error: 'Organization not found' }, { status: 404 })

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
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings?billing=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings?billing=cancelled`,
  })

  return NextResponse.json({ url: session.url })
}
