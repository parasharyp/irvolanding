'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Shield } from 'lucide-react'
import { AISystem, RiskLevel } from '@/types'

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
    default: return '#333'
  }
}

function riskLabel(level: RiskLevel): string {
  switch (level) {
    case 'unacceptable': return 'Unacceptable'
    case 'high': return 'High Risk'
    case 'limited': return 'Limited Risk'
    case 'minimal': return 'Minimal Risk'
    default: return 'Unknown'
  }
}

function RiskBadge({ level }: { level: RiskLevel }) {
  const color = riskColor(level)
  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 10px',
      border: `1px solid ${color}`,
      color,
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: '0.04em',
      textTransform: 'uppercase',
    }}>
      {riskLabel(level)}
    </span>
  )
}

export default function SystemsPage() {
  const [systems, setSystems] = useState<AISystem[]>([])
  const [loading, setLoading] = useState(true)

  const days = daysUntil(ENFORCEMENT_DATE)
  const bannerColor = days < 60 ? '#e54747' : days < 180 ? '#f59e0b' : '#36bd5f'

  useEffect(() => {
    fetch('/api/systems')
      .then((r) => r.json())
      .then((d) => { setSystems(d.systems ?? []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div style={{
      minHeight: '100vh',
      background: '#040404',
      fontFamily: 'var(--font-raleway), Raleway, Helvetica, Arial, sans-serif',
      color: '#e8e8e8',
    }}>
      {/* Deadline banner */}
      <div style={{
        background: `${bannerColor}18`,
        borderBottom: `1px solid ${bannerColor}44`,
        padding: '10px 32px',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
      }}>
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: bannerColor, flexShrink: 0 }} />
        <span style={{ fontSize: 12, color: bannerColor, fontWeight: 600 }}>
          <strong>{days}</strong> days until August 2, 2026 EU AI Act enforcement deadline
        </span>
      </div>

      <div style={{ padding: '32px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 900, color: '#ffffff', margin: 0, letterSpacing: '-0.01em' }}>AI Systems</h1>
            <p style={{ fontSize: 13, color: '#666', margin: '4px 0 0' }}>Document and classify your AI systems for EU AI Act compliance</p>
          </div>
          <Link
            href="/systems/new"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 20px',
              background: '#00e5bf',
              color: '#040404',
              textDecoration: 'none',
              fontSize: 13,
              fontWeight: 700,
              borderRadius: 100,
            }}
          >
            + New System
          </Link>
        </div>

        {/* Content */}
        {loading ? (
          <div style={{ color: '#666', fontSize: 13, padding: '48px 0', textAlign: 'center' }}>Loading systems…</div>
        ) : systems.length === 0 ? (
          /* Empty state */
          <div style={{
            border: '1px solid rgba(255,255,255,0.07)',
            background: '#0c0c0c',
            padding: '64px 32px',
            textAlign: 'center',
            width: '100%',
            boxSizing: 'border-box',
          }}>
            <Shield size={40} color="#333" style={{ marginBottom: 16 }} />
            <h2 style={{ fontSize: 18, fontWeight: 800, color: '#e8e8e8', margin: '0 0 8px' }}>No systems documented yet</h2>
            <p style={{ fontSize: 13, color: '#666', margin: '0 0 24px' }}>Start by documenting your first AI or automation workflow.</p>
            <Link
              href="/systems/new"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '10px 24px',
                background: '#00e5bf',
                color: '#040404',
                textDecoration: 'none',
                fontSize: 13,
                fontWeight: 700,
                borderRadius: 100,
              }}
            >
              Document First System
            </Link>
          </div>
        ) : (
          /* Systems table */
          <div className="table-scroll">
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: 13,
            }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                  {['System', 'Risk', 'Category', 'Obligations', ''].map((h) => (
                    <th key={h} style={{
                      textAlign: 'left',
                      padding: '10px 16px',
                      fontSize: 10,
                      fontWeight: 700,
                      color: '#555',
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {systems.map((s) => {
                  const pct = s.obligations_total > 0
                    ? Math.round((s.obligations_complete / s.obligations_total) * 100)
                    : 0
                  return (
                    <tr key={s.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding: '14px 16px', fontWeight: 700, color: '#ffffff' }}>{s.name}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <RiskBadge level={s.risk_level} />
                      </td>
                      <td style={{ padding: '14px 16px', color: '#666', fontSize: 12 }}>
                        {s.annex_iii_category
                          ? s.annex_iii_category.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
                          : <span style={{ color: '#333', fontStyle: 'italic' }}>Pending classification</span>
                        }
                      </td>
                      <td style={{ padding: '14px 16px', minWidth: 180 }}>
                        <div style={{ fontSize: 11, color: '#666', marginBottom: 6 }}>
                          {s.obligations_complete} / {s.obligations_total} obligations complete
                        </div>
                        <div style={{ height: 3, background: '#131313', width: '100%' }}>
                          <div style={{ height: 3, background: '#00e5bf', width: `${pct}%`, transition: 'width 0.4s ease' }} />
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        <Link
                          href={`/systems/${s.id}`}
                          style={{
                            color: '#00e5bf',
                            textDecoration: 'none',
                            fontSize: 12,
                            fontWeight: 700,
                          }}
                        >
                          Open →
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
