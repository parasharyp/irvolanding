import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { serverError, unauthorized } from '@/lib/api-error'

export async function GET() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return unauthorized()

  const { data: userData } = await supabase.from('users').select('organization_id').eq('id', user.id).single()
  const orgId = userData?.organization_id
  if (!orgId) return NextResponse.json({ error: 'No organization' }, { status: 400 })

  const { data, error } = await supabase
    .from('reminder_templates')
    .select('*')
    .eq('organization_id', orgId)
    .order('stage')

  if (error) return serverError(error, 'GET /api/settings/templates')
  return NextResponse.json(data)
}
