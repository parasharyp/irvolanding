import { Invoice } from '@/types'
import { daysBetween } from '@/lib/utils'

export const BASE_RATE = 0.05 // BoE base rate — update as needed
export const STATUTORY_ADDITION = 0.08
export const EFFECTIVE_RATE = BASE_RATE + STATUTORY_ADDITION // 13%

export function getCompensationFee(amount: number): number {
  if (amount < 1000) return 40
  if (amount < 10000) return 70
  return 100
}

export interface InterestResult {
  days_overdue: number
  interest_rate: number
  daily_rate: number
  interest_amount: number
  compensation_fee: number
  total: number
}

export function calculateInterest(invoice: Invoice, asOf: Date = new Date()): InterestResult {
  const days_overdue = Math.max(0, daysBetween(invoice.due_date, asOf))
  const interest_rate = EFFECTIVE_RATE
  const daily_rate = interest_rate / 365
  const interest_amount = parseFloat((invoice.amount * daily_rate * days_overdue).toFixed(2))
  const compensation_fee = getCompensationFee(invoice.amount)
  const total = parseFloat((interest_amount + compensation_fee).toFixed(2))

  return {
    days_overdue,
    interest_rate,
    daily_rate,
    interest_amount,
    compensation_fee,
    total,
  }
}
