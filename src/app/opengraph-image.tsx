import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Irvo — EU AI Act Compliance Platform for SMEs'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
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
        {/* Top teal accent line */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: '#00e5bf' }} />

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 48 }}>
          <div style={{ width: 4, height: 36, background: '#00e5bf' }} />
          <span style={{ fontSize: 40, fontWeight: 900, color: '#e8e8e8', letterSpacing: '2px' }}>IRVO</span>
        </div>

        {/* Headline */}
        <div style={{ fontSize: 64, fontWeight: 900, color: '#e8e8e8', lineHeight: 1.1, letterSpacing: '-2px', marginBottom: 8 }}>
          EU AI Act compliance
        </div>
        <div style={{ fontSize: 64, fontWeight: 900, color: '#00e5bf', lineHeight: 1.1, letterSpacing: '-2px', marginBottom: 32 }}>
          for SMEs.
        </div>

        {/* Subtext */}
        <div style={{ fontSize: 24, color: '#888', lineHeight: 1.5 }}>
          Evidence packs in 20 minutes. Not 40 hours.
        </div>

        {/* Bottom bar */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '24px 100px',
          borderTop: '1px solid rgba(255,255,255,0.07)',
        }}>
          <span style={{ fontSize: 16, color: '#555' }}>irvo.co.uk</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#e54747' }} />
            <span style={{ fontSize: 16, color: '#e54747', fontWeight: 700 }}>
              Enforcement: August 2, 2026
            </span>
          </div>
        </div>

        {/* Grain overlay for texture */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.03,
          backgroundImage: 'url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIj48ZmlsdGVyIGlkPSJuIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iMC42NSIgbnVtT2N0YXZlcz0iNCIgc3RpdGNoVGlsZXM9InN0aXRjaCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNuKSIvPjwvc3ZnPg==)',
        }} />
      </div>
    ),
    { ...size }
  )
}
