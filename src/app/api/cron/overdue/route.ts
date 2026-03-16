import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { determineReminderStage } from '@/lib/reminders'
import { calculateClientRiskScore } from '@/lib/intelligence/riskScore'
import { predictInvoicePayment } from '@/lib/intelligence/paymentPrediction'
import { Invoice } from '@/types'

// Called daily by Vercel Cron — protected by CRON_SECRET header
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = await createAdminClient()
  const today = new Date().toISOString().split('T')[0]

  // ── 1. Mark unpaid invoices past due date as overdue ──────────
  const { data: overdueUpdated, error: overdueError } = await admin
    .from('invoices')
    .update({ status: 'overdue' })
    .lt('due_date', today)
    .in('status', ['pending'])
    .select('id, invoice_number, organization_id')

  if (overdueError) {
    console.error('Overdue update error:', overdueError)
    return NextResponse.json({ error: overdueError.message }, { status: 500 })
  }

  if (overdueUpdated && overdueUpdated.length > 0) {
    await admin.from('invoice_events').insert(
      overdueUpdated.map((inv) => ({
        invoice_id: inv.id,
        event_type: 'invoice_overdue',
        metadata: { auto_overdue: true, date: today },
      }))
    )
  }

  // ── 2. Auto-escalate 30+ day overdue invoices ──────────────────
  const { data: overdueInvoices } = await admin
    .from('invoices')
    .select('*')
    .in('status', ['overdue', 'escalated'])

  let escalated = 0
  for (const invoice of overdueInvoices ?? []) {
    const stage = determineReminderStage(invoice as Invoice)
    if (stage === 4 && invoice.status !== 'escalated') {
      await admin.from('invoices').update({ status: 'escalated' }).eq('id', invoice.id)
      await admin.from('invoice_events').insert({
        invoice_id: invoice.id,
        event_type: 'invoice_escalated',
        metadata: { auto: true, date: today },
      })
      escalated++
    }
  }

  // ── 3. Recompute client risk scores ────────────────────────────
  const { data: allInvoices } = await admin.from('invoices').select('*')
  const { data: clients } = await admin.from('clients').select('id, organization_id')

  let riskUpdated = 0
  const history = ((allInvoices ?? []) as Invoice[]).filter((i) => i.status === 'paid' && i.paid_at)
  const unpaid = ((allInvoices ?? []) as Invoice[]).filter((i) => i.status !== 'paid')

  for (const client of clients ?? []) {
    const clientInvoices = ((allInvoices ?? []) as Invoice[]).filter((i) => i.client_id === client.id)
    const risk = calculateClientRiskScore(clientInvoices)

    await admin.from('clients').update({ risk_score: risk.score, risk_tier: risk.tier }).eq('id', client.id)

    // Refresh predictions for this client's unpaid invoices
    for (const invoice of unpaid.filter((i) => i.client_id === client.id)) {
      const prediction = predictInvoicePayment(invoice, history)
      await admin.from('payment_predictions').delete().eq('invoice_id', invoice.id)
      await admin.from('payment_predictions').insert({
        invoice_id: invoice.id,
        predicted_delay_days: prediction.predictedDelayDays,
        predicted_payment_date: prediction.predictedPaymentDate,
        confidence: prediction.confidence,
      })
    }

    riskUpdated++
  }

  return NextResponse.json({
    ok: true,
    newly_overdue: overdueUpdated?.length ?? 0,
    auto_escalated: escalated,
    risk_scores_updated: riskUpdated,
    run_at: new Date().toISOString(),
  })
}
