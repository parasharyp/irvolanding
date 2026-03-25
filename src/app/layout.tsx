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
  title: 'Irvo — AI Act Compliance for SMEs',
  description: 'Document, classify, and generate evidence packs for your AI systems. EU AI Act compliance made simple.',
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
