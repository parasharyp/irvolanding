import { z } from 'zod'
import { TRANSPARENCY_PACK_PROMPT } from './prompts'
import { sanitizeInput } from './sanitize'
import { getAIClient, getModelId } from './client'

export const AI_SURFACES = [
  'chat-widget',
  'voice-agent',
  'generative-content',
  'emotion-recognition',
  'biometric-categorisation',
  'deepfake-synthesis',
] as const

export type AiSurface = typeof AI_SURFACES[number]

export const BRAND_TONES = [
  'friendly',
  'formal',
  'technical',
  'warm-professional',
  'concise-direct',
] as const

export type BrandTone = typeof BRAND_TONES[number]

const transparencySchema = z.object({
  organisationName: z.string().min(1),
  chatWidgetDisclosures: z.object({
    shortVariant: z.string().min(1),
    warmVariant: z.string().min(1),
  }),
  voiceAgentOpening: z.string().min(1),
  generativeWatermark: z.object({
    description: z.string().min(1),
    c2paSnippetExample: z.string().min(1),
  }),
  termsOfServiceClause: z.string().min(1),
  privacyNoticeParagraph: z.string().min(1),
  emotionOrBiometricNotice: z.string().min(1),
  deployerNotes: z.string().min(1),
})

export type TransparencyPack = z.infer<typeof transparencySchema>

export interface TransparencyInput {
  organisationName: string
  surfaces: AiSurface[]
  brandTone: BrandTone
  productContext?: string
}

const DEFAULT_PACK = (input: TransparencyInput): TransparencyPack => ({
  organisationName: input.organisationName,
  chatWidgetDisclosures: {
    shortVariant: `You're chatting with ${input.organisationName}'s AI assistant.`,
    warmVariant: `Hey — I'm ${input.organisationName}'s AI assistant. A human is always available if you'd prefer.`,
  },
  voiceAgentOpening:
    `This call uses an AI assistant from ${input.organisationName}. You can ask for a human at any time.`,
  generativeWatermark: {
    description:
      'Generative AI outputs should be watermarked in a machine-readable format. C2PA manifests provide a widely adopted standard: embed a signed assertion describing the AI tool, version, and generation parameters into every produced image, audio, or video file.',
    c2paSnippetExample: JSON.stringify({
      '@context': 'https://c2pa.org/manifest',
      claim_generator: `${input.organisationName}/1.0`,
      assertions: [
        {
          label: 'c2pa.actions',
          data: { actions: [{ action: 'c2pa.created', softwareAgent: 'ai-model' }] },
        },
      ],
    }, null, 2),
  },
  termsOfServiceClause:
    `AI disclosure. ${input.organisationName} uses artificial intelligence systems in parts of its service, including (but not limited to) conversational agents, content generation, and automated recommendations. Under Article 50 of Regulation (EU) 2024/1689, we inform you when you are interacting with an AI system. AI-generated outputs (text, images, audio) are marked in machine-readable form where technically feasible. Human support remains available for any interaction at your request.`,
  privacyNoticeParagraph:
    `Use of AI. We use AI systems to process your interactions and, in some cases, generate content. Your inputs may be transmitted to third-party AI providers under contracts that restrict their use. We do not use your personal data to train foundation models. You have the right under UK GDPR and the EU AI Act to be informed of AI processing, to request human review of automated decisions that significantly affect you, and to opt out of certain AI-based interactions by requesting human assistance.`,
  emotionOrBiometricNotice:
    input.surfaces.includes('emotion-recognition') || input.surfaces.includes('biometric-categorisation')
      ? `This interaction may involve AI-based emotion recognition or biometric categorisation. Under Article 50(3) of Regulation (EU) 2024/1689, you are entitled to know this is occurring. You may withdraw consent and request an alternative interaction at any time.`
      : 'Not applicable — no emotion-recognition or biometric-categorisation surfaces declared.',
  deployerNotes:
    'Place disclosures at the point of interaction, before the user engages with the AI surface. For chat widgets, surface the short-variant disclosure on the widget header and the full ToS clause in your footer links. For voice agents, play the opening line before the first question. For generative outputs, embed the C2PA assertion at file creation and document the process in your AI Act technical documentation.',
})

export async function generateTransparencyPack(input: TransparencyInput): Promise<TransparencyPack> {
  const safeOrg = sanitizeInput(input.organisationName, 200)
  const surfacesText = input.surfaces.map((s) => `- ${s}`).join('\n') || '- (none declared)'
  const safeContext = sanitizeInput(input.productContext ?? '', 1000)

  const userMessage = `<user_data>
## Organisation
${safeOrg}

## Brand tone
${input.brandTone}

## AI surfaces in use
${surfacesText}

## Additional product context
${safeContext || '(none)'}
</user_data>

Draft the Article 50 transparency pack. Return JSON only.`

  try {
    const client = getAIClient()
    const response = await client.chat.completions.create({
      model: getModelId(),
      max_tokens: 3000,
      messages: [
        { role: 'system', content: TRANSPARENCY_PACK_PROMPT },
        { role: 'user', content: userMessage },
      ],
    })
    const text = response.choices[0]?.message?.content ?? ''
    const cleaned = text.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim()
    const raw = JSON.parse(cleaned)
    const validated = transparencySchema.safeParse(raw)
    if (!validated.success) {
      console.warn('[transparency] LLM output failed schema validation:', validated.error.issues)
      return DEFAULT_PACK(input)
    }
    return validated.data
  } catch (err) {
    console.error('[transparency] Error:', err)
    return DEFAULT_PACK(input)
  }
}
