import { z } from 'zod'
import type { ClassificationResult } from '@/types'
import { CLASSIFY_SYSTEM_PROMPT } from './prompts'
import { sanitizeInput } from './sanitize'
import { getAIClient, getModelId } from './client'

const VALID_RISK_LEVELS = ['none', 'limited', 'high', 'unacceptable'] as const
const VALID_OBLIGATION_KEYS = [
  'risk-management', 'data-governance', 'technical-documentation',
  'transparency-disclosure', 'human-oversight', 'accuracy-robustness',
  'conformity-assessment', 'logging-monitoring', 'incident-reporting',
  'post-market-monitoring', 'general-transparency', 'gpai-obligations',
] as const

const classificationSchema = z.object({
  riskLevel: z.enum(VALID_RISK_LEVELS),
  annexCategory: z.string().nullable(),
  rationale: z.string().min(1),
  obligations: z.array(z.object({
    key: z.enum(VALID_OBLIGATION_KEYS),
    article: z.string(),
    title: z.string(),
    description: z.string(),
    evidenceRequired: z.string(),
  })).min(1),
  immediateActions: z.array(z.string()).min(1),
})

const DEFAULT_RESULT: ClassificationResult = {
  riskLevel: 'limited',
  annexCategory: null,
  rationale:
    'Classification could not be determined automatically. A limited risk level has been assigned as a precautionary default. Please review manually or re-run the assessment.',
  obligations: [
    {
      key: 'general-transparency',
      article: 'Article 50',
      title: 'General transparency obligation',
      description:
        'Ensure individuals are informed that they are interacting with an AI system, unless this is obvious from the circumstances.',
      evidenceRequired:
        'Documentation of transparency measures, user-facing disclosures, and notification mechanisms.',
    },
  ],
  immediateActions: [
    'Review the system description and questionnaire answers for completeness.',
    'Consult qualified legal counsel to confirm the risk classification.',
    'Ensure basic transparency disclosures are in place.',
  ],
}

interface ClassifyInput {
  systemName: string
  systemDescription: string
  answers: { questionId: string; answer: string }[]
}



export async function classifySystem(
  input: ClassifyInput
): Promise<ClassificationResult> {
  const { systemName, systemDescription, answers } = input

  const safeName = sanitizeInput(systemName)
  const safeDesc = sanitizeInput(systemDescription)
  const answersFormatted = answers
    .map((a, i) => `Q${i + 1} [${a.questionId}]: ${sanitizeInput(a.answer)}`)
    .join('\n')

  const userMessage = `## AI System
Name: ${safeName}
Description: ${safeDesc}

## Questionnaire Answers
${answersFormatted}

Classify this system under the EU AI Act. Return JSON only.`

  try {
    const client = getAIClient()

    const response = await client.chat.completions.create({
      model: getModelId(),
      max_tokens: 2048,
      messages: [
        { role: 'system', content: CLASSIFY_SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ],
    })

    const text = response.choices[0]?.message?.content ?? ''

    // Strip markdown code fences if the model wraps JSON in them
    const cleaned = text.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim()

    const raw = JSON.parse(cleaned)
    const validated = classificationSchema.safeParse(raw)

    if (!validated.success) {
      console.warn('[classify] LLM output failed schema validation:', validated.error.issues)
      return DEFAULT_RESULT
    }

    return validated.data as ClassificationResult
  } catch (err) {
    console.error('[classify] Error:', err)
    return DEFAULT_RESULT
  }
}
