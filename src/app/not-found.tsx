import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Page Not Found',
}

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh', background: '#040404', color: '#e8e8e8',
      fontFamily: 'var(--font-raleway), Raleway, Helvetica, Arial, sans-serif',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '40px 24px',
    }}>
      <div style={{ textAlign: 'center', maxWidth: 480 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 48 }}>
          <div style={{ width: 2, height: 22, background: '#00e5bf' }} />
          <span style={{ fontSize: 24, fontWeight: 900, letterSpacing: '2px' }}>IRVO</span>
        </div>
        <h1 style={{ fontSize: 48, fontWeight: 900, letterSpacing: '-0.03em', marginBottom: 12 }}>404</h1>
        <p style={{ fontSize: 16, color: '#888', lineHeight: 1.6, marginBottom: 32 }}>
          This page doesn&apos;t exist. But your EU AI Act compliance deadline does.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link
            href="/"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: '#00e5bf', color: '#040404', fontSize: 14, fontWeight: 800,
              padding: '12px 28px', borderRadius: 100, textDecoration: 'none',
            }}
          >
            Back to Irvo
          </Link>
          <Link
            href="/guides"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'transparent', color: '#888', fontSize: 14, fontWeight: 600,
              padding: '12px 28px', borderRadius: 100, textDecoration: 'none',
              border: '1px solid rgba(255,255,255,0.07)',
            }}
          >
            Browse guides
          </Link>
        </div>
      </div>
    </div>
  )
}
