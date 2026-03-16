import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { generateEvidencePack } from '@/lib/pdf'
import { Invoice, InvoiceEvent, ReminderLog, InterestCalculation } from '@/types'

export async function POST(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const admin = await createAdminClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: userData } = await supabase.from('users').select('organization_id').eq('id', user.id).single()
  const orgId = userData?.organization_id
  if (!orgId) return NextResponse.json({ error: 'No organization' }, { status: 400 })

  const { data: org } = await supabase.from('organizations').select('name').eq('id', orgId).single()

  const { data: invoice, error: invoiceError } = await supabase
    .from('invoices')
    .select('*, client:clients(id, name, email, company)')
    .eq('id', id)
    .single()

  if (invoiceError || !invoice) return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })

  const [
    { data: events },
    { data: reminderLogs },
    { data: interestCalcs },
  ] = await Promise.all([
    supabase.from('invoice_events').select('*').eq('invoice_id', id).order('event_timestamp'),
    supabase.from('reminder_logs').select('*').eq('invoice_id', id).order('sent_at'),
    supabase.from('interest_calculations').select('*').eq('invoice_id', id).order('calculated_at', { ascending: false }).limit(1),
  ])

  const pdfBuffer = await generateEvidencePack({
    invoice: invoice as Invoice,
    events: (events ?? []) as InvoiceEvent[],
    reminderLogs: (reminderLogs ?? []) as ReminderLog[],
    interestCalc: interestCalcs?.[0] as InterestCalculation ?? null,
    orgName: org?.name ?? 'Unknown',
    clientName: invoice.client?.name ?? 'Unknown',
  })

  const fileName = `evidence-${invoice.invoice_number}-${Date.now()}.pdf`
  const filePath = `${orgId}/${fileName}`

  const { error: uploadError } = await admin.storage
    .from('evidence-packs')
    .upload(filePath, pdfBuffer, { contentType: 'application/pdf', upsert: true })

  if (uploadError) return NextResponse.json({ error: 'Upload failed', details: uploadError.message }, { status: 500 })

  const { data: { publicUrl } } = admin.storage.from('evidence-packs').getPublicUrl(filePath)

  const { data: pack, error: packError } = await supabase
    .from('evidence_packs')
    .insert({ invoice_id: id, file_url: publicUrl })
    .select()
    .single()

  if (packError) return NextResponse.json({ error: packError.message }, { status: 500 })

  await supabase.from('invoice_events').insert({
    invoice_id: id,
    event_type: 'evidence_generated',
    metadata: { file_url: publicUrl },
  })

  return NextResponse.json(pack)
}

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data } = await supabase
    .from('evidence_packs')
    .select('*')
    .eq('invoice_id', id)
    .order('generated_at', { ascending: false })

  return NextResponse.json(data ?? [])
}
