import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Irvo terms of service — conditions for using our EU AI Act compliance platform. Guidance only, not legal advice.',
  alternates: { canonical: 'https://irvo.co.uk/terms' },
}

export default function TermsPage() {
  return (
    <div style={{
      minHeight: '100vh', background: '#040404', color: '#e8e8e8',
      fontFamily: 'var(--font-raleway), Raleway, Helvetica, Arial, sans-serif',
      padding: '80px 32px',
    }}>
      <div style={{ maxWidth: 680, margin: '0 auto' }}>
        <Link href="/" style={{ fontSize: 12, color: '#888', textDecoration: 'none', display: 'inline-block', marginBottom: 32 }}>
          ← Back to Irvo
        </Link>
        <h1 style={{ fontSize: 28, fontWeight: 900, margin: '0 0 16px', letterSpacing: '-0.02em' }}>Terms of Service</h1>
        <p style={{ fontSize: 14, color: '#888', lineHeight: 1.7, margin: '0 0 24px' }}>
          Last updated: March 2026
        </p>
        <div style={{ fontSize: 14, color: '#888', lineHeight: 1.8 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: '#e8e8e8', margin: '32px 0 12px' }}>Service Description</h2>
          <p style={{ marginBottom: 16 }}>
            Irvo provides AI Act compliance documentation tools including risk classification, obligations mapping, evidence drafting, and evidence pack generation. The service is provided on a subscription basis.
          </p>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: '#e8e8e8', margin: '32px 0 12px' }}>Not Legal Advice</h2>
          <p style={{ marginBottom: 16 }}>
            Irvo provides compliance guidance and structured documentation tools only. Our outputs do not constitute legal advice. You should always consult qualified legal counsel for binding compliance decisions. Irvo is not liable for regulatory outcomes based on classifications or documentation produced by the service.
          </p>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: '#e8e8e8', margin: '32px 0 12px' }}>Subscriptions &amp; Billing</h2>
          <p style={{ marginBottom: 16 }}>
            Plans are billed monthly via Stripe. You may cancel at any time; access continues until the end of the current billing period. Founding discount pricing is locked for the lifetime of continuous subscription.
          </p>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: '#e8e8e8', margin: '32px 0 12px' }}>Data Ownership</h2>
          <p style={{ marginBottom: 16 }}>
            You retain full ownership of all data you input into Irvo, including system descriptions, questionnaire answers, and evidence documentation. We do not claim any intellectual property rights over your content.
          </p>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: '#e8e8e8', margin: '32px 0 12px' }}>Contact</h2>
          <p>
            For questions: <a href="mailto:hello@irvo.co.uk" style={{ color: '#00e5bf', textDecoration: 'none' }}>hello@irvo.co.uk</a>
          </p>
        </div>
      </div>
    </div>
  )
}
