import { Invoice } from '@/types'
import { predictInvoicePayment } from './paymentPrediction'

export interface CashflowForecast {
  next_30_days_expected: number
  next_60_days_expected: number
  next_90_days_expected: number
  high_confidence: number
  medium_confidence: number
  low_confidence: number
  daily_buckets: Array<{ date: string; amount: number; confidence: number }>
}

export function generateCashflowForecast(invoices: Invoice[]): CashflowForecast {
  const unpaid = invoices.filter((i) => i.status !== 'paid')
  const history = invoices.filter((i) => i.status === 'paid' && i.paid_at)

  const today = new Date()
  const in30 = new Date(today); in30.setDate(today.getDate() + 30)
  const in60 = new Date(today); in60.setDate(today.getDate() + 60)
  const in90 = new Date(today); in90.setDate(today.getDate() + 90)

  const buckets: Record<string, { amount: number; confidence: number }> = {}
  let next_30 = 0, next_60 = 0, next_90 = 0
  let high = 0, medium = 0, low = 0

  for (const invoice of unpaid) {
    const prediction = predictInvoicePayment(invoice, history)
    const payDate = new Date(prediction.predictedPaymentDate)

    if (payDate > in90) continue

    const dateKey = prediction.predictedPaymentDate
    if (!buckets[dateKey]) buckets[dateKey] = { amount: 0, confidence: prediction.confidence }
    buckets[dateKey].amount += Number(invoice.amount)

    if (payDate <= in30) next_30 += Number(invoice.amount)
    if (payDate <= in60) next_60 += Number(invoice.amount)
    if (payDate <= in90) next_90 += Number(invoice.amount)

    if (prediction.confidence >= 0.75) high += Number(invoice.amount)
    else if (prediction.confidence >= 0.45) medium += Number(invoice.amount)
    else low += Number(invoice.amount)
  }

  const daily_buckets = Object.entries(buckets)
    .map(([date, { amount, confidence }]) => ({ date, amount, confidence }))
    .sort((a, b) => a.date.localeCompare(b.date))

  return {
    next_30_days_expected: Math.round(next_30 * 100) / 100,
    next_60_days_expected: Math.round(next_60 * 100) / 100,
    next_90_days_expected: Math.round(next_90 * 100) / 100,
    high_confidence: Math.round(high * 100) / 100,
    medium_confidence: Math.round(medium * 100) / 100,
    low_confidence: Math.round(low * 100) / 100,
    daily_buckets,
  }
}
