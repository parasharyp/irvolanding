const ZERO_WIDTH = /[\u200B\u200C\u200D\u200E\u200F\uFEFF\u00AD\u034F\u061C\u180E\u2060\u2061\u2062\u2063\u2064\u2066\u2067\u2068\u2069\u206A-\u206F]/g

const INJECTION_PATTERNS: RegExp[] = [
  /ignore\s+(all\s+)?previous\s+instructions/gi,
  /forget\s+(all\s+)?(previous|prior|above)/gi,
  /disregard\s+(all\s+)?(previous|prior|above)/gi,
  /you\s+are\s+now\s+/gi,
  /act\s+as\b/gi,
  /pretend\s+(you\s+are|to\s+be)/gi,
  /system\s*:\s*/gi,
  /system\s*prompt/gi,
  /\b(assistant|human|user)\s*:\s*/gi,
  /\brespond\s+only\s+with\b/gi,
  /\bdo\s+not\s+classify\b/gi,
  /\boverride\b/gi,
  /\bnew\s+instructions?\b/gi,
  /\bjailbreak\b/gi,
  /\bDAN\b/g,
]

export function sanitizeInput(text: string, maxLength = 5000): string {
  let out = text.slice(0, maxLength)
  out = out.normalize('NFKC')
  out = out.replace(ZERO_WIDTH, '')
  for (const pattern of INJECTION_PATTERNS) {
    out = out.replace(pattern, '[filtered]')
  }
  return out
}
