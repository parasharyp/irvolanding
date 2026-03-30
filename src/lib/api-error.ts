import { NextResponse } from 'next/server'

// Never expose raw DB/internal error messages to clients.
// Log server-side, return a safe generic message.
export function serverError(err: unknown, context?: string): NextResponse {
  const message = err instanceof Error ? err.message : String(err)
  console.error(`[API error]${context ? ` ${context}` : ''}: ${message}`)
  if (process.env.NODE_ENV !== 'production') {
    console.error(err)
  }
  return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 })
}

export function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

export function notFound(resource = 'Resource') {
  return NextResponse.json({ error: `${resource} not found` }, { status: 404 })
}

export function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 })
}
