import type { Metadata } from 'next'
import Link from 'next/link'
import { GUIDE_LIST } from '@/lib/guides'
import { ArrowRight, BookOpen, Clock } from 'lucide-react'
import { getOrganizationSchema, getBreadcrumbSchema } from '@/lib/structured-data'

export const metadata: Metadata = {
  title: 'EU AI Act Compliance Guides for SMEs',
  description:
    'Free, practical guides to EU AI Act compliance for SMEs. Risk classification, Annex III categories, compliance checklists, evidence packs, and more.',
  alternates: { canonical: 'https://irvo.co.uk/guides' },
  openGraph: {
    title: 'EU AI Act Compliance Guides — Irvo',
    description: 'Free compliance knowledge base for EU AI Act. Practical, plain-English guides for companies with 10–500 employees.',
    url: 'https://irvo.co.uk/guides',
  },
}

const T = {
  bg: '#040404',
  surface: '#0c0c0c',
  border: 'rgba(255,255,255,0.07)',
  text: '#e8e8e8',
  text2: '#888',
  text3: '#555',
  accent: '#00e5bf',
}
const FF = 'var(--font-raleway), Raleway, Helvetica, Arial, sans-serif'

export default function GuidesIndexPage() {
  const orgSchema = getOrganizationSchema()
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: 'https://irvo.co.uk' },
    { name: 'Guides', url: 'https://irvo.co.uk/guides' },
  ])

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div style={{ minHeight: '100vh', background: T.bg, color: T.text, fontFamily: FF }}>
        {/* Header */}
        <header style={{
          borderBottom: `1px solid ${T.border}`, padding: '18px 32px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          maxWidth: 1160, margin: '0 auto',
        }}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 9, textDecoration: 'none' }}>
            <div style={{ width: 2, height: 20, background: T.accent }} />
            <span style={{ fontSize: 22, fontWeight: 900, letterSpacing: '2px', color: T.text }}>IRVO</span>
          </Link>
          <Link href="/login" style={{ fontSize: 13, color: T.text2, textDecoration: 'none', fontWeight: 500 }}>
            Sign in
          </Link>
        </header>

        <main style={{ maxWidth: 900, margin: '0 auto', padding: '64px 32px 120px' }}>
          {/* Page heading */}
          <div style={{ marginBottom: 64 }}>
            <p style={{
              fontSize: 11, fontWeight: 600, color: T.accent, textTransform: 'uppercase',
              letterSpacing: '0.08em', margin: '0 0 16px',
            }}>
              Knowledge Base
            </p>
            <h1 style={{
              fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 900,
              letterSpacing: '-0.03em', lineHeight: 1.1, margin: '0 0 16px',
            }}>
              EU AI Act Compliance Guides
            </h1>
            <p style={{ fontSize: 16, color: T.text2, lineHeight: 1.6, maxWidth: 560, margin: 0 }}>
              Practical, plain-English guides for SMEs navigating the EU AI Act.
              Every article references the actual regulation — no fluff, no jargon.
            </p>
          </div>

          {/* Article cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {GUIDE_LIST.map((guide) => (
              <Link
                key={guide.slug}
                href={`/guides/${guide.slug}`}
                style={{
                  display: 'block', textDecoration: 'none', color: 'inherit',
                  background: T.surface, border: `1px solid ${T.border}`,
                  padding: '32px 36px', transition: 'border-color 0.15s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 24 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                      <span style={{
                        fontSize: 10, fontWeight: 700, color: T.accent, textTransform: 'uppercase',
                        letterSpacing: '0.06em', border: `1px solid rgba(0,229,191,0.2)`,
                        padding: '2px 8px',
                      }}>
                        {guide.category}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: T.text3 }}>
                        <Clock size={10} /> {guide.readingTime}
                      </span>
                    </div>
                    <h2 style={{
                      fontSize: 20, fontWeight: 800, color: T.text,
                      margin: '0 0 8px', letterSpacing: '-0.02em', lineHeight: 1.3,
                    }}>
                      {guide.headline}
                    </h2>
                    <p style={{ fontSize: 14, color: T.text2, lineHeight: 1.6, margin: 0 }}>
                      {guide.metaDescription}
                    </p>
                    <div style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      marginTop: 16, fontSize: 12, fontWeight: 600, color: T.accent,
                    }}>
                      Read guide <ArrowRight size={12} />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Bottom CTA */}
          <div style={{
            marginTop: 80, textAlign: 'center', padding: '48px 32px',
            background: T.surface, border: `1px solid ${T.border}`,
          }}>
            <BookOpen size={24} color={T.accent} style={{ margin: '0 auto 16px', display: 'block' }} />
            <h2 style={{ fontSize: 22, fontWeight: 800, margin: '0 0 8px', letterSpacing: '-0.02em' }}>
              Ready to start documenting?
            </h2>
            <p style={{ fontSize: 14, color: T.text2, margin: '0 0 24px', lineHeight: 1.6 }}>
              Irvo turns these guides into action. Classify your AI systems, map obligations,
              and generate evidence packs — in 20 minutes per system.
            </p>
            <Link
              href="/signup"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: T.accent, color: T.bg, fontSize: 14, fontWeight: 800,
                padding: '13px 32px', borderRadius: 100, textDecoration: 'none',
              }}
            >
              Start documenting <ArrowRight size={14} />
            </Link>
          </div>
        </main>

        {/* Footer */}
        <footer style={{ padding: '32px', borderTop: `1px solid ${T.border}` }}>
          <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
            <p style={{ fontSize: 12, color: T.text3, margin: 0 }}>
              &copy; {new Date().getFullYear()} Irvo. Guidance only — not legal advice.
            </p>
            <div style={{ display: 'flex', gap: 16 }}>
              <Link href="/privacy" style={{ fontSize: 12, color: T.text3, textDecoration: 'none' }}>Privacy</Link>
              <Link href="/terms" style={{ fontSize: 12, color: T.text3, textDecoration: 'none' }}>Terms</Link>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}
