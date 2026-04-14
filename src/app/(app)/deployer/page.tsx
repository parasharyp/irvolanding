'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { WORKPLACE_CONTEXTS } from '@/lib/ai/deployer'

const FONT = "var(--font-raleway), Raleway, Helvetica, Arial, sans-serif"

const CONTEXT_LABELS: Record<string, string> = {
  'customer-facing': 'Customer-facing',
  'workforce-management': 'Workforce management',
  'hiring-recruitment': 'Hiring / recruitment',
  'credit-financial': 'Credit / financial',
  'healthcare': 'Healthcare',
  'education': 'Education',
  'public-sector': 'Public sector',
  'internal-operations': 'Internal operations',
}

export default function DeployerPage() {
  const [contexts, setContexts] = useState<Set<string>>(new Set(['customer-facing', 'internal-operations']))
  const [loading, setLoading] = useState(false)

  const toggle = (c: string) => {
    setContexts((prev) => {
      const next = new Set(prev)
      if (next.has(c)) next.delete(c)
      else next.add(c)
      return next
    })
  }

  const generate = async () => {
    if (contexts.size === 0) {
      toast.error('Select at least one deployment context')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/deployer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workplaceContexts: Array.from(contexts) }),
      })
      if (!res.ok) {
        const msg = await res.text()
        throw new Error(msg || `Failed (${res.status})`)
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const cd = res.headers.get('Content-Disposition') || ''
      const match = cd.match(/filename="([^"]+)"/)
      a.download = match ? match[1] : 'deployer-obligations-pack.pdf'
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
      toast.success('Deployer pack downloaded')
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: 32, fontFamily: FONT, maxWidth: 860 }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 11, color: '#00e5bf', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 6 }}>
          EU AI Act · Article 26
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: '#e8e8e8', margin: 0 }}>Deployer Obligations Pack</h1>
        <p style={{ color: '#666', marginTop: 10, lineHeight: 1.5 }}>
          Article 26 places operational obligations on every organisation that deploys high-risk AI — human oversight,
          monitoring, logging, incident reporting, worker and affected-persons notifications, DPIA triggers, and
          cooperation with authorities. Enforcement begins 2 August 2026. Select your deployment contexts — Irvo generates
          a tailored pack using your classified systems.
        </p>
      </div>

      <div style={{ border: '1px solid rgba(255,255,255,0.07)', background: '#0c0c0c', padding: 24, marginBottom: 24 }}>
        <div style={{ fontSize: 12, color: '#e8e8e8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 14 }}>
          Deployment contexts
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
          {WORKPLACE_CONTEXTS.map((c) => {
            const active = contexts.has(c)
            return (
              <button
                key={c}
                onClick={() => toggle(c)}
                type="button"
                style={{
                  padding: '12px 14px',
                  textAlign: 'left',
                  border: `1px solid ${active ? '#00e5bf' : 'rgba(255,255,255,0.12)'}`,
                  background: active ? '#00e5bf' : 'transparent',
                  color: active ? '#040404' : '#e8e8e8',
                  fontFamily: FONT,
                  fontSize: 13,
                  fontWeight: active ? 700 : 500,
                  cursor: 'pointer',
                }}
              >
                {CONTEXT_LABELS[c] ?? c}
              </button>
            )
          })}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <button
          onClick={generate}
          disabled={loading || contexts.size === 0}
          style={{
            background: '#00e5bf',
            color: '#040404',
            border: 'none',
            padding: '14px 28px',
            fontFamily: FONT,
            fontSize: 14,
            fontWeight: 700,
            cursor: loading ? 'default' : 'pointer',
            opacity: loading || contexts.size === 0 ? 0.5 : 1,
          }}
        >
          {loading ? 'Generating…' : 'Generate & download PDF'}
        </button>
        <span style={{ color: '#666', fontSize: 12 }}>
          Pulls your classified systems. Covers Art. 26(1)–(12) + Art. 73 incident reporting.
        </span>
      </div>

      <div style={{ marginTop: 32, padding: 16, border: '1px solid rgba(255,255,255,0.07)', background: '#080808', color: '#666', fontSize: 12, lineHeight: 1.5 }}>
        The pack includes a human-oversight designation template, monitoring & logging procedure, serious-incident playbook
        (Art. 73 timelines), worker and affected-persons notification copy, DPIA trigger checklist, IFU compliance
        attestation, and a full obligations appendix with evidence requirements. This is not legal advice.
      </div>
    </div>
  )
}
