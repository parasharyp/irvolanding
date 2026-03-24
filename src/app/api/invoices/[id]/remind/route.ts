import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createClient } from '@/lib/supabase/server'
import { unauthorized } from '@/lib/api-error'
import { checkReminderRateLimit, checkInvoiceReminderLimit, checkRecipientReminderLimit } from '@/lib/ratelimit'
import { calculateInterest } from '@/lib/interest'
import { determineReminderStage, DEFAULT_TEMPLATES, renderTemplate } from '@/lib/reminders'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Invoice } from '@/types'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return unauthorized()

  // Get user org
  const { data: userData } = await supabase.from('users').select('organization_id').eq('id', user.id).single()
  const orgId = userData?.organization_id
  if (!orgId) return NextResponse.json({ error: 'No organization' }, { status: 400 })

  // Rate limit check
  const rateLimit = await checkReminderRateLimit(orgId)
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Maximum 20 reminder emails per hour.' },
      { status: 429, headers: { 'X-RateLimit-Reset': String(rateLimit.resetAt) } }
    )
  }

  // Fetch invoice + client + org — filter by org to prevent IDOR
  const { data: invoice, error: invoiceError } = await supabase
    .from('invoices')
    .select('*, client:clients(id, name, email, company)')
    .eq('id', id)
    .eq('organization_id', orgId)
    .single()

  if (invoiceError || !invoice) return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
  if (invoice.status === 'paid') return NextResponse.json({ error: 'Invoice is already paid' }, { status: 400 })

  // Per-invoice rate limit (3 reminders/day per invoice)
  const invoiceLimit = await checkInvoiceReminderLimit(id)
  if (!invoiceLimit.allowed) {
    return NextResponse.json(
      { error: 'This invoice has reached its daily reminder limit (3/day).' },
      { status: 429, headers: { 'X-RateLimit-Reset': String(invoiceLimit.resetAt) } }
    )
  }

  // Per-recipient rate limit (10 emails/hour to same address)
  const recipientEmail = invoice.client?.email as string | undefined
  if (recipientEmail) {
    const recipientLimit = await checkRecipientReminderLimit(recipientEmail)
    if (!recipientLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many emails sent to this recipient recently.' },
        { status: 429, headers: { 'X-RateLimit-Reset': String(recipientLimit.resetAt) } }
      )
    }
  }

  const { data: org } = await supabase.from('organizations').select('name').eq('id', orgId).single()

  // Determine stage — allow override from body (must be 1–4)
  const body = await request.json().catch(() => ({}))
  const rawStage = body.stage
  let stage: number
  if (rawStage !== undefined) {
    const parsed = Number(rawStage)
    if (!Number.isInteger(parsed) || parsed < 1 || parsed > 4) {
      return NextResponse.json({ error: 'stage must be an integer between 1 and 4' }, { status: 400 })
    }
    stage = parsed
  } else {
    stage = determineReminderStage(invoice as Invoice) ?? 2
  }

  // Get template (custom org template > default)
  const { data: customTemplate } = await supabase
    .from('reminder_templates')
    .select('*')
    .eq('organization_id', orgId)
    .eq('stage', stage)
    .single()

  const interestResult = calculateInterest(invoice as Invoice)

  const templateVars: Record<string, string> = {
    invoice_number: invoice.invoice_number,
    client_name: invoice.client?.name ?? 'Client',
    amount: formatCurrency(invoice.amount, invoice.currency),
    due_date: formatDate(invoice.due_date),
    org_name: org?.name ?? 'Your creditor',
    days_overdue: String(interestResult.days_overdue),
    interest_rate: `${(interestResult.interest_rate * 100).toFixed(1)}%`,
    interest_amount: formatCurrency(interestResult.interest_amount),
    compensation_fee: formatCurrency(interestResult.compensation_fee),
    total_due: formatCurrency(invoice.amount + interestResult.total),
  }

  const defaultTpl = DEFAULT_TEMPLATES[stage as keyof typeof DEFAULT_TEMPLATES]
  const subject = renderTemplate(customTemplate?.subject ?? defaultTpl.subject, templateVars)
  const bodyText = renderTemplate(customTemplate?.body ?? defaultTpl.body, templateVars)

  const escapeHtml = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')
  const htmlBody = `<pre style="font-family:sans-serif;white-space:pre-wrap">${escapeHtml(bodyText)}</pre>`

  // Send email
// Send email
if (!resend) return NextResponse.json({ error: 'Email service not configured' }, { status: 503 })
  const { error: emailError } = await resend.emails.send({
    from: `Irvo <noreply@${process.env.RESEND_DOMAIN ?? 'irvo.co.uk'}>`,
    to: invoice.client.email,
    subject,
    html: htmlBody,
  })

  if (emailError) {
    console.error('[API error] POST remind — email send failed:', emailError)
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }

  // Log reminder
  await supabase.from('reminder_logs').insert({
    invoice_id: id,
    client_id: invoice.client_id,
    stage,
    email_subject: subject,
    email_body: bodyText,
  })

  // Log event
  await supabase.from('invoice_events').insert({
    invoice_id: id,
    event_type: 'reminder_sent',
    metadata: { stage, to: invoice.client.email },
  })

  return NextResponse.json({ sent: true, stage, to: invoice.client.email, remaining_quota: rateLimit.remaining })
}
