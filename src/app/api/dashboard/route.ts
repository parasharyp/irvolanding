import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { calculateInterest } from '@/lib/interest'
import { Invoice } from '@/types'
import { daysBetween } from '@/lib/utils'

export async function GET() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: userData } = await supabase.from('users').select('organization_id').eq('id', user.id).single()
  const orgId = userData?.organization_id
  if (!orgId) return NextResponse.json({ error: 'No organization' }, { status: 400 })

  const { data: invoices } = await supabase.from('invoices').select('*').eq('organization_id', orgId)
  if (!invoices) return NextResponse.json({ outstanding_balance: 0, overdue_count: 0, interest_recoverable: 0, avg_days_late: 0, paid_this_month: 0, recovery_rate: 0, total_invoices: 0, monthly_trend: [], pipeline: {}, activity_feed: [], upcoming_due: [], recent_invoices: [] })

  const unpaid = invoices.filter((i) => i.status !== 'paid')
  const overdue = invoices.filter((i) => i.status === 'overdue' || i.status === 'escalated')

  const outstanding_balance = unpaid.reduce((sum, i) => sum + Number(i.amount), 0)
  const overdue_count = overdue.length

  const interest_recoverable = overdue.reduce((sum, inv) => {
    const { total } = calculateInterest(inv as Invoice)
    return sum + total
  }, 0)

  const totalDaysLate = overdue.reduce((sum, inv) => sum + daysBetween(inv.due_date), 0)
  const avg_days_late = overdue.length > 0 ? Math.round(totalDaysLate / overdue.length) : 0

  // Pipeline breakdown by status
  const pipeline: Record<string, { count: number; amount: number }> = {
    draft: { count: 0, amount: 0 },
    pending: { count: 0, amount: 0 },
    overdue: { count: 0, amount: 0 },
    escalated: { count: 0, amount: 0 },
    paid: { count: 0, amount: 0 },
  }
  for (const inv of invoices) {
    const s = inv.status as string
    if (pipeline[s]) { pipeline[s].count++; pipeline[s].amount += Number(inv.amount) }
  }

  // Paid this month
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()
  const paid_this_month = invoices
    .filter((i) => i.status === 'paid' && i.paid_at && i.paid_at >= monthStart)
    .reduce((sum, i) => sum + Number(i.amount), 0)

  // Recovery rate
  const paid_count = invoices.filter((i) => i.status === 'paid').length
  const recovery_rate = invoices.length > 0 ? Math.round((paid_count / invoices.length) * 100) : 0

  // Monthly trend (last 6 months) with amounts
  const monthlyData: Record<string, { month: string; overdue: number; paid: number; overdue_amount: number; paid_amount: number }> = {}
  for (let i = 5; i >= 0; i--) {
    const d = new Date(); d.setMonth(d.getMonth() - i)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const label = d.toLocaleString('en-GB', { month: 'short', year: '2-digit' })
    monthlyData[key] = { month: label, overdue: 0, paid: 0, overdue_amount: 0, paid_amount: 0 }
  }
  for (const inv of invoices) {
    const key = inv.due_date.slice(0, 7)
    if (monthlyData[key]) {
      if (inv.status === 'paid') { monthlyData[key].paid++; monthlyData[key].paid_amount += Number(inv.amount) }
      else if (inv.status === 'overdue' || inv.status === 'escalated') { monthlyData[key].overdue++; monthlyData[key].overdue_amount += Number(inv.amount) }
    }
  }

  // Activity feed from invoice_events for this org's invoices
  const invoiceIds = invoices.map((i) => i.id)
  const invMap = Object.fromEntries(invoices.map((i) => [i.id, i.invoice_number]))
  let activity_feed: unknown[] = []
  if (invoiceIds.length > 0) {
    const { data: events } = await supabase
      .from('invoice_events')
      .select('*')
      .in('invoice_id', invoiceIds)
      .order('event_timestamp', { ascending: false })
      .limit(12)
    activity_feed = (events ?? []).map((e) => ({ ...e, invoice_number: invMap[e.invoice_id] ?? 'Unknown' }))
  }

  // Upcoming due dates (next 14 days, unpaid)
  const todayStr = new Date().toISOString().slice(0, 10)
  const in14Str = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  const upcoming_due = invoices
    .filter((i) => i.status !== 'paid' && i.due_date >= todayStr && i.due_date <= in14Str)
    .sort((a, b) => a.due_date.localeCompare(b.due_date))
    .slice(0, 6)

  return NextResponse.json({
    outstanding_balance,
    overdue_count,
    interest_recoverable,
    avg_days_late,
    paid_this_month,
    recovery_rate,
    total_invoices: invoices.length,
    monthly_trend: Object.values(monthlyData),
    pipeline,
    activity_feed,
    upcoming_due,
    recent_invoices: [...invoices]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 6),
  })
}
