import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { unauthorized, serverError, notFound } from '@/lib/api-error'
import { AISystem, Obligation } from '@/types'

function mockSystem(id: string, orgId: string): AISystem {
  return {
    id,
    organization_id: orgId,
    name: 'Sample AI System',
    description: 'A sample system for demonstration purposes.',
    owner: 'Compliance Officer',
    data_sources: 'Internal database',
    model_type: 'Classification model',
    business_process: 'Automated decision support',
    risk_level: 'high',
    annex_iii_category: 'employment',
    articles_applicable: ['Art. 9', 'Art. 10', 'Art. 11', 'Art. 13', 'Art. 14'],
    obligations_total: 5,
    obligations_complete: 0,
    classification_completed: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
}

function mockObligations(systemId: string): Obligation[] {
  return [
    {
      id: `obl-1-${systemId}`,
      system_id: systemId,
      article: 'Art. 9',
      title: 'Risk management system',
      description: 'Establish and maintain a risk management system throughout the lifecycle.',
      evidence_required: 'Risk management plan, risk register, review logs',
      is_complete: false,
      created_at: new Date().toISOString(),
    },
    {
      id: `obl-2-${systemId}`,
      system_id: systemId,
      article: 'Art. 10',
      title: 'Data governance',
      description: 'Implement data governance and management practices for training and validation data.',
      evidence_required: 'Data governance policy, data quality reports',
      is_complete: false,
      created_at: new Date().toISOString(),
    },
    {
      id: `obl-3-${systemId}`,
      system_id: systemId,
      article: 'Art. 11',
      title: 'Technical documentation',
      description: 'Prepare technical documentation before placing the system on the market.',
      evidence_required: 'Technical specification document, architecture diagram',
      is_complete: false,
      created_at: new Date().toISOString(),
    },
    {
      id: `obl-4-${systemId}`,
      system_id: systemId,
      article: 'Art. 13',
      title: 'Transparency and information',
      description: 'Ensure the system is sufficiently transparent for users to interpret outputs.',
      evidence_required: 'User manual, transparency notice, interpretability documentation',
      is_complete: false,
      created_at: new Date().toISOString(),
    },
    {
      id: `obl-5-${systemId}`,
      system_id: systemId,
      article: 'Art. 14',
      title: 'Human oversight',
      description: 'Design with human oversight measures enabling supervisors to intervene or halt the system.',
      evidence_required: 'Human oversight policy, escalation procedures, training records',
      is_complete: false,
      created_at: new Date().toISOString(),
    },
  ]
}

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

    const { id } = await params

    if (!id || id === 'undefined') return notFound('System')

    const system = mockSystem(id, userData.organization_id)
    const obligations = mockObligations(id)

    return NextResponse.json({ system, obligations })
  } catch (err) {
    return serverError(err, 'GET /api/systems/[id]')
  }
}

export async function PUT(
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

    return NextResponse.json({ system: { ...mockSystem(id, userData.organization_id), ...body, updated_at: new Date().toISOString() } })
  } catch (err) {
    return serverError(err, 'PUT /api/systems/[id]')
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return unauthorized()

    const { data: userData } = await supabase.from('users').select('organization_id').eq('id', user.id).single()
    if (!userData?.organization_id) return NextResponse.json({ error: 'No organization' }, { status: 400 })

    const { id } = await params
    return NextResponse.json({ success: true })
  } catch (err) {
    return serverError(err, 'DELETE /api/systems/[id]')
  }
}
