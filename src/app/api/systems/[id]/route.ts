import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { unauthorized, badRequest, notFound, serverError } from '@/lib/api-error'
import { checkAuthenticatedRateLimit } from '@/lib/ratelimit'

type RouteContext = { params: Promise<{ id: string }> }

// GET /api/systems/[id] — fetch single system + obligations
export async function GET(_req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
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

    const { data: system, error } = await supabase
      .from('systems')
      .select('*')
      .eq('id', id)
      .eq('organization_id', profile.organization_id)
      .single()

    if (error || !system) return notFound('System')

    const { data: obligations } = await supabase
      .from('obligations')
      .select('*')
      .eq('system_id', id)
      .order('sort_order', { ascending: true })

    return NextResponse.json({ system, obligations: obligations ?? [] })
  } catch (err) {
    return serverError(err, 'GET /api/systems/[id]')
  }
}

const updateSystemSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  owner_name: z.string().max(200).optional(),
  owner_email: z.string().email().optional(),
  business_process: z.string().max(2000).optional(),
  data_sources: z.array(z.string()).optional(),
  model_type: z.string().optional(),
  status: z.enum(['draft', 'in-progress', 'ready', 'exported']).optional(),
}).strict()

// PATCH /api/systems/[id] — update system fields
export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
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
    const parsed = updateSystemSchema.safeParse(body)
    if (!parsed.success) {
      return badRequest(parsed.error.issues[0].message)
    }

    const { data: system, error } = await supabase
      .from('systems')
      .update({ ...parsed.data, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('organization_id', profile.organization_id)
      .select()
      .single()

    if (error || !system) return notFound('System')

    return NextResponse.json({ system })
  } catch (err) {
    return serverError(err, 'PATCH /api/systems/[id]')
  }
}

// DELETE /api/systems/[id] — delete system
export async function DELETE(_req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
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

    const { error } = await supabase
      .from('systems')
      .delete()
      .eq('id', id)
      .eq('organization_id', profile.organization_id)

    if (error) return serverError(error, 'DELETE /api/systems/[id]')

    return new NextResponse(null, { status: 204 })
  } catch (err) {
    return serverError(err, 'DELETE /api/systems/[id]')
  }
}
