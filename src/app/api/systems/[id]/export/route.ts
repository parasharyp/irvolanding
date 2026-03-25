import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { unauthorized, badRequest, notFound, serverError } from '@/lib/api-error'
import { checkAuthenticatedRateLimit } from '@/lib/ratelimit'
import { generateEvidencePack } from '@/lib/pdf'

type RouteContext = { params: Promise<{ id: string }> }

const exportSchema = z.object({
  format: z.enum(['pdf']),
})

// POST /api/systems/[id]/export — generate and return a PDF evidence pack
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

    const body = await req.json()
    const parsed = exportSchema.safeParse(body)
    if (!parsed.success) {
      return badRequest(parsed.error.issues[0].message)
    }

    // Fetch system
    const { data: system, error: sysError } = await supabase
      .from('systems')
      .select('*')
      .eq('id', systemId)
      .eq('organization_id', profile.organization_id)
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
      .eq('id', profile.organization_id)
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

    // Record export
    await supabase
      .from('exports')
      .insert({
        system_id: systemId,
        format: 'pdf',
      })

    const fileName = `${system.name.replace(/[^a-zA-Z0-9-_ ]/g, '')}-evidence-pack.pdf`

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
