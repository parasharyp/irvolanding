import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { badRequest, serverError, rateLimited } from '@/lib/api-error'
import { getAuthContext } from '@/lib/auth'
import { checkAuthenticatedRateLimit, checkDraftRateLimit } from '@/lib/ratelimit'
import { requireModule } from '@/lib/plan-access'
import { generateDeployerPack, WORKPLACE_CONTEXTS, type WorkplaceContext } from '@/lib/ai/deployer'
import { renderDeployerPdf } from '@/lib/pdf-deployer'
import { parseBody, requireJson } from '@/lib/validate-body'
import { formatDate } from '@/lib/utils'

const bodySchema = z.object({
  workplaceContexts: z.array(z.enum(WORKPLACE_CONTEXTS)).min(1).max(WORKPLACE_CONTEXTS.length),
})

// POST /api/deployer — generate Article 26 deployer obligations pack for the org
export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthContext()
    if ('error' in auth) return auth.error
    const { supabase, user, orgId } = auth

    const rate = await checkAuthenticatedRateLimit(user.id)
    if (!rate.allowed) return rateLimited(rate.resetAt)
    const aiRate = await checkDraftRateLimit(orgId)
    if (!aiRate.allowed) return rateLimited(aiRate.resetAt)

    const gate = await requireModule(supabase, orgId, 'deployer')
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

    const pack = await generateDeployerPack({
      organisationName: org?.name ?? 'Your organisation',
      systems: (systems ?? []).map((s) => ({
        name: s.name ?? 'Unnamed system',
        riskLevel: s.risk_level ?? 'none',
        description: s.description ?? '',
        annexCategory: s.annex_category,
      })),
      workplaceContexts: parsed.data.workplaceContexts as WorkplaceContext[],
    })

    const pdf = await renderDeployerPdf(pack, formatDate(new Date().toISOString()))

    return new NextResponse(pdf as unknown as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${(org?.name ?? 'organisation').replace(/[^a-z0-9]/gi, '-')}-deployer-obligations-pack.pdf"`,
        'Cache-Control': 'no-store',
      },
    })
  } catch (err) {
    return serverError(err, 'POST /api/deployer')
  }
}
