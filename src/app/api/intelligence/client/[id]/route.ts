import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { calculateClientRiskScore } from '@/lib/intelligence/riskScore'
import { generateRecommendations } from '@/lib/intelligence/recommendations'
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

  // Verify client belongs to org
  const { data: client, error: clientError } = await supabase
    .from('clients')
    .select('*')
    .eq('id', id)
    .eq('organization_id', orgId)
    .single()

  if (clientError || !client) return NextResponse.json({ error: 'Client not found' }, { status: 404 })

  const { data: invoices } = await supabase
    .from('invoices')
    .select('*')
    .eq('client_id', id)
    .eq('organization_id', orgId)

  const risk = calculateClientRiskScore((invoices ?? []) as Invoice[])
  const recommendations = generateRecommendations(risk)

  return NextResponse.json({
    client,
    risk_score: risk.score,
    risk_tier: risk.tier,
    average_delay: risk.averageDelay,
    late_ratio: risk.lateRatio,
    payment_variance: risk.paymentVariance,
    days_since_last_payment: risk.daysSinceLastPayment,
    total_invoices: risk.totalInvoices,
    paid_invoices: risk.paidInvoices,
    recommendations,
  })
}
