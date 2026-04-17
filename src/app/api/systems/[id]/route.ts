import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { badRequest, notFound, serverError, rateLimited } from '@/lib/api-error'
import { getAuthContext } from '@/lib/auth'
import { checkAuthenticatedRateLimit } from '@/lib/ratelimit'
import { parseBody, requireJson } from '@/lib/validate-body'
import { validateUuid } from '@/lib/validate-params'

type RouteContext = { params: Promise<{ id: string }> }

// GET /api/systems/[id] — fetch single system + obligations
export async function GET(_req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    const idErr = validateUuid(id); if (idErr) return idErr
    const auth = await getAuthContext()
    if ('error' in auth) return auth.error
    const { supabase, user, orgId } = auth

    const rateCheck = await checkAuthenticatedRateLimit(user.id)
    if (!rateCheck.allowed) {
      return rateLimited(rateCheck.resetAt)
    }

    const { data: system, error } = await supabase
      .from('systems')
      .select('*')
      .eq('id', id)
      .eq('organization_id', orgId)
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
    const idErr = validateUuid(id); if (idErr) return idErr
    const auth = await getAuthContext()
    if ('error' in auth) return auth.error
    const { supabase, user, orgId } = auth

    const rateCheck = await checkAuthenticatedRateLimit(user.id)
    if (!rateCheck.allowed) {
      return rateLimited(rateCheck.resetAt)
    }

    const ctErr = requireJson(req); if (ctErr) return ctErr
    const { data: body, error: bodyErr } = await parseBody(req); if (bodyErr) return bodyErr
    const parsed = updateSystemSchema.safeParse(body)
    if (!parsed.success) {
      return badRequest(parsed.error.issues[0].message)
    }

    const { data: system, error } = await supabase
      .from('systems')
      .update({ ...parsed.data, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('organization_id', orgId)
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
    const idErr = validateUuid(id); if (idErr) return idErr
    const auth = await getAuthContext()
    if ('error' in auth) return auth.error
    const { supabase, user, orgId } = auth

    const rateCheck = await checkAuthenticatedRateLimit(user.id)
    if (!rateCheck.allowed) {
      return rateLimited(rateCheck.resetAt)
    }

    const { error } = await supabase
      .from('systems')
      .delete()
      .eq('id', id)
      .eq('organization_id', orgId)

    if (error) return serverError(error, 'DELETE /api/systems/[id]')

    return new NextResponse(null, { status: 204 })
  } catch (err) {
    return serverError(err, 'DELETE /api/systems/[id]')
  }
}
