import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/server'
import { checkPublicRateLimit } from '@/lib/ratelimit'

const Schema = z.object({
  email: z.string().email().max(254),
  full_name: z.string().max(200).optional(),
  company_name: z.string().max(200).optional(),
  source: z.string().max(100).default('landing-page'),
})

function getClientIp(req: NextRequest): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req)
  const { allowed, resetAt } = await checkPublicRateLimit(ip)
  if (!allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429, headers: { 'Retry-After': String(resetAt - Math.floor(Date.now() / 1000)) } }
    )
  }

  const raw = await req.json().catch(() => null)
  if (!raw) return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })

  const parsed = Schema.safeParse(raw)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', detail: parsed.error.flatten().fieldErrors }, { status: 422 })
  }

  const admin = await createAdminClient()
  const email = parsed.data.email.toLowerCase()

  const { data: existing } = await admin
    .from('waitlist')
    .select('id')
    .eq('email', email)
    .single()

  if (existing) {
    return NextResponse.json({ success: true, duplicate: true })
  }

  const { error } = await admin.from('waitlist').insert({
    email,
    full_name: parsed.data.full_name ?? null,
    company_name: parsed.data.company_name ?? null,
    source: parsed.data.source,
  })

  if (error) {
    console.error('[API error] POST /api/waitlist:', error.message)
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 })
  }

  return NextResponse.json({ success: true, duplicate: false })
}
