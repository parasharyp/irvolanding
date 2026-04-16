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
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 5, height: 96, background: '#00e5bf' }} />
          <div style={{ fontSize: 108, fontWeight: 900, color: '#e8e8e8', fontFamily: 'sans-serif', letterSpacing: '-4px', lineHeight: 1 }}>
            I
          </div>
        </div>
      </div>
    ),
    { ...size }
  )
}
