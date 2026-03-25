import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import {
  generateRequestId,
  extractIp,
  isScannerPath,
  hasAttackPattern,
  isScannerUserAgent,
} from '@/lib/security'

// ─── Auth-gated routes ───────────────────────────────────────────────────────
const PROTECTED_PREFIXES = [
  '/dashboard',
  '/invoices',
  '/clients',
  '/settings',
  '/systems',
]

// ─── Proxy ───────────────────────────────────────────────────────────────────

export async function proxy(request: NextRequest) {
  const requestId = generateRequestId()
  const pathname = request.nextUrl.pathname
  const ip = extractIp(request.headers)
  const ua = request.headers.get('user-agent')

  // ── Threat layer 1: scanner path probes ───────────────────────────────────
  // Any hit to these paths is automated attack traffic, never a real user.
  if (isScannerPath(pathname)) {
    console.warn('[SEC:PROBE]', {
      requestId,
      ip,
      pathname,
      ua: ua?.slice(0, 120),
      ts: new Date().toISOString(),
    })
    // Return bare 404 — no JSON body, no hints. Indistinguishable from a missing page.
    return new NextResponse(null, {
      status: 404,
      headers: { 'X-Request-ID': requestId },
    })
  }

  // ── Threat layer 2: attack patterns in the URL ────────────────────────────
  // Catches path traversal, SQL injection, SSTI, and other injection classes.
  if (hasAttackPattern(request.url)) {
    console.warn('[SEC:INJECT]', {
      requestId,
      ip,
      url: request.url.slice(0, 300),
      ua: ua?.slice(0, 120),
      ts: new Date().toISOString(),
    })
    return new NextResponse(null, {
      status: 400,
      headers: { 'X-Request-ID': requestId },
    })
  }

  // ── Threat layer 3: known scanner user-agents ─────────────────────────────
  // SQLMap, Nikto, Nuclei, Burp Suite active scan, etc.
  if (isScannerUserAgent(ua)) {
    console.warn('[SEC:SCANNER-UA]', {
      requestId,
      ip,
      ua: ua?.slice(0, 200),
      pathname,
      ts: new Date().toISOString(),
    })
    return new NextResponse(null, {
      status: 404,
      headers: { 'X-Request-ID': requestId },
    })
  }

  // ── Threat layer 4: oversized query strings ───────────────────────────────
  // Legitimate requests don't have 8KB+ query strings. Buffer overflow attempts do.
  const queryString = request.nextUrl.search
  if (queryString.length > 8192) {
    console.warn('[SEC:OVERSIZED-QS]', {
      requestId,
      ip,
      qsLength: queryString.length,
      pathname,
      ts: new Date().toISOString(),
    })
    return new NextResponse(null, {
      status: 400,
      headers: { 'X-Request-ID': requestId },
    })
  }

  // ── OAuth code redirect ──────────────────────────────────────────────────
  // Supabase PKCE flow sends the auth code to Site URL (/).
  // Intercept it and forward to our callback handler.
  const authCode = request.nextUrl.searchParams.get('code')
  if (authCode && (pathname === '/' || pathname === '')) {
    const callbackUrl = request.nextUrl.clone()
    callbackUrl.pathname = '/api/auth/callback'
    return NextResponse.redirect(callbackUrl)
  }

  // ── Auth layer ────────────────────────────────────────────────────────────
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p))

  if (isProtected && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirect', pathname)
    const redirect = NextResponse.redirect(url)
    redirect.headers.set('X-Request-ID', requestId)
    return redirect
  }

  if ((pathname === '/login' || pathname === '/signup') && user) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    const redirect = NextResponse.redirect(url)
    redirect.headers.set('X-Request-ID', requestId)
    return redirect
  }

  // Stamp every legitimate response with a traceable request ID
  supabaseResponse.headers.set('X-Request-ID', requestId)
  return supabaseResponse
}

export const config = {
  // Exclude static assets and Next.js internals. Include everything else —
  // the threat detection layers run before any route handler.
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
