import OpenAI from 'openai'
import { DRAFT_SECTION_PROMPT } from './prompts'

interface DraftContext {
  systemName: string
  systemDescription: string
  obligationTitle: string
  obligationDescription: string
  evidenceRequired: string
  existingContent?: string
}

interface DraftFromDbContext {
  system: { name: string; description: string }
  obligation: { title: string; description: string; evidence_required: string }
  existingContent?: string
}

function getClient(): OpenAI {
  const apiKey = process.env.OPENROUTER_API_KEY ?? process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    throw new Error('AI drafting is not available. No API key configured.')
  }

  if (process.env.OPENROUTER_API_KEY) {
    return new OpenAI({
      apiKey: process.env.OPENROUTER_API_KEY,
      baseURL: 'https://openrouter.ai/api/v1',
    })
  }

  return new OpenAI({
    apiKey: process.env.ANTHROPIC_API_KEY,
    baseURL: 'https://api.anthropic.com/v1',
  })
}

export async function draftEvidenceSection(
  context: DraftContext | DraftFromDbContext
): Promise<string> {
  // Normalize both input shapes
  const normalized: DraftContext = 'systemName' in context
    ? context
    : {
        systemName: context.system.name,
        systemDescription: context.system.description,
        obligationTitle: context.obligation.title,
        obligationDescription: context.obligation.description,
        evidenceRequired: context.obligation.evidence_required,
        existingContent: context.existingContent,
      }

  const userMessage = `## System
Name: ${normalized.systemName}
Description: ${normalized.systemDescription}

## Obligation
Title: ${normalized.obligationTitle}
Description: ${normalized.obligationDescription}

## Evidence Required
${normalized.evidenceRequired}

${normalized.existingContent ? `## Existing Content (revise and improve)\n${normalized.existingContent}` : '## No existing content — draft from scratch.'}

Draft this evidence section now.`

  try {
    const client = getClient()

    const response = await client.chat.completions.create({
      model: process.env.OPENROUTER_API_KEY
        ? 'anthropic/claude-sonnet-4'
        : 'claude-sonnet-4-6-20250514',
      max_tokens: 2048,
      messages: [
        { role: 'system', content: DRAFT_SECTION_PROMPT },
        { role: 'user', content: userMessage },
      ],
    })

    return response.choices[0]?.message?.content ?? ''
  } catch {
    throw new Error(
      'Failed to generate evidence draft. Please try again or draft manually.'
    )
  }
}
