import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder", { apiVersion: '2026-02-25.acacia' as any }) // eslint-disable-line

export async function POST(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: userData } = await supabase.from('users').select('organization_id').eq('id', user.id).single()
  const { data: invoice } = await supabase
    .from('invoices')
    .select('*, client:clients(name, email, company)')
    .eq('id', id)
    .single()

  if (!invoice || invoice.organization_id !== userData?.organization_id) {
    return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
  }
  if (invoice.status === 'paid') return NextResponse.json({ error: 'Invoice is already paid' }, { status: 400 })

  const client = invoice.client as { name: string; email: string; company?: string } | null
  if (!client?.email) return NextResponse.json({ error: 'Client has no email address on record' }, { status: 400 })

  const base = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [
      {
        price_data: {
          currency: 'gbp',
          product_data: {
            name: 'Legal Demand Letter',
            description: `Formal statutory demand for Invoice ${invoice.invoice_number} — sent to ${client.email} as PDF`,
          },
          unit_amount: 999,
        },
        quantity: 1,
      },
    ],
    metadata: {
      type: 'legal_demand',
      invoice_id: id,
      org_id: invoice.organization_id,
      user_email: user.email ?? '',
    },
    customer_email: user.email ?? undefined,
    success_url: `${base}/invoices/${id}?legal_demand=sent`,
    cancel_url: `${base}/invoices/${id}`,
  })

  return NextResponse.json({ url: session.url })
}
