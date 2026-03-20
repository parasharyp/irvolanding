import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { calculateInterest } from '@/lib/interest'
import { Invoice } from '@/types'
import { serverError, unauthorized } from '@/lib/api-error'

export async function POST(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return unauthorized()

  const { data: invoice, error: invoiceError } = await supabase
    .from('invoices')
    .select('*')
    .eq('id', id)
    .single()

  if (invoiceError || !invoice) return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })

  const result = calculateInterest(invoice as Invoice)

  const { data: calc, error } = await supabase
    .from('interest_calculations')
    .insert({
      invoice_id: id,
      principal: invoice.amount,
      interest_rate: result.interest_rate,
      days_overdue: result.days_overdue,
      interest_amount: result.interest_amount,
      compensation_fee: result.compensation_fee,
    })
    .select()
    .single()

  if (error) return serverError(error, 'POST /api/invoices/[id]/interest')

  await supabase.from('invoice_events').insert({
    invoice_id: id,
    event_type: 'interest_applied',
    metadata: { interest_amount: result.interest_amount, compensation_fee: result.compensation_fee },
  })

  return NextResponse.json({ ...calc, total: result.total })
}

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return unauthorized()

  const { data, error } = await supabase
    .from('interest_calculations')
    .select('*')
    .eq('invoice_id', id)
    .order('calculated_at', { ascending: false })
    .limit(1)
    .single()

  if (error) return NextResponse.json(null)
  return NextResponse.json(data)
}
