import { z } from 'zod'
import { DEPLOYER_PACK_PROMPT } from './prompts'
import { sanitizeInput } from './sanitize'
import { getAIClient, getModelId } from './client'

export const WORKPLACE_CONTEXTS = [
  'customer-facing',
  'workforce-management',
  'hiring-recruitment',
  'credit-financial',
  'healthcare',
  'education',
  'public-sector',
  'internal-operations',
] as const

export type WorkplaceContext = typeof WORKPLACE_CONTEXTS[number]

const deployerSchema = z.object({
  organisationName: z.string().min(1),
  systemsCovered: z.array(z.object({
    systemName: z.string(),
    riskTier: z.string(),
    annexCategory: z.string().nullable().optional(),
  })),
  humanOversight: z.object({
    designatedRole: z.string().min(1),
    competencies: z.string().min(1),
    reviewCadence: z.string().min(1),
    escalationProcedure: z.string().min(1),
  }),
  inputDataControls: z.string().min(1),
  monitoringAndLogging: z.object({
    procedure: z.string().min(1),
    logRetention: z.string().min(1),
    incidentTriggers: z.string().min(1),
  }),
  seriousIncidentProcedure: z.string().min(1),
  workerNotification: z.string().min(1),
  affectedPersonsNotification: z.string().min(1),
  dpiaTriggers: z.string().min(1),
  providerIfuCompliance: z.string().min(1),
  cooperationWithAuthorities: z.string().min(1),
  obligationsAppendix: z.array(z.object({
    article: z.string(),
    title: z.string(),
    summary: z.string(),
    evidenceRequired: z.string(),
  })).min(1),
})

export type DeployerPack = z.infer<typeof deployerSchema>

interface DeployerSystemInput {
  name: string
  riskLevel: string
  description?: string
  annexCategory?: string | null
}

export interface DeployerInput {
  organisationName: string
  systems: DeployerSystemInput[]
  workplaceContexts: string[]
}

const DEFAULT_PACK = (input: DeployerInput): DeployerPack => ({
  organisationName: input.organisationName,
  systemsCovered: input.systems.map((s) => ({
    systemName: s.name,
    riskTier: s.riskLevel,
    annexCategory: s.annexCategory ?? null,
  })),
  humanOversight: {
    designatedRole: 'AI Compliance Lead (or equivalent senior operational role with authority to pause or override AI outputs).',
    competencies:
      'Working knowledge of the AI systems in use, their limitations, and the domain in which outputs are applied. Ability to interpret outputs, recognise failure modes, and intervene where appropriate.',
    reviewCadence:
      'Continuous during operation for real-time systems; monthly structured review of output quality and incident logs; quarterly executive review.',
    escalationProcedure:
      'Oversight operator → AI Compliance Lead → Senior Leadership. Urgent rights- or safety-related issues escalated within 24 hours.',
  },
  inputDataControls:
    'Where the deployer controls input data, it must be relevant and sufficiently representative of the intended purpose. Document data sources, any pre-processing, and known limitations. Never use untrusted third-party inputs without validation.',
  monitoringAndLogging: {
    procedure:
      'Monitor AI system operation on the basis of the provider\'s instructions for use. Retain automatically generated logs produced by the system.',
    logRetention:
      'Minimum six months, unless longer retention is required by applicable EU or Member State law. Logs must be stored securely and access controlled.',
    incidentTriggers:
      'Any malfunction, significant deviation from expected behaviour, or event causing harm or risk of harm to health, safety or fundamental rights.',
  },
  seriousIncidentProcedure:
    'On identifying a serious incident: (1) suspend or restrict use of the system, (2) notify the provider without undue delay, (3) report to the competent market surveillance authority within the timelines set by Article 73 (immediately, and in any event within 15 days of awareness; within 2 days for widespread infringements or serious incidents involving critical infrastructure), (4) preserve logs and documentation, (5) conduct a root-cause review.',
  workerNotification:
    'Before putting a high-risk AI system into service or use at the workplace, deployers that are employers must inform workers\' representatives and affected workers that they will be subject to the use of the high-risk AI system. Information must comply with applicable rules and procedures on the information of workers and their representatives.',
  affectedPersonsNotification:
    'Where a high-risk AI system makes, or assists in making, decisions about natural persons, those persons must be informed that they are subject to its use. Explanations of individual decision-making must be provided on request to the extent required by Article 86 of the AI Act.',
  dpiaTriggers:
    'A Data Protection Impact Assessment (DPIA) under Article 35 GDPR is required when AI processing is likely to result in a high risk to rights and freedoms — including systematic/extensive profiling with legal effect, large-scale processing of special-category data, or systematic monitoring of publicly accessible areas. The AI Act obligations under Article 26(9) are in addition to, not a replacement for, GDPR DPIA requirements.',
  providerIfuCompliance:
    'Use the high-risk AI system strictly in accordance with the provider\'s instructions for use (IFU). Maintain a copy of the IFU. Validate that actual operating conditions remain inside the IFU\'s stated intended purpose. Any deviation must be documented and risk-assessed; material deviations may reclassify the deployer as a provider under Article 25.',
  cooperationWithAuthorities:
    'Cooperate with national competent authorities on any action taken in relation to the AI system. Provide access to logs, technical documentation, and the organisation\'s own records on request.',
  obligationsAppendix: [
    { article: 'Art. 26(1)', title: 'Follow instructions for use', summary: 'Operate the system strictly within the provider\'s IFU and intended purpose.', evidenceRequired: 'Copy of IFU, IFU sign-off, any deviation log.' },
    { article: 'Art. 26(2)', title: 'Human oversight', summary: 'Assign oversight to natural persons with the necessary competence, training, authority and support.', evidenceRequired: 'Oversight designation letter, competency record, training log.' },
    { article: 'Art. 26(4)', title: 'Monitor operation', summary: 'Monitor the system on the basis of the IFU and inform the provider and authorities of risks and serious incidents.', evidenceRequired: 'Monitoring procedure, incident log, provider communications.' },
    { article: 'Art. 26(5)', title: 'Logging', summary: 'Keep logs automatically generated by the high-risk AI system for at least six months.', evidenceRequired: 'Log retention policy, storage location, access log.' },
    { article: 'Art. 26(6)', title: 'Inform workers', summary: 'Before workplace deployment, inform workers\' representatives and affected workers.', evidenceRequired: 'Notification record, consultation minutes.' },
    { article: 'Art. 26(8)', title: 'Inform affected persons', summary: 'Inform natural persons subject to the use of a high-risk AI system.', evidenceRequired: 'User-facing disclosure copy, placement evidence.' },
    { article: 'Art. 26(9)', title: 'DPIA', summary: 'Where applicable, conduct a Data Protection Impact Assessment under GDPR.', evidenceRequired: 'Signed DPIA, residual risk record.' },
    { article: 'Art. 26(10)', title: 'Cooperation with authorities', summary: 'Cooperate with competent authorities in any investigation or action.', evidenceRequired: 'Contact register, response log.' },
    { article: 'Art. 73', title: 'Serious incident reporting', summary: 'Report serious incidents to market surveillance within statutory timelines.', evidenceRequired: 'Incident report template, reporting log.' },
  ],
})

export async function generateDeployerPack(input: DeployerInput): Promise<DeployerPack> {
  const safeOrg = sanitizeInput(input.organisationName, 200)
  const systemsText = input.systems
    .map((s, i) => `${i + 1}. ${sanitizeInput(s.name, 200)} — risk: ${sanitizeInput(s.riskLevel, 50)}${s.annexCategory ? ` (${sanitizeInput(s.annexCategory, 120)})` : ''}. ${sanitizeInput(s.description ?? '', 500)}`)
    .join('\n')
  const contextsText = input.workplaceContexts.map((c) => `- ${sanitizeInput(c, 100)}`).join('\n')

  const userMessage = `<user_data>
## Organisation
${safeOrg}

## High-risk / limited-risk AI systems operated
${systemsText || 'No classified systems yet.'}

## Deployment contexts
${contextsText || '- internal-operations'}
</user_data>

Draft the Article 26 deployer obligations pack. Return JSON only.`

  try {
    const client = getAIClient()
    const response = await client.chat.completions.create({
      model: getModelId(),
      max_tokens: 4000,
      messages: [
        { role: 'system', content: DEPLOYER_PACK_PROMPT },
        { role: 'user', content: userMessage },
      ],
    })
    const text = response.choices[0]?.message?.content ?? ''
    const cleaned = text.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim()
    const raw = JSON.parse(cleaned)
    const validated = deployerSchema.safeParse(raw)
    if (!validated.success) {
      console.warn('[deployer] LLM output failed schema validation:', validated.error.issues)
      return DEFAULT_PACK(input)
    }
    return validated.data
  } catch (err) {
    console.error('[deployer] Error:', err)
    return DEFAULT_PACK(input)
  }
}
