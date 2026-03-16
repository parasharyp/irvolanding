import { Invoice } from '@/types'
import { daysBetween } from '@/lib/utils'

export interface PredictionResult {
  predictedDelayDays: number
  predictedPaymentDate: string // ISO date string
  confidence: number // 0–1
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr)
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
}

function variance(values: number[]): number {
  if (values.length < 2) return 0
  const mean = values.reduce((a, b) => a + b, 0) / values.length
  const sqDiffs = values.map((v) => Math.pow(v - mean, 2))
  return sqDiffs.reduce((a, b) => a + b, 0) / values.length
}

export function predictInvoicePayment(invoice: Invoice, history: Invoice[]): PredictionResult {
  const paid = history
    .filter((i) => i.status === 'paid' && i.paid_at && i.id !== invoice.id)
    .sort((a, b) => new Date(b.paid_at!).getTime() - new Date(a.paid_at!).getTime())
    .slice(0, 5) // use last 5 payments

  if (paid.length === 0) {
    // No history — predict due date with low confidence
    return {
      predictedDelayDays: 0,
      predictedPaymentDate: invoice.due_date,
      confidence: 0.3,
    }
  }

  const delays = paid.map((inv) => daysBetween(inv.due_date, inv.paid_at!))

  // Weighted average: more recent payments weighted higher
  const weights = delays.map((_, i) => paid.length - i)
  const totalWeight = weights.reduce((a, b) => a + b, 0)
  const weightedDelay = delays.reduce((sum, delay, i) => sum + delay * weights[i], 0) / totalWeight

  const predictedDelayDays = Math.round(weightedDelay)

  // Confidence: inverse of variance, normalised
  const v = variance(delays)
  const maxVariance = 400 // ~20 day std dev considered max chaos
  const confidence = Math.round(Math.max(0.1, Math.min(0.99, 1 - v / maxVariance)) * 100) / 100

  return {
    predictedDelayDays,
    predictedPaymentDate: addDays(invoice.due_date, predictedDelayDays),
    confidence,
  }
}
