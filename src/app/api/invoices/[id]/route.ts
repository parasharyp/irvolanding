import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { serverError, unauthorized, notFound, badRequest } from '@/lib/api-error'

const UpdateInvoiceSchema = z.object({
  status: z.enum(['pending', 'paid', 'overdue', 'escalated']).optional(),
  amount: z.number().positive().optional(),
  due_date: z.string().optional(),
  invoice_number: z.string().optional(),
})

async function resolveOrgId(supabase: Awaited<ReturnType<typeof createClient>>, userId: string) {
  const { data } = await supabase.from('users').select('organization_id').eq('id', userId).single()
  return data?.organization_id ?? null
}

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return unauthorized()

  const orgId = await resolveOrgId(supabase, user.id)
  if (!orgId) return badRequest('No organization')

  const { data, error } = await supabase
    .from('invoices')
    .select('*, client:clients(id, name, email, company)')
    .eq('id', id)
    .eq('organization_id', orgId)
    .single()

  if (error || !data) return notFound('Invoice')
  return NextResponse.json(data)
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return unauthorized()

  const orgId = await resolveOrgId(supabase, user.id)
  if (!orgId) return badRequest('No organization')

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
    .eq('organization_id', orgId)
    .select()
    .single()

  if (error) return serverError(error, 'PATCH /api/invoices/[id]')
  if (!data) return notFound('Invoice')

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
  if (authError || !user) return unauthorized()

  const orgId = await resolveOrgId(supabase, user.id)
  if (!orgId) return badRequest('No organization')

  const { error } = await supabase.from('invoices').delete().eq('id', id).eq('organization_id', orgId)
  if (error) return serverError(error, 'DELETE /api/invoices/[id]')

  return NextResponse.json({ deleted: true })
}
