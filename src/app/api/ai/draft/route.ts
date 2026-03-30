import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { unauthorized, badRequest, notFound, serverError } from '@/lib/api-error'
import { checkAuthenticatedRateLimit, checkDraftRateLimit } from '@/lib/ratelimit'
import { draftEvidenceSection } from '@/lib/ai/draft'
import { parseBody, requireJson } from '@/lib/validate-body'

const draftSchema = z.object({
  systemId: z.string().uuid(),
  obligationId: z.string().uuid(),
})

// POST /api/ai/draft — AI-draft an evidence section for an obligation
export async function POST(req: NextRequest) {
  try {
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

    // AI-specific rate limit — 30 drafts per hour per org
    const aiRateCheck = await checkDraftRateLimit(profile.organization_id)
    if (!aiRateCheck.allowed) {
      return NextResponse.json({ error: 'Draft rate limit exceeded. Try again later.' }, { status: 429 })
    }

    const ctErr = requireJson(req); if (ctErr) return ctErr
    const { data: body, error: bodyErr } = await parseBody(req); if (bodyErr) return bodyErr
    const parsed = draftSchema.safeParse(body)
    if (!parsed.success) {
      return badRequest(parsed.error.issues[0].message)
    }

    const { systemId, obligationId } = parsed.data

    // Fetch system (RLS scopes to org)
    const { data: system, error: sysError } = await supabase
      .from('systems')
      .select('*')
      .eq('id', systemId)
      .eq('organization_id', profile.organization_id)
      .single()

    if (sysError || !system) return notFound('System')

    // Fetch obligation
    const { data: obligation, error: oblError } = await supabase
      .from('obligations')
      .select('*')
      .eq('id', obligationId)
      .eq('system_id', systemId)
      .single()

    if (oblError || !obligation) return notFound('Obligation')

    // Generate draft via AI
    const draft = await draftEvidenceSection({ system, obligation })

    return NextResponse.json({ draft })
  } catch (err) {
    return serverError(err, 'POST /api/ai/draft')
  }
}
