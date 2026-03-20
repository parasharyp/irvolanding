import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { serverError, unauthorized, badRequest } from '@/lib/api-error'

const UpdateTemplateSchema = z.object({
  subject: z.string().min(1).optional(),
  body: z.string().min(1).optional(),
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
  const parsed = UpdateTemplateSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })

  const { data, error } = await supabase
    .from('reminder_templates')
    .update(parsed.data)
    .eq('id', id)
    .eq('organization_id', orgId)
    .select()
    .single()

  if (error) return serverError(error, 'PATCH /api/settings/templates/[id]')
  return NextResponse.json(data)
}
