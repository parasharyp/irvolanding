'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { AFFECTED_GROUP_CATEGORIES } from '@/lib/ai/fria'
import { createClient } from '@/lib/supabase/client'

const FONT = "var(--font-raleway), Raleway, Helvetica, Arial, sans-serif"

const GROUP_LABELS: Record<string, string> = {
  'employees': 'Employees',
  'job-applicants': 'Job applicants',
  'customers': 'Customers',
  'patients': 'Patients',
  'students': 'Students',
  'credit-applicants': 'Credit applicants',
  'insurance-applicants': 'Insurance applicants',
  'minors': 'Minors',
  'general-public': 'General public',
  'vulnerable-adults': 'Vulnerable adults',
}

interface SystemRow {
  id: string
  name: string
  risk_level: string | null
  annex_category: string | null
}

export default function FriaPage() {
  const [systems, setSystems] = useState<SystemRow[]>([])
  const [systemId, setSystemId] = useState<string>('')
  const [context, setContext] = useState<string>('')
  const [groups, setGroups] = useState<Set<string>>(new Set(['general-public']))
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

  const toggleGroup = (g: string) => {
    setGroups((prev) => {
      const next = new Set(prev)
      if (next.has(g)) next.delete(g)
      else next.add(g)
      return next
    })
  }

  const generate = async () => {
    if (!systemId) { toast.error('Select a system'); return }
    if (!context.trim()) { toast.error('Describe the deployment context'); return }
    if (groups.size === 0) { toast.error('Select at least one affected group'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/fria', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemId,
          deploymentContext: context.trim(),
          affectedGroups: Array.from(groups),
        }),
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
      a.download = match ? match[1] : 'fria.pdf'
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
      toast.success('FRIA downloaded')
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
          EU AI Act · Article 27
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: '#e8e8e8', margin: 0 }}>Fundamental Rights Impact Assessment</h1>
        <p style={{ color: '#666', marginTop: 10, lineHeight: 1.5 }}>
          Article 27 requires public bodies, providers of public services, and deployers of specific Annex III systems
          (credit scoring, life/health insurance risk assessment) to perform a FRIA before first use. Results must be
          notified to the market surveillance authority. Pick a system, describe how you use it, select the affected
          groups — Irvo drafts the FRIA as a signable PDF.
        </p>
      </div>

      {fetching ? (
        <div style={{ color: '#666' }}>Loading your systems…</div>
      ) : systems.length === 0 ? (
        <div style={{ padding: 24, border: '1px solid rgba(255,255,255,0.07)', background: '#0c0c0c', color: '#666' }}>
          No classified systems yet. Classify a system first on the <strong style={{ color: '#e8e8e8' }}>AI Systems</strong> page.
        </div>
      ) : (
        <>
          <div style={{ border: '1px solid rgba(255,255,255,0.07)', background: '#0c0c0c', padding: 24, marginBottom: 18 }}>
            <label htmlFor="system" style={{ display: 'block', fontSize: 12, color: '#e8e8e8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>
              System
            </label>
            <select
              id="system"
              value={systemId}
              onChange={(e) => setSystemId(e.target.value)}
              style={{
                width: '100%',
                background: '#040404',
                border: '1px solid rgba(255,255,255,0.12)',
                color: '#e8e8e8',
                padding: 10,
                fontFamily: FONT,
                fontSize: 13,
                outline: 'none',
              }}
            >
              {systems.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} · {s.risk_level ?? 'unclassified'}{s.annex_category ? ` · ${s.annex_category}` : ''}
                </option>
              ))}
            </select>
          </div>

          <div style={{ border: '1px solid rgba(255,255,255,0.07)', background: '#0c0c0c', padding: 24, marginBottom: 18 }}>
            <label htmlFor="context" style={{ display: 'block', fontSize: 12, color: '#e8e8e8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>
              Deployment context
            </label>
            <textarea
              id="context"
              value={context}
              onChange={(e) => setContext(e.target.value.slice(0, 500))}
              placeholder="How and where is the system used? What decisions does it inform? Who operates it?"
              rows={3}
              style={{
                width: '100%',
                background: '#040404',
                border: '1px solid rgba(255,255,255,0.12)',
                color: '#e8e8e8',
                padding: 10,
                fontFamily: FONT,
                fontSize: 13,
                resize: 'vertical',
                outline: 'none',
              }}
            />
            <div style={{ color: '#666', fontSize: 11, marginTop: 6, textAlign: 'right' }}>{context.length}/500</div>
          </div>

          <div style={{ border: '1px solid rgba(255,255,255,0.07)', background: '#0c0c0c', padding: 24, marginBottom: 24 }}>
            <div style={{ fontSize: 12, color: '#e8e8e8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 14 }}>
              Affected groups
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 10 }}>
              {AFFECTED_GROUP_CATEGORIES.map((g) => {
                const active = groups.has(g)
                return (
                  <button
                    key={g}
                    onClick={() => toggleGroup(g)}
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
                    {GROUP_LABELS[g] ?? g}
                  </button>
                )
              })}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <button
              onClick={generate}
              disabled={loading || !systemId || !context.trim() || groups.size === 0}
              style={{
                background: '#00e5bf',
                color: '#040404',
                border: 'none',
                padding: '14px 28px',
                fontFamily: FONT,
                fontSize: 14,
                fontWeight: 700,
                cursor: loading ? 'default' : 'pointer',
                opacity: loading || !systemId || !context.trim() || groups.size === 0 ? 0.5 : 1,
              }}
            >
              {loading ? 'Generating…' : 'Generate & download FRIA'}
            </button>
            <span style={{ color: '#666', fontSize: 12 }}>
              Notify the market surveillance authority with the generated PDF.
            </span>
          </div>
        </>
      )}

      <div style={{ marginTop: 32, padding: 16, border: '1px solid rgba(255,255,255,0.07)', background: '#080808', color: '#666', fontSize: 12, lineHeight: 1.5 }}>
        The FRIA covers deployment processes, period/frequency, affected groups, fundamental rights at risk (severity ×
        likelihood), specific harms, human oversight, mitigations, complaint mechanism, residual risk, review triggers,
        and a signable sign-off. This is not legal advice — consult your DPO or compliance counsel before submission.
      </div>
    </div>
  )
}
