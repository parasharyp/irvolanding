import { z } from 'zod'
import { REGISTRATION_PROMPT } from './prompts'
import { sanitizeInput } from './sanitize'
import { getAIClient, getModelId } from './client'

export const REGISTRATION_ROLES = ['deployer-public-body', 'deployer-annex-iii', 'provider'] as const
export type RegistrationRole = typeof REGISTRATION_ROLES[number]

const registrationSchema = z.object({
  organisationName: z.string().min(1),
  role: z.string(),
  systemName: z.string().min(1),
  riskTier: z.string(),
  annexCategory: z.string().nullable().optional(),
  // Annex VIII-style fields
  providerName: z.string().min(1),
  authorisedRepresentative: z.string().min(1),
  tradeName: z.string().min(1),
  systemIntendedPurpose: z.string().min(1),
  systemDescription: z.string().min(1),
  annexIIIReference: z.string().min(1),
  statusOfSystem: z.string().min(1),
  memberStatesWhereAvailable: z.string().min(1),
  euDeclarationOfConformity: z.string().min(1),
  instructionsForUseSummary: z.string().min(1),
  additionalInformation: z.string().min(1),
  // Deployer-specific (if applicable)
  deployerContact: z.string().min(1),
  deployerIntendedUse: z.string().min(1),
  deployerFriaReference: z.string().min(1),
  submissionChecklist: z.array(z.object({
    item: z.string(),
    ready: z.enum(['Yes', 'No', 'Yes/No', 'Partial']).catch('No'),
    evidence: z.string(),
  })).min(1),
  notes: z.string().min(1),
})

export type RegistrationDossier = z.infer<typeof registrationSchema>

export interface RegistrationInput {
  organisationName: string
  role: RegistrationRole
  systemName: string
  systemDescription: string
  riskLevel: string
  annexCategory?: string | null
  providerName: string
  memberStates: string
}

const DEFAULT_DOSSIER = (input: RegistrationInput): RegistrationDossier => ({
  organisationName: input.organisationName,
  role: input.role,
  systemName: input.systemName,
  riskTier: input.riskLevel,
  annexCategory: input.annexCategory ?? null,
  providerName: input.providerName || '[DATA REQUIRED: provider legal name]',
  authorisedRepresentative: '[DATA REQUIRED: EU authorised representative name and address, where provider is established outside the Union]',
  tradeName: input.systemName,
  systemIntendedPurpose: input.systemDescription || '[DATA REQUIRED: intended purpose as stated by the provider]',
  systemDescription: input.systemDescription || '[DATA REQUIRED: description of the system and its main functional components]',
  annexIIIReference: input.annexCategory ?? '[DATA REQUIRED: Annex III point and sub-point, e.g. "Point 4(a) — recruitment and selection of natural persons"]',
  statusOfSystem: 'On the market · in service · withdrawn · recalled — select one at time of submission.',
  memberStatesWhereAvailable: input.memberStates || '[DATA REQUIRED: list of Member States]',
  euDeclarationOfConformity:
    'Reference the EU declaration of conformity (Art. 47) provided by the provider. Attach a digital copy to the registration.',
  instructionsForUseSummary:
    'Summarise the provider\'s instructions for use (Art. 13) in a form suitable for the public registration entry. Include intended purpose, capabilities and limitations, required competencies, and any known residual risks.',
  additionalInformation:
    'Any additional information material to the operation of the system that would help a natural person understand its purpose, scope, and limits.',
  deployerContact:
    '[DATA REQUIRED: name, email, and address of the deployer contact responsible for this registration]',
  deployerIntendedUse:
    'Describe the specific deployer use of the system, including processes into which outputs feed and decisions they influence.',
  deployerFriaReference:
    'Reference the FRIA (Art. 27) performed for this system. Attach or cite the document identifier.',
  submissionChecklist: [
    { item: 'Organisation EU Login account', ready: 'No', evidence: '[DATA REQUIRED: EULogin account reference]' },
    { item: 'Provider details complete (Annex VIII §1)', ready: 'Yes/No', evidence: 'Provider legal name, address, contact' },
    { item: 'Authorised representative (if applicable)', ready: 'Yes/No', evidence: 'EU AR designation letter' },
    { item: 'Trade name(s)', ready: 'Yes', evidence: 'System name as marketed' },
    { item: 'Intended purpose', ready: 'Yes', evidence: 'From provider IFU' },
    { item: 'Annex III reference', ready: 'Yes/No', evidence: 'Point and sub-point confirmed' },
    { item: 'EU declaration of conformity', ready: 'Yes/No', evidence: 'Art. 47 declaration from provider' },
    { item: 'Instructions for use summary', ready: 'Yes/No', evidence: 'Art. 13 IFU copy' },
    { item: 'Member States where system is placed / put into service', ready: 'Yes', evidence: 'List' },
    { item: 'Deployer FRIA (if Art. 27 applies)', ready: 'Yes/No', evidence: 'FRIA document identifier' },
    { item: 'Signed sign-off', ready: 'No', evidence: 'Authorised signatory' },
  ],
  notes:
    '- The EU database is established under Article 71 and populated per Annex VIII. Public-authority deployers and Annex III deployers must register under Article 49(1a). Providers of high-risk AI systems must register under Article 49(1).\n- Registration must be completed before placing on the market / putting into service.\n- The entry must be kept up to date for the lifecycle of the system.\n- Classified confidential information may be restricted from public access per Article 71(5).',
})

export async function generateRegistrationDossier(input: RegistrationInput): Promise<RegistrationDossier> {
  const safeOrg = sanitizeInput(input.organisationName, 200)
  const safeSys = sanitizeInput(input.systemName, 200)
  const safeDesc = sanitizeInput(input.systemDescription, 1000)
  const safeAnnex = input.annexCategory ? sanitizeInput(input.annexCategory, 200) : 'not specified'
  const safeProvider = sanitizeInput(input.providerName, 200)
  const safeStates = sanitizeInput(input.memberStates, 300)

  const userMessage = `<user_data>
## Organisation
${safeOrg} — role: ${input.role}

## System
Name: ${safeSys}
Risk tier: ${sanitizeInput(input.riskLevel, 50)}
Annex III: ${safeAnnex}
Description: ${safeDesc}

## Provider
${safeProvider || 'not specified'}

## Member States where the system is placed / put into service
${safeStates || 'not specified'}
</user_data>

Draft the Article 49 / Annex VIII registration dossier. Return JSON only.`

  try {
    const client = getAIClient()
    const response = await client.chat.completions.create({
      model: getModelId(),
      max_tokens: 4000,
      messages: [
        { role: 'system', content: REGISTRATION_PROMPT },
        { role: 'user', content: userMessage },
      ],
    })
    const text = response.choices[0]?.message?.content ?? ''
    const cleaned = text.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim()
    const raw = JSON.parse(cleaned)
    const validated = registrationSchema.safeParse(raw)
    if (!validated.success) {
      console.warn('[registration] LLM output failed schema validation:', validated.error.issues)
      return DEFAULT_DOSSIER(input)
    }
    return validated.data
  } catch (err) {
    console.error('[registration] Error:', err)
    return DEFAULT_DOSSIER(input)
  }
}
