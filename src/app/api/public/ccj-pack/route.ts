import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { z } from 'zod'
import { checkPublicLegalLimit } from '@/lib/ratelimit'

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) throw new Error('STRIPE_SECRET_KEY is not configured')
  return new Stripe(key, { apiVersion: '2026-02-25.acacia' as never })
}

const Schema = z.object({
  creditorName: z.string().min(1).max(200),
  creditorEmail: z.string().email().max(254),
  clientName: z.string().min(1).max(200),
  clientEmail: z.string().email().max(254).optional(),
  clientCompany: z.string().max(200).optional(),
  invoiceNumber: z.string().min(1).max(100),
  invoiceAmount: z.coerce.number().positive().max(1_000_000),
  invoiceDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  description: z.string().max(500).optional(),
})

function calcInterest(principal: number, dueDate: string) {
  const days = Math.max(0, Math.floor((Date.now() - new Date(dueDate).getTime()) / 86400000))
  const interest_amount = Math.round(principal * 0.13 / 365 * days * 100) / 100
  const compensation_fee = principal < 1000 ? 40 : principal < 10000 ? 70 : 100
  return { days_overdue: days, interest_rate: 0.13, interest_amount, compensation_fee }
}

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',').pop()?.trim() ??
    req.headers.get('x-real-ip') ??
    'unknown'
  )
}

export async function POST(req: NextRequest) {
  // Rate limit: 1 request/day per IP — document generation endpoints are high-abuse risk
  const ip = getClientIp(req)
  const { allowed, resetAt } = await checkPublicLegalLimit(ip)
  if (!allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      {
        status: 429,
        headers: { 'Retry-After': String(resetAt - Math.floor(Date.now() / 1000)) },
      }
    )
  }

  const raw = await req.json().catch(() => null)
  if (!raw) return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })

  const parsed = Schema.safeParse(raw)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 422 })
  }

  const { creditorName, creditorEmail, clientName, clientEmail, clientCompany, invoiceNumber, invoiceAmount, invoiceDate, dueDate, description } = parsed.data
  const interest = calcInterest(invoiceAmount, dueDate)
  const base = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  let stripe: Stripe
  try {
    stripe = getStripe()
  } catch {
    return NextResponse.json({ error: 'Payment processing unavailable' }, { status: 503 })
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [{
      price_data: {
        currency: 'gbp',
        product_data: {
          name: 'CCJ Preparation Pack',
          description: `County Court filing pack for Invoice ${invoiceNumber}`,
        },
        unit_amount: 2900,
      },
      quantity: 1,
    }],
    metadata: {
      type: 'public_ccj_pack',
      creditor_name: creditorName,
      creditor_email: creditorEmail,
      client_name: clientName,
      client_email: clientEmail ?? '',
      client_company: clientCompany ?? '',
      invoice_number: invoiceNumber,
      invoice_amount: String(invoiceAmount),
      invoice_date: invoiceDate,
      due_date: dueDate,
      description: description ?? '',
      interest_amount: String(interest.interest_amount),
      compensation_fee: String(interest.compensation_fee),
      days_overdue: String(interest.days_overdue),
    },
    customer_email: creditorEmail,
    success_url: `${base}/?ccj_sent=1&inv=${encodeURIComponent(invoiceNumber)}`,
    cancel_url: `${base}/`,
  })

  return NextResponse.json({ url: session.url })
}
