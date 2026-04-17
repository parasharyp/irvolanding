import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { serverError, rateLimited, badRequest } from '@/lib/api-error'
import { getAuthContext } from '@/lib/auth'
import { checkAuthenticatedRateLimit } from '@/lib/ratelimit'
import { parseBody, requireJson } from '@/lib/validate-body'

const UpdateOrgSchema = z.object({ name: z.string().min(1).max(200) }).strict()

export async function GET() {
  try {
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
  } catch (err) {
    return serverError(err, 'GET /api/settings/org')
  }
}

export async function PATCH(request: NextRequest) {
  try {
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
    if (!parsed.success) return badRequest('Invalid input')

    const { data, error } = await supabase.from('organizations').update({ name: parsed.data.name }).eq('id', orgId).select().single()
    if (error) return serverError(error, 'PATCH /api/settings/org')
    return NextResponse.json(data)
  } catch (err) {
    return serverError(err, 'PATCH /api/settings/org')
  }
}
