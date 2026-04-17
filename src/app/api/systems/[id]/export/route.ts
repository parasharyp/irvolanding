import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { badRequest, notFound, serverError, rateLimited } from '@/lib/api-error'
import { getAuthContext } from '@/lib/auth'
import { checkAuthenticatedRateLimit } from '@/lib/ratelimit'
import { parseBody, requireJson } from '@/lib/validate-body'
import { validateUuid } from '@/lib/validate-params'
import { generateEvidencePack } from '@/lib/pdf'

type RouteContext = { params: Promise<{ id: string }> }

const exportSchema = z.object({
  format: z.enum(['pdf']),
})

// POST /api/systems/[id]/export — generate and return a PDF evidence pack
export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const { id: systemId } = await context.params
    const idErr = validateUuid(systemId); if (idErr) return idErr
    const auth = await getAuthContext()
    if ('error' in auth) return auth.error
    const { supabase, user, orgId } = auth

    const rateCheck = await checkAuthenticatedRateLimit(user.id)
    if (!rateCheck.allowed) {
      return rateLimited(rateCheck.resetAt)
    }

    const ctErr = requireJson(req); if (ctErr) return ctErr
    const { data: body, error: bodyErr } = await parseBody(req); if (bodyErr) return bodyErr
    const parsed = exportSchema.safeParse(body)
    if (!parsed.success) {
      return badRequest(parsed.error.issues[0].message)
    }

    // Fetch system
    const { data: system, error: sysError } = await supabase
      .from('systems')
      .select('*')
      .eq('id', systemId)
      .eq('organization_id', orgId)
      .single()

    if (sysError || !system) return notFound('System')

    // Fetch obligations
    const { data: obligations } = await supabase
      .from('obligations')
      .select('*')
      .eq('system_id', systemId)
      .order('sort_order', { ascending: true })

    // Fetch all evidence items for this system
    const { data: evidence } = await supabase
      .from('evidence_items')
      .select('*')
      .eq('system_id', systemId)
      .order('created_at', { ascending: true })

    // Fetch org name
    const { data: org } = await supabase
      .from('organizations')
      .select('name')
      .eq('id', orgId)
      .single()

    // Generate PDF
    const pdfBuffer = await generateEvidencePack({
      system,
      obligations: obligations ?? [],
      evidence: evidence ?? [],
      orgName: org?.name ?? 'Organisation',
    })

    // Update system status
    await supabase
      .from('systems')
      .update({ status: 'exported', updated_at: new Date().toISOString() })
      .eq('id', systemId)
      .eq('organization_id', orgId)

    // Record export
    await supabase
      .from('exports')
      .insert({
        system_id: systemId,
        format: 'pdf',
      })

    const sanitizedName = system.name.replace(/[^a-zA-Z0-9-_ ]/g, '').trim() || 'system'
    const fileName = `${sanitizedName}-evidence-pack.pdf`

    const uint8 = new Uint8Array(pdfBuffer)
    return new NextResponse(uint8, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    })
  } catch (err) {
    return serverError(err, 'POST /api/systems/[id]/export')
  }
}
