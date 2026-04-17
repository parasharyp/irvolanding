import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { badRequest, notFound, serverError, rateLimited } from '@/lib/api-error'
import { getAuthContext } from '@/lib/auth'
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
    const auth = await getAuthContext()
    if ('error' in auth) return auth.error
    const { supabase, user, orgId } = auth

    const { data: org } = await supabase
      .from('organizations').select('plan').eq('id', orgId).single()
    if ((org?.plan ?? 'starter') === 'starter') {
      return NextResponse.json(
        { error: 'AI drafting requires the Growth plan or higher.', requiredPlan: 'growth', currentPlan: org?.plan ?? 'starter' },
        { status: 403 },
      )
    }

    const rateCheck = await checkAuthenticatedRateLimit(user.id)
    if (!rateCheck.allowed) {
      return rateLimited(rateCheck.resetAt)
    }

    // AI-specific rate limit — 30 drafts per hour per org
    const aiRateCheck = await checkDraftRateLimit(orgId)
    if (!aiRateCheck.allowed) {
      return rateLimited(aiRateCheck.resetAt)
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
      .eq('organization_id', orgId)
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
