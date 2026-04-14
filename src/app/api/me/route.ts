import { NextResponse } from 'next/server'
import { serverError, rateLimited } from '@/lib/api-error'
import { getAuthContext } from '@/lib/auth'
import { checkAuthenticatedRateLimit } from '@/lib/ratelimit'
import type { OrgPlan } from '@/types'

// GET /api/me — current org plan (lightweight, for gating UX)
export async function GET() {
  try {
    const auth = await getAuthContext()
    if ('error' in auth) return auth.error
    const { supabase, user, orgId } = auth

    const rate = await checkAuthenticatedRateLimit(user.id)
    if (!rate.allowed) return rateLimited(rate.resetAt)

    const { data: org } = await supabase
      .from('organizations').select('plan').eq('id', orgId).single()

    return NextResponse.json({ plan: (org?.plan ?? 'starter') as OrgPlan })
  } catch (err) {
    return serverError(err, 'GET /api/me')
  }
}
