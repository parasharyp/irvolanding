import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const UpdateInvoiceSchema = z.object({
  status: z.enum(['pending', 'paid', 'overdue', 'escalated']).optional(),
  amount: z.number().positive().optional(),
  due_date: z.string().optional(),
  invoice_number: z.string().optional(),
})

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('invoices')
    .select('*, client:clients(id, name, email, company)')
    .eq('id', id)
    .single()

  if (error || !data) return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
  return NextResponse.json(data)
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const parsed = UpdateInvoiceSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })

  const updatePayload = {
    ...parsed.data,
    ...(parsed.data.status === 'paid' ? { paid_at: new Date().toISOString() } : {}),
  }

  const { data, error } = await supabase
    .from('invoices')
    .update(updatePayload)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (parsed.data.status) {
    await supabase.from('invoice_events').insert({
      invoice_id: id,
      event_type: parsed.data.status === 'paid' ? 'payment_recorded' : `status_changed_to_${parsed.data.status}`,
      metadata: { status: parsed.data.status },
    })
  }

  return NextResponse.json(data)
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { error } = await supabase.from('invoices').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ deleted: true })
}
