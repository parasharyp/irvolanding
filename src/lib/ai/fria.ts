import { z } from 'zod'
import { FRIA_PROMPT } from './prompts'
import { sanitizeInput } from './sanitize'
import { getAIClient, getModelId } from './client'

export const AFFECTED_GROUP_CATEGORIES = [
  'employees',
  'job-applicants',
  'customers',
  'patients',
  'students',
  'credit-applicants',
  'insurance-applicants',
  'minors',
  'general-public',
  'vulnerable-adults',
] as const

export type AffectedGroup = typeof AFFECTED_GROUP_CATEGORIES[number]

const friaSchema = z.object({
  organisationName: z.string().min(1),
  systemName: z.string().min(1),
  systemPurpose: z.string().min(1),
  riskTier: z.string(),
  annexCategory: z.string().nullable().optional(),
  deploymentProcesses: z.string().min(1),
  periodAndFrequency: z.string().min(1),
  affectedGroups: z.array(z.object({
    group: z.string(),
    likelyImpact: z.string(),
  })).min(1),
  fundamentalRightsAtRisk: z.array(z.object({
    right: z.string(),
    riskDescription: z.string(),
    severity: z.enum(['Low', 'Medium', 'High']).catch('Medium'),
    likelihood: z.enum(['Low', 'Medium', 'High']).catch('Medium'),
  })).min(1),
  specificHarms: z.string().min(1),
  humanOversightMeasures: z.string().min(1),
  mitigationMeasures: z.string().min(1),
  complaintMechanism: z.string().min(1),
  residualRiskAssessment: z.string().min(1),
  notificationToMarketSurveillance: z.string().min(1),
  reviewTriggers: z.string().min(1),
  signOffStatement: z.string().min(1),
})

export type FriaReport = z.infer<typeof friaSchema>

export interface FriaInput {
  organisationName: string
  systemName: string
  systemDescription: string
  riskLevel: string
  annexCategory?: string | null
  deploymentContext: string
  affectedGroups: string[]
}

const DEFAULT_FRIA = (input: FriaInput): FriaReport => ({
  organisationName: input.organisationName,
  systemName: input.systemName,
  systemPurpose: input.systemDescription || 'See system documentation.',
  riskTier: input.riskLevel,
  annexCategory: input.annexCategory ?? null,
  deploymentProcesses:
    `The system is used within the organisation's ${input.deploymentContext || 'operational'} processes. Outputs feed into downstream decisions that affect natural persons and must be interpreted by competent human operators before being actioned.`,
  periodAndFrequency:
    'Ongoing deployment. Usage frequency to be determined by operational volume. This FRIA is reviewed annually and whenever material changes are made to the system, its inputs, or its intended purpose.',
  affectedGroups: input.affectedGroups.map((g) => ({
    group: g,
    likelyImpact: 'Subject to decisions made or materially assisted by the system; may experience accept/reject, prioritisation, or scoring outcomes.',
  })),
  fundamentalRightsAtRisk: [
    { right: 'Non-discrimination (Art. 21 Charter)', riskDescription: 'Training data or proxies may embed discrimination on protected characteristics.', severity: 'High', likelihood: 'Medium' },
    { right: 'Privacy and data protection (Art. 7–8 Charter)', riskDescription: 'Processing of personal data, potentially special categories.', severity: 'Medium', likelihood: 'Medium' },
    { right: 'Right to an effective remedy (Art. 47 Charter)', riskDescription: 'Affected persons may find it difficult to contest automated outputs without clear explanation.', severity: 'Medium', likelihood: 'Medium' },
    { right: 'Dignity and consumer protection (Art. 1, 38 Charter)', riskDescription: 'Automated decisions without meaningful human review may diminish dignity and consumer protection.', severity: 'Medium', likelihood: 'Low' },
  ],
  specificHarms:
    '- Unfair denial of service, opportunity, or benefit.\n- Loss of autonomy through opaque automated decision-making.\n- Economic loss from incorrect outputs.\n- Psychological harm from surveillance, profiling, or stigmatisation.\n- Disproportionate impact on vulnerable groups.',
  humanOversightMeasures:
    'Every output that materially affects a natural person is reviewed by a competent human operator before action. Operators have authority to override, request more information, or escalate. Operators are trained on the system\'s limitations and failure modes.',
  mitigationMeasures:
    '- Pre-deployment bias testing across protected groups; ongoing fairness monitoring.\n- Input data governance: documented sources, pre-processing, known limitations.\n- Output explanation at time of decision, to the extent technically feasible.\n- Clear user communication that an AI system is in use.\n- Regular review of false-positive/false-negative rates and impact by demographic cut.\n- Kill-switch: ability to suspend the system on evidence of material harm.',
  complaintMechanism:
    'Affected persons may request an explanation of an individual decision and lodge a complaint via a clearly published channel. Complaints are logged, investigated, and responded to within 30 days. Unresolved complaints are escalated to the AI Compliance Lead and, where appropriate, to the competent market surveillance authority or data protection authority.',
  residualRiskAssessment:
    'After the mitigations above, residual risk is assessed as acceptable for the stated intended purpose, subject to the monitoring cadence and review triggers below. Residual risk is reassessed whenever monitoring reveals a material change in performance or impact.',
  notificationToMarketSurveillance:
    'The results of this FRIA must be notified to the market surveillance authority using the template provided by the AI Office (Art. 27(4)). Where a DPIA under GDPR Article 35 has already been performed, this FRIA complements rather than replaces it.',
  reviewTriggers:
    '- Annual scheduled review.\n- Material change in system, inputs, or intended purpose.\n- A serious incident under Article 73.\n- Evidence from monitoring of disproportionate impact on a protected group.\n- Change in applicable law or regulatory guidance.',
  signOffStatement:
    'I confirm that this Fundamental Rights Impact Assessment has been conducted in accordance with Article 27 of Regulation 2024/1689 and that the residual risk is acceptable for the stated intended purpose.',
})

export async function generateFriaReport(input: FriaInput): Promise<FriaReport> {
  const safeOrg = sanitizeInput(input.organisationName, 200)
  const safeSystem = sanitizeInput(input.systemName, 200)
  const safeDesc = sanitizeInput(input.systemDescription, 1000)
  const safeContext = sanitizeInput(input.deploymentContext, 300)
  const safeAnnex = input.annexCategory ? sanitizeInput(input.annexCategory, 200) : 'not specified'
  const groupsText = input.affectedGroups.map((g) => `- ${sanitizeInput(g, 100)}`).join('\n')

  const userMessage = `<user_data>
## Organisation
${safeOrg}

## System
Name: ${safeSystem}
Risk tier: ${sanitizeInput(input.riskLevel, 50)}
Annex III category: ${safeAnnex}
Description: ${safeDesc}

## Deployment context
${safeContext}

## Affected groups
${groupsText || '- general-public'}
</user_data>

Draft the Article 27 Fundamental Rights Impact Assessment. Return JSON only.`

  try {
    const client = getAIClient()
    const response = await client.chat.completions.create({
      model: getModelId(),
      max_tokens: 4000,
      messages: [
        { role: 'system', content: FRIA_PROMPT },
        { role: 'user', content: userMessage },
      ],
    })
    const text = response.choices[0]?.message?.content ?? ''
    const cleaned = text.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim()
    const raw = JSON.parse(cleaned)
    const validated = friaSchema.safeParse(raw)
    if (!validated.success) {
      console.warn('[fria] LLM output failed schema validation:', validated.error.issues)
      return DEFAULT_FRIA(input)
    }
    return validated.data
  } catch (err) {
    console.error('[fria] Error:', err)
    return DEFAULT_FRIA(input)
  }
}
