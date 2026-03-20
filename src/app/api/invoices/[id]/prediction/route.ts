import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { predictInvoicePayment } from '@/lib/intelligence/paymentPrediction'
import { Invoice } from '@/types'
import { unauthorized } from '@/lib/api-error'

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return unauthorized()

  const { data: userData } = await supabase.from('users').select('organization_id').eq('id', user.id).single()
  const orgId = userData?.organization_id
  if (!orgId) return NextResponse.json({ error: 'No organization' }, { status: 400 })

  const { data: invoice, error: invoiceError } = await supabase
    .from('invoices')
    .select('*')
    .eq('id', id)
    .eq('organization_id', orgId)
    .single()

  if (invoiceError || !invoice) return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })

  // Check for stored prediction first
  const { data: stored } = await supabase
    .from('payment_predictions')
    .select('*')
    .eq('invoice_id', id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (stored) return NextResponse.json(stored)

  // Compute on-the-fly using client invoice history
  const { data: history } = await supabase
    .from('invoices')
    .select('*')
    .eq('client_id', invoice.client_id)
    .eq('status', 'paid')
    .not('paid_at', 'is', null)

  const prediction = predictInvoicePayment(invoice as Invoice, (history ?? []) as Invoice[])

  return NextResponse.json({
    invoice_id: id,
    predicted_delay_days: prediction.predictedDelayDays,
    predicted_payment_date: prediction.predictedPaymentDate,
    confidence: prediction.confidence,
  })
}
