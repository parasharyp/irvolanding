import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { badRequest, serverError, rateLimited, notFound } from '@/lib/api-error'
import { getAuthContext } from '@/lib/auth'
import { checkAuthenticatedRateLimit, checkDraftRateLimit } from '@/lib/ratelimit'
import { generateRegistrationDossier, REGISTRATION_ROLES, type RegistrationRole } from '@/lib/ai/registration'
import { renderRegistrationPdf } from '@/lib/pdf-registration'
import { parseBody, requireJson } from '@/lib/validate-body'
import { formatDate } from '@/lib/utils'

const bodySchema = z.object({
  systemId: z.string().uuid(),
  role: z.enum(REGISTRATION_ROLES),
  providerName: z.string().max(200).optional(),
  memberStates: z.string().max(300).optional(),
})

// POST /api/registration — generate Article 49 / Annex VIII preparatory dossier for one system
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

    const { data: system } = await supabase
      .from('systems')
      .select('name, description, risk_level, annex_category')
      .eq('id', parsed.data.systemId)
      .eq('organization_id', orgId)
      .single()

    if (!system) return notFound('System')

    const dossier = await generateRegistrationDossier({
      organisationName: org?.name ?? 'Your organisation',
      role: parsed.data.role as RegistrationRole,
      systemName: system.name ?? 'Unnamed system',
      systemDescription: system.description ?? '',
      riskLevel: system.risk_level ?? 'none',
      annexCategory: system.annex_category,
      providerName: parsed.data.providerName ?? '',
      memberStates: parsed.data.memberStates ?? '',
    })

    const pdf = await renderRegistrationPdf(dossier, formatDate(new Date().toISOString()))
    const slug = `${(org?.name ?? 'org').replace(/[^a-z0-9]/gi, '-')}-${(system.name ?? 'system').replace(/[^a-z0-9]/gi, '-')}`

    return new NextResponse(pdf as unknown as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${slug}-art49-registration-dossier.pdf"`,
        'Cache-Control': 'no-store',
      },
    })
  } catch (err) {
    return serverError(err, 'POST /api/registration')
  }
}
