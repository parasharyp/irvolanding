import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency = 'GBP'): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency,
  }).format(amount)
}

export function formatDate(date: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date))
}

export function daysBetween(from: string | Date, to: string | Date = new Date()): number {
  const a = new Date(from)
  const b = new Date(to)
  const ms = b.getTime() - a.getTime()
  return Math.floor(ms / (1000 * 60 * 60 * 24))
}
