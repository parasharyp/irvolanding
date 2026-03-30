import { ImageResponse } from 'next/og'
import { getGuideBySlug, getAllSlugs } from '@/lib/guides'

export const alt = 'Irvo Guide'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }))
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const guide = getGuideBySlug(slug)
  const title = guide?.headline ?? 'EU AI Act Guide'
  const category = guide?.category ?? 'Guide'

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'flex-start',
          background: '#040404',
          padding: '80px 100px',
          position: 'relative',
        }}
      >
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: '#00e5bf' }} />

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <div style={{ width: 4, height: 36, background: '#00e5bf' }} />
          <span style={{ fontSize: 40, fontWeight: 900, color: '#e8e8e8', letterSpacing: '2px' }}>IRVO</span>
        </div>

        {/* Category */}
        <div style={{
          fontSize: 14, fontWeight: 700, color: '#00e5bf',
          textTransform: 'uppercase', letterSpacing: '2px', marginBottom: 24,
          border: '1px solid rgba(0,229,191,0.3)', padding: '4px 16px',
        }}>
          {category}
        </div>

        {/* Title */}
        <div style={{ fontSize: 52, fontWeight: 900, color: '#e8e8e8', lineHeight: 1.15, letterSpacing: '-1.5px', maxWidth: 900 }}>
          {title}
        </div>

        {/* Bottom */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '24px 100px',
          borderTop: '1px solid rgba(255,255,255,0.07)',
        }}>
          <span style={{ fontSize: 16, color: '#555' }}>irvo.co.uk/guides</span>
          <span style={{ fontSize: 16, color: '#555' }}>Free compliance guide</span>
        </div>
      </div>
    ),
    { ...size }
  )
}
