import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { serverError, unauthorized, badRequest } from '@/lib/api-error'

const UpdateClientSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  company: z.string().optional(),
})

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return unauthorized()

  const { data: userData } = await supabase.from('users').select('organization_id').eq('id', user.id).single()
  const orgId = userData?.organization_id
  if (!orgId) return badRequest('No organization')

  const body = await request.json()
  const parsed = UpdateClientSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })

  const { data, error } = await supabase
    .from('clients')
    .update(parsed.data)
    .eq('id', id)
    .eq('organization_id', orgId)
    .select()
    .single()

  if (error) return serverError(error, 'PATCH /api/clients/[id]')
  return NextResponse.json(data)
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return unauthorized()

  const { data: userData } = await supabase.from('users').select('organization_id').eq('id', user.id).single()
  const orgId = userData?.organization_id
  if (!orgId) return badRequest('No organization')

  const { error } = await supabase.from('clients').delete().eq('id', id).eq('organization_id', orgId)
  if (error) return serverError(error, 'DELETE /api/clients/[id]')

  return NextResponse.json({ deleted: true })
}
