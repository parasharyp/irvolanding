// ─── Plan & Org ─────────────────────────────────────────────────────────
export type OrgPlan = 'starter' | 'growth' | 'plus'

export const PLAN_SYSTEM_LIMITS: Record<OrgPlan, number> = {
  starter: 3,
  growth: 10,
  plus: 25,
}

export type ComplianceModule =
  | 'literacy'
  | 'transparency'
  | 'deployer'
  | 'governance'
  | 'fria'
  | 'risk-review'
  | 'registration'

// Each module is unlocked at its minimum plan tier and above.
export const MODULE_MIN_PLAN: Record<ComplianceModule, OrgPlan> = {
  literacy: 'starter',
  transparency: 'starter',
  deployer: 'growth',
  governance: 'growth',
  fria: 'plus',
  'risk-review': 'plus',
  registration: 'plus',
}

const PLAN_RANK: Record<OrgPlan, number> = { starter: 0, growth: 1, plus: 2 }

export function hasModuleAccess(plan: OrgPlan, module: ComplianceModule): boolean {
  return PLAN_RANK[plan] >= PLAN_RANK[MODULE_MIN_PLAN[module]]
}

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

// ─── AI Systems ─────────────────────────────────────────────────────────
export type RiskLevel = 'none' | 'limited' | 'high' | 'unacceptable'

export type SystemStatus = 'draft' | 'in-progress' | 'ready' | 'exported'

export interface AISystem {
  id: string
  organization_id: string
  name: string
  description: string
  owner_name: string
  owner_email: string
  business_process: string
  data_sources: string[]
  model_type: string
  tags: string[]
  risk_level: RiskLevel | null
  annex_category: string | null
  classification_rationale: string | null
  immediate_actions: string[]
  pct_complete: number
  status: SystemStatus
  created_at: string
  updated_at: string
}

// ─── Questionnaire ──────────────────────────────────────────────────────
export type QuestionType = 'single' | 'multi' | 'text'

export interface QuestionOption {
  value: string
  label: string
}

export interface QuestionnaireQuestion {
  id: string
  text: string
  hint?: string
  type: QuestionType
  options?: QuestionOption[]
  triggersHighRisk?: boolean
}

// ─── Obligations ────────────────────────────────────────────────────────
export type ObligationKey =
  | 'risk-management'
  | 'data-governance'
  | 'technical-documentation'
  | 'transparency-disclosure'
  | 'human-oversight'
  | 'accuracy-robustness'
  | 'conformity-assessment'
  | 'logging-monitoring'
  | 'incident-reporting'
  | 'post-market-monitoring'
  | 'general-transparency'
  | 'gpai-obligations'

export interface Obligation {
  id: string
  system_id: string
  obligation_key: ObligationKey
  article: string
  title: string
  description: string
  evidence_required: string
  is_complete: boolean
  sort_order: number
  created_at: string
}

// ─── Evidence ───────────────────────────────────────────────────────────
export type EvidenceItemType = 'document' | 'log' | 'test' | 'declaration' | 'note'

export interface EvidenceItem {
  id: string
  system_id: string
  obligation_id: string
  item_type: EvidenceItemType
  title: string
  content: string | null
  file_path: string | null
  file_name: string | null
  ai_drafted: boolean
  reviewed: boolean
  created_at: string
  updated_at: string
}

// ─── Exports ────────────────────────────────────────────────────────────
export type ExportFormat = 'pdf' | 'docx'

export interface Export {
  id: string
  system_id: string
  format: ExportFormat
  file_path: string | null
  file_name: string | null
  created_at: string
}

// ─── Classification result (from AI) ────────────────────────────────────
export interface ClassificationResult {
  riskLevel: RiskLevel
  annexCategory: string | null
  rationale: string
  obligations: Array<{
    key: ObligationKey
    article: string
    title: string
    description: string
    evidenceRequired: string
  }>
  immediateActions: string[]
}

// ─── Dashboard ──────────────────────────────────────────────────────────
export interface DashboardSystemSummary {
  id: string
  name: string
  risk_level: RiskLevel | null
  status: SystemStatus
  pct_complete: number
  obligation_count: number
  obligations_complete: number
  evidence_count: number
  evidence_ai_drafted: number
  updated_at: string
}

export interface DashboardInsight {
  type: 'warning' | 'action' | 'info' | 'success'
  title: string
  description: string
  system_id?: string
  system_name?: string
}

export interface DashboardMetrics {
  total_systems: number
  systems_by_risk: Record<RiskLevel, number>
  avg_completion: number
  systems_ready: number
  systems_draft: number
  systems_in_progress: number
  systems_exported: number
  days_until_deadline: number
  // New: richer data
  compliance_score: number // 0-100 weighted score
  total_obligations: number
  obligations_complete: number
  total_evidence: number
  evidence_ai_drafted: number
  systems: DashboardSystemSummary[]
  insights: DashboardInsight[]
}
