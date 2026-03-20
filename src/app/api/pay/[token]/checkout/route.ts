import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createAdminClient } from '@/lib/supabase/server'
import { calculateInterest } from '@/lib/interest'
import { Invoice } from '@/types'

const stripeKey = process.env.STRIPE_SECRET_KEY
if (!stripeKey) throw new Error('STRIPE_SECRET_KEY is not configured')
const stripe = new Stripe(stripeKey, { apiVersion: '2026-02-25.acacia' as any })

const TOKEN_RE = /^[a-f0-9]{64}$/

// Public — no auth required
export async function POST(_: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params

  if (!TOKEN_RE.test(token)) {
    return NextResponse.json({ error: 'Invalid or expired link' }, { status: 404 })
  }

  const admin = await createAdminClient()

  const { data: pt } = await admin
    .from('payment_tokens')
    .select('invoice_id, expires_at')
    .eq('token', token)
    .single()

  if (!pt || new Date(pt.expires_at) < new Date()) {
    return NextResponse.json({ error: 'Invalid or expired link' }, { status: 404 })
  }

  const { data: invoice } = await admin
    .from('invoices')
    .select('*, client:clients(name, email)')
    .eq('id', pt.invoice_id)
    .single()

  // IDOR guard: invoice must belong to the token's resolved invoice_id
  if (!invoice || invoice.id !== pt.invoice_id || invoice.status === 'paid') {
    return NextResponse.json({ error: 'Invoice unavailable' }, { status: 400 })
  }

  const { data: org } = await admin
    .from('organizations')
    .select('name, stripe_customer_id')
    .eq('id', invoice.organization_id)
    .single()

  // Amount validation — guard against corrupted DB values
  const principal = Number(invoice.amount)
  if (!Number.isFinite(principal) || principal <= 0 || principal > 1_000_000) {
    return NextResponse.json({ error: 'Invalid invoice amount' }, { status: 400 })
  }

  const interest = calculateInterest(invoice as Invoice)
  const totalPence = Math.round((principal + interest.interest_amount + interest.compensation_fee) * 100)

  if (totalPence <= 0 || totalPence > 100_000_000) {
    return NextResponse.json({ error: 'Calculated total out of range' }, { status: 400 })
  }

  const base = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [
      {
        price_data: {
          currency: (invoice.currency ?? 'gbp').toLowerCase(),
          product_data: {
            name: `Invoice ${invoice.invoice_number}`,
            description: `Payment to ${org?.name ?? 'Creditor'} — includes £${interest.interest_amount.toFixed(2)} statutory interest + £${interest.compensation_fee} compensation`,
          },
          unit_amount: totalPence,
        },
        quantity: 1,
      },
    ],
    metadata: {
      invoice_id: invoice.id,
      token,
      type: 'payment_portal',
      principal: String(invoice.amount),
      interest_amount: String(interest.interest_amount),
      compensation_fee: String(interest.compensation_fee),
    },
    customer_email: (invoice.client as { email: string } | null)?.email,
    success_url: `${base}/pay/${token}?paid=true`,
    cancel_url: `${base}/pay/${token}`,
  })

  return NextResponse.json({ url: session.url })
}
