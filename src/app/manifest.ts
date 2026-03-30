import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Irvo — EU AI Act Compliance',
    short_name: 'Irvo',
    description: 'AI-powered EU AI Act compliance platform for SMEs. Evidence packs in 20 minutes.',
    start_url: '/',
    display: 'standalone',
    background_color: '#040404',
    theme_color: '#040404',
    icons: [
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' },
      { src: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  }
}
