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
  title: 'Irvo — AI Act Evidence Packs for SMEs',
  description: 'Turn each AI workflow into a structured, regulator-ready evidence pack in 20 minutes. EU AI Act compliance for companies with 10–500 employees.',
  openGraph: {
    title: 'Irvo — AI Act Evidence Packs for SMEs',
    description: 'Turn each AI workflow into a structured, regulator-ready evidence pack in 20 minutes. Enforcement: August 2, 2026.',
    url: 'https://irvo.co.uk',
    siteName: 'Irvo',
    type: 'website',
    locale: 'en_GB',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Irvo — AI Act Evidence Packs for SMEs',
    description: 'Turn each AI workflow into a structured, regulator-ready evidence pack in 20 minutes.',
  },
  robots: { index: true, follow: true },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${raleway.variable} antialiased`} style={{ fontFamily: 'var(--font-raleway), Helvetica, Arial, sans-serif', margin: 0, padding: 0, overflowX: 'hidden' }}>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
