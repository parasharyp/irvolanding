'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AISystem, RiskLevel } from '@/types'

interface DashboardData {
  total_systems: number
  classified: number
  documented: number
  at_risk: number
  systems: AISystem[]
}

function daysUntil(target: Date): number {
  return Math.ceil((target.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
}

const ENFORCEMENT_DATE = new Date('2026-08-02T00:00:00.000Z')

function riskColor(level: RiskLevel): string {
  switch (level) {
    case 'unacceptable': return '#e54747'
    case 'high': return '#e54747'
    case 'limited': return '#f59e0b'
    case 'minimal': return '#36bd5f'
    default: return '#555'
  }
}

function StatCard({ label, value, sub }: { label: string; value: number | string; sub?: string }) {
  return (
    <div style={{
      background: '#0c0c0c',
      border: '1px solid rgba(255,255,255,0.07)',
      padding: '20px 24px',
    }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: '#555', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>{label}</div>
      <div style={{ fontSize: 32, fontWeight: 900, color: '#ffffff', letterSpacing: '-0.02em', lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: '#555', marginTop: 8 }}>{sub}</div>}
    </div>
  )
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  const days = daysUntil(ENFORCEMENT_DATE)
  const deadlineColor = days < 60 ? '#e54747' : days < 180 ? '#f59e0b' : '#36bd5f'

  useEffect(() => {
    fetch('/api/dashboard')
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div style={{
      minHeight: '100vh',
      background: '#040404',
      fontFamily: 'var(--font-raleway), Raleway, Helvetica, Arial, sans-serif',
      color: '#e8e8e8',
    }}>
      <div style={{ padding: '32px' }}>
        {/* Page heading */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: '#ffffff', margin: '0 0 4px', letterSpacing: '-0.01em' }}>Overview</h1>
          <p style={{ fontSize: 13, color: '#555', margin: 0 }}>EU AI Act compliance dashboard</p>
        </div>

        {/* Deadline banner */}
        <div style={{
          background: `${deadlineColor}10`,
          border: `1px solid ${deadlineColor}40`,
          padding: '24px 28px',
          marginBottom: 28,
          display: 'flex',
          alignItems: 'center',
          gap: 24,
        }}>
          <div style={{ textAlign: 'center', flexShrink: 0 }}>
            <div style={{ fontSize: 56, fontWeight: 900, color: deadlineColor, lineHeight: 1, letterSpacing: '-0.03em' }}>{days}</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: deadlineColor, opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.06em' }}>days</div>
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#e8e8e8', marginBottom: 4 }}>EU AI Act Enforcement Deadline</div>
            <div style={{ fontSize: 13, color: '#666' }}>High-risk AI obligations enforced on August 2, 2026 by the EU AI Act.</div>
            <div style={{ fontSize: 12, color: '#444', marginTop: 6 }}>Ensure your high-risk systems are fully documented and compliant before this date.</div>
          </div>
        </div>

        {/* Stat cards */}
        <div className="r-grid-4" style={{ gap: 1, marginBottom: 28, background: 'rgba(255,255,255,0.04)' }}>
          <StatCard label="Total Systems" value={loading ? '—' : (data?.total_systems ?? 0)} sub="Documented AI systems" />
          <StatCard label="Classified" value={loading ? '—' : (data?.classified ?? 0)} sub="Risk classification complete" />
          <StatCard label="Fully Documented" value={loading ? '—' : (data?.documented ?? 0)} sub="All obligations complete" />
          <StatCard label="At Risk" value={loading ? '—' : (data?.at_risk ?? 0)} sub="High/unacceptable + incomplete" />
        </div>

        {/* Quick action */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ fontSize: 15, fontWeight: 800, color: '#e8e8e8', margin: 0 }}>Recent Systems</h2>
          <Link
            href="/systems/new"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '9px 20px',
              background: '#00e5bf',
              color: '#040404',
              textDecoration: 'none',
              fontSize: 12,
              fontWeight: 700,
              borderRadius: 100,
            }}
          >
            + Document a new system
          </Link>
        </div>

        {/* Systems summary */}
        {loading ? (
          <div style={{ color: '#555', fontSize: 13, padding: '24px 0' }}>Loading…</div>
        ) : !data || data.systems.length === 0 ? (
          <div style={{ background: '#0c0c0c', border: '1px solid rgba(255,255,255,0.07)', padding: '32px', textAlign: 'center' }}>
            <p style={{ color: '#555', fontSize: 13, margin: 0 }}>No systems documented yet.</p>
            <Link href="/systems/new" style={{ color: '#00e5bf', fontSize: 13, fontWeight: 700, textDecoration: 'none', marginTop: 8, display: 'inline-block' }}>
              Document your first system →
            </Link>
          </div>
        ) : (
          <div className="table-scroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                  {['System', 'Risk', 'Progress', ''].map((h) => (
                    <th key={h} style={{ textAlign: 'left', padding: '10px 16px', fontSize: 10, fontWeight: 700, color: '#555', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.systems.slice(0, 5).map((s) => {
                  const pct = s.obligations_total > 0
                    ? Math.round((s.obligations_complete / s.obligations_total) * 100)
                    : 0
                  return (
                    <tr key={s.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding: '12px 16px', fontWeight: 700, color: '#ffffff' }}>{s.name}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{
                          padding: '2px 10px',
                          border: `1px solid ${riskColor(s.risk_level)}`,
                          color: riskColor(s.risk_level),
                          fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em',
                        }}>
                          {s.risk_level}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', minWidth: 150 }}>
                        <div style={{ fontSize: 11, color: '#666', marginBottom: 5 }}>{pct}%</div>
                        <div style={{ height: 3, background: '#131313', width: '100%' }}>
                          <div style={{ height: 3, background: '#00e5bf', width: `${pct}%` }} />
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        <Link href={`/systems/${s.id}`} style={{ color: '#00e5bf', textDecoration: 'none', fontSize: 12, fontWeight: 700 }}>Open →</Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {data && data.systems.length > 5 && (
          <div style={{ marginTop: 12, textAlign: 'right' }}>
            <Link href="/systems" style={{ color: '#555', fontSize: 12, textDecoration: 'none' }}>View all {data.systems.length} systems →</Link>
          </div>
        )}
      </div>
    </div>
  )
}
