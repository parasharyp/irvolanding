'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Shield, CheckCircle, Clock, Target } from 'lucide-react'
import { DashboardMetrics, RiskLevel } from '@/types'

const ENFORCEMENT_DATE = new Date('2026-08-02T00:00:00.000Z')

function daysUntil(target: Date): number {
  return Math.max(0, Math.ceil((target.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
}

const RISK_COLORS: Record<RiskLevel, string> = {
  none: '#666',
  limited: '#f59e0b',
  high: '#e54747',
  unacceptable: '#e54747',
}

const RISK_LABELS: Record<RiskLevel, string> = {
  none: 'Minimal / None',
  limited: 'Limited',
  high: 'High',
  unacceptable: 'Unacceptable',
}

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [loading, setLoading] = useState(true)

  const days = daysUntil(ENFORCEMENT_DATE)
  const deadlineColor = days < 60 ? '#e54747' : days < 180 ? '#f59e0b' : '#36bd5f'

  useEffect(() => {
    fetch('/api/dashboard')
      .then((r) => r.json())
      .then((d) => { setMetrics(d.metrics ?? null); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const isEmpty = !loading && (!metrics || metrics.total_systems === 0)

  return (
    <div style={{
      minHeight: '100vh',
      background: '#040404',
      fontFamily: 'var(--font-raleway), Raleway, Helvetica, Arial, sans-serif',
      color: '#e8e8e8',
    }}>
      <div style={{ padding: 32 }}>

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

        {/* Page heading */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: '#ffffff', margin: '0 0 4px', letterSpacing: '-0.01em' }}>Dashboard</h1>
          <p style={{ fontSize: 13, color: '#555', margin: 0 }}>AI Act compliance overview</p>
        </div>

        {/* Loading state */}
        {loading && (
          <div style={{ color: '#555', fontSize: 13, padding: '24px 0' }}>Loading...</div>
        )}

        {/* Empty state */}
        {isEmpty && (
          <div style={{
            background: '#0c0c0c',
            border: '1px solid rgba(255,255,255,0.07)',
            padding: '48px 32px',
            textAlign: 'center',
          }}>
            <Shield size={32} strokeWidth={1.5} style={{ color: '#333', marginBottom: 16 }} />
            <p style={{ color: '#666', fontSize: 15, fontWeight: 700, margin: '0 0 8px' }}>No AI systems documented yet</p>
            <p style={{ color: '#444', fontSize: 13, margin: '0 0 24px' }}>Start by documenting your first AI system to track compliance.</p>
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
                fontWeight: 800,
                borderRadius: 100,
              }}
            >
              + Document your first system
            </Link>
          </div>
        )}

        {/* Main content — only when we have data */}
        {!loading && metrics && metrics.total_systems > 0 && (
          <>
            {/* Metrics grid */}
            <div className="r-grid-4" style={{ gap: 1, marginBottom: 28, background: 'rgba(255,255,255,0.04)' }}>
              {/* Total Systems */}
              <div style={{ background: '#0c0c0c', border: '1px solid rgba(255,255,255,0.07)', padding: '20px 24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <Shield size={13} strokeWidth={2} style={{ color: '#555' }} />
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#555', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Total Systems</span>
                </div>
                <div style={{ fontSize: 32, fontWeight: 900, color: '#ffffff', letterSpacing: '-0.02em', lineHeight: 1 }}>{metrics.total_systems}</div>
                <div style={{ fontSize: 11, color: '#555', marginTop: 8 }}>Documented AI systems</div>
              </div>

              {/* Average Completion */}
              <div style={{ background: '#0c0c0c', border: '1px solid rgba(255,255,255,0.07)', padding: '20px 24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <Target size={13} strokeWidth={2} style={{ color: '#555' }} />
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#555', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Avg Completion</span>
                </div>
                <div style={{ fontSize: 32, fontWeight: 900, color: '#ffffff', letterSpacing: '-0.02em', lineHeight: 1 }}>{metrics.avg_completion}%</div>
                <div style={{ height: 3, background: '#131313', width: '100%', marginTop: 10 }}>
                  <div style={{ height: 3, background: '#00e5bf', width: `${metrics.avg_completion}%`, transition: 'width 0.4s ease' }} />
                </div>
              </div>

              {/* Systems Ready */}
              <div style={{ background: '#0c0c0c', border: '1px solid rgba(255,255,255,0.07)', padding: '20px 24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <CheckCircle size={13} strokeWidth={2} style={{ color: '#555' }} />
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#555', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Systems Ready</span>
                </div>
                <div style={{ fontSize: 32, fontWeight: 900, color: '#36bd5f', letterSpacing: '-0.02em', lineHeight: 1 }}>{metrics.systems_ready}</div>
                <div style={{ fontSize: 11, color: '#555', marginTop: 8 }}>Fully compliant</div>
              </div>

              {/* Days to Deadline */}
              <div style={{ background: '#0c0c0c', border: '1px solid rgba(255,255,255,0.07)', padding: '20px 24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <Clock size={13} strokeWidth={2} style={{ color: '#555' }} />
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#555', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Days to Deadline</span>
                </div>
                <div style={{ fontSize: 32, fontWeight: 900, color: deadlineColor, letterSpacing: '-0.02em', lineHeight: 1 }}>{metrics.days_until_deadline}</div>
                <div style={{ fontSize: 11, color: '#555', marginTop: 8 }}>August 2, 2026</div>
              </div>
            </div>

            {/* Risk breakdown */}
            <div style={{ marginBottom: 28 }}>
              <h2 style={{ fontSize: 15, fontWeight: 800, color: '#e8e8e8', margin: '0 0 14px' }}>Risk Breakdown</h2>
              <div className="r-grid-4" style={{ gap: 1 }}>
                {(['none', 'limited', 'high', 'unacceptable'] as RiskLevel[]).map((level) => (
                  <div key={level} style={{
                    background: '#0c0c0c',
                    border: '1px solid rgba(255,255,255,0.07)',
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                  }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: RISK_COLORS[level], flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: 20, fontWeight: 900, color: '#ffffff', lineHeight: 1, marginBottom: 3 }}>
                        {metrics.systems_by_risk[level] ?? 0}
                      </div>
                      <div style={{ fontSize: 10, fontWeight: 700, color: '#555', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                        {RISK_LABELS[level]}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick actions */}
            <div style={{ marginBottom: 28 }}>
              <h2 style={{ fontSize: 15, fontWeight: 800, color: '#e8e8e8', margin: '0 0 14px' }}>Quick Actions</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
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
                    fontWeight: 800,
                    borderRadius: 100,
                  }}
                >
                  + Document New System
                </Link>
                <Link
                  href="/systems"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '9px 22px',
                    background: 'transparent',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#888',
                    textDecoration: 'none',
                    fontSize: 13,
                    fontWeight: 700,
                    borderRadius: 100,
                    transition: 'border-color 0.15s, color 0.15s',
                  }}
                >
                  View All Systems
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
