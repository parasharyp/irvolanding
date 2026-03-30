import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { serverError, rateLimited } from '@/lib/api-error'
import { getAuthContext } from '@/lib/auth'
import { checkAuthenticatedRateLimit } from '@/lib/ratelimit'
import { parseBody, requireJson } from '@/lib/validate-body'

const UpdateOrgSchema = z.object({ name: z.string().min(1) })

export async function GET() {
  const auth = await getAuthContext()
  if ('error' in auth) return auth.error
  const { supabase, user, orgId } = auth

  const rateLimit = await checkAuthenticatedRateLimit(user.id)
  if (!rateLimit.allowed) {
    return rateLimited(rateLimit.resetAt)
  }

  const { data, error } = await supabase.from('organizations').select('*').eq('id', orgId).single()
  if (error) return serverError(error, 'GET /api/settings/org')
  return NextResponse.json(data)
}

export async function PATCH(request: NextRequest) {
  const auth = await getAuthContext()
  if ('error' in auth) return auth.error
  const { supabase, user, orgId } = auth

  const rateLimit = await checkAuthenticatedRateLimit(user.id)
  if (!rateLimit.allowed) {
    return rateLimited(rateLimit.resetAt)
  }

  const ctErr = requireJson(request); if (ctErr) return ctErr
  const { data: body, error: bodyErr } = await parseBody(request); if (bodyErr) return bodyErr
  const parsed = UpdateOrgSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })

  const { data, error } = await supabase.from('organizations').update(parsed.data).eq('id', orgId).select().single()
  if (error) return serverError(error, 'PATCH /api/settings/org')
  return NextResponse.json(data)
}
