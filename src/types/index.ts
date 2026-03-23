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

// ─── AI Systems types ───────────────────────────────────────────────────────

export type RiskLevel = 'unacceptable' | 'high' | 'limited' | 'minimal' | 'unknown'

export type AnnexIIICategory =
  | 'biometric' | 'critical_infrastructure' | 'education'
  | 'employment' | 'essential_services' | 'law_enforcement'
  | 'migration' | 'justice' | 'none'

export interface AISystem {
  id: string
  organization_id: string
  name: string
  description: string
  owner: string
  data_sources: string
  model_type: string
  business_process: string
  risk_level: RiskLevel
  annex_iii_category: AnnexIIICategory | null
  articles_applicable: string[]
  obligations_total: number
  obligations_complete: number
  classification_completed: boolean
  created_at: string
  updated_at: string
}

export interface QuestionnaireAnswer {
  question_id: string
  question: string
  answer: string
}

export interface Obligation {
  id: string
  system_id: string
  article: string
  title: string
  description: string
  evidence_required: string
  is_complete: boolean
  created_at: string
}

export interface Evidence {
  id: string
  obligation_id: string
  system_id: string
  type: 'text' | 'file'
  content: string | null
  file_url: string | null
  file_name: string | null
  created_at: string
}
