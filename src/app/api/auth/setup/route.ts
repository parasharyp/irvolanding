import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { serverError, unauthorized } from '@/lib/api-error'
import { checkAuthenticatedRateLimit, checkSignupRateLimit } from '@/lib/ratelimit'
import { extractIp } from '@/lib/security'
import { parseBody, requireJson } from '@/lib/validate-body'

const Schema = z.object({
  user_id: z.string().uuid(),
  email: z.string().email().max(254),
  name: z.string().min(1).max(200),
  org_name: z.string().min(2).max(200),
})

export async function POST(request: NextRequest) {
  // CRIT-1: Verify the caller is actually the user they claim to be
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return unauthorized()

  const rateCheck = await checkAuthenticatedRateLimit(user.id)
  if (!rateCheck.allowed) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
  }

  // Signup-specific rate limit — 5 per hour per IP to prevent account farming
  const ip = extractIp(request.headers)
  const signupRate = await checkSignupRateLimit(ip)
  if (!signupRate.allowed) {
    return NextResponse.json({ error: 'Too many signup attempts. Try again later.' }, { status: 429 })
  }

  const ctErr = requireJson(request); if (ctErr) return ctErr
  const { data: body, error: bodyErr } = await parseBody(request); if (bodyErr) return bodyErr

  const parsed = Schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid data' }, { status: 422 })

  const { user_id, email, name, org_name } = parsed.data

  // CRIT-1: The authenticated user must match the user_id in the body
  if (user.id !== user_id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const admin = await createAdminClient()

  // HIGH-1: Idempotency — if user already has an org, return it
  const { data: existing } = await admin
    .from('users')
    .select('organization_id')
    .eq('id', user_id)
    .single()

  if (existing?.organization_id) {
    return NextResponse.json({ ok: true, org_id: existing.organization_id })
  }

  // Create organization
  const { data: org, error: orgError } = await admin
    .from('organizations')
    .insert({ name: org_name, owner_user_id: user_id })
    .select()
    .single()

  if (orgError) return serverError(orgError, 'POST /api/auth/setup — org insert')

  // Create user profile
  const { error: userError } = await admin.from('users').insert({
    id: user_id,
    email,
    name,
    organization_id: org.id,
  })

  if (userError) {
    await admin.from('organizations').delete().eq('id', org.id)
    return serverError(userError, 'POST /api/auth/setup — user insert')
  }

  return NextResponse.json({ ok: true, org_id: org.id })
}
