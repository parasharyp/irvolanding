/**
 * Strip common prompt injection patterns from user-provided text
 * before passing to AI models. Not foolproof — defence in depth
 * alongside system prompt boundaries.
 */
export function sanitizeInput(text: string, maxLength = 5000): string {
  return text
    .replace(/ignore\s+(all\s+)?previous\s+instructions/gi, '[filtered]')
    .replace(/you\s+are\s+now\s+/gi, '[filtered]')
    .replace(/system\s*:\s*/gi, '[filtered]')
    .replace(/\brespond\s+only\s+with\b/gi, '[filtered]')
    .replace(/\bdo\s+not\s+classify\b/gi, '[filtered]')
    .replace(/\boverride\b/gi, '[filtered]')
    .slice(0, maxLength)
}
