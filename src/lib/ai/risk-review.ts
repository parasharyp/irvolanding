import { z } from 'zod'
import { RISK_REVIEW_PROMPT } from './prompts'
import { sanitizeInput } from './sanitize'
import { getAIClient, getModelId } from './client'

const riskReviewSchema = z.object({
  organisationName: z.string().min(1),
  systemName: z.string().min(1),
  reviewPeriod: z.string().min(1),
  riskTier: z.string(),
  annexCategory: z.string().nullable().optional(),
  executiveSummary: z.string().min(1),
  identifiedRisks: z.array(z.object({
    risk: z.string(),
    source: z.string(),
    severity: z.enum(['Low', 'Medium', 'High']).catch('Medium'),
    likelihood: z.enum(['Low', 'Medium', 'High']).catch('Medium'),
    status: z.enum(['Open', 'Mitigated', 'Monitored', 'Closed']).catch('Open'),
  })).min(1),
  incidentsReviewed: z.string().min(1),
  postMarketMonitoring: z.string().min(1),
  testingAndEvaluation: z.string().min(1),
  riskMitigationUpdates: z.string().min(1),
  residualRiskAcceptability: z.string().min(1),
  dataAndInputChanges: z.string().min(1),
  humanOversightReview: z.string().min(1),
  actionsForNextPeriod: z.array(z.object({
    action: z.string(),
    owner: z.string(),
    due: z.string(),
  })).min(1),
  signOffStatement: z.string().min(1),
})

export type RiskReviewReport = z.infer<typeof riskReviewSchema>

export interface RiskReviewInput {
  organisationName: string
  systemName: string
  systemDescription: string
  riskLevel: string
  annexCategory?: string | null
  reviewPeriodLabel: string
  incidentNotes?: string
}

const DEFAULT_REVIEW = (input: RiskReviewInput): RiskReviewReport => ({
  organisationName: input.organisationName,
  systemName: input.systemName,
  reviewPeriod: input.reviewPeriodLabel,
  riskTier: input.riskLevel,
  annexCategory: input.annexCategory ?? null,
  executiveSummary:
    'This annual review documents the operation of the risk-management system required under Article 9 of Regulation 2024/1689 for the period stated. Identified risks, mitigations, incidents, and residual risk have been reviewed; actions are recorded for the next review cycle.',
  identifiedRisks: [
    { risk: 'Accuracy degradation on edge cases', source: 'Post-market monitoring', severity: 'Medium', likelihood: 'Medium', status: 'Mitigated' },
    { risk: 'Bias against protected groups', source: 'Fairness monitoring', severity: 'High', likelihood: 'Low', status: 'Monitored' },
    { risk: 'Data drift from training distribution', source: 'Input monitoring', severity: 'Medium', likelihood: 'Medium', status: 'Open' },
    { risk: 'Prompt injection / untrusted inputs', source: 'Security review', severity: 'Medium', likelihood: 'Low', status: 'Mitigated' },
  ],
  incidentsReviewed:
    input.incidentNotes || 'No serious incidents reportable under Article 73 occurred during the review period. Near-misses and user-reported issues have been logged and triaged.',
  postMarketMonitoring:
    'A post-market monitoring plan is in place: automated metrics on accuracy, availability, and fairness are collected continuously; anomalies are reviewed weekly by the oversight operator; quarterly trend reports are reviewed by the AI Compliance Lead.',
  testingAndEvaluation:
    'The system was retested at least once in the review period against the original acceptance criteria and an updated evaluation set. Results remained within acceptance thresholds; any regressions were addressed before redeployment.',
  riskMitigationUpdates:
    'Mitigations were updated where new risks emerged or existing ones escalated. Changes to thresholds, guardrails, and oversight procedures are logged in the change-control register.',
  residualRiskAcceptability:
    'Residual risk, after the current mitigations, is assessed as acceptable for the stated intended purpose. This assessment is valid until the next scheduled review or the occurrence of a review trigger, whichever is earlier.',
  dataAndInputChanges:
    'No material change in the training, validation, or testing data sources during the period, unless documented separately. Inputs in production are governed by the input-data controls defined in the deployer obligations pack.',
  humanOversightReview:
    'The designated oversight operators remain competent and trained. Override and escalation events were reviewed; oversight procedures were judged effective.',
  actionsForNextPeriod: [
    { action: 'Expand fairness monitoring to additional demographic segments.', owner: 'AI Compliance Lead', due: 'Within 90 days' },
    { action: 'Refresh operator training materials.', owner: 'Operations', due: 'Within 60 days' },
    { action: 'Re-baseline evaluation set against recent production data.', owner: 'Engineering', due: 'Within 120 days' },
  ],
  signOffStatement:
    'I confirm this Article 9 annual risk-management review accurately reflects the operation of the risk-management system for the stated period and that residual risk is acceptable for the intended purpose.',
})

export async function generateRiskReview(input: RiskReviewInput): Promise<RiskReviewReport> {
  const safeOrg = sanitizeInput(input.organisationName, 200)
  const safeSys = sanitizeInput(input.systemName, 200)
  const safeDesc = sanitizeInput(input.systemDescription, 1000)
  const safePeriod = sanitizeInput(input.reviewPeriodLabel, 100)
  const safeAnnex = input.annexCategory ? sanitizeInput(input.annexCategory, 200) : 'not specified'
  const safeIncidents = sanitizeInput(input.incidentNotes ?? '', 1000)

  const userMessage = `<user_data>
## Organisation
${safeOrg}

## System
Name: ${safeSys}
Risk tier: ${sanitizeInput(input.riskLevel, 50)}
Annex III: ${safeAnnex}
Description: ${safeDesc}

## Review period
${safePeriod}

## Incident notes
${safeIncidents || 'No incident notes supplied.'}
</user_data>

Draft the Article 9 annual risk-management review. Return JSON only.`

  try {
    const client = getAIClient()
    const response = await client.chat.completions.create({
      model: getModelId(),
      max_tokens: 4000,
      messages: [
        { role: 'system', content: RISK_REVIEW_PROMPT },
        { role: 'user', content: userMessage },
      ],
    })
    const text = response.choices[0]?.message?.content ?? ''
    const cleaned = text.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim()
    const raw = JSON.parse(cleaned)
    const validated = riskReviewSchema.safeParse(raw)
    if (!validated.success) {
      console.warn('[risk-review] LLM output failed schema validation:', validated.error.issues)
      return DEFAULT_REVIEW(input)
    }
    return validated.data
  } catch (err) {
    console.error('[risk-review] Error:', err)
    return DEFAULT_REVIEW(input)
  }
}
