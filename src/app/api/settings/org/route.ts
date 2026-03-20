import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { serverError, unauthorized } from '@/lib/api-error'

const UpdateOrgSchema = z.object({ name: z.string().min(1) })

async function getOrgId(supabase: Awaited<ReturnType<typeof createClient>>, userId: string) {
  const { data } = await supabase.from('users').select('organization_id').eq('id', userId).single()
  return data?.organization_id as string | null
}

export async function GET() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return unauthorized()

  const orgId = await getOrgId(supabase, user.id)
  if (!orgId) return NextResponse.json({ error: 'No organization' }, { status: 400 })

  const { data, error } = await supabase.from('organizations').select('*').eq('id', orgId).single()
  if (error) return serverError(error, 'GET /api/settings/org')
  return NextResponse.json(data)
}

export async function PATCH(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return unauthorized()

  const orgId = await getOrgId(supabase, user.id)
  if (!orgId) return NextResponse.json({ error: 'No organization' }, { status: 400 })

  const body = await request.json()
  const parsed = UpdateOrgSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })

  const { data, error } = await supabase.from('organizations').update(parsed.data).eq('id', orgId).select().single()
  if (error) return serverError(error, 'PATCH /api/settings/org')
  return NextResponse.json(data)
}
