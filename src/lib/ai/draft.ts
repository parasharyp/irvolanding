import { DRAFT_SECTION_PROMPT } from './prompts'
import { sanitizeInput } from './sanitize'
import { getAIClient, getModelId } from './client'

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

  const userMessage = `<user_data>
## System
Name: ${sanitizeInput(normalized.systemName)}
Description: ${sanitizeInput(normalized.systemDescription)}

## Obligation
Title: ${sanitizeInput(normalized.obligationTitle)}
Description: ${sanitizeInput(normalized.obligationDescription)}

## Evidence Required
${sanitizeInput(normalized.evidenceRequired)}

${normalized.existingContent ? `## Existing Content (revise and improve)\n${sanitizeInput(normalized.existingContent, 10000)}` : '## No existing content — draft from scratch.'}
</user_data>

Draft this evidence section now.`

  try {
    const client = getAIClient()

    const response = await client.chat.completions.create({
      model: getModelId(),
      max_tokens: 2048,
      messages: [
        { role: 'system', content: DRAFT_SECTION_PROMPT },
        { role: 'user', content: userMessage },
      ],
    })

    const draft = response.choices[0]?.message?.content ?? ''
    if (!draft || draft.length > 10000) return ''
    if (draft.includes('IMPORTANT: The user-provided content')) return ''
    return draft
  } catch {
    throw new Error(
      'Failed to generate evidence draft. Please try again or draft manually.'
    )
  }
}
