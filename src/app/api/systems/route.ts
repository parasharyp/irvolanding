import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { unauthorized, badRequest, serverError } from '@/lib/api-error'
import { checkAuthenticatedRateLimit } from '@/lib/ratelimit'
import { parseBody, requireJson } from '@/lib/validate-body'
import { PLAN_SYSTEM_LIMITS } from '@/types'
import type { OrgPlan } from '@/types'

// GET /api/systems — list all systems for the user's org
export async function GET() {
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

    const { data: systems, error } = await supabase
      .from('systems')
      .select('*')
      .eq('organization_id', profile.organization_id)
      .order('created_at', { ascending: false })

    if (error) return serverError(error, 'GET /api/systems')

    return NextResponse.json({ systems: systems ?? [] })
  } catch (err) {
    return serverError(err, 'GET /api/systems')
  }
}

const createSystemSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  description: z.string().max(2000).optional().default(''),
})

// POST /api/systems — create a new AI system
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

    const ctErr = requireJson(req); if (ctErr) return ctErr
    const { data: body, error: bodyErr } = await parseBody(req); if (bodyErr) return bodyErr
    const parsed = createSystemSchema.safeParse(body)
    if (!parsed.success) {
      return badRequest(parsed.error.issues[0].message)
    }

    // Check plan system limit
    const { data: org } = await supabase
      .from('organizations')
      .select('plan')
      .eq('id', profile.organization_id)
      .single()

    if (!org) return serverError(new Error('Organization not found'), 'POST /api/systems')

    const { count } = await supabase
      .from('systems')
      .select('id', { count: 'exact', head: true })
      .eq('organization_id', profile.organization_id)

    const limit = PLAN_SYSTEM_LIMITS[org.plan as OrgPlan] ?? 3
    if ((count ?? 0) >= limit) {
      return badRequest(`Plan limit reached. Your ${org.plan} plan allows ${limit} systems. Upgrade to add more.`)
    }

    const { data: system, error } = await supabase
      .from('systems')
      .insert({
        organization_id: profile.organization_id,
        name: parsed.data.name,
        description: parsed.data.description,
      })
      .select()
      .single()

    if (error) return serverError(error, 'POST /api/systems')

    return NextResponse.json({ system }, { status: 201 })
  } catch (err) {
    return serverError(err, 'POST /api/systems')
  }
}
