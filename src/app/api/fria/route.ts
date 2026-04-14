import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { badRequest, serverError, rateLimited, notFound } from '@/lib/api-error'
import { getAuthContext } from '@/lib/auth'
import { checkAuthenticatedRateLimit, checkDraftRateLimit } from '@/lib/ratelimit'
import { requireModule } from '@/lib/plan-access'
import { generateFriaReport, AFFECTED_GROUP_CATEGORIES } from '@/lib/ai/fria'
import { renderFriaPdf } from '@/lib/pdf-fria'
import { parseBody, requireJson } from '@/lib/validate-body'
import { formatDate } from '@/lib/utils'

const bodySchema = z.object({
  systemId: z.string().uuid(),
  deploymentContext: z.string().min(1).max(500),
  affectedGroups: z.array(z.enum(AFFECTED_GROUP_CATEGORIES)).min(1).max(AFFECTED_GROUP_CATEGORIES.length),
})

// POST /api/fria — generate Article 27 Fundamental Rights Impact Assessment for one system
export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthContext()
    if ('error' in auth) return auth.error
    const { supabase, user, orgId } = auth

    const rate = await checkAuthenticatedRateLimit(user.id)
    if (!rate.allowed) return rateLimited(rate.resetAt)
    const aiRate = await checkDraftRateLimit(orgId)
    if (!aiRate.allowed) return rateLimited(aiRate.resetAt)

    const gate = await requireModule(supabase, orgId, 'fria')
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

    const { data: system } = await supabase
      .from('systems')
      .select('name, description, risk_level, annex_category')
      .eq('id', parsed.data.systemId)
      .eq('organization_id', orgId)
      .single()

    if (!system) return notFound('System')

    const report = await generateFriaReport({
      organisationName: org?.name ?? 'Your organisation',
      systemName: system.name ?? 'Unnamed system',
      systemDescription: system.description ?? '',
      riskLevel: system.risk_level ?? 'none',
      annexCategory: system.annex_category,
      deploymentContext: parsed.data.deploymentContext,
      affectedGroups: parsed.data.affectedGroups,
    })

    const pdf = await renderFriaPdf(report, formatDate(new Date().toISOString()))

    const slug = `${(org?.name ?? 'org').replace(/[^a-z0-9]/gi, '-')}-${(system.name ?? 'system').replace(/[^a-z0-9]/gi, '-')}`
    return new NextResponse(pdf as unknown as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${slug}-fria.pdf"`,
        'Cache-Control': 'no-store',
      },
    })
  } catch (err) {
    return serverError(err, 'POST /api/fria')
  }
}
