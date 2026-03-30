import OpenAI from 'openai'

/** Shared AI client — routes to OpenRouter or Anthropic based on env config. */
export function getAIClient(): OpenAI {
  const apiKey = process.env.OPENROUTER_API_KEY ?? process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    throw new Error('No AI API key configured (OPENROUTER_API_KEY or ANTHROPIC_API_KEY)')
  }

  return new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY ?? process.env.ANTHROPIC_API_KEY,
    baseURL: process.env.OPENROUTER_API_KEY
      ? 'https://openrouter.ai/api/v1'
      : 'https://api.anthropic.com/v1',
  })
}

/** Returns the correct model ID based on which API is configured. */
export function getModelId(): string {
  return process.env.OPENROUTER_API_KEY
    ? 'anthropic/claude-sonnet-4'
    : 'claude-sonnet-4-6-20250514'
}
