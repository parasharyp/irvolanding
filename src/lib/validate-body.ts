import { NextRequest, NextResponse } from 'next/server'

const MAX_BODY_SIZE = 64 * 1024 // 64KB — more than enough for any API payload

/** Reads and parses JSON body with size validation. Returns null + error response on failure. */
export async function parseBody<T = unknown>(
  req: NextRequest,
  maxSize = MAX_BODY_SIZE
): Promise<{ data: T; error?: never } | { data?: never; error: NextResponse }> {
  const contentLength = req.headers.get('content-length')
  if (contentLength && parseInt(contentLength, 10) > maxSize) {
    return { error: NextResponse.json({ error: 'Request body too large' }, { status: 413 }) }
  }
  try {
    const data = await req.json()
    return { data: data as T }
  } catch {
    return { error: NextResponse.json({ error: 'Invalid request body' }, { status: 400 }) }
  }
}

/** Returns error response if Content-Type is not application/json */
export function requireJson(req: NextRequest): NextResponse | null {
  const ct = req.headers.get('content-type')
  if (!ct || !ct.includes('application/json')) {
    return NextResponse.json({ error: 'Content-Type must be application/json' }, { status: 415 })
  }
  return null
}
