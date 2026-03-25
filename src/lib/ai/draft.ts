import Anthropic from '@anthropic-ai/sdk'
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
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('AI drafting is not available. ANTHROPIC_API_KEY is not configured.')
    }
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6-20250514',
      max_tokens: 2048,
      system: DRAFT_SECTION_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
    })

    const text =
      response.content[0].type === 'text' ? response.content[0].text : ''

    return text
  } catch {
    throw new Error(
      'Failed to generate evidence draft. Please try again or draft manually.'
    )
  }
}
