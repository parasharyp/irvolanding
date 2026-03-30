import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowRight, ArrowLeft, Clock, AlertTriangle, Info, Lightbulb } from 'lucide-react'
import { getGuideBySlug, getAllSlugs, GUIDES } from '@/lib/guides'
import { getFAQSchema, getBreadcrumbSchema, getOrganizationSchema } from '@/lib/structured-data'
import type { GuideSection, GuideFAQ } from '@/lib/guides/types'

// ─── Static generation ───────────────────────────────────────────────────────
export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }))
}

// ─── Dynamic metadata ────────────────────────────────────────────────────────
type PageProps = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const guide = getGuideBySlug(slug)
  if (!guide) return {}

  return {
    title: guide.title,
    description: guide.metaDescription,
    keywords: guide.tags.map((t) => `${t} EU AI Act`),
    alternates: { canonical: `https://irvo.co.uk/guides/${guide.slug}` },
    openGraph: {
      title: guide.title,
      description: guide.metaDescription,
      url: `https://irvo.co.uk/guides/${guide.slug}`,
      type: 'article',
      publishedTime: guide.publishedAt,
      modifiedTime: guide.updatedAt,
      authors: [guide.author],
    },
    twitter: {
      card: 'summary_large_image',
      title: guide.headline,
      description: guide.metaDescription,
    },
  }
}

// ─── Design tokens ───────────────────────────────────────────────────────────
const T = {
  bg: '#040404',
  surface: '#0c0c0c',
  surface2: '#131313',
  border: 'rgba(255,255,255,0.07)',
  borderMid: 'rgba(255,255,255,0.10)',
  text: '#e8e8e8',
  text2: '#888',
  text3: '#555',
  accent: '#00e5bf',
  accentDim: 'rgba(0,229,191,0.08)',
  red: '#e54747',
  amber: '#f59e0b',
}
const FF = 'var(--font-raleway), Raleway, Helvetica, Arial, sans-serif'

// ─── Callout component ───────────────────────────────────────────────────────
function Callout({ type, text }: { type: 'info' | 'warning' | 'tip'; text: string }) {
  const config = {
    info: { icon: Info, color: T.accent, bg: T.accentDim, border: 'rgba(0,229,191,0.2)' },
    warning: { icon: AlertTriangle, color: T.amber, bg: 'rgba(245,158,11,0.06)', border: 'rgba(245,158,11,0.2)' },
    tip: { icon: Lightbulb, color: T.accent, bg: T.accentDim, border: 'rgba(0,229,191,0.2)' },
  }[type]
  const Icon = config.icon
  return (
    <div style={{
      display: 'flex', gap: 12, padding: '16px 20px', marginTop: 16,
      background: config.bg, border: `1px solid ${config.border}`,
    }}>
      <Icon size={16} color={config.color} style={{ flexShrink: 0, marginTop: 2 }} />
      <p style={{ fontSize: 13, color: T.text2, lineHeight: 1.7, margin: 0 }}>{text}</p>
    </div>
  )
}

// ─── Table component ─────────────────────────────────────────────────────────
function DataTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div style={{ overflowX: 'auto', marginTop: 16 }}>
      <table style={{
        width: '100%', borderCollapse: 'collapse', fontSize: 13, lineHeight: 1.6,
      }}>
        <thead>
          <tr>
            {headers.map((h) => (
              <th key={h} style={{
                textAlign: 'left', padding: '10px 14px', fontWeight: 700,
                color: T.text, background: T.surface2, borderBottom: `1px solid ${T.borderMid}`,
                whiteSpace: 'nowrap',
              }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j} style={{
                  padding: '10px 14px', color: T.text2,
                  borderBottom: `1px solid ${T.border}`,
                  verticalAlign: 'top',
                }}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ─── Section renderer ────────────────────────────────────────────────────────
function Section({ section }: { section: GuideSection }) {
  return (
    <section id={section.id} style={{ marginBottom: 48 }}>
      <h2 style={{
        fontSize: 22, fontWeight: 800, color: T.text, letterSpacing: '-0.02em',
        margin: '0 0 16px', lineHeight: 1.3, scrollMarginTop: 80,
      }}>
        {section.heading}
      </h2>
      {section.content.split('\n\n').map((paragraph, i) => (
        <p key={i} style={{ fontSize: 15, color: T.text2, lineHeight: 1.8, margin: '0 0 14px' }}>
          {paragraph}
        </p>
      ))}
      {section.table && <DataTable headers={section.table.headers} rows={section.table.rows} />}
      {section.list && (
        <ul style={{ padding: '0 0 0 20px', margin: '12px 0 0' }}>
          {section.list.map((item, i) => (
            <li key={i} style={{ fontSize: 14, color: T.text2, lineHeight: 1.7, marginBottom: 6 }}>
              {item}
            </li>
          ))}
        </ul>
      )}
      {section.callout && <Callout type={section.callout.type} text={section.callout.text} />}
    </section>
  )
}

// ─── FAQ renderer ────────────────────────────────────────────────────────────
function FAQSection({ faqs }: { faqs: GuideFAQ[] }) {
  return (
    <section id="faq" style={{ marginTop: 64 }}>
      <h2 style={{
        fontSize: 22, fontWeight: 800, color: T.text, letterSpacing: '-0.02em',
        margin: '0 0 32px',
      }}>
        Frequently Asked Questions
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {faqs.map((faq) => (
          <div key={faq.question} style={{
            padding: '24px 0', borderBottom: `1px solid ${T.border}`,
          }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: T.text, margin: '0 0 8px' }}>
              {faq.question}
            </h3>
            <p style={{ fontSize: 14, color: T.text2, lineHeight: 1.7, margin: 0 }}>
              {faq.answer}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}

// ─── Page component ──────────────────────────────────────────────────────────
export default async function GuidePage({ params }: PageProps) {
  const { slug } = await params
  const guide = getGuideBySlug(slug)
  if (!guide) notFound()

  const faqSchema = getFAQSchema(guide.faqs.map((f) => ({ q: f.question, a: f.answer })))
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: 'https://irvo.co.uk' },
    { name: 'Guides', url: 'https://irvo.co.uk/guides' },
    { name: guide.headline, url: `https://irvo.co.uk/guides/${guide.slug}` },
  ])
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: guide.headline,
    description: guide.metaDescription,
    author: { '@type': 'Organization', name: guide.author },
    publisher: { '@type': 'Organization', name: 'Irvo', url: 'https://irvo.co.uk' },
    datePublished: guide.publishedAt,
    dateModified: guide.updatedAt,
    mainEntityOfPage: `https://irvo.co.uk/guides/${guide.slug}`,
  }
  const orgSchema = getOrganizationSchema()

  // Related guides
  const related = guide.relatedSlugs
    .map((s) => GUIDES[s])
    .filter(Boolean)

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }} />

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
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <Link href="/guides" style={{ fontSize: 13, color: T.text2, textDecoration: 'none' }}>Guides</Link>
            <Link href="/login" style={{ fontSize: 13, color: T.text2, textDecoration: 'none' }}>Sign in</Link>
          </div>
        </header>

        <div style={{ maxWidth: 760, margin: '0 auto', padding: '48px 32px 120px' }}>
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" style={{ marginBottom: 32, fontSize: 12, color: T.text3 }}>
            <Link href="/" style={{ color: T.text3, textDecoration: 'none' }}>Home</Link>
            <span style={{ margin: '0 8px' }}>/</span>
            <Link href="/guides" style={{ color: T.text3, textDecoration: 'none' }}>Guides</Link>
            <span style={{ margin: '0 8px' }}>/</span>
            <span style={{ color: T.text2 }}>{guide.headline}</span>
          </nav>

          {/* Article header */}
          <header style={{ marginBottom: 48 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
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
              <span style={{ fontSize: 11, color: T.text3 }}>
                Updated {new Date(guide.updatedAt).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
              </span>
            </div>
            <h1 style={{
              fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 900,
              letterSpacing: '-0.03em', lineHeight: 1.15, margin: '0 0 16px',
            }}>
              {guide.headline}
            </h1>
            <p style={{ fontSize: 16, color: T.text2, lineHeight: 1.7, margin: 0 }}>
              {guide.subtitle}
            </p>
          </header>

          {/* TL;DR box — GEO optimised: this is what AI search extracts */}
          <div style={{
            padding: '20px 24px', marginBottom: 48,
            background: T.accentDim, border: `1px solid rgba(0,229,191,0.2)`,
          }}>
            <p style={{
              fontSize: 11, fontWeight: 700, color: T.accent, textTransform: 'uppercase',
              letterSpacing: '0.06em', margin: '0 0 8px',
            }}>
              TL;DR
            </p>
            <p style={{ fontSize: 14, color: T.text, lineHeight: 1.7, margin: 0 }}>
              {guide.tldr}
            </p>
          </div>

          {/* Table of contents */}
          <nav aria-label="Table of contents" style={{
            padding: '24px 28px', marginBottom: 48,
            background: T.surface, border: `1px solid ${T.border}`,
          }}>
            <p style={{
              fontSize: 11, fontWeight: 700, color: T.text3, textTransform: 'uppercase',
              letterSpacing: '0.08em', margin: '0 0 14px',
            }}>
              In this guide
            </p>
            <ol style={{ padding: '0 0 0 18px', margin: 0 }}>
              {guide.sections.map((s) => (
                <li key={s.id} style={{ marginBottom: 6 }}>
                  <a
                    href={`#${s.id}`}
                    style={{ fontSize: 13, color: T.text2, textDecoration: 'none', lineHeight: 1.5 }}
                  >
                    {s.heading}
                  </a>
                </li>
              ))}
              {guide.faqs.length > 0 && (
                <li style={{ marginBottom: 6 }}>
                  <a href="#faq" style={{ fontSize: 13, color: T.text2, textDecoration: 'none' }}>
                    Frequently Asked Questions
                  </a>
                </li>
              )}
            </ol>
          </nav>

          {/* Article body */}
          <article>
            {guide.sections.map((section) => (
              <Section key={section.id} section={section} />
            ))}
          </article>

          {/* FAQ section with schema */}
          {guide.faqs.length > 0 && <FAQSection faqs={guide.faqs} />}

          {/* CTA */}
          <div style={{
            marginTop: 64, padding: '40px 32px', textAlign: 'center',
            background: T.surface, border: `1px solid ${T.border}`,
          }}>
            <h2 style={{ fontSize: 22, fontWeight: 800, margin: '0 0 8px', letterSpacing: '-0.02em' }}>
              Turn this guide into action
            </h2>
            <p style={{ fontSize: 14, color: T.text2, margin: '0 0 24px', lineHeight: 1.6, maxWidth: 480, marginLeft: 'auto', marginRight: 'auto' }}>
              Irvo automates the compliance steps in this guide. Classify your AI systems,
              map obligations, and generate evidence packs — in 20 minutes per system.
            </p>
            <Link
              href={guide.ctaVariant === 'signup' ? '/signup' : '/'}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: T.accent, color: T.bg, fontSize: 14, fontWeight: 800,
                padding: '13px 32px', borderRadius: 100, textDecoration: 'none',
              }}
            >
              {guide.ctaVariant === 'signup' ? 'Start documenting' : 'Join the waitlist'} <ArrowRight size={14} />
            </Link>
          </div>

          {/* Related articles */}
          {related.length > 0 && (
            <div style={{ marginTop: 64 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: T.text, margin: '0 0 24px', letterSpacing: '-0.02em' }}>
                Related guides
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {related.map((r) => (
                  <Link
                    key={r.slug}
                    href={`/guides/${r.slug}`}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '16px 20px', background: T.surface, border: `1px solid ${T.border}`,
                      textDecoration: 'none', color: 'inherit', gap: 16,
                    }}
                  >
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 700, color: T.text, margin: '0 0 4px' }}>
                        {r.headline}
                      </p>
                      <p style={{ fontSize: 12, color: T.text3, margin: 0 }}>
                        {r.category} &middot; {r.readingTime}
                      </p>
                    </div>
                    <ArrowRight size={14} color={T.text3} style={{ flexShrink: 0 }} />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Back link */}
          <div style={{ marginTop: 48 }}>
            <Link href="/guides" style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              fontSize: 13, color: T.text3, textDecoration: 'none',
            }}>
              <ArrowLeft size={12} /> All guides
            </Link>
          </div>

          {/* Disclaimer */}
          <p style={{ fontSize: 11, color: T.text3, marginTop: 48, lineHeight: 1.6 }}>
            This guide is provided for informational purposes only and does not constitute legal advice.
            Always consult qualified legal counsel for binding decisions regarding EU AI Act compliance.
            References are to Regulation (EU) 2024/1689 of the European Parliament and of the Council.
          </p>
        </div>

        {/* Footer */}
        <footer style={{ padding: '32px', borderTop: `1px solid ${T.border}` }}>
          <div style={{ maxWidth: 760, margin: '0 auto', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
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
