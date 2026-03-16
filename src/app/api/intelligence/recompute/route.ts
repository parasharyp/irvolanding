import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/server'
import { calculateClientRiskScore } from '@/lib/intelligence/riskScore'
import { predictInvoicePayment } from '@/lib/intelligence/paymentPrediction'
import { Invoice } from '@/types'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: userData } = await supabase.from('users').select('organization_id').eq('id', user.id).single()
  const orgId = userData?.organization_id
  if (!orgId) return NextResponse.json({ error: 'No organization' }, { status: 400 })

  const admin = await createAdminClient()

  const { data: clients } = await admin.from('clients').select('id').eq('organization_id', orgId)
  const { data: allInvoices } = await admin.from('invoices').select('*').eq('organization_id', orgId)

  if (!clients || !allInvoices) return NextResponse.json({ updated: 0 })

  let updated = 0
  const unpaid = (allInvoices as Invoice[]).filter((i) => i.status !== 'paid')
  const history = (allInvoices as Invoice[]).filter((i) => i.status === 'paid' && i.paid_at)

  for (const client of clients) {
    const clientInvoices = (allInvoices as Invoice[]).filter((i) => i.client_id === client.id)
    const risk = calculateClientRiskScore(clientInvoices)

    await admin
      .from('clients')
      .update({ risk_score: risk.score, risk_tier: risk.tier })
      .eq('id', client.id)

    // Compute and upsert predictions for unpaid invoices of this client
    const clientUnpaid = unpaid.filter((i) => i.client_id === client.id)
    for (const invoice of clientUnpaid) {
      const prediction = predictInvoicePayment(invoice, history)

      // Delete old prediction for this invoice, insert fresh
      await admin.from('payment_predictions').delete().eq('invoice_id', invoice.id)
      await admin.from('payment_predictions').insert({
        invoice_id: invoice.id,
        predicted_delay_days: prediction.predictedDelayDays,
        predicted_payment_date: prediction.predictedPaymentDate,
        confidence: prediction.confidence,
      })
    }

    updated++
  }

  return NextResponse.json({ updated, clients: clients.length })
}
