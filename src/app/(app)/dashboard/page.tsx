'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Shield, CheckCircle, Clock, Target, AlertTriangle,
  ArrowRight, Sparkles, FileText, BarChart3, Zap,
  TrendingUp, Activity, Brain,
} from 'lucide-react'
import { DashboardMetrics, DashboardInsight, DashboardSystemSummary, RiskLevel } from '@/types'

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

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  draft: { label: 'Draft', color: '#666' },
  'in-progress': { label: 'In Progress', color: '#f59e0b' },
  ready: { label: 'Ready', color: '#36bd5f' },
  exported: { label: 'Exported', color: '#00e5bf' },
}

const INSIGHT_CONFIG: Record<DashboardInsight['type'], { icon: typeof AlertTriangle; color: string; bg: string }> = {
  warning: { icon: AlertTriangle, color: '#f59e0b', bg: 'rgba(245,158,11,0.06)' },
  action: { icon: Zap, color: '#00e5bf', bg: 'rgba(0,229,191,0.06)' },
  info: { icon: Brain, color: '#6366f1', bg: 'rgba(99,102,241,0.06)' },
  success: { icon: CheckCircle, color: '#36bd5f', bg: 'rgba(54,189,95,0.06)' },
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days}d ago`
  return `${Math.floor(days / 7)}w ago`
}

/* ─── Compliance Score Ring ───────────────────────────────────────────── */
function ScoreRing({ score }: { score: number }) {
  const size = 140
  const stroke = 8
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference
  const color = score >= 80 ? '#36bd5f' : score >= 50 ? '#f59e0b' : score >= 25 ? '#e54747' : '#666'

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#131313" strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
      </svg>
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{ fontSize: 36, fontWeight: 900, color, lineHeight: 1, letterSpacing: '-0.03em' }}>{score}</div>
        <div style={{ fontSize: 9, fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 4 }}>Score</div>
      </div>
    </div>
  )
}

/* ─── Risk Bar ────────────────────────────────────────────────────────── */
function RiskBar({ systems_by_risk, total }: { systems_by_risk: Record<RiskLevel, number>; total: number }) {
  if (total === 0) return null
  const levels: RiskLevel[] = ['unacceptable', 'high', 'limited', 'none']
  return (
    <div>
      <div style={{ display: 'flex', height: 8, overflow: 'hidden', marginBottom: 12 }}>
        {levels.map(level => {
          const count = systems_by_risk[level] ?? 0
          if (count === 0) return null
          return (
            <div
              key={level}
              style={{
                flex: count,
                background: RISK_COLORS[level],
                opacity: 0.8,
                transition: 'flex 0.5s ease',
              }}
            />
          )
        })}
      </div>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        {levels.map(level => {
          const count = systems_by_risk[level] ?? 0
          if (count === 0) return null
          return (
            <div key={level} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: RISK_COLORS[level] }} />
              <span style={{ fontSize: 11, color: '#888', fontWeight: 600 }}>
                {count} {RISK_LABELS[level]}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ─── Main Dashboard ──────────────────────────────────────────────────── */
export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [loading, setLoading] = useState(true)

  const days = daysUntil(ENFORCEMENT_DATE)
  const deadlineColor = days < 60 ? '#e54747' : days < 180 ? '#f59e0b' : '#36bd5f'
  const deadlineUrgency = days < 60 ? 'Critical' : days < 180 ? 'Approaching' : 'On Track'

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
      <div style={{ padding: 32, maxWidth: 1200 }}>

        {/* Page heading */}
        <div style={{ marginBottom: 28, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 900, color: '#ffffff', margin: '0 0 4px', letterSpacing: '-0.01em' }}>Compliance Command Centre</h1>
            <p style={{ fontSize: 13, color: '#555', margin: 0 }}>EU AI Act — real-time compliance intelligence</p>
          </div>
          <Link
            href="/systems/new"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '10px 24px', background: '#00e5bf', color: '#040404',
              textDecoration: 'none', fontSize: 13, fontWeight: 800, borderRadius: 100,
            }}
          >
            <Sparkles size={14} strokeWidth={2.5} /> Document New System
          </Link>
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ color: '#555', fontSize: 13, padding: '24px 0' }}>Loading compliance data...</div>
        )}

        {/* Empty state */}
        {isEmpty && (
          <div style={{
            background: '#0c0c0c', border: '1px solid rgba(255,255,255,0.07)',
            padding: '64px 32px', textAlign: 'center',
          }}>
            <Shield size={40} strokeWidth={1.5} style={{ color: '#333', marginBottom: 20 }} />
            <p style={{ color: '#e8e8e8', fontSize: 18, fontWeight: 800, margin: '0 0 8px' }}>Start your compliance journey</p>
            <p style={{ color: '#555', fontSize: 13, margin: '0 0 8px', maxWidth: 440, marginLeft: 'auto', marginRight: 'auto' }}>
              Document your first AI system to get risk classification, obligation mapping, and AI-assisted evidence drafting.
            </p>
            <p style={{ color: '#444', fontSize: 12, margin: '0 0 32px' }}>
              EU AI Act enforcement begins August 2, 2026 — <span style={{ color: deadlineColor, fontWeight: 700 }}>{days} days away</span>
            </p>
            <Link
              href="/systems/new"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '12px 32px', background: '#00e5bf', color: '#040404',
                textDecoration: 'none', fontSize: 14, fontWeight: 800, borderRadius: 100,
              }}
            >
              <Sparkles size={16} strokeWidth={2.5} /> Document your first AI system
            </Link>
          </div>
        )}

        {/* Main content */}
        {!loading && metrics && metrics.total_systems > 0 && (
          <>
            {/* ─── Top Row: Score + Deadline + Key Stats ─────────────── */}
            <div className="r-grid-3" style={{ gap: 1, marginBottom: 2 }}>

              {/* Compliance Score */}
              <div style={{
                background: '#0c0c0c', border: '1px solid rgba(255,255,255,0.07)',
                padding: '28px 24px', display: 'flex', alignItems: 'center', gap: 24,
              }}>
                <ScoreRing score={metrics.compliance_score} />
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#555', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>
                    AI Compliance Score
                  </div>
                  <div style={{ fontSize: 13, color: '#888', lineHeight: 1.5 }}>
                    Weighted by risk level and evidence completion across all systems.
                  </div>
                  {metrics.compliance_score < 50 && (
                    <div style={{ fontSize: 11, color: '#f59e0b', marginTop: 8, fontWeight: 600 }}>
                      Focus on high-risk systems to improve your score fastest.
                    </div>
                  )}
                </div>
              </div>

              {/* Deadline */}
              <div style={{
                background: '#0c0c0c', border: '1px solid rgba(255,255,255,0.07)',
                padding: '28px 24px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <Clock size={13} strokeWidth={2} style={{ color: '#555' }} />
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#555', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Enforcement Deadline</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: 48, fontWeight: 900, color: deadlineColor, lineHeight: 1, letterSpacing: '-0.03em' }}>{days}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: deadlineColor, opacity: 0.7 }}>days</span>
                </div>
                <div style={{ fontSize: 12, color: '#555', marginBottom: 12 }}>August 2, 2026 — EU AI Act</div>
                {/* Deadline progress bar */}
                <div style={{ height: 4, background: '#131313', marginBottom: 6 }}>
                  <div style={{
                    height: 4, background: deadlineColor,
                    width: `${Math.max(2, Math.min(100, 100 - (days / 730) * 100))}%`,
                    transition: 'width 0.5s ease',
                  }} />
                </div>
                <div style={{
                  fontSize: 10, fontWeight: 700, color: deadlineColor,
                  textTransform: 'uppercase', letterSpacing: '0.06em',
                }}>
                  {deadlineUrgency}
                </div>
              </div>

              {/* Key Stats Stack */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <div style={{
                  background: '#0c0c0c', border: '1px solid rgba(255,255,255,0.07)',
                  padding: '16px 24px', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: '#555', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Systems</div>
                    <div style={{ fontSize: 11, color: '#444', marginTop: 2 }}>{metrics.systems_ready} ready · {metrics.systems_in_progress + metrics.systems_draft} in progress</div>
                  </div>
                  <div style={{ fontSize: 28, fontWeight: 900, color: '#ffffff', lineHeight: 1 }}>{metrics.total_systems}</div>
                </div>
                <div style={{
                  background: '#0c0c0c', border: '1px solid rgba(255,255,255,0.07)',
                  padding: '16px 24px', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: '#555', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Obligations</div>
                    <div style={{ fontSize: 11, color: '#444', marginTop: 2 }}>{metrics.obligations_complete} of {metrics.total_obligations} complete</div>
                  </div>
                  <div style={{ fontSize: 28, fontWeight: 900, color: metrics.total_obligations > 0 ? '#00e5bf' : '#555', lineHeight: 1 }}>
                    {metrics.total_obligations > 0 ? `${Math.round((metrics.obligations_complete / metrics.total_obligations) * 100)}%` : '—'}
                  </div>
                </div>
                <div style={{
                  background: '#0c0c0c', border: '1px solid rgba(255,255,255,0.07)',
                  padding: '16px 24px', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: '#555', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Evidence Items</div>
                    <div style={{ fontSize: 11, color: '#444', marginTop: 2 }}>{metrics.evidence_ai_drafted} AI-drafted</div>
                  </div>
                  <div style={{ fontSize: 28, fontWeight: 900, color: '#ffffff', lineHeight: 1 }}>{metrics.total_evidence}</div>
                </div>
              </div>
            </div>

            {/* ─── Risk Distribution ─────────────────────────────────── */}
            <div style={{
              background: '#0c0c0c', border: '1px solid rgba(255,255,255,0.07)',
              padding: '20px 24px', marginBottom: 2,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <BarChart3 size={13} strokeWidth={2} style={{ color: '#555' }} />
                <span style={{ fontSize: 10, fontWeight: 700, color: '#555', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Risk Distribution</span>
              </div>
              <RiskBar systems_by_risk={metrics.systems_by_risk} total={metrics.total_systems} />
            </div>

            {/* ─── Two Column: Insights + Systems ────────────────────── */}
            <div className="r-grid-2" style={{ gap: 1 }}>

              {/* AI Insights */}
              <div style={{
                background: '#0c0c0c', border: '1px solid rgba(255,255,255,0.07)',
                padding: '24px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
                  <Brain size={14} strokeWidth={2} style={{ color: '#00e5bf' }} />
                  <span style={{ fontSize: 12, fontWeight: 800, color: '#e8e8e8', letterSpacing: '-0.01em' }}>AI Compliance Insights</span>
                </div>

                {metrics.insights.length === 0 && (
                  <div style={{ fontSize: 12, color: '#444', padding: '12px 0' }}>
                    No insights yet — document and classify a system to get started.
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {metrics.insights.map((insight, i) => {
                    const config = INSIGHT_CONFIG[insight.type]
                    const Icon = config.icon
                    return (
                      <div
                        key={i}
                        style={{
                          background: config.bg,
                          border: `1px solid ${config.color}15`,
                          padding: '14px 16px',
                          display: 'flex', gap: 12, alignItems: 'flex-start',
                        }}
                      >
                        <Icon size={14} strokeWidth={2} style={{ color: config.color, flexShrink: 0, marginTop: 1 }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 12, fontWeight: 700, color: '#e8e8e8', marginBottom: 3 }}>
                            {insight.title}
                          </div>
                          <div style={{ fontSize: 11, color: '#666', lineHeight: 1.5 }}>
                            {insight.description}
                          </div>
                          {insight.system_id && (
                            <Link
                              href={`/systems/${insight.system_id}`}
                              style={{
                                display: 'inline-flex', alignItems: 'center', gap: 4,
                                fontSize: 10, fontWeight: 700, color: config.color,
                                textDecoration: 'none', marginTop: 6,
                                textTransform: 'uppercase', letterSpacing: '0.06em',
                              }}
                            >
                              View System <ArrowRight size={10} />
                            </Link>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Systems Overview */}
              <div style={{
                background: '#0c0c0c', border: '1px solid rgba(255,255,255,0.07)',
                padding: '24px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Activity size={14} strokeWidth={2} style={{ color: '#00e5bf' }} />
                    <span style={{ fontSize: 12, fontWeight: 800, color: '#e8e8e8', letterSpacing: '-0.01em' }}>Systems Overview</span>
                  </div>
                  <Link href="/systems" style={{
                    fontSize: 10, fontWeight: 700, color: '#555', textDecoration: 'none',
                    textTransform: 'uppercase', letterSpacing: '0.06em',
                    display: 'flex', alignItems: 'center', gap: 4,
                  }}>
                    View All <ArrowRight size={10} />
                  </Link>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {metrics.systems.slice(0, 6).map((sys) => {
                    const statusConf = STATUS_LABELS[sys.status] ?? STATUS_LABELS.draft
                    const riskColor = sys.risk_level ? RISK_COLORS[sys.risk_level] : '#333'
                    return (
                      <Link
                        key={sys.id}
                        href={`/systems/${sys.id}`}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 12,
                          padding: '12px 14px', background: '#080808',
                          border: '1px solid rgba(255,255,255,0.04)',
                          textDecoration: 'none', color: 'inherit',
                          transition: 'border-color 0.15s',
                        }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.12)' }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.04)' }}
                      >
                        {/* Risk dot */}
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: riskColor, flexShrink: 0 }} />

                        {/* Name + meta */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{
                            fontSize: 12, fontWeight: 700, color: '#e8e8e8',
                            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                          }}>
                            {sys.name}
                          </div>
                          <div style={{ fontSize: 10, color: '#444', marginTop: 2 }}>
                            {sys.obligations_complete}/{sys.obligation_count} obligations · {sys.evidence_count} evidence · {timeAgo(sys.updated_at)}
                          </div>
                        </div>

                        {/* Progress bar */}
                        <div style={{ width: 60, flexShrink: 0 }}>
                          <div style={{ height: 3, background: '#1a1a1a' }}>
                            <div style={{
                              height: 3,
                              background: sys.pct_complete === 100 ? '#36bd5f' : '#00e5bf',
                              width: `${sys.pct_complete}%`,
                              transition: 'width 0.3s ease',
                            }} />
                          </div>
                          <div style={{ fontSize: 9, color: '#555', marginTop: 3, textAlign: 'right', fontWeight: 600 }}>
                            {sys.pct_complete}%
                          </div>
                        </div>

                        {/* Status badge */}
                        <div style={{
                          fontSize: 9, fontWeight: 700, color: statusConf.color,
                          border: `1px solid ${statusConf.color}30`,
                          padding: '3px 8px', textTransform: 'uppercase',
                          letterSpacing: '0.06em', flexShrink: 0,
                        }}>
                          {statusConf.label}
                        </div>
                      </Link>
                    )
                  })}
                </div>

                {metrics.systems.length === 0 && (
                  <div style={{ fontSize: 12, color: '#444', padding: '12px 0' }}>
                    No systems documented yet.
                  </div>
                )}
              </div>
            </div>

            {/* ─── Bottom Row: Obligation Progress + AI Usage + Quick Actions ── */}
            <div className="r-grid-3" style={{ gap: 1, marginTop: 2 }}>

              {/* Obligation Progress */}
              <div style={{
                background: '#0c0c0c', border: '1px solid rgba(255,255,255,0.07)',
                padding: '24px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <FileText size={13} strokeWidth={2} style={{ color: '#555' }} />
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#555', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Obligation Coverage</span>
                </div>
                {metrics.total_obligations > 0 ? (
                  <>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 12 }}>
                      <span style={{ fontSize: 32, fontWeight: 900, color: '#ffffff', lineHeight: 1 }}>
                        {metrics.obligations_complete}
                      </span>
                      <span style={{ fontSize: 14, fontWeight: 600, color: '#444' }}>/ {metrics.total_obligations}</span>
                    </div>
                    <div style={{ height: 6, background: '#131313', marginBottom: 8 }}>
                      <div style={{
                        height: 6,
                        background: metrics.obligations_complete === metrics.total_obligations ? '#36bd5f' : '#00e5bf',
                        width: `${(metrics.obligations_complete / metrics.total_obligations) * 100}%`,
                        transition: 'width 0.5s ease',
                      }} />
                    </div>
                    <div style={{ fontSize: 11, color: '#555' }}>
                      {metrics.total_obligations - metrics.obligations_complete} obligations remaining
                    </div>
                  </>
                ) : (
                  <div style={{ fontSize: 12, color: '#444' }}>Classify a system to generate obligations.</div>
                )}
              </div>

              {/* AI Activity */}
              <div style={{
                background: '#0c0c0c', border: '1px solid rgba(255,255,255,0.07)',
                padding: '24px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <Sparkles size={13} strokeWidth={2} style={{ color: '#00e5bf' }} />
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#555', letterSpacing: '0.08em', textTransform: 'uppercase' }}>AI-Powered Compliance</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 12 }}>
                  <span style={{ fontSize: 32, fontWeight: 900, color: '#00e5bf', lineHeight: 1 }}>
                    {metrics.evidence_ai_drafted}
                  </span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#444' }}>AI-drafted sections</span>
                </div>
                <div style={{ fontSize: 11, color: '#555', lineHeight: 1.6 }}>
                  {metrics.total_evidence > 0 && metrics.evidence_ai_drafted > 0
                    ? `${Math.round((metrics.evidence_ai_drafted / metrics.total_evidence) * 100)}% of your evidence was AI-assisted — saving hours of manual documentation.`
                    : 'Use AI drafting on any obligation to generate regulator-ready evidence in seconds.'}
                </div>
                {metrics.total_evidence > 0 && metrics.evidence_ai_drafted === 0 && (
                  <div style={{
                    marginTop: 12, padding: '8px 12px',
                    background: 'rgba(0,229,191,0.06)', border: '1px solid rgba(0,229,191,0.1)',
                    fontSize: 11, color: '#00e5bf', fontWeight: 600,
                  }}>
                    Try AI drafting to accelerate your compliance documentation.
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div style={{
                background: '#0c0c0c', border: '1px solid rgba(255,255,255,0.07)',
                padding: '24px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <TrendingUp size={13} strokeWidth={2} style={{ color: '#555' }} />
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#555', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Next Steps</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {/* Contextual first action */}
                  {metrics.systems.length > 0 && metrics.systems[0].pct_complete < 100 && (
                    <Link
                      href={`/systems/${metrics.systems[0].id}`}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '10px 14px', background: 'rgba(0,229,191,0.06)',
                        border: '1px solid rgba(0,229,191,0.12)',
                        textDecoration: 'none', color: '#e8e8e8', fontSize: 12, fontWeight: 600,
                      }}
                    >
                      <Target size={14} style={{ color: '#00e5bf', flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          Continue: {metrics.systems[0].name}
                        </div>
                        <div style={{ fontSize: 10, color: '#555', marginTop: 1 }}>{metrics.systems[0].pct_complete}% complete</div>
                      </div>
                      <ArrowRight size={12} style={{ color: '#00e5bf', flexShrink: 0 }} />
                    </Link>
                  )}

                  <Link
                    href="/systems/new"
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '10px 14px', background: '#080808',
                      border: '1px solid rgba(255,255,255,0.06)',
                      textDecoration: 'none', color: '#888', fontSize: 12, fontWeight: 600,
                    }}
                  >
                    <Shield size={14} style={{ color: '#555', flexShrink: 0 }} />
                    <span>Document new AI system</span>
                    <ArrowRight size={12} style={{ color: '#555', flexShrink: 0, marginLeft: 'auto' }} />
                  </Link>

                  <Link
                    href="/systems"
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '10px 14px', background: '#080808',
                      border: '1px solid rgba(255,255,255,0.06)',
                      textDecoration: 'none', color: '#888', fontSize: 12, fontWeight: 600,
                    }}
                  >
                    <BarChart3 size={14} style={{ color: '#555', flexShrink: 0 }} />
                    <span>View all systems</span>
                    <ArrowRight size={12} style={{ color: '#555', flexShrink: 0, marginLeft: 'auto' }} />
                  </Link>

                  {metrics.systems_ready > 0 && (
                    <Link
                      href={`/systems/${metrics.systems.find(s => s.status === 'ready')?.id ?? metrics.systems[0].id}`}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '10px 14px', background: '#080808',
                        border: '1px solid rgba(255,255,255,0.06)',
                        textDecoration: 'none', color: '#888', fontSize: 12, fontWeight: 600,
                      }}
                    >
                      <FileText size={14} style={{ color: '#36bd5f', flexShrink: 0 }} />
                      <span>Export evidence pack</span>
                      <ArrowRight size={12} style={{ color: '#555', flexShrink: 0, marginLeft: 'auto' }} />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
