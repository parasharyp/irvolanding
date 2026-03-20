import { NextResponse } from 'next/server'

// Never expose raw DB/internal error messages to clients.
// Log server-side, return a safe generic message.
export function serverError(err: unknown, context?: string): NextResponse {
  console.error(`[API error]${context ? ` ${context}` : ''}`, err)
  return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 })
}

export function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

export function forbidden() {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}

export function notFound(resource = 'Resource') {
  return NextResponse.json({ error: `${resource} not found` }, { status: 404 })
}

export function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 })
}
