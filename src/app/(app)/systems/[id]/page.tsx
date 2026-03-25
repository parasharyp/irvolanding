'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import type { AISystem, Obligation, EvidenceItem, RiskLevel } from '@/types'

function riskColor(level: RiskLevel | null): string {
  switch (level) {
    case 'unacceptable': return '#e54747'
    case 'high': return '#e54747'
    case 'limited': return '#f59e0b'
    case 'none': return '#36bd5f'
    default: return '#555'
  }
}

export default function SystemDetailPage() {
  const params = useParams()
  const id = params.id as string
  const [system, setSystem] = useState<AISystem | null>(null)
  const [obligations, setObligations] = useState<Obligation[]>([])
  const [evidenceMap, setEvidenceMap] = useState<Record<string, EvidenceItem[]>>({})
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<string | null>(null)
  const [evidenceText, setEvidenceText] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState<Record<string, boolean>>({})
  const [drafting, setDrafting] = useState<Record<string, boolean>>({})
  const [exporting, setExporting] = useState(false)

  const showToast = useCallback((msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }, [])

  useEffect(() => {
    Promise.all([
      fetch(`/api/systems/${id}`).then((r) => r.json()),
      fetch(`/api/systems/${id}/evidence`).then((r) => r.json()),
    ]).then(([sysData, evidenceData]) => {
      setSystem(sysData.system ?? null)
      setObligations(sysData.obligations ?? [])

      // Build evidence map keyed by obligation_id
      const map: Record<string, EvidenceItem[]> = {}
      const textMap: Record<string, string> = {}
      for (const ev of (evidenceData.evidence ?? []) as EvidenceItem[]) {
        if (!map[ev.obligation_id]) map[ev.obligation_id] = []
        map[ev.obligation_id].push(ev)
        // Pre-fill with the latest evidence content
        if (ev.content && !textMap[ev.obligation_id]) {
          textMap[ev.obligation_id] = ev.content
        }
      }
      setEvidenceMap(map)
      setEvidenceText(textMap)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [id])

  async function saveEvidence(ob: Obligation) {
    const content = evidenceText[ob.id]
    if (!content?.trim()) {
      showToast('Write some evidence before saving')
      return
    }
    setSaving((prev) => ({ ...prev, [ob.id]: true }))
    try {
      const res = await fetch(`/api/systems/${id}/evidence`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          obligation_id: ob.id,
          item_type: 'note',
          title: `Evidence for ${ob.title}`,
          content: content.trim(),
        }),
      })
      if (res.ok) {
        const data = await res.json()
        // Update evidence map
        setEvidenceMap((prev) => ({
          ...prev,
          [ob.id]: [data.evidence, ...(prev[ob.id] ?? [])],
        }))
        // Mark obligation as complete locally
        setObligations((prev) => prev.map((o) => o.id === ob.id ? { ...o, is_complete: true } : o))
        // Update system pct
        setSystem((prev) => {
          if (!prev) return prev
          const total = obligations.length
          const complete = obligations.filter((o) => o.id === ob.id ? true : o.is_complete).length
          return { ...prev, pct_complete: total > 0 ? Math.round((complete / total) * 100) : 0 }
        })
        showToast('Evidence saved')
      } else {
        const err = await res.json()
        showToast(err.error ?? 'Failed to save')
      }
    } catch {
      showToast('Failed to save evidence')
    } finally {
      setSaving((prev) => ({ ...prev, [ob.id]: false }))
    }
  }

  async function aiDraft(ob: Obligation) {
    setDrafting((prev) => ({ ...prev, [ob.id]: true }))
    try {
      const res = await fetch('/api/ai/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ systemId: id, obligationId: ob.id }),
      })
      if (res.ok) {
        const data = await res.json()
        setEvidenceText((prev) => ({ ...prev, [ob.id]: data.draft }))
        showToast('AI draft generated — review and edit before saving')
      } else {
        showToast('AI draft failed')
      }
    } catch {
      showToast('AI draft failed')
    } finally {
      setDrafting((prev) => ({ ...prev, [ob.id]: false }))
    }
  }

  async function toggleComplete(ob: Obligation) {
    const newComplete = !ob.is_complete
    setObligations((prev) => prev.map((o) => o.id === ob.id ? { ...o, is_complete: newComplete } : o))
    // Optimistic — no server endpoint for toggling yet, but keep UI responsive
  }

  async function exportPdf() {
    setExporting(true)
    try {
      const res = await fetch(`/api/systems/${id}/export`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ format: 'pdf' }),
      })
      if (res.ok) {
        const blob = await res.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = res.headers.get('Content-Disposition')?.match(/filename="(.+)"/)?.[1] ?? 'evidence-pack.pdf'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        showToast('PDF exported')
      } else {
        showToast('Export failed')
      }
    } catch {
      showToast('Export failed')
    } finally {
      setExporting(false)
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#040404', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666', fontFamily: 'var(--font-raleway), Raleway, Helvetica, Arial, sans-serif' }}>
        Loading system...
      </div>
    )
  }

  if (!system) {
    return (
      <div style={{ minHeight: '100vh', background: '#040404', padding: 32, fontFamily: 'var(--font-raleway), Raleway, Helvetica, Arial, sans-serif', color: '#e8e8e8' }}>
        <Link href="/systems" style={{ fontSize: 12, color: '#555', textDecoration: 'none', display: 'inline-block', marginBottom: 24 }}>
          ← Back to AI Systems
        </Link>
        <div style={{ color: '#e54747', fontSize: 15, fontWeight: 700 }}>System not found.</div>
      </div>
    )
  }

  const complete = obligations.filter((o) => o.is_complete).length
  const total = obligations.length
  const pct = system.pct_complete ?? (total > 0 ? Math.round((complete / total) * 100) : 0)

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
                  {system.risk_level
                    ? system.risk_level.charAt(0).toUpperCase() + system.risk_level.slice(1) + ' Risk'
                    : 'Pending'
                  }
                </span>
                {system.annex_category && system.annex_category !== 'none' && (
                  <span style={{ padding: '3px 12px', border: '1px solid rgba(255,255,255,0.1)', color: '#888', fontSize: 11, fontWeight: 600 }}>
                    {system.annex_category.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                  </span>
                )}
                <span style={{
                  padding: '3px 12px',
                  border: `1px solid ${system.status === 'ready' || system.status === 'exported' ? '#36bd5f44' : '#55555544'}`,
                  background: system.status === 'ready' || system.status === 'exported' ? '#36bd5f12' : 'transparent',
                  color: system.status === 'ready' || system.status === 'exported' ? '#36bd5f' : '#555',
                  fontSize: 10, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase',
                }}>
                  {system.status}
                </span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <Link
                href={`/systems/${id}/questionnaire`}
                style={{
                  padding: '10px 20px',
                  background: 'transparent',
                  color: '#666',
                  border: '1px solid rgba(255,255,255,0.07)',
                  textDecoration: 'none',
                  fontSize: 12,
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                }}
              >
                View Questionnaire
              </Link>
              <button
                onClick={exportPdf}
                disabled={exporting}
                style={{
                  padding: '10px 20px',
                  background: exporting ? '#131313' : '#00e5bf',
                  color: exporting ? '#555' : '#040404',
                  border: 'none',
                  cursor: exporting ? 'not-allowed' : 'pointer',
                  fontSize: 12,
                  fontWeight: 700,
                  fontFamily: 'var(--font-raleway), Raleway, Helvetica, Arial, sans-serif',
                  borderRadius: 100,
                }}
              >
                {exporting ? 'Exporting...' : 'Export PDF'}
              </button>
            </div>
          </div>

          {/* Meta */}
          <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', marginBottom: 20 }}>
            {system.owner_name && (
              <div>
                <span style={{ fontSize: 10, color: '#555', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Owner</span>
                <div style={{ fontSize: 13, color: '#888', marginTop: 2 }}>
                  {system.owner_name}
                  {system.owner_email && <span style={{ color: '#555', marginLeft: 8 }}>{system.owner_email}</span>}
                </div>
              </div>
            )}
            {system.business_process && (
              <div>
                <span style={{ fontSize: 10, color: '#555', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Business Process</span>
                <div style={{ fontSize: 13, color: '#888', marginTop: 2 }}>{system.business_process}</div>
              </div>
            )}
            {system.model_type && (
              <div>
                <span style={{ fontSize: 10, color: '#555', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Model Type</span>
                <div style={{ fontSize: 13, color: '#888', marginTop: 2 }}>{system.model_type}</div>
              </div>
            )}
          </div>

          {/* Description */}
          {system.description && (
            <div style={{ fontSize: 13, color: '#666', lineHeight: 1.6, marginBottom: 20 }}>
              {system.description}
            </div>
          )}

          {/* Classification rationale */}
          {system.classification_rationale && (
            <div style={{ marginBottom: 20, padding: '12px 16px', background: '#0c0c0c', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ fontSize: 10, color: '#555', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Classification Rationale</div>
              <div style={{ fontSize: 12, color: '#888', lineHeight: 1.6 }}>{system.classification_rationale}</div>
            </div>
          )}

          {/* Immediate actions */}
          {system.immediate_actions && system.immediate_actions.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 10, color: '#f59e0b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Immediate Actions</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {system.immediate_actions.map((action, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '6px 12px', background: '#f59e0b08', border: '1px solid #f59e0b18' }}>
                    <span style={{ color: '#f59e0b', fontSize: 11, fontWeight: 700 }}>!</span>
                    <span style={{ fontSize: 12, color: '#e8e8e8' }}>{action}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

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

        {/* Obligations */}
        {obligations.length > 0 && (
          <div>
            <h2 style={{ fontSize: 15, fontWeight: 800, color: '#e8e8e8', margin: '0 0 16px', letterSpacing: '-0.01em' }}>
              Compliance Obligations
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {obligations.map((ob) => {
                const existingEvidence = evidenceMap[ob.id] ?? []
                return (
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
                          {ob.is_complete && (
                            <span style={{ fontSize: 10, fontWeight: 700, color: '#36bd5f', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Complete</span>
                          )}
                        </div>
                        <p style={{ fontSize: 12, color: '#666', margin: '0 0 6px' }}>{ob.description}</p>
                        {ob.evidence_required && (
                          <div style={{ fontSize: 11, color: '#555', fontStyle: 'italic' }}>
                            Evidence needed: {ob.evidence_required}
                          </div>
                        )}
                      </div>
                      {/* Complete checkbox */}
                      <button
                        onClick={() => toggleComplete(ob)}
                        style={{
                          width: 22, height: 22,
                          border: `1px solid ${ob.is_complete ? '#36bd5f' : 'rgba(255,255,255,0.15)'}`,
                          background: ob.is_complete ? '#36bd5f' : 'transparent',
                          cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0,
                        }}
                        title="Mark complete"
                      >
                        {ob.is_complete && <span style={{ fontSize: 12, color: '#040404', fontWeight: 900 }}>✓</span>}
                      </button>
                    </div>

                    {/* Existing evidence items */}
                    {existingEvidence.length > 0 && (
                      <div style={{ marginBottom: 12 }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: '#555', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }}>
                          Saved Evidence ({existingEvidence.length})
                        </div>
                        {existingEvidence.map((ev) => (
                          <div key={ev.id} style={{
                            padding: '8px 12px',
                            background: '#131313',
                            border: '1px solid rgba(255,255,255,0.04)',
                            marginBottom: 4,
                            fontSize: 12,
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                              <span style={{ fontWeight: 700, color: '#888' }}>{ev.title}</span>
                              <span style={{ fontSize: 10, color: '#444', textTransform: 'uppercase' }}>{ev.item_type}</span>
                              {ev.ai_drafted && <span style={{ fontSize: 10, color: '#00e5bf', fontWeight: 700 }}>AI</span>}
                              {ev.reviewed && <span style={{ fontSize: 10, color: '#36bd5f', fontWeight: 700 }}>Reviewed</span>}
                            </div>
                            {ev.content && (
                              <div style={{ color: '#666', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                                {ev.content.length > 300 ? ev.content.slice(0, 300) + '...' : ev.content}
                              </div>
                            )}
                            {ev.file_name && (
                              <div style={{ color: '#555', marginTop: 4 }}>
                                File: {ev.file_name}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Evidence textarea */}
                    <div>
                      <label style={{ fontSize: 10, fontWeight: 700, color: '#555', letterSpacing: '0.06em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
                        {existingEvidence.length > 0 ? 'Add More Evidence' : 'Evidence / Notes'}
                      </label>
                      <textarea
                        value={evidenceText[ob.id] ?? ''}
                        onChange={(e) => setEvidenceText((prev) => ({ ...prev, [ob.id]: e.target.value }))}
                        rows={3}
                        placeholder="Document your evidence for this obligation..."
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
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
                        <button
                          onClick={() => saveEvidence(ob)}
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
                          {saving[ob.id] ? 'Saving...' : 'Save'}
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
                          {drafting[ob.id] ? 'Drafting...' : 'AI Draft'}
                        </button>
                        {/* File upload placeholder */}
                        <label style={{
                          padding: '7px 18px',
                          background: 'transparent',
                          color: '#444',
                          border: '1px solid rgba(255,255,255,0.07)',
                          cursor: 'pointer',
                          fontSize: 12,
                          fontWeight: 600,
                          fontFamily: 'var(--font-raleway), Raleway, Helvetica, Arial, sans-serif',
                        }}>
                          Attach File
                          <input type="file" style={{ display: 'none' }} onChange={() => showToast('File upload coming soon')} />
                        </label>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {obligations.length === 0 && (
          <div style={{
            border: '1px solid rgba(255,255,255,0.07)',
            background: '#0c0c0c',
            padding: '48px 32px',
            textAlign: 'center',
          }}>
            <p style={{ fontSize: 15, fontWeight: 700, color: '#e8e8e8', margin: '0 0 8px' }}>No obligations yet</p>
            <p style={{ fontSize: 13, color: '#666', margin: 0 }}>
              This system has not been classified. Go to the{' '}
              <Link href="/systems/new" style={{ color: '#00e5bf', textDecoration: 'none', fontWeight: 700 }}>new system wizard</Link>{' '}
              to classify it and generate obligations.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
