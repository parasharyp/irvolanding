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
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#040404',
        }}
      >
        {/* Bold serif I — teal mark */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
          <div style={{ width: 108, height: 18, background: '#00e5bf' }} />
          <div style={{ width: 22, height: 100, background: '#00e5bf' }} />
          <div style={{ width: 108, height: 18, background: '#00e5bf' }} />
        </div>
      </div>
    ),
    { ...size }
  )
}
