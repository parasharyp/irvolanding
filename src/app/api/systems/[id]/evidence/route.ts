import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { unauthorized, badRequest, notFound, serverError } from '@/lib/api-error'
import { checkAuthenticatedRateLimit } from '@/lib/ratelimit'

type RouteContext = { params: Promise<{ id: string }> }

// GET /api/systems/[id]/evidence — list all evidence items for a system
export async function GET(_req: NextRequest, context: RouteContext) {
  try {
    const { id: systemId } = await context.params
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return unauthorized()

    const { data: profile } = await supabase
      .from('users')
      .select('organization_id')
      .eq('id', user.id)
      .single()
    if (!profile) return unauthorized()

    const rateCheck = await checkAuthenticatedRateLimit(user.id)
    if (!rateCheck.allowed) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
    }

    // Verify system belongs to org
    const { data: system } = await supabase
      .from('systems')
      .select('id')
      .eq('id', systemId)
      .eq('organization_id', profile.organization_id)
      .single()

    if (!system) return notFound('System')

    const { data: evidence, error } = await supabase
      .from('evidence_items')
      .select('*')
      .eq('system_id', systemId)
      .order('created_at', { ascending: false })

    if (error) return serverError(error, 'GET /api/systems/[id]/evidence')

    return NextResponse.json({ evidence: evidence ?? [] })
  } catch (err) {
    return serverError(err, 'GET /api/systems/[id]/evidence')
  }
}

const createEvidenceSchema = z.object({
  obligation_id: z.string().uuid('Valid obligation_id is required'),
  item_type: z.enum(['document', 'log', 'test', 'declaration', 'note']),
  title: z.string().min(1).max(500),
  content: z.string().max(50000).nullable().optional(),
  file_path: z.string().max(1000).nullable().optional(),
  file_name: z.string().max(500).nullable().optional(),
  ai_drafted: z.boolean().optional().default(false),
}).refine(
  (d) => (d.content && d.content.length > 0) || (d.file_path && d.file_path.length > 0),
  { message: 'Either content or file_path is required' }
)

// POST /api/systems/[id]/evidence — create an evidence item
export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const { id: systemId } = await context.params
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return unauthorized()

    const { data: profile } = await supabase
      .from('users')
      .select('organization_id')
      .eq('id', user.id)
      .single()
    if (!profile) return unauthorized()

    const rateCheck = await checkAuthenticatedRateLimit(user.id)
    if (!rateCheck.allowed) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
    }

    // Verify system belongs to org
    const { data: system } = await supabase
      .from('systems')
      .select('id')
      .eq('id', systemId)
      .eq('organization_id', profile.organization_id)
      .single()

    if (!system) return notFound('System')

    const body = await req.json()
    const parsed = createEvidenceSchema.safeParse(body)
    if (!parsed.success) {
      return badRequest(parsed.error.issues[0].message)
    }

    // Verify obligation belongs to this system
    const { data: obligation } = await supabase
      .from('obligations')
      .select('id')
      .eq('id', parsed.data.obligation_id)
      .eq('system_id', systemId)
      .single()

    if (!obligation) return notFound('Obligation')

    // Insert evidence item
    const { data: evidenceItem, error: insertError } = await supabase
      .from('evidence_items')
      .insert({
        system_id: systemId,
        obligation_id: parsed.data.obligation_id,
        item_type: parsed.data.item_type,
        title: parsed.data.title,
        content: parsed.data.content ?? null,
        file_path: parsed.data.file_path ?? null,
        file_name: parsed.data.file_name ?? null,
        ai_drafted: parsed.data.ai_drafted,
      })
      .select()
      .single()

    if (insertError) return serverError(insertError, 'POST evidence: insert')

    // Mark obligation as complete (has evidence now)
    await supabase
      .from('obligations')
      .update({ is_complete: true })
      .eq('id', parsed.data.obligation_id)

    // Recompute system pct_complete
    const { data: allObligations } = await supabase
      .from('obligations')
      .select('is_complete')
      .eq('system_id', systemId)

    if (allObligations && allObligations.length > 0) {
      const complete = allObligations.filter((o) => o.is_complete).length
      const pctComplete = Math.round((complete / allObligations.length) * 100)

      await supabase
        .from('systems')
        .update({
          pct_complete: pctComplete,
          updated_at: new Date().toISOString(),
        })
        .eq('id', systemId)
    }

    return NextResponse.json({ evidence: evidenceItem }, { status: 201 })
  } catch (err) {
    return serverError(err, 'POST /api/systems/[id]/evidence')
  }
}
