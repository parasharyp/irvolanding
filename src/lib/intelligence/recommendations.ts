import { RiskScoreResult, RiskTier } from './riskScore'

export interface Recommendation {
  priority: 'high' | 'medium' | 'low'
  action: string
  reason: string
}

export function generateRecommendations(risk: RiskScoreResult): Recommendation[] {
  const recs: Recommendation[] = []

  if (risk.score > 80) {
    recs.push({
      priority: 'high',
      action: 'Require a 50% deposit upfront',
      reason: `This client has a risk score of ${risk.score} — they pay an average of ${risk.averageDelay} days late.`,
    })
    recs.push({
      priority: 'high',
      action: 'Shorten payment terms to 7 days',
      reason: `${Math.round(risk.lateRatio * 100)}% of their invoices have been paid late. Shorter terms reduce exposure.`,
    })
    recs.push({
      priority: 'high',
      action: 'Escalate reminders immediately when overdue',
      reason: 'High-severity clients respond better to prompt, firm communication.',
    })
  } else if (risk.score > 60) {
    recs.push({
      priority: 'medium',
      action: 'Send pre-due reminders 5 days early',
      reason: `Average payment delay of ${risk.averageDelay} days suggests this client benefits from early nudges.`,
    })
    recs.push({
      priority: 'medium',
      action: 'Follow up personally 2 days after due date',
      reason: 'Moderate-risk clients often respond to a personal touch before automated reminders.',
    })
  } else if (risk.score > 40) {
    recs.push({
      priority: 'low',
      action: 'Maintain standard 30-day terms',
      reason: 'Payment history is acceptable but monitor for changes.',
    })
  } else {
    recs.push({
      priority: 'low',
      action: 'Consider offering extended 45–60 day terms',
      reason: `This client has an excellent payment record (score: ${risk.score}). Flexible terms may strengthen the relationship.`,
    })
    recs.push({
      priority: 'low',
      action: 'Eligible for preferred client status',
      reason: `Only ${Math.round(risk.lateRatio * 100)}% of their invoices have been paid late.`,
    })
  }

  if (risk.daysSinceLastPayment > 60 && risk.totalInvoices > 0) {
    recs.push({
      priority: 'medium',
      action: 'Re-engage client — no payment in 60+ days',
      reason: 'Long gaps between invoices can indicate a stalled relationship.',
    })
  }

  return recs
}

export const TIER_COLOURS: Record<RiskTier, { bg: string; text: string; label: string }> = {
  low:      { bg: '#d1fae5', text: '#065f46', label: 'Low Risk' },
  moderate: { bg: '#fef3c7', text: '#92400e', label: 'Moderate' },
  high:     { bg: '#fee2e2', text: '#991b1b', label: 'High Risk' },
  severe:   { bg: '#4c0519', text: '#fecdd3', label: 'Severe' },
}
