import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { serverError, unauthorized } from '@/lib/api-error'

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

  const body = await request.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })

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

  // Seed default reminder templates
  const templates = [1, 2, 3, 4].map((stage) => ({
    organization_id: org.id,
    stage,
    subject: getDefaultSubject(stage),
    body: getDefaultBody(stage),
  }))

  await admin.from('reminder_templates').insert(templates)

  return NextResponse.json({ ok: true, org_id: org.id })
}

function getDefaultSubject(stage: number): string {
  const subjects: Record<number, string> = {
    1: 'Friendly reminder: Invoice {{invoice_number}} due soon',
    2: 'Invoice {{invoice_number}} is now overdue',
    3: 'Notice: Statutory interest accruing on invoice {{invoice_number}}',
    4: 'FINAL NOTICE: Invoice {{invoice_number}} — escalation pending',
  }
  return subjects[stage]
}

function getDefaultBody(stage: number): string {
  const bodies: Record<number, string> = {
    1: `Dear {{client_name}},\n\nThis is a friendly reminder that invoice {{invoice_number}} for {{amount}} is due on {{due_date}}.\n\nPlease arrange payment at your earliest convenience.\n\nKind regards,\n{{org_name}}`,
    2: `Dear {{client_name}},\n\nInvoice {{invoice_number}} for {{amount}} was due on {{due_date}} and remains unpaid.\n\nPlease arrange immediate payment to avoid further action.\n\nKind regards,\n{{org_name}}`,
    3: `Dear {{client_name}},\n\nInvoice {{invoice_number}} for {{amount}} is now {{days_overdue}} days overdue.\n\nUnder the Late Payment of Commercial Debts (Interest) Act 1998, statutory interest of {{interest_rate}} per annum is accruing.\n\nInterest to date: {{interest_amount}}\nCompensation fee: {{compensation_fee}}\nTotal now due: {{total_due}}\n\nPlease settle urgently.\n\nKind regards,\n{{org_name}}`,
    4: `Dear {{client_name}},\n\nDespite previous reminders, invoice {{invoice_number}} for {{amount}} remains unpaid after {{days_overdue}} days.\n\nIf payment is not received within 7 days, we will escalate to debt recovery and/or legal proceedings.\n\nTotal outstanding: {{total_due}}\n\nYours faithfully,\n{{org_name}}`,
  }
  return bodies[stage]
}
