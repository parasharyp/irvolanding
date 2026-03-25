import Link from 'next/link'

export default function PrivacyPage() {
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
        <h1 style={{ fontSize: 28, fontWeight: 900, margin: '0 0 16px', letterSpacing: '-0.02em' }}>Privacy Policy</h1>
        <p style={{ fontSize: 14, color: '#888', lineHeight: 1.7, margin: '0 0 24px' }}>
          Last updated: March 2026
        </p>
        <div style={{ fontSize: 14, color: '#888', lineHeight: 1.8 }}>
          <p style={{ marginBottom: 16 }}>
            Irvo (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) is committed to protecting your privacy. This policy explains how we collect, use, and safeguard your information when you use our service at irvo.co.uk.
          </p>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: '#e8e8e8', margin: '32px 0 12px' }}>Data We Collect</h2>
          <p style={{ marginBottom: 16 }}>
            Account information (email, name, organisation name), AI system descriptions and questionnaire answers you provide, evidence documentation you upload or draft, and standard usage analytics.
          </p>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: '#e8e8e8', margin: '32px 0 12px' }}>How We Use It</h2>
          <p style={{ marginBottom: 16 }}>
            To provide the compliance documentation service, generate risk classifications and evidence packs, process payments via Stripe, and send transactional emails via Resend. We do not sell your data.
          </p>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: '#e8e8e8', margin: '32px 0 12px' }}>AI Processing</h2>
          <p style={{ marginBottom: 16 }}>
            System descriptions and questionnaire answers are sent to Anthropic&apos;s Claude API for risk classification and evidence drafting. This data is processed under Anthropic&apos;s data processing terms and is not used to train AI models.
          </p>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: '#e8e8e8', margin: '32px 0 12px' }}>Data Storage</h2>
          <p style={{ marginBottom: 16 }}>
            Data is stored in Supabase (hosted in the EU) with row-level security ensuring organisation isolation. All connections are encrypted in transit (TLS 1.2+) and at rest.
          </p>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: '#e8e8e8', margin: '32px 0 12px' }}>Contact</h2>
          <p>
            For privacy enquiries: <a href="mailto:hello@irvo.co.uk" style={{ color: '#00e5bf', textDecoration: 'none' }}>hello@irvo.co.uk</a>
          </p>
        </div>
      </div>
    </div>
  )
}
