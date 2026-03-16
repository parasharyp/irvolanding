import { Invoice } from '@/types'
import { daysBetween } from '@/lib/utils'

export type RiskTier = 'low' | 'moderate' | 'high' | 'severe'

export interface RiskScoreResult {
  score: number
  tier: RiskTier
  averageDelay: number
  lateRatio: number
  paymentVariance: number
  daysSinceLastPayment: number
  totalInvoices: number
  paidInvoices: number
}

function tierFromScore(score: number): RiskTier {
  if (score <= 20) return 'low'
  if (score <= 50) return 'moderate'
  if (score <= 75) return 'high'
  return 'severe'
}

function variance(values: number[]): number {
  if (values.length < 2) return 0
  const mean = values.reduce((a, b) => a + b, 0) / values.length
  const sqDiffs = values.map((v) => Math.pow(v - mean, 2))
  return Math.sqrt(sqDiffs.reduce((a, b) => a + b, 0) / values.length)
}

export function calculateClientRiskScore(invoices: Invoice[]): RiskScoreResult {
  const paid = invoices.filter((i) => i.status === 'paid' && i.paid_at)

  if (paid.length === 0) {
    // No payment history — default moderate risk
    return {
      score: 30,
      tier: 'moderate',
      averageDelay: 0,
      lateRatio: 0,
      paymentVariance: 0,
      daysSinceLastPayment: 999,
      totalInvoices: invoices.length,
      paidInvoices: 0,
    }
  }

  // Compute delay per paid invoice (days after due_date)
  const delays = paid.map((inv) => {
    const delay = daysBetween(inv.due_date, inv.paid_at!)
    return delay // positive = late, negative = early
  })

  const lateInvoices = delays.filter((d) => d > 0)
  const averageDelay = delays.reduce((a, b) => a + b, 0) / delays.length
  const lateRatio = lateInvoices.length / paid.length
  const paymentVariance = variance(delays)

  // Days since last payment
  const lastPaidDate = paid
    .map((i) => new Date(i.paid_at!).getTime())
    .sort((a, b) => b - a)[0]
  const daysSinceLastPayment = Math.max(0, daysBetween(new Date(lastPaidDate)))

  // Score formula
  const rawScore =
    Math.max(0, averageDelay) * 0.6 +
    lateRatio * 40 +
    Math.min(daysSinceLastPayment, 90) * 0.2 +
    paymentVariance * 10

  const score = Math.round(Math.min(100, Math.max(0, rawScore)))

  return {
    score,
    tier: tierFromScore(score),
    averageDelay: Math.round(averageDelay * 10) / 10,
    lateRatio: Math.round(lateRatio * 1000) / 1000,
    paymentVariance: Math.round(paymentVariance * 10) / 10,
    daysSinceLastPayment,
    totalInvoices: invoices.length,
    paidInvoices: paid.length,
  }
}
