import type { Metadata } from 'next'
import LandingClient from './LandingClient'
import {
  getOrganizationSchema,
  getWebsiteSchema,
  getSoftwareApplicationSchema,
  getFAQSchema,
  getBreadcrumbSchema,
} from '@/lib/structured-data'

// ─── SEO Metadata ────────────────────────────────────────────────────────────
// This is server-rendered into <head> — crawlers see it immediately.
export const metadata: Metadata = {
  title: 'Irvo — EU AI Act Compliance Platform for SMEs | Evidence Packs in 20 Minutes',
  description:
    'Irvo helps EU and UK companies with 10–500 employees document AI systems for EU AI Act compliance. AI-powered risk classification, obligations mapping, and regulator-ready evidence packs — in 20 minutes per system, not 40 hours. Enforcement: August 2, 2026.',
  keywords: [
    'EU AI Act compliance',
    'AI Act evidence pack',
    'AI Act compliance tool',
    'EU AI Act SME',
    'AI risk classification',
    'AI Act obligations',
    'Annex III high-risk AI',
    'AI compliance software',
    'AI Act documentation',
    'AI Act UK compliance',
    'AI governance tool',
    'AI regulation compliance',
    'artificial intelligence act',
    'EU AI Act August 2026',
    'AI Act evidence documentation',
    'AI compliance SaaS',
    'GPAI obligations',
    'AI Act risk assessment',
    'regulator-ready evidence pack',
    'AI Act compliance for SMEs',
  ],
  alternates: {
    canonical: 'https://irvo.co.uk',
  },
  openGraph: {
    title: 'Irvo — EU AI Act Compliance for SMEs',
    description:
      'Turn each AI workflow into a structured, regulator-ready evidence pack in 20 minutes. AI-powered risk classification and obligations mapping for the EU AI Act. Enforcement: August 2, 2026.',
    url: 'https://irvo.co.uk',
    siteName: 'Irvo',
    type: 'website',
    locale: 'en_GB',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Irvo — EU AI Act Compliance for SMEs',
    description:
      'AI-powered risk classification, obligations mapping, and evidence pack generation. Be ready before August 2, 2026.',
    site: '@irvo_uk',
  },
  robots: {
    index: true,
    follow: true,
    'max-snippet': -1,
    'max-image-preview': 'large',
    'max-video-preview': -1,
  },
  other: {
    'geo.region': 'GB',
    'geo.placename': 'United Kingdom',
    'content-language': 'en-GB',
  },
}

// ─── FAQ data (duplicated here for JSON-LD — source of truth) ────────────────
const FAQS = [
  { q: 'Is this legal advice?', a: 'No. Irvo provides compliance guidance and structured documentation tools. Always consult qualified legal counsel for binding decisions.' },
  { q: 'What AI systems need documenting?', a: 'Any workflow using automation, ML models, or AI-enabled tools that falls under Annex III categories: HR/recruitment, credit scoring, safety-critical systems, and more.' },
  { q: 'What if my system is low-risk?', a: 'You\u2019ll know in 2 minutes. The questionnaire classifies your system and only generates obligations that apply. Limited-risk systems have lighter requirements.' },
  { q: 'Can I try before I pay?', a: 'Yes. We offer a free concierge session where we document one workflow for you at no cost.' },
  { q: 'How long does it actually take?', a: '20 minutes per system for a complete evidence pack. Compare that to 40\u201360 hours with a consultant.' },
  { q: 'What happens after August 2026?', a: 'The Act requires ongoing compliance, not a one-time exercise. Irvo supports annual reviews and updates whenever your systems change.' },
]

// ─── Page Component (Server) ─────────────────────────────────────────────────
export default function HomePage() {
  const orgSchema = getOrganizationSchema()
  const siteSchema = getWebsiteSchema()
  const appSchema = getSoftwareApplicationSchema()
  const faqSchema = getFAQSchema(FAQS)
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: 'https://irvo.co.uk' },
  ])

  return (
    <>
      {/* JSON-LD Structured Data — server-rendered, visible to all crawlers */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(siteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(appSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Semantic HTML for crawlers — visually hidden, server-rendered */}
      {/* This ensures all key content is in the initial HTML response */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          width: 1,
          height: 1,
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          whiteSpace: 'nowrap',
          border: 0,
        }}
      >
        <main>
          <h1>Irvo — EU AI Act Compliance Platform for SMEs</h1>
          <p>
            Your AI systems need evidence packs. Build them in minutes. Irvo is
            the only tool that builds the evidence pack regulators will actually
            ask for. Covers all Annex III high-risk categories for EU and UK
            jurisdiction.
          </p>

          <section>
            <h2>EU AI Act Enforcement Deadline: August 2, 2026</h2>
            <p>
              Maximum penalty: up to 35 million pounds or 7% of global annual
              turnover. 67% of SMEs are unaware their workflows qualify under the
              EU AI Act.
            </p>
          </section>

          <section>
            <h2>The Compliance Gap for SMEs</h2>
            <p>
              Most SMEs are starting from zero. Manual compliance takes 40-60
              hours per system. Consulting engagements cost 15,000 to 50,000
              pounds. There is zero structured tooling built for companies with
              10 to 500 employees.
            </p>
          </section>

          <section>
            <h2>How Irvo Works — From Workflow to Evidence Pack in 20 Minutes</h2>
            <p>
              Irvo turns each of your AI and automation workflows into a
              structured evidence pack for your legal team — in hours instead of
              weeks, at a fraction of consulting cost. Built for compliance
              leads, ops directors, and CTOs at EU/UK companies with 10 to 500
              employees.
            </p>
            <ol>
              <li>
                Describe your AI system — name the workflow, describe what it
                does, identify who is affected. Two minutes.
              </li>
              <li>
                Answer 12 questions — AI classifies your risk level, maps the
                Annex III category, and generates every obligation that applies.
                Instant.
              </li>
              <li>
                Capture evidence, export — AI drafts each evidence section. You
                review, edit, upload supporting files. Download an 8-section PDF
                ready for any auditor.
              </li>
            </ol>
          </section>

          <section>
            <h2>AI Act Compliance Features</h2>
            <ul>
              <li>
                Risk Classification Engine — 12-question questionnaire mapped to
                Annex III. AI classifies your system in seconds.
              </li>
              <li>
                Obligations Mapping — every applicable Article surfaced with
                required evidence. No legal interpretation needed.
              </li>
              <li>
                AI Evidence Drafting — Claude drafts evidence sections from your
                system description. Edit, review, approve.
              </li>
              <li>
                Evidence Pack Export — 8-section PDF: cover, classification,
                obligations, evidence, gaps, declaration. Auditor-ready.
              </li>
              <li>
                Deadline Tracking — countdown to August 2, 2026. Urgency states.
                Progress dashboards per system.
              </li>
              <li>
                Multi-System Management — document 3 to 25+ systems. Track
                completion across your entire AI inventory.
              </li>
            </ul>
          </section>

          <section>
            <h2>Pricing — Built for SME Budgets</h2>
            <p>30% lifetime discount for first 20 customers.</p>
            <ul>
              <li>
                Starter Plan — 149 pounds per month. 1 user, 3 AI systems. PDF
                export, risk classification, obligations map, basic templates,
                email support.
              </li>
              <li>
                Growth Plan — 399 pounds per month. Up to 5 users, 10 AI
                systems. PDF and Word export, AI drafting assistance, custom
                templates, priority support.
              </li>
              <li>
                Plus Plan — 799 pounds per month. Unlimited users, 25+ AI
                systems. Auditor view, API access, custom templates, dedicated
                support.
              </li>
            </ul>
          </section>

          <section>
            <h2>Frequently Asked Questions about EU AI Act Compliance</h2>
            {FAQS.map((faq) => (
              <div key={faq.q}>
                <h3>{faq.q}</h3>
                <p>{faq.a}</p>
              </div>
            ))}
          </section>

          <section>
            <h2>Start Documenting Your AI Systems Today</h2>
            <p>
              The EU AI Act enforcement deadline is August 2, 2026. Start
              documenting your AI systems today. First 20 customers get 30% off
              for life. Irvo does not provide legal advice. Consult a qualified
              professional for binding decisions.
            </p>
          </section>
        </main>
      </div>

      {/* Visual landing page — client-rendered with animations */}
      <LandingClient />
    </>
  )
}
