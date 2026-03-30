import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { rateLimited } from '@/lib/api-error'
import { getAuthContext } from '@/lib/auth'
import { checkAuthenticatedRateLimit } from '@/lib/ratelimit'

export async function GET(request: NextRequest) {
  const auth = await getAuthContext()
  if ('error' in auth) return auth.error
  const { supabase, user, orgId } = auth

  const rateCheck = await checkAuthenticatedRateLimit(user.id)
  if (!rateCheck.allowed) {
    return rateLimited(rateCheck.resetAt)
  }

  const { data: org } = await supabase.from('organizations').select('stripe_customer_id').eq('id', orgId).single()
  if (!org?.stripe_customer_id) return NextResponse.json({ error: 'No billing account found' }, { status: 400 })

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-02-25.clover' })

  const session = await stripe.billingPortal.sessions.create({
    customer: org.stripe_customer_id,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings`,
  })

  return NextResponse.json({ url: session.url })
}
