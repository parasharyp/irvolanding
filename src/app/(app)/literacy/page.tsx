'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { LITERACY_ROLES } from '@/lib/ai/literacy'

const FONT = "var(--font-raleway), Raleway, Helvetica, Arial, sans-serif"

export default function LiteracyPage() {
  const [selectedRoles, setSelectedRoles] = useState<Set<string>>(
    new Set(['Leadership', 'Engineering', 'Operations', 'Customer-facing'])
  )
  const [loading, setLoading] = useState(false)

  const toggle = (role: string) => {
    setSelectedRoles((prev) => {
      const next = new Set(prev)
      if (next.has(role)) next.delete(role)
      else next.add(role)
      return next
    })
  }

  const generate = async () => {
    if (selectedRoles.size === 0) {
      toast.error('Select at least one role')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/literacy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roles: Array.from(selectedRoles) }),
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
      a.download = match ? match[1] : 'ai-literacy-briefing.pdf'
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
      toast.success('Briefing downloaded')
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
          EU AI Act · Article 4
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: '#e8e8e8', margin: 0 }}>AI Literacy Briefing</h1>
        <p style={{ color: '#666', marginTop: 10, lineHeight: 1.5 }}>
          Article 4 has been in force since 2 February 2025. Every organisation that deploys AI must ensure relevant staff
          have an appropriate level of AI literacy. Select the roles that apply — Irvo generates a tailored briefing using
          your classified systems and returns it as a signable PDF.
        </p>
      </div>

      <div style={{ border: '1px solid rgba(255,255,255,0.07)', background: '#0c0c0c', padding: 24, marginBottom: 24 }}>
        <div style={{ fontSize: 12, color: '#e8e8e8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 14 }}>
          Roles to include
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 10 }}>
          {LITERACY_ROLES.map((role) => {
            const active = selectedRoles.has(role)
            return (
              <button
                key={role}
                onClick={() => toggle(role)}
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
                {role}
              </button>
            )
          })}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <button
          onClick={generate}
          disabled={loading || selectedRoles.size === 0}
          style={{
            background: '#00e5bf',
            color: '#040404',
            border: 'none',
            padding: '14px 28px',
            fontFamily: FONT,
            fontSize: 14,
            fontWeight: 700,
            cursor: loading ? 'default' : 'pointer',
            opacity: loading || selectedRoles.size === 0 ? 0.5 : 1,
          }}
        >
          {loading ? 'Generating…' : 'Generate & download PDF'}
        </button>
        <span style={{ color: '#666', fontSize: 12 }}>
          Pulls your classified systems. Generation typically takes 15–30 seconds.
        </span>
      </div>

      <div style={{ marginTop: 32, padding: 16, border: '1px solid rgba(255,255,255,0.07)', background: '#080808', color: '#666', fontSize: 12, lineHeight: 1.5 }}>
        The generated PDF includes an acknowledgement form for each staff member to sign. Store signed copies as evidence
        of Article 4 compliance. This is not legal advice — consult your DPO or compliance counsel where required.
      </div>
    </div>
  )
}
