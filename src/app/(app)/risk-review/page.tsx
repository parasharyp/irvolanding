'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

const FONT = "var(--font-raleway), Raleway, Helvetica, Arial, sans-serif"

interface SystemRow { id: string; name: string; risk_level: string | null; annex_category: string | null }

export default function RiskReviewPage() {
  const [systems, setSystems] = useState<SystemRow[]>([])
  const [systemId, setSystemId] = useState<string>('')
  const currentYear = new Date().getFullYear()
  const [period, setPeriod] = useState<string>(String(currentYear))
  const [notes, setNotes] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('systems')
        .select('id, name, risk_level, annex_category')
        .in('status', ['in-progress', 'ready', 'exported'])
        .order('created_at', { ascending: false })
      setSystems(data ?? [])
      if (data && data.length > 0) setSystemId(data[0].id)
      setFetching(false)
    }
    load()
  }, [])

  const generate = async () => {
    if (!systemId) { toast.error('Select a system'); return }
    if (!period.trim()) { toast.error('Enter a review period'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/risk-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemId,
          reviewPeriodLabel: period.trim(),
          incidentNotes: notes.trim() || undefined,
        }),
      })
      if (!res.ok) throw new Error((await res.text()) || `Failed (${res.status})`)
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const cd = res.headers.get('Content-Disposition') || ''
      const match = cd.match(/filename="([^"]+)"/)
      a.download = match ? match[1] : 'risk-review.pdf'
      document.body.appendChild(a); a.click(); a.remove()
      URL.revokeObjectURL(url)
      toast.success('Risk review downloaded')
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
          EU AI Act · Article 9
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: '#e8e8e8', margin: 0 }}>Annual Risk-Management Review</h1>
        <p style={{ color: '#666', marginTop: 10, lineHeight: 1.5 }}>
          Article 9 requires a continuous, iterative risk-management system for every high-risk AI system across its
          lifecycle. Generate the annual review per system — identified risks, incidents, post-market monitoring, testing,
          mitigations, residual-risk acceptability, and actions for the next cycle.
        </p>
      </div>

      {fetching ? (
        <div style={{ color: '#666' }}>Loading your systems…</div>
      ) : systems.length === 0 ? (
        <div style={{ padding: 24, border: '1px solid rgba(255,255,255,0.07)', background: '#0c0c0c', color: '#666' }}>
          No classified systems yet. Classify a system first.
        </div>
      ) : (
        <>
          <div style={{ border: '1px solid rgba(255,255,255,0.07)', background: '#0c0c0c', padding: 24, marginBottom: 18 }}>
            <label htmlFor="system" style={{ display: 'block', fontSize: 12, color: '#e8e8e8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>
              System
            </label>
            <select
              id="system" value={systemId} onChange={(e) => setSystemId(e.target.value)}
              style={{ width: '100%', background: '#040404', border: '1px solid rgba(255,255,255,0.12)', color: '#e8e8e8', padding: 10, fontFamily: FONT, fontSize: 13, outline: 'none' }}
            >
              {systems.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} · {s.risk_level ?? 'unclassified'}{s.annex_category ? ` · ${s.annex_category}` : ''}
                </option>
              ))}
            </select>
          </div>

          <div style={{ border: '1px solid rgba(255,255,255,0.07)', background: '#0c0c0c', padding: 24, marginBottom: 18 }}>
            <label htmlFor="period" style={{ display: 'block', fontSize: 12, color: '#e8e8e8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>
              Review period
            </label>
            <input
              id="period" value={period} onChange={(e) => setPeriod(e.target.value.slice(0, 100))}
              placeholder="e.g. Calendar year 2026"
              style={{ width: '100%', background: '#040404', border: '1px solid rgba(255,255,255,0.12)', color: '#e8e8e8', padding: 10, fontFamily: FONT, fontSize: 13, outline: 'none' }}
            />
          </div>

          <div style={{ border: '1px solid rgba(255,255,255,0.07)', background: '#0c0c0c', padding: 24, marginBottom: 24 }}>
            <label htmlFor="notes" style={{ display: 'block', fontSize: 12, color: '#e8e8e8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>
              Optional — incident / monitoring notes
            </label>
            <textarea
              id="notes" value={notes} onChange={(e) => setNotes(e.target.value.slice(0, 1000))}
              placeholder="Any notable incidents, near-misses, monitoring anomalies, or mitigations added during the period."
              rows={4}
              style={{ width: '100%', background: '#040404', border: '1px solid rgba(255,255,255,0.12)', color: '#e8e8e8', padding: 10, fontFamily: FONT, fontSize: 13, resize: 'vertical', outline: 'none' }}
            />
            <div style={{ color: '#666', fontSize: 11, marginTop: 6, textAlign: 'right' }}>{notes.length}/1000</div>
          </div>

          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <button
              onClick={generate} disabled={loading || !systemId || !period.trim()}
              style={{ background: '#00e5bf', color: '#040404', border: 'none', padding: '14px 28px', fontFamily: FONT, fontSize: 14, fontWeight: 700, cursor: loading ? 'default' : 'pointer', opacity: loading || !systemId || !period.trim() ? 0.5 : 1 }}
            >
              {loading ? 'Generating…' : 'Generate & download PDF'}
            </button>
            <span style={{ color: '#666', fontSize: 12 }}>Store signed copies as Article 9 evidence.</span>
          </div>
        </>
      )}
    </div>
  )
}
