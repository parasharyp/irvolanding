import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { badRequest, serverError, rateLimited } from '@/lib/api-error'
import { getAuthContext } from '@/lib/auth'
import { checkAuthenticatedRateLimit, checkDraftRateLimit } from '@/lib/ratelimit'
import {
  generateTransparencyPack,
  AI_SURFACES,
  BRAND_TONES,
  type AiSurface,
  type BrandTone,
} from '@/lib/ai/transparency'
import { renderTransparencyPdf } from '@/lib/pdf-transparency'
import { requireModule } from '@/lib/plan-access'
import { parseBody, requireJson } from '@/lib/validate-body'
import { formatDate } from '@/lib/utils'

const bodySchema = z.object({
  surfaces: z.array(z.enum(AI_SURFACES)).min(1).max(AI_SURFACES.length),
  brandTone: z.enum(BRAND_TONES),
  productContext: z.string().max(1000).optional(),
})

// POST /api/transparency — generate Article 50 disclosure pack PDF for the org
export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthContext()
    if ('error' in auth) return auth.error
    const { supabase, user, orgId } = auth

    const rate = await checkAuthenticatedRateLimit(user.id)
    if (!rate.allowed) return rateLimited(rate.resetAt)
    const aiRate = await checkDraftRateLimit(orgId)
    if (!aiRate.allowed) return rateLimited(aiRate.resetAt)

    const gate = await requireModule(supabase, orgId, 'transparency')
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

    const pack = await generateTransparencyPack({
      organisationName: org?.name ?? 'Your organisation',
      surfaces: parsed.data.surfaces as AiSurface[],
      brandTone: parsed.data.brandTone as BrandTone,
      productContext: parsed.data.productContext,
    })

    const pdf = await renderTransparencyPdf(pack, formatDate(new Date().toISOString()))

    return new NextResponse(pdf as unknown as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${(org?.name ?? 'organisation').replace(/[^a-z0-9]/gi, '-')}-transparency-pack.pdf"`,
        'Cache-Control': 'no-store',
      },
    })
  } catch (err) {
    return serverError(err, 'POST /api/transparency')
  }
}
