import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/server'

const Schema = z.object({
  user_id: z.string().uuid(),
  email: z.string().email(),
  name: z.string(),
  org_name: z.string(),
})

export async function POST(request: NextRequest) {
  const body = await request.json()
  const parsed = Schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid data' }, { status: 422 })

  const { user_id, email, name, org_name } = parsed.data
  const admin = await createAdminClient()

  // Create organization
  const { data: org, error: orgError } = await admin
    .from('organizations')
    .insert({ name: org_name, owner_user_id: user_id })
    .select()
    .single()

  if (orgError) return NextResponse.json({ error: orgError.message }, { status: 500 })

  // Create user profile
  const { error: userError } = await admin.from('users').insert({
    id: user_id,
    email,
    name,
    organization_id: org.id,
  })

  if (userError) {
    // Rollback org
    await admin.from('organizations').delete().eq('id', org.id)
    return NextResponse.json({ error: userError.message }, { status: 500 })
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
