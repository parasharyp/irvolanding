import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { badRequest, serverError, rateLimited } from '@/lib/api-error'
import { getAuthContext } from '@/lib/auth'
import { checkAuthenticatedRateLimit, checkDraftRateLimit } from '@/lib/ratelimit'
import { generateGovernancePack, GOVERNANCE_SCALES, type GovernanceScale } from '@/lib/ai/governance'
import { renderGovernancePdf } from '@/lib/pdf-governance'
import { parseBody, requireJson } from '@/lib/validate-body'
import { formatDate } from '@/lib/utils'

const bodySchema = z.object({
  organisationScale: z.enum(GOVERNANCE_SCALES),
})

// POST /api/governance — generate AI Governance Pack for the org
export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthContext()
    if ('error' in auth) return auth.error
    const { supabase, user, orgId } = auth

    const rate = await checkAuthenticatedRateLimit(user.id)
    if (!rate.allowed) return rateLimited(rate.resetAt)
    const aiRate = await checkDraftRateLimit(orgId)
    if (!aiRate.allowed) return rateLimited(aiRate.resetAt)

    const ctErr = requireJson(req); if (ctErr) return ctErr
    const { data: body, error: bodyErr } = await parseBody(req); if (bodyErr) return bodyErr
    const parsed = bodySchema.safeParse(body)
    if (!parsed.success) return badRequest(parsed.error.issues[0].message)

    const { data: org } = await supabase
      .from('organizations').select('name').eq('id', orgId).single()

    const { data: systems } = await supabase
      .from('systems').select('risk_level').eq('organization_id', orgId)
      .in('status', ['in-progress', 'ready', 'exported'])

    const hasHighRisk = (systems ?? []).some((s) => s.risk_level === 'high' || s.risk_level === 'unacceptable')

    const pack = await generateGovernancePack({
      organisationName: org?.name ?? 'Your organisation',
      organisationScale: parsed.data.organisationScale as GovernanceScale,
      systemsCount: systems?.length ?? 0,
      hasHighRiskSystems: hasHighRisk,
    })

    const pdf = await renderGovernancePdf(pack, formatDate(new Date().toISOString()))

    return new NextResponse(pdf as unknown as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${(org?.name ?? 'organisation').replace(/[^a-z0-9]/gi, '-')}-ai-governance-pack.pdf"`,
        'Cache-Control': 'no-store',
      },
    })
  } catch (err) {
    return serverError(err, 'POST /api/governance')
  }
}
