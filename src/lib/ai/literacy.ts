import { z } from 'zod'
import { LITERACY_BRIEFING_PROMPT } from './prompts'
import { sanitizeInput } from './sanitize'
import { getAIClient, getModelId } from './client'

export const LITERACY_ROLES = [
  'Leadership',
  'Engineering',
  'Operations',
  'HR',
  'Customer-facing',
  'Legal & Compliance',
  'Marketing',
  'Finance',
] as const

export type LiteracyRole = typeof LITERACY_ROLES[number]

const literacySchema = z.object({
  organisationName: z.string().min(1),
  introduction: z.string().min(1),
  whatIsAi: z.string().min(1),
  systemsOverview: z.array(z.object({
    systemName: z.string(),
    riskTier: z.string(),
    capabilities: z.string(),
    limitations: z.string(),
  })),
  riskAwareness: z.string().min(1),
  rolesGuidance: z.array(z.object({
    role: z.string(),
    responsibilities: z.string(),
  })).min(1),
  escalationPath: z.string().min(1),
  legalContext: z.string().min(1),
  acknowledgementStatement: z.string().min(1),
})

export type LiteracyBriefing = z.infer<typeof literacySchema>

interface LiteracySystemInput {
  name: string
  riskLevel: string
  description?: string
  annexCategory?: string | null
}

export interface LiteracyInput {
  organisationName: string
  systems: LiteracySystemInput[]
  roles: string[]
}

const DEFAULT_BRIEFING = (input: LiteracyInput): LiteracyBriefing => ({
  organisationName: input.organisationName,
  introduction:
    'This briefing sets out the baseline understanding of AI required of all staff under Article 4 of the EU AI Act. It is not legal advice; it is the minimum working knowledge your role requires.',
  whatIsAi:
    'An AI system is a machine-based system designed to operate with varying levels of autonomy, producing outputs such as predictions, recommendations, or decisions from the inputs it receives. AI does not "understand" in the human sense — it computes statistical associations from training data.',
  systemsOverview: input.systems.map((s) => ({
    systemName: s.name,
    riskTier: s.riskLevel,
    capabilities: 'See system documentation.',
    limitations: 'Outputs may be inaccurate, biased, or out of date. Never use without human review where outcomes affect people.',
  })),
  riskAwareness:
    '- Hallucination: AI may produce fluent but false output.\n- Bias: training data may embed discrimination.\n- Automation bias: humans trust AI output more than warranted.\n- Data leakage: inputs may be retained by third-party providers.\n- Prompt injection: untrusted text may override instructions.',
  rolesGuidance: input.roles.map((r) => ({
    role: r,
    responsibilities:
      'Apply human oversight before acting on AI output. Escalate uncertainty. Record decisions where AI contributed materially to outcomes affecting individuals.',
  })),
  escalationPath:
    'Report concerns, incidents, or suspected misuse to the AI Compliance Lead. Urgent safety or rights issues must be escalated to Leadership within 24 hours.',
  legalContext:
    'Article 4 of EU Regulation 2024/1689 (the AI Act) requires providers and deployers of AI systems to ensure a sufficient level of AI literacy among their staff. The obligation has been in force since 2 February 2025. Broader AI Act obligations take effect on 2 August 2026.',
  acknowledgementStatement:
    'I confirm I have read and understood this AI literacy briefing and agree to apply it in my role.',
})

export async function generateLiteracyBriefing(input: LiteracyInput): Promise<LiteracyBriefing> {
  const safeOrg = sanitizeInput(input.organisationName, 200)
  const systemsText = input.systems
    .map((s, i) => `${i + 1}. ${sanitizeInput(s.name, 200)} — risk: ${sanitizeInput(s.riskLevel, 50)}${s.annexCategory ? ` (${sanitizeInput(s.annexCategory, 120)})` : ''}. ${sanitizeInput(s.description ?? '', 500)}`)
    .join('\n')
  const rolesText = input.roles.map((r) => `- ${sanitizeInput(r, 100)}`).join('\n')

  const userMessage = `## Organisation
${safeOrg}

## AI Systems in use
${systemsText || 'No classified systems yet.'}

## Roles to address
${rolesText}

Draft the Article 4 AI literacy briefing. Return JSON only.`

  try {
    const client = getAIClient()
    const response = await client.chat.completions.create({
      model: getModelId(),
      max_tokens: 3000,
      messages: [
        { role: 'system', content: LITERACY_BRIEFING_PROMPT },
        { role: 'user', content: userMessage },
      ],
    })
    const text = response.choices[0]?.message?.content ?? ''
    const cleaned = text.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim()
    const raw = JSON.parse(cleaned)
    const validated = literacySchema.safeParse(raw)
    if (!validated.success) {
      console.warn('[literacy] LLM output failed schema validation:', validated.error.issues)
      return DEFAULT_BRIEFING(input)
    }
    return validated.data
  } catch (err) {
    console.error('[literacy] Error:', err)
    return DEFAULT_BRIEFING(input)
  }
}
