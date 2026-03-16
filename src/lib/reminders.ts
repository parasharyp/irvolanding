import { Invoice } from '@/types'
import { daysBetween } from '@/lib/utils'

export type ReminderStage = 1 | 2 | 3 | 4

export const REMINDER_STAGE_LABELS: Record<ReminderStage, string> = {
  1: 'Pre-due reminder',
  2: 'First overdue notice',
  3: 'Interest notice',
  4: 'Final escalation',
}

export const DEFAULT_TEMPLATES: Record<ReminderStage, { subject: string; body: string }> = {
  1: {
    subject: 'Friendly reminder: Invoice {{invoice_number}} due soon',
    body: `Dear {{client_name}},\n\nThis is a friendly reminder that invoice {{invoice_number}} for {{amount}} is due on {{due_date}}.\n\nPlease arrange payment at your earliest convenience.\n\nKind regards,\n{{org_name}}`,
  },
  2: {
    subject: 'Invoice {{invoice_number}} is now overdue',
    body: `Dear {{client_name}},\n\nInvoice {{invoice_number}} for {{amount}} was due on {{due_date}} and remains unpaid.\n\nPlease arrange immediate payment to avoid further action.\n\nKind regards,\n{{org_name}}`,
  },
  3: {
    subject: 'Notice: Statutory interest accruing on invoice {{invoice_number}}',
    body: `Dear {{client_name}},\n\nInvoice {{invoice_number}} for {{amount}} is now {{days_overdue}} days overdue.\n\nUnder the Late Payment of Commercial Debts (Interest) Act 1998, we are entitled to charge statutory interest at 8% above the Bank of England base rate (currently {{interest_rate}}% per annum).\n\nInterest accrued to date: {{interest_amount}}\nCompensation fee: {{compensation_fee}}\nTotal now due: {{total_due}}\n\nPlease settle this matter urgently.\n\nKind regards,\n{{org_name}}`,
  },
  4: {
    subject: 'FINAL NOTICE: Invoice {{invoice_number}} — escalation pending',
    body: `Dear {{client_name}},\n\nDespite previous reminders, invoice {{invoice_number}} for {{amount}} remains unpaid after {{days_overdue}} days.\n\nWe hereby give notice that if payment is not received within 7 days, we will escalate this matter to a debt recovery service and/or initiate legal proceedings.\n\nTotal outstanding (including statutory interest and compensation): {{total_due}}\n\nYours faithfully,\n{{org_name}}`,
  },
}

/**
 * Returns the appropriate reminder stage for an invoice, or null if no reminder is due.
 * Stage 1: 3 days before due date
 * Stage 2: 3+ days overdue
 * Stage 3: 14+ days overdue
 * Stage 4: 30+ days overdue
 */
export function determineReminderStage(invoice: Invoice): ReminderStage | null {
  if (invoice.status === 'paid') return null

  const daysUntilDue = daysBetween(new Date(), invoice.due_date) // negative = overdue
  const daysOverdue = -daysUntilDue

  if (daysOverdue >= 30) return 4
  if (daysOverdue >= 14) return 3
  if (daysOverdue >= 3) return 2
  if (daysUntilDue <= 3 && daysUntilDue >= 0) return 1
  return null
}

export function renderTemplate(
  template: string,
  vars: Record<string, string>
): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? `{{${key}}}`)
}
