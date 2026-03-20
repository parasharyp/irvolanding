import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { serverError, unauthorized } from '@/lib/api-error'

const CreateInvoiceSchema = z.object({
  client_id: z.string().uuid(),
  invoice_number: z.string().min(1),
  amount: z.number().positive(),
  currency: z.string().default('GBP'),
  issue_date: z.string(),
  due_date: z.string(),
})

async function getOrgId(supabase: Awaited<ReturnType<typeof createClient>>, userId: string) {
  const { data } = await supabase.from('users').select('organization_id').eq('id', userId).single()
  return data?.organization_id as string | null
}

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return unauthorized()

  const orgId = await getOrgId(supabase, user.id)
  if (!orgId) return NextResponse.json({ error: 'No organization found' }, { status: 400 })

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const clientId = searchParams.get('client_id')

  let query = supabase
    .from('invoices')
    .select('*, client:clients(id, name, email, company)')
    .eq('organization_id', orgId)
    .order('created_at', { ascending: false })

  if (status) query = query.eq('status', status)
  if (clientId) query = query.eq('client_id', clientId)

  const { data, error } = await query
  if (error) return serverError(error, 'GET /api/invoices')

  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return unauthorized()

  const orgId = await getOrgId(supabase, user.id)
  if (!orgId) return NextResponse.json({ error: 'No organization found' }, { status: 400 })

  const body = await request.json()
  const parsed = CreateInvoiceSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })

  const { data: invoice, error } = await supabase
    .from('invoices')
    .insert({ ...parsed.data, organization_id: orgId, status: 'pending' })
    .select()
    .single()

  if (error) return serverError(error, 'POST /api/invoices')

  // Log invoice_created event
  await supabase.from('invoice_events').insert({
    invoice_id: invoice.id,
    event_type: 'invoice_created',
    metadata: { amount: invoice.amount, client_id: invoice.client_id },
  })

  return NextResponse.json(invoice, { status: 201 })
}
