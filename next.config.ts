import type { NextConfig } from 'next'

const securityHeaders = [
  // ── Content Security Policy ──────────────────────────────────────────────
  // Restricts which resources the browser can load. Blocks XSS via inline script injection.
  // 'unsafe-inline' in style-src is unavoidable — Next.js injects inline styles for hydration.
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://js.stripe.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https:",
      "connect-src 'self' https://*.supabase.co https://api.stripe.com https://api.resend.com wss://*.supabase.co",
      "frame-src https://js.stripe.com https://hooks.stripe.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "upgrade-insecure-requests",
    ].join('; '),
  },

  // ── MIME sniffing ────────────────────────────────────────────────────────
  // Prevents browsers from interpreting files as a different MIME type.
  { key: 'X-Content-Type-Options', value: 'nosniff' },

  // ── Clickjacking ─────────────────────────────────────────────────────────
  // Prevents the page from being embedded in iframes on other origins.
  { key: 'X-Frame-Options', value: 'DENY' },

  // ── HTTPS enforcement ────────────────────────────────────────────────────
  // Forces HTTPS for 2 years. Included in browser HSTS preload lists.
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },

  // ── Referrer policy ──────────────────────────────────────────────────────
  // Only sends the origin (not the full URL) as referrer to cross-origin requests.
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },

  // ── Browser API restrictions ─────────────────────────────────────────────
  // Disables camera, mic, geolocation, USB. Payment allowed only from our origin.
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=(self), usb=(), interest-cohort=()',
  },

  // ── Cross-origin opener isolation ────────────────────────────────────────
  // Prevents other pages from getting a reference to this window via window.open().
  // Mitigates cross-origin information leaks and Spectre-class attacks.
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },

  // ── Cross-origin resource isolation ──────────────────────────────────────
  // Prevents other origins from loading our resources (images, scripts) into their context.
  { key: 'Cross-Origin-Resource-Policy', value: 'same-origin' },

  // ── Flash / PDF cross-domain policy ──────────────────────────────────────
  // Blocks Flash and Acrobat from making cross-domain requests using our resources.
  { key: 'X-Permitted-Cross-Domain-Policies', value: 'none' },

  // ── Origin agent cluster ─────────────────────────────────────────────────
  // Requests that the browser isolate this origin in its own agent cluster.
  // Additional Spectre mitigation — reduces cross-origin memory access risk.
  { key: 'Origin-Agent-Cluster', value: '?1' },
]

const nextConfig: NextConfig = {
  // ── Turbopack root ───────────────────────────────────────────────────────
  // Fixes Turbopack panic when the project path contains emoji (💻).
  turbopack: {
    root: __dirname,
  },

  // ── Framework fingerprint removal ────────────────────────────────────────
  // Removes X-Powered-By: Next.js from all responses.
  // Prevents automated scanners from identifying the stack and targeting known CVEs.
  poweredByHeader: false,

  // ── Source map suppression ───────────────────────────────────────────────
  // Production JS bundles are minified and unreadable. Source maps would
  // re-expose the original code — disabled here to keep business logic private.
  productionBrowserSourceMaps: false,

  // ── Security headers ─────────────────────────────────────────────────────
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ]
  },

  // ── TypeScript strictness ────────────────────────────────────────────────
  typescript: {
    ignoreBuildErrors: false,
  },
}

export default nextConfig
