import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { badRequest, serverError, rateLimited } from '@/lib/api-error'
import { getAuthContext } from '@/lib/auth'
import { checkAuthenticatedRateLimit, checkDraftRateLimit } from '@/lib/ratelimit'
import { generateLiteracyBriefing, LITERACY_ROLES, type LiteracyRole } from '@/lib/ai/literacy'
import { requireModule } from '@/lib/plan-access'
import { renderLiteracyPdf } from '@/lib/pdf-literacy'
import { parseBody, requireJson } from '@/lib/validate-body'
import { formatDate } from '@/lib/utils'

const bodySchema = z.object({
  roles: z.array(z.enum(LITERACY_ROLES)).min(1).max(LITERACY_ROLES.length),
})

// POST /api/literacy — generate Article 4 literacy briefing PDF for the org
export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthContext()
    if ('error' in auth) return auth.error
    const { supabase, user, orgId } = auth

    const rate = await checkAuthenticatedRateLimit(user.id)
    if (!rate.allowed) return rateLimited(rate.resetAt)
    const aiRate = await checkDraftRateLimit(orgId)
    if (!aiRate.allowed) return rateLimited(aiRate.resetAt)

    const gate = await requireModule(supabase, orgId, 'literacy')
    if (!gate.ok) return gate.response

    const ctErr = requireJson(req); if (ctErr) return ctErr
    const { data: body, error: bodyErr } = await parseBody(req); if (bodyErr) return bodyErr
    const parsed = bodySchema.safeParse(body)
    if (!parsed.success) return badRequest(parsed.error.issues[0].message)

    const { data: org } = await supabase
      .from('organizations')
      .select('name')
      .eq('id', orgId)
      .single()

    const { data: systems } = await supabase
      .from('systems')
      .select('name, description, risk_level, annex_category')
      .eq('organization_id', orgId)
      .in('status', ['in-progress', 'ready', 'exported'])

    const briefing = await generateLiteracyBriefing({
      organisationName: org?.name ?? 'Your organisation',
      systems: (systems ?? []).map((s) => ({
        name: s.name ?? 'Unnamed system',
        riskLevel: s.risk_level ?? 'none',
        description: s.description ?? '',
        annexCategory: s.annex_category,
      })),
      roles: parsed.data.roles as LiteracyRole[],
    })

    const pdf = await renderLiteracyPdf(briefing, formatDate(new Date().toISOString()))

    return new NextResponse(pdf as unknown as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${(org?.name ?? 'organisation').replace(/[^a-z0-9]/gi, '-')}-ai-literacy-briefing.pdf"`,
        'Cache-Control': 'no-store',
      },
    })
  } catch (err) {
    return serverError(err, 'POST /api/literacy')
  }
}
