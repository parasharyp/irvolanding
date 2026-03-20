import type { NextConfig } from 'next'

const securityHeaders = [
  // Content Security Policy — restrict resource origins
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com",
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
  // Prevent browsers from guessing MIME types
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Prevent clickjacking
  { key: 'X-Frame-Options', value: 'DENY' },
  // Force HTTPS for 2 years, include subdomains
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  // Control referrer data
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // Restrict powerful browser APIs
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=(self), usb=()',
  },
  // Remove framework fingerprint
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
]

const nextConfig: NextConfig = {
  // Never expose X-Powered-By: Next.js
  poweredByHeader: false,

  // No source maps in production — keep business logic private
  productionBrowserSourceMaps: false,

  // Security headers on all routes
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ]
  },

  // Strict compiler checks
  typescript: {
    ignoreBuildErrors: false,
  },
}

export default nextConfig
