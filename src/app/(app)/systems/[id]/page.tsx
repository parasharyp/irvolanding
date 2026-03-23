'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { AISystem, Obligation, RiskLevel } from '@/types'

function riskColor(level: RiskLevel): string {
  switch (level) {
    case 'unacceptable': return '#e54747'
    case 'high': return '#e54747'
    case 'limited': return '#f59e0b'
    case 'minimal': return '#36bd5f'
    default: return '#555'
  }
}

interface ObligationWithEvidence extends Obligation {
  draftText?: string
  savedContent?: string
}

export default function SystemDetailPage() {
  const params = useParams()
  const id = params.id as string
  const [system, setSystem] = useState<AISystem | null>(null)
  const [obligations, setObligations] = useState<ObligationWithEvidence[]>([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<string | null>(null)
  const [evidenceText, setEvidenceText] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState<Record<string, boolean>>({})
  const [drafting, setDrafting] = useState<Record<string, boolean>>({})

  useEffect(() => {
    Promise.all([
      fetch(`/api/systems/${id}`).then((r) => r.json()),
      fetch(`/api/systems/${id}/evidence`).then((r) => r.json()),
    ]).then(([sysData, evidenceData]) => {
      setSystem(sysData.system ?? null)
      setObligations(sysData.obligations ?? [])
      // Pre-fill any saved evidence
      const textMap: Record<string, string> = {}
      for (const ev of evidenceData.evidence ?? []) {
        if (ev.obligation_id) textMap[ev.obligation_id] = ev.content ?? ''
      }
      setEvidenceText(textMap)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [id])

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  async function saveEvidence(obligationId: string) {
    setSaving((prev) => ({ ...prev, [obligationId]: true }))
    try {
      await fetch(`/api/systems/${id}/evidence`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ obligation_id: obligationId, type: 'text', content: evidenceText[obligationId] ?? '' }),
      })
      showToast('Evidence saved')
    } catch {
      showToast('Failed to save')
    } finally {
      setSaving((prev) => ({ ...prev, [obligationId]: false }))
    }
  }

  async function aiDraft(ob: ObligationWithEvidence) {
    setDrafting((prev) => ({ ...prev, [ob.id]: true }))
    // Stub: simulate AI drafting
    await new Promise((r) => setTimeout(r, 800))
    const mockDraft = `[AI Draft] This system complies with ${ob.article} (${ob.title}) through the following measures: ` +
      `A documented process exists for ${ob.description.toLowerCase()} ` +
      `Regular reviews are conducted quarterly and findings are recorded in the compliance log. ` +
      `Responsible owner has been assigned and training completed as of ${new Date().toLocaleDateString('en-GB')}.`
    setEvidenceText((prev) => ({ ...prev, [ob.id]: mockDraft }))
    setDrafting((prev) => ({ ...prev, [ob.id]: false }))
    showToast('AI draft generated — review and edit before saving')
  }

  function toggleComplete(obId: string) {
    setObligations((prev) => prev.map((o) => o.id === obId ? { ...o, is_complete: !o.is_complete } : o))
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#040404', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666', fontFamily: 'var(--font-raleway), Raleway, Helvetica, Arial, sans-serif' }}>
        Loading system…
      </div>
    )
  }

  const complete = obligations.filter((o) => o.is_complete).length
  const total = obligations.length
  const pct = total > 0 ? Math.round((complete / total) * 100) : 0

  return (
    <div style={{
      minHeight: '100vh',
      background: '#040404',
      fontFamily: 'var(--font-raleway), Raleway, Helvetica, Arial, sans-serif',
      color: '#e8e8e8',
    }}>
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: 20, right: 20, zIndex: 9999,
          background: '#0c0c0c', border: '1px solid rgba(255,255,255,0.1)',
          padding: '12px 20px', fontSize: 13, color: '#e8e8e8', fontWeight: 600,
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        }}>
          {toast}
        </div>
      )}

      <div style={{ padding: '32px' }}>
        {/* Back link */}
        <Link href="/systems" style={{ fontSize: 12, color: '#555', textDecoration: 'none', display: 'inline-block', marginBottom: 24 }}>
          ← Back to AI Systems
        </Link>

        {/* System header */}
        {system ? (
          <div style={{ marginBottom: 32 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 16 }}>
              <div>
                <h1 style={{ fontSize: 22, fontWeight: 900, color: '#ffffff', margin: '0 0 8px', letterSpacing: '-0.01em' }}>{system.name}</h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                  <span style={{
                    padding: '3px 12px',
                    border: `1px solid ${riskColor(system.risk_level)}`,
                    color: riskColor(system.risk_level),
                    fontSize: 11, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase',
                  }}>
                    {system.risk_level.charAt(0).toUpperCase() + system.risk_level.slice(1)} Risk
                  </span>
                  {system.annex_iii_category && system.annex_iii_category !== 'none' && (
                    <span style={{ padding: '3px 12px', border: '1px solid rgba(255,255,255,0.1)', color: '#888', fontSize: 11, fontWeight: 600 }}>
                      {system.annex_iii_category.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                    </span>
                  )}
                </div>
              </div>
              {/* Export stub */}
              <button
                onClick={() => showToast('Export coming soon')}
                style={{
                  padding: '10px 20px',
                  background: 'transparent',
                  color: '#666',
                  border: '1px solid rgba(255,255,255,0.07)',
                  cursor: 'pointer',
                  fontSize: 12,
                  fontWeight: 600,
                  fontFamily: 'var(--font-raleway), Raleway, Helvetica, Arial, sans-serif',
                }}
              >
                Export
              </button>
            </div>

            {/* Meta */}
            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginBottom: 20 }}>
              {system.owner && (
                <div>
                  <span style={{ fontSize: 10, color: '#555', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Owner</span>
                  <div style={{ fontSize: 13, color: '#888', marginTop: 2 }}>{system.owner}</div>
                </div>
              )}
              {system.business_process && (
                <div>
                  <span style={{ fontSize: 10, color: '#555', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Business Process</span>
                  <div style={{ fontSize: 13, color: '#888', marginTop: 2 }}>{system.business_process}</div>
                </div>
              )}
            </div>

            {/* Progress bar */}
            <div style={{ background: '#0c0c0c', border: '1px solid rgba(255,255,255,0.07)', padding: '16px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#e8e8e8' }}>Documentation Progress</span>
                <span style={{ fontSize: 20, fontWeight: 900, color: pct === 100 ? '#36bd5f' : '#00e5bf' }}>{pct}%</span>
              </div>
              <div style={{ height: 6, background: '#131313', width: '100%' }}>
                <div style={{
                  height: 6,
                  background: pct === 100 ? '#36bd5f' : '#00e5bf',
                  width: `${pct}%`,
                  transition: 'width 0.5s ease',
                }} />
              </div>
              <div style={{ fontSize: 11, color: '#555', marginTop: 8 }}>{complete} of {total} obligations documented</div>
            </div>
          </div>
        ) : (
          <div style={{ color: '#e54747', marginBottom: 24 }}>System not found.</div>
        )}

        {/* Obligations */}
        {obligations.length > 0 && (
          <div>
            <h2 style={{ fontSize: 15, fontWeight: 800, color: '#e8e8e8', margin: '0 0 16px', letterSpacing: '-0.01em' }}>
              Compliance Obligations
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {obligations.map((ob) => (
                <div
                  key={ob.id}
                  style={{
                    background: '#0c0c0c',
                    border: `1px solid ${ob.is_complete ? 'rgba(54,189,95,0.2)' : 'rgba(255,255,255,0.07)'}`,
                    padding: '20px 24px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: '#00e5bf' }}>{ob.article}</span>
                        <span style={{ fontSize: 14, fontWeight: 800, color: ob.is_complete ? '#36bd5f' : '#e8e8e8' }}>{ob.title}</span>
                      </div>
                      <p style={{ fontSize: 12, color: '#666', margin: 0 }}>{ob.description}</p>
                    </div>
                    {/* Complete checkbox */}
                    <button
                      onClick={() => toggleComplete(ob.id)}
                      style={{
                        width: 22, height: 22, border: `1px solid ${ob.is_complete ? '#36bd5f' : 'rgba(255,255,255,0.15)'}`,
                        background: ob.is_complete ? '#36bd5f' : 'transparent',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                      }}
                      title="Mark complete"
                    >
                      {ob.is_complete && <span style={{ fontSize: 12, color: '#040404', fontWeight: 900 }}>✓</span>}
                    </button>
                  </div>

                  {/* Evidence textarea */}
                  <div>
                    <label style={{ fontSize: 10, fontWeight: 700, color: '#555', letterSpacing: '0.06em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
                      Evidence / Notes
                    </label>
                    <textarea
                      value={evidenceText[ob.id] ?? ''}
                      onChange={(e) => setEvidenceText((prev) => ({ ...prev, [ob.id]: e.target.value }))}
                      rows={3}
                      placeholder="Document your evidence for this obligation…"
                      style={{
                        width: '100%',
                        background: '#131313',
                        border: '1px solid rgba(255,255,255,0.06)',
                        color: '#e8e8e8',
                        padding: '10px 12px',
                        fontSize: 12,
                        fontFamily: 'var(--font-raleway), Raleway, Helvetica, Arial, sans-serif',
                        outline: 'none',
                        resize: 'vertical',
                        boxSizing: 'border-box',
                      }}
                    />
                    <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                      <button
                        onClick={() => saveEvidence(ob.id)}
                        disabled={saving[ob.id]}
                        style={{
                          padding: '7px 18px',
                          background: '#00e5bf',
                          color: '#040404',
                          border: 'none',
                          cursor: saving[ob.id] ? 'not-allowed' : 'pointer',
                          fontSize: 12,
                          fontWeight: 700,
                          opacity: saving[ob.id] ? 0.6 : 1,
                          fontFamily: 'var(--font-raleway), Raleway, Helvetica, Arial, sans-serif',
                        }}
                      >
                        {saving[ob.id] ? 'Saving…' : 'Save'}
                      </button>
                      <button
                        onClick={() => aiDraft(ob)}
                        disabled={drafting[ob.id]}
                        style={{
                          padding: '7px 18px',
                          background: '#131313',
                          color: drafting[ob.id] ? '#555' : '#00e5bf',
                          border: '1px solid rgba(0,229,191,0.2)',
                          cursor: drafting[ob.id] ? 'not-allowed' : 'pointer',
                          fontSize: 12,
                          fontWeight: 700,
                          fontFamily: 'var(--font-raleway), Raleway, Helvetica, Arial, sans-serif',
                        }}
                      >
                        {drafting[ob.id] ? 'Drafting…' : '✦ AI Draft'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
