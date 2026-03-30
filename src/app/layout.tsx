import type { Metadata, Viewport } from 'next'
import { Raleway } from 'next/font/google'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const raleway = Raleway({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-raleway',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://irvo.co.uk'),
  title: {
    default: 'Irvo — EU AI Act Compliance Platform for SMEs',
    template: '%s | Irvo',
  },
  description: 'Turn each AI workflow into a structured, regulator-ready evidence pack in 20 minutes. EU AI Act compliance for companies with 10–500 employees.',
  applicationName: 'Irvo',
  generator: 'Next.js',
  referrer: 'strict-origin-when-cross-origin',
  creator: 'Irvo',
  publisher: 'Irvo',
  category: 'technology',
  classification: 'Business Software',
  icons: {
    icon: '/icon.svg',
    apple: '/apple-icon.png',
  },
  openGraph: {
    title: 'Irvo — EU AI Act Compliance for SMEs',
    description: 'Turn each AI workflow into a structured, regulator-ready evidence pack in 20 minutes. Enforcement: August 2, 2026.',
    url: 'https://irvo.co.uk',
    siteName: 'Irvo',
    type: 'website',
    locale: 'en_GB',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@irvo_uk',
    creator: '@irvo_uk',
    title: 'Irvo — EU AI Act Compliance for SMEs',
    description: 'Turn each AI workflow into a structured, regulator-ready evidence pack in 20 minutes.',
  },
  robots: {
    index: true,
    follow: true,
    'max-snippet': -1,
    'max-image-preview': 'large',
    'max-video-preview': -1,
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#040404' },
    { media: '(prefers-color-scheme: light)', color: '#040404' },
  ],
  colorScheme: 'dark',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" style={{ colorScheme: 'dark' }}>
      <head>
        <meta name="theme-color" content="#040404" />
        <meta name="msapplication-TileColor" content="#040404" />
        <meta name="msapplication-navbutton-color" content="#040404" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className={`${raleway.variable} antialiased`} style={{ fontFamily: 'var(--font-raleway), Helvetica, Arial, sans-serif', margin: 0, padding: 0, overflowX: 'hidden' }}>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
