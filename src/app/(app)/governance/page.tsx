'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { GOVERNANCE_SCALES } from '@/lib/ai/governance'

const FONT = "var(--font-raleway), Raleway, Helvetica, Arial, sans-serif"

const SCALE_LABELS: Record<string, string> = {
  micro: 'Micro (≤10 staff)',
  small: 'Small (11–50 staff)',
  medium: 'Medium (51–250 staff)',
}

export default function GovernancePage() {
  const [scale, setScale] = useState<string>('small')
  const [loading, setLoading] = useState(false)

  const generate = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/governance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ organisationScale: scale }),
      })
      if (!res.ok) throw new Error((await res.text()) || `Failed (${res.status})`)
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const cd = res.headers.get('Content-Disposition') || ''
      const match = cd.match(/filename="([^"]+)"/)
      a.download = match ? match[1] : 'ai-governance-pack.pdf'
      document.body.appendChild(a); a.click(); a.remove()
      URL.revokeObjectURL(url)
      toast.success('Governance pack downloaded')
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
          Governance
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: '#e8e8e8', margin: 0 }}>AI Governance Pack</h1>
        <p style={{ color: '#666', marginTop: 10, lineHeight: 1.5 }}>
          Operationalise your AI Act obligations. The pack delivers an adopt-ready AI policy, scope, principles,
          roles/responsibilities, a RACI matrix, AI committee charter, record-keeping practices, approved and prohibited
          use lists (Art. 5), vendor assessment criteria, training requirements (Art. 4), and a review cadence — scaled
          proportionally to your organisation size.
        </p>
      </div>

      <div style={{ border: '1px solid rgba(255,255,255,0.07)', background: '#0c0c0c', padding: 24, marginBottom: 24 }}>
        <div style={{ fontSize: 12, color: '#e8e8e8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 14 }}>
          Organisation scale
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {GOVERNANCE_SCALES.map((x) => {
            const active = scale === x
            return (
              <button key={x} onClick={() => setScale(x)} type="button"
                style={{
                  padding: '10px 16px',
                  border: `1px solid ${active ? '#00e5bf' : 'rgba(255,255,255,0.12)'}`,
                  background: active ? '#00e5bf' : 'transparent',
                  color: active ? '#040404' : '#e8e8e8',
                  fontFamily: FONT, fontSize: 12, fontWeight: active ? 700 : 500, cursor: 'pointer',
                }}
              >
                {SCALE_LABELS[x] ?? x}
              </button>
            )
          })}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <button
          onClick={generate} disabled={loading}
          style={{ background: '#00e5bf', color: '#040404', border: 'none', padding: '14px 28px', fontFamily: FONT, fontSize: 14, fontWeight: 700, cursor: loading ? 'default' : 'pointer', opacity: loading ? 0.5 : 1 }}
        >
          {loading ? 'Generating…' : 'Generate & download PDF'}
        </button>
        <span style={{ color: '#666', fontSize: 12 }}>Adopt, sign, store as AI Act evidence.</span>
      </div>
    </div>
  )
}
