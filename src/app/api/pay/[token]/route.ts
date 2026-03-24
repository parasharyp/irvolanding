import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { checkPublicRateLimit } from '@/lib/ratelimit'

const TOKEN_RE = /^[a-f0-9]{64}$/

// Public — no auth required. Uses admin client to read past RLS.
export async function GET(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  // Rate limit: prevent token enumeration / brute-force (B2)
  const ip =
    req.headers.get('x-forwarded-for')?.split(',').pop()?.trim() ??
    req.headers.get('x-real-ip') ??
    'unknown'
  const { allowed } = await checkPublicRateLimit(ip)
  if (!allowed) {
    return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 })
  }

  const { token } = await params

  if (!TOKEN_RE.test(token)) {
    return NextResponse.json({ error: 'Invalid payment link' }, { status: 404 })
  }

  const admin = await createAdminClient()

  // Resolve token — return same 404 for not-found and expired (C6: no timing oracle)
  const { data: pt, error: tokenErr } = await admin
    .from('payment_tokens')
    .select('invoice_id, expires_at')
    .eq('token', token)
    .single()

  if (tokenErr || !pt) return NextResponse.json({ error: 'Invalid payment link' }, { status: 404 })
  if (new Date(pt.expires_at) < new Date()) return NextResponse.json({ error: 'Invalid payment link' }, { status: 404 })

  // Fetch invoice + nested client
  const { data: invoice, error: invErr } = await admin
    .from('invoices')
    .select('*, client:clients(id, name, email, company)')
    .eq('id', pt.invoice_id)
    .single()

  if (invErr || !invoice) return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })

  // Fetch org name for branding
  const { data: org } = await admin
    .from('organizations')
    .select('name')
    .eq('id', invoice.organization_id)
    .single()

  return NextResponse.json({
    invoice: {
      id: invoice.id,
      invoice_number: invoice.invoice_number,
      amount: Number(invoice.amount),
      currency: invoice.currency ?? 'GBP',
      issue_date: invoice.issue_date,
      due_date: invoice.due_date,
      status: invoice.status,
      paid_at: invoice.paid_at ?? null,
    },
    client: invoice.client,
    org_name: org?.name ?? 'Your Creditor',
  })
}
