export type InvoiceStatus = 'pending' | 'paid' | 'overdue' | 'escalated'
export type OrgPlan = 'starter' | 'studio' | 'firm'

export interface Organization {
  id: string
  name: string
  owner_user_id: string
  plan: OrgPlan
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  created_at: string
}

export interface User {
  id: string
  email: string
  name: string | null
  organization_id: string
  created_at: string
}

export interface Client {
  id: string
  organization_id: string
  name: string
  email: string
  company: string | null
  risk_score: number
  risk_tier: RiskTier
  created_at: string
}

export interface Invoice {
  id: string
  organization_id: string
  client_id: string
  invoice_number: string
  amount: number
  currency: string
  issue_date: string
  due_date: string
  paid_at?: string | null
  status: InvoiceStatus
  created_at: string
  client?: Client
}

export interface PaymentPrediction {
  id: string
  invoice_id: string
  predicted_delay_days: number
  predicted_payment_date: string
  confidence: number
  created_at: string
}

export type RiskTier = 'low' | 'moderate' | 'high' | 'severe'

export interface InvoiceEvent {
  id: string
  invoice_id: string
  event_type: string
  event_timestamp: string
  metadata: Record<string, unknown>
}

export interface InterestCalculation {
  id: string
  invoice_id: string
  principal: number
  interest_rate: number
  days_overdue: number
  interest_amount: number
  compensation_fee: number
  calculated_at: string
}

export interface ReminderTemplate {
  id: string
  organization_id: string
  stage: 1 | 2 | 3 | 4
  subject: string
  body: string
  created_at: string
}

export interface ReminderLog {
  id: string
  invoice_id: string
  client_id: string
  stage: number
  sent_at: string
  email_subject: string
  email_body: string
}

export interface EvidencePack {
  id: string
  invoice_id: string
  file_url: string
  generated_at: string
}

export interface DashboardMetrics {
  outstanding_balance: number
  overdue_count: number
  interest_recoverable: number
  avg_days_late: number
}
