import { z } from 'zod'
import { GOVERNANCE_PROMPT } from './prompts'
import { sanitizeInput } from './sanitize'
import { getAIClient, getModelId } from './client'

export const GOVERNANCE_SCALES = ['micro', 'small', 'medium'] as const
export type GovernanceScale = typeof GOVERNANCE_SCALES[number]

const governanceSchema = z.object({
  organisationName: z.string().min(1),
  organisationScale: z.string(),
  aiPolicyStatement: z.string().min(1),
  scope: z.string().min(1),
  principles: z.string().min(1),
  rolesAndResponsibilities: z.array(z.object({
    role: z.string(),
    responsibilities: z.string(),
  })).min(1),
  raciMatrix: z.array(z.object({
    activity: z.string(),
    responsible: z.string(),
    accountable: z.string(),
    consulted: z.string(),
    informed: z.string(),
  })).min(1),
  committeeCharter: z.object({
    purpose: z.string(),
    membership: z.string(),
    meetingCadence: z.string(),
    decisionRights: z.string(),
  }),
  recordKeeping: z.string().min(1),
  approvedUseList: z.string().min(1),
  prohibitedUses: z.string().min(1),
  vendorAssessment: z.string().min(1),
  trainingRequirements: z.string().min(1),
  reviewCadence: z.string().min(1),
  signOffStatement: z.string().min(1),
})

export type GovernancePack = z.infer<typeof governanceSchema>

export interface GovernanceInput {
  organisationName: string
  organisationScale: GovernanceScale
  systemsCount: number
  hasHighRiskSystems: boolean
}

const DEFAULT_PACK = (input: GovernanceInput): GovernancePack => ({
  organisationName: input.organisationName,
  organisationScale: input.organisationScale,
  aiPolicyStatement:
    `${input.organisationName} uses AI systems to improve its operations and customer outcomes. Every deployment is governed, monitored, and subject to human oversight. This policy sets the standards that apply to the procurement, deployment, operation, and decommissioning of AI across the organisation.`,
  scope:
    'This policy applies to all employees, contractors, and third parties acting on behalf of the organisation in the selection, use, or operation of any AI system or automated decision-making component.',
  principles:
    '- Lawful, fair, and transparent use.\n- Human oversight in every material decision.\n- Proportionality between AI benefits and risks to rights.\n- Privacy and data protection by design.\n- Accountability: every AI system has a named owner.\n- Continuous monitoring and improvement.',
  rolesAndResponsibilities: [
    { role: 'Executive Sponsor', responsibilities: 'Accountable for AI strategy and risk appetite; approves high-risk deployments.' },
    { role: 'AI Compliance Lead', responsibilities: 'Owns the AI system register; runs classification, approvals, reviews; first escalation for incidents.' },
    { role: 'System Owner', responsibilities: 'Responsible for an individual AI system\'s configuration, monitoring, and user training.' },
    { role: 'Oversight Operator', responsibilities: 'Reviews AI outputs before material decisions; authorised to override or escalate.' },
    { role: 'Data Protection Officer (or equivalent)', responsibilities: 'Advises on DPIA triggers and GDPR intersection; liaises with supervisory authority.' },
  ],
  raciMatrix: [
    { activity: 'Classify a new AI system', responsible: 'AI Compliance Lead', accountable: 'Executive Sponsor', consulted: 'System Owner, DPO', informed: 'Leadership' },
    { activity: 'Approve high-risk deployment', responsible: 'AI Compliance Lead', accountable: 'Executive Sponsor', consulted: 'Legal, DPO', informed: 'System Owner' },
    { activity: 'Monitor AI outputs in production', responsible: 'Oversight Operator', accountable: 'System Owner', consulted: 'AI Compliance Lead', informed: 'Executive Sponsor' },
    { activity: 'Report Article 73 incident', responsible: 'AI Compliance Lead', accountable: 'Executive Sponsor', consulted: 'Legal, DPO', informed: 'Market surveillance authority' },
    { activity: 'Annual Art. 9 review', responsible: 'AI Compliance Lead', accountable: 'Executive Sponsor', consulted: 'System Owner, Oversight Operator', informed: 'Leadership' },
  ],
  committeeCharter: {
    purpose: 'Provide executive oversight of AI risk, ethics, and compliance across the organisation.',
    membership: 'Executive Sponsor (chair), AI Compliance Lead, DPO, Head of Engineering, Head of Operations, Legal (ad hoc).',
    meetingCadence: input.organisationScale === 'micro' ? 'Quarterly, or on demand.' : input.organisationScale === 'small' ? 'Monthly.' : 'Monthly, with operational standup weekly.',
    decisionRights: 'Approves or vetoes new high-risk AI deployments; approves annual Art. 9 reviews; approves FRIAs; owns response to serious incidents.',
  },
  recordKeeping:
    'The organisation maintains an AI system register with, at minimum: system name, provider, purpose, risk tier, Annex III category, owner, date of deployment, review cadence, incident log, and linked evidence artefacts (classification, FRIA, deployer pack, Art. 9 review). All records retained for at least six years.',
  approvedUseList:
    'Approved AI uses are those passing classification and, where applicable, FRIA review. The AI Compliance Lead maintains the canonical list. Any new use requires classification before production deployment.',
  prohibitedUses:
    '- Systems prohibited under Article 5 (manipulation, exploitation of vulnerabilities, social scoring by public authority, untargeted scraping of facial images, emotion inference at work/education with limited exceptions, biometric categorisation by protected characteristics, real-time remote biometric identification in public spaces for law enforcement).\n- Use of AI on special-category personal data without legal basis and DPIA.\n- Generative AI output presented as human-authored in any customer-facing context without disclosure.',
  vendorAssessment:
    'Before procuring a third-party AI system, the AI Compliance Lead assesses: provider\'s Art. 13 instructions for use; provider\'s technical documentation; conformity assessment (for high-risk); data handling and sub-processor chain; incident-reporting SLAs; and continuity arrangements. Results recorded in the AI system register.',
  trainingRequirements:
    'All staff receive the Article 4 AI literacy briefing. Role-specific training is required for System Owners, Oversight Operators, and AI Compliance Lead. Training is refreshed annually and on any material change to the systems in use.',
  reviewCadence:
    'This policy is reviewed annually by the AI committee and on occurrence of any of: material regulatory change; a serious incident; a substantial change to the AI systems in use; a governance audit finding.',
  signOffStatement:
    'I confirm the AI Governance Policy above is approved and in force for the organisation.',
})

export async function generateGovernancePack(input: GovernanceInput): Promise<GovernancePack> {
  const safeOrg = sanitizeInput(input.organisationName, 200)

  const userMessage = `<user_data>
## Organisation
Name: ${safeOrg}
Scale: ${input.organisationScale}
Classified AI systems on record: ${input.systemsCount}
Any high-risk systems: ${input.hasHighRiskSystems ? 'yes' : 'no'}
</user_data>

Draft the AI Governance Pack. Return JSON only.`

  try {
    const client = getAIClient()
    const response = await client.chat.completions.create({
      model: getModelId(),
      max_tokens: 4000,
      messages: [
        { role: 'system', content: GOVERNANCE_PROMPT },
        { role: 'user', content: userMessage },
      ],
    })
    const text = response.choices[0]?.message?.content ?? ''
    const cleaned = text.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim()
    const raw = JSON.parse(cleaned)
    const validated = governanceSchema.safeParse(raw)
    if (!validated.success) {
      console.warn('[governance] LLM output failed schema validation:', validated.error.issues)
      return DEFAULT_PACK(input)
    }
    return validated.data
  } catch (err) {
    console.error('[governance] Error:', err)
    return DEFAULT_PACK(input)
  }
}
