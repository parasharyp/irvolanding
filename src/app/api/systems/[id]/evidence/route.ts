import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { unauthorized, serverError } from '@/lib/api-error'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return unauthorized()

    const { data: userData } = await supabase.from('users').select('organization_id').eq('id', user.id).single()
    if (!userData?.organization_id) return NextResponse.json({ error: 'No organization' }, { status: 400 })

    return NextResponse.json({ evidence: [] })
  } catch (err) {
    return serverError(err, 'GET /api/systems/[id]/evidence')
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return unauthorized()

    const { data: userData } = await supabase.from('users').select('organization_id').eq('id', user.id).single()
    if (!userData?.organization_id) return NextResponse.json({ error: 'No organization' }, { status: 400 })

    const { id } = await params
    const body = await req.json() as Record<string, unknown>

    return NextResponse.json({ success: true, id: `ev-${Date.now()}` }, { status: 201 })
  } catch (err) {
    return serverError(err, 'POST /api/systems/[id]/evidence')
  }
}
