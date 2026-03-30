import { NextRequest, NextResponse } from 'next/server'

const MAX_BODY = 64 * 1024

export function requireJson(req: NextRequest): NextResponse | null {
  const ct = req.headers.get('content-type')
  if (!ct || !ct.includes('application/json')) {
    return NextResponse.json({ error: 'Content-Type must be application/json' }, { status: 415 })
  }
  return null
}

export async function parseBody<T = unknown>(
  req: NextRequest, maxSize = MAX_BODY
): Promise<{ data: T; error?: never } | { data?: never; error: NextResponse }> {
  const cl = req.headers.get('content-length')
  if (cl && parseInt(cl, 10) > maxSize) {
    return { error: NextResponse.json({ error: 'Request too large' }, { status: 413 }) }
  }
  try {
    return { data: (await req.json()) as T }
  } catch {
    return { error: NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }
  }
}
