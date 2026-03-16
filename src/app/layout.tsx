import type { Metadata } from 'next'
import { Raleway } from 'next/font/google'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const raleway = Raleway({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-raleway',
})

export const metadata: Metadata = {
  title: 'Irvo — UK Invoice Enforcement',
  description: 'Track overdue invoices, calculate statutory interest, and enforce UK late payment rights automatically.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${raleway.variable} antialiased`} style={{ fontFamily: 'var(--font-raleway), Helvetica, Arial, sans-serif', margin: 0, padding: 0 }}>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
