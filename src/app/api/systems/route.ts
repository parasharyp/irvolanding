import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { unauthorized, badRequest, serverError } from '@/lib/api-error'
import { RiskLevel, AnnexIIICategory } from '@/types'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return unauthorized()

    const { data: userData } = await supabase.from('users').select('organization_id').eq('id', user.id).single()
    if (!userData?.organization_id) return NextResponse.json({ error: 'No organization' }, { status: 400 })

    return NextResponse.json({ systems: [] })
  } catch (err) {
    return serverError(err, 'GET /api/systems')
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return unauthorized()

    const { data: userData } = await supabase.from('users').select('organization_id').eq('id', user.id).single()
    if (!userData?.organization_id) return NextResponse.json({ error: 'No organization' }, { status: 400 })

    const body = await req.json() as Record<string, unknown>
    const name = typeof body.name === 'string' ? body.name.trim() : ''
    if (!name) return badRequest('name is required')

    const mockSystem = {
      id: `sys-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      organization_id: userData.organization_id,
      name,
      description: typeof body.description === 'string' ? body.description : '',
      owner: typeof body.owner === 'string' ? body.owner : '',
      data_sources: typeof body.data_sources === 'string' ? body.data_sources : '',
      model_type: typeof body.model_type === 'string' ? body.model_type : '',
      business_process: typeof body.business_process === 'string' ? body.business_process : '',
      risk_level: (body.risk_level as RiskLevel) ?? 'unknown',
      annex_iii_category: (body.annex_iii_category as AnnexIIICategory) ?? null,
      articles_applicable: Array.isArray(body.articles_applicable) ? body.articles_applicable as string[] : [],
      obligations_total: Array.isArray(body.obligations) ? (body.obligations as unknown[]).length : 0,
      obligations_complete: 0,
      classification_completed: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    return NextResponse.json({ system: mockSystem }, { status: 201 })
  } catch (err) {
    return serverError(err, 'POST /api/systems')
  }
}
