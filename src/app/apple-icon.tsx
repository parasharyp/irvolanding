import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#040404',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 6, height: 80, background: '#00e5bf', borderRadius: 3 }} />
          <div style={{ fontSize: 90, fontWeight: 900, color: '#e8e8e8', fontFamily: 'sans-serif', letterSpacing: '-2px', lineHeight: 1 }}>
            I
          </div>
        </div>
      </div>
    ),
    { ...size }
  )
}
