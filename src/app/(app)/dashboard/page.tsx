'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, useMotionValue, useSpring, useInView, animate, AnimatePresence } from 'framer-motion'
import { BarChart, Bar, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import {
  TrendingUp, AlertTriangle, DollarSign, Clock, RefreshCw, CheckCircle, Zap,
  ArrowUpRight, Activity, Users, FileText, Calendar, MoreHorizontal, ExternalLink, Bell,
} from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import InvoiceStatusBadge from '@/components/invoices/InvoiceStatusBadge'
import { TIER_COLOURS } from '@/lib/intelligence/recommendations'
import { Invoice, Client, RiskTier } from '@/types'
import { fadeInUp, staggerContainer, cardHover, btnHover, btnTap, pageVariants } from '@/lib/motion'

interface DashboardData {
  outstanding_balance: number
  overdue_count: number
  interest_recoverable: number
  avg_days_late: number
  paid_this_month: number
  recovery_rate: number
  total_invoices: number
  monthly_trend: Array<{ month: string; overdue: number; paid: number; overdue_amount: number; paid_amount: number }>
  pipeline: Record<string, { count: number; amount: number }>
  activity_feed: Array<{ id: string; invoice_id: string; invoice_number: string; event_type: string; event_timestamp: string; metadata: Record<string, unknown> }>
  upcoming_due: Invoice[]
  recent_invoices: Invoice[]
}

interface CashflowData {
  next_30_days_expected: number
  next_60_days_expected: number
  next_90_days_expected: number
  daily_buckets: Array<{ date: string; amount: number; confidence: number }>
}

interface RiskClient extends Client { outstanding: number }

// ─── Cursor glow (same system as homepage) ────────────────────────────────────
function CursorGlow() {
  const mx = useMotionValue(0); const my = useMotionValue(0)
  const sx = useSpring(mx, { stiffness: 60, damping: 22 })
  const sy = useSpring(my, { stiffness: 60, damping: 22 })
  useEffect(() => {
    const h = (e: MouseEvent) => { mx.set(e.clientX); my.set(e.clientY) }
    window.addEventListener('mousemove', h)
    return () => window.removeEventListener('mousemove', h)
  }, [mx, my])
  return (
    <motion.div
      style={{ x: sx, y: sy, position: 'fixed', top: 0, left: 0, width: 480, height: 480, borderRadius: '50%', pointerEvents: 'none', zIndex: 0, translateX: '-50%', translateY: '-50%', background: 'radial-gradient(circle, rgba(71,201,229,0.055) 0%, transparent 70%)' }}
    />
  )
}

// ─── Live clock ───────────────────────────────────────────────────────────────
function LiveClock() {
  const [time, setTime] = useState('')
  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
    tick(); const id = setInterval(tick, 1000); return () => clearInterval(id)
  }, [])
  return (
    <span style={{ fontVariantNumeric: 'tabular-nums', fontFamily: 'monospace', fontSize: 13, color: '#47c9e5', letterSpacing: '0.05em' }}>{time}</span>
  )
}

// ─── Animated number counter ──────────────────────────────────────────────────
function AnimatedNumber({ value, prefix = '', suffix = '', decimals = 0 }: { value: number; prefix?: string; suffix?: string; decimals?: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true })
  const motionVal = useMotionValue(0)
  const spring = useSpring(motionVal, { stiffness: 55, damping: 18 })
  const [display, setDisplay] = useState('0')

  useEffect(() => {
    if (!isInView) return
    const ctrl = animate(motionVal, value, { duration: 1.6, ease: 'easeOut' })
    const unsub = spring.on('change', (v) => {
      if (prefix === '£') setDisplay(formatCurrency(v))
      else if (decimals > 0) setDisplay(`${v.toFixed(decimals)}${suffix}`)
      else setDisplay(`${Math.round(v)}${suffix}`)
    })
    return () => { ctrl.stop(); unsub() }
  }, [isInView, value]) // eslint-disable-line

  return <span ref={ref}>{display}</span>
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────
function KpiCard({ label, numValue, icon: Icon, accent, prefix, suffix, decimals, trend }: {
  label: string; numValue: number; icon: React.ElementType; accent: string; prefix?: string; suffix?: string; decimals?: number; trend?: 'up' | 'down' | 'neutral'
}) {
  return (
    <motion.div
      variants={fadeInUp}
      whileHover={cardHover}
      style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '22px 22px 20px', cursor: 'default', position: 'relative', overflow: 'hidden' }}
    >
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${accent}, transparent)` }} />
      <div style={{ position: 'absolute', bottom: -24, right: -24, width: 80, height: 80, borderRadius: '50%', background: `${accent}08` }} />
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
        <p style={{ fontSize: 10, color: '#4a4a4a', fontWeight: 700, margin: 0, textTransform: 'uppercase', letterSpacing: '0.8px' }}>{label}</p>
        <div style={{ width: 34, height: 34, borderRadius: 8, background: `${accent}14`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={16} color={accent} />
        </div>
      </div>
      <p style={{ fontSize: 28, fontWeight: 900, color: '#ffffff', margin: 0, letterSpacing: '-1px', lineHeight: 1 }}>
        <AnimatedNumber value={numValue} prefix={prefix ?? ''} suffix={suffix ?? ''} decimals={decimals ?? 0} />
      </p>
      {trend && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 10 }}>
          <motion.div animate={{ y: trend === 'up' ? [0, -2, 0] : [0, 2, 0] }} transition={{ duration: 2, repeat: Infinity }}>
            <ArrowUpRight size={12} color={trend === 'up' ? '#36bd5f' : trend === 'down' ? '#e54747' : '#5e5e5e'} style={{ transform: trend === 'down' ? 'rotate(90deg)' : undefined }} />
          </motion.div>
          <span style={{ fontSize: 11, color: trend === 'up' ? '#36bd5f' : trend === 'down' ? '#e54747' : '#5e5e5e' }}>
            {trend === 'up' ? 'Increasing' : trend === 'down' ? 'Declining' : 'Stable'}
          </span>
        </div>
      )}
    </motion.div>
  )
}

// ─── Section card wrapper ─────────────────────────────────────────────────────
function SectionCard({ children, title, subtitle, action }: { children: React.ReactNode; title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <motion.div
      variants={fadeInUp}
      whileHover={{ boxShadow: '0 8px 40px rgba(0,0,0,0.4)', transition: { duration: 0.25 } }}
      style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: 24 }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 12, fontWeight: 800, color: '#555555', margin: 0, textTransform: 'uppercase', letterSpacing: '0.8px' }}>{title}</h2>
          {subtitle && <p style={{ fontSize: 11, color: '#363636', margin: '3px 0 0' }}>{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </motion.div>
  )
}

// ─── Pipeline funnel bar ──────────────────────────────────────────────────────
const PIPELINE_STAGES = [
  { key: 'draft', label: 'Draft', color: '#3a3a3a' },
  { key: 'pending', label: 'Pending', color: '#e2b742' },
  { key: 'overdue', label: 'Overdue', color: '#e54747' },
  { key: 'escalated', label: 'Escalated', color: '#c23a3a' },
  { key: 'paid', label: 'Paid', color: '#36bd5f' },
]

function PipelineFunnel({ pipeline }: { pipeline: Record<string, { count: number; amount: number }> }) {
  const total = Object.values(pipeline).reduce((s, v) => s + v.count, 0) || 1
  return (
    <div>
      {/* Bar segments */}
      <div style={{ display: 'flex', height: 10, borderRadius: 999, overflow: 'hidden', gap: 2, marginBottom: 20 }}>
        {PIPELINE_STAGES.map((stage) => {
          const pct = ((pipeline[stage.key]?.count ?? 0) / total) * 100
          return (
            <motion.div
              key={stage.key}
              title={`${stage.label}: ${pipeline[stage.key]?.count ?? 0}`}
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
              style={{ background: stage.color, height: '100%', minWidth: pct > 0 ? 4 : 0, borderRadius: 999 }}
            />
          )
        })}
      </div>
      {/* Stage labels */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {PIPELINE_STAGES.map((stage) => {
          const s = pipeline[stage.key] ?? { count: 0, amount: 0 }
          return (
            <motion.div
              key={stage.key}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              style={{ flex: 1, minWidth: 90 }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: stage.color }} />
                <span style={{ fontSize: 10, color: '#4a4a4a', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{stage.label}</span>
              </div>
              <p style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#e3e3e3' }}>{s.count}</p>
              <p style={{ margin: '2px 0 0', fontSize: 11, color: '#3a3a3a' }}>{formatCurrency(s.amount)}</p>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Activity feed ────────────────────────────────────────────────────────────
const EVENT_ICONS: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  invoice_created: { icon: FileText, color: '#47c9e5', label: 'Invoice Created' },
  reminder_sent: { icon: Bell, color: '#e2b742', label: 'Reminder Sent' },
  payment_received: { icon: CheckCircle, color: '#36bd5f', label: 'Payment Received' },
  status_changed: { icon: Activity, color: '#a78bfa', label: 'Status Changed' },
  escalated: { icon: AlertTriangle, color: '#e54747', label: 'Escalated' },
  evidence_generated: { icon: FileText, color: '#47c9e5', label: 'Evidence Pack' },
}

function ActivityFeed({ events }: { events: DashboardData['activity_feed'] }) {
  if (events.length === 0) {
    return <p style={{ color: '#3a3a3a', fontSize: 13, textAlign: 'center', padding: '32px 0' }}>No activity yet</p>
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      <AnimatePresence>
        {events.map((ev, i) => {
          const meta = EVENT_ICONS[ev.event_type] ?? { icon: Activity, color: '#5e5e5e', label: ev.event_type }
          const Icon = meta.icon
          const ago = Math.round((Date.now() - new Date(ev.event_timestamp).getTime()) / 60000)
          const agoStr = ago < 60 ? `${ago}m ago` : ago < 1440 ? `${Math.round(ago / 60)}h ago` : `${Math.round(ago / 1440)}d ago`
          return (
            <motion.div
              key={ev.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', position: 'relative' }}
            >
              {/* Timeline line */}
              {i < events.length - 1 && (
                <div style={{ position: 'absolute', left: 15, top: 36, width: 1, bottom: -10, background: 'rgba(255,255,255,0.04)' }} />
              )}
              <div style={{ width: 30, height: 30, borderRadius: '50%', background: `${meta.color}18`, border: `1px solid ${meta.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={13} color={meta.color} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: '#c0c0c0' }}>{meta.label}</p>
                <p style={{ margin: '2px 0 0', fontSize: 11, color: '#4a4a4a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {ev.invoice_number}
                </p>
              </div>
              <span style={{ fontSize: 10, color: '#363636', flexShrink: 0 }}>{agoStr}</span>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}

// ─── Upcoming due widget ──────────────────────────────────────────────────────
function UpcomingDue({ invoices }: { invoices: Invoice[] }) {
  if (invoices.length === 0) {
    return <p style={{ color: '#3a3a3a', fontSize: 13, textAlign: 'center', padding: '32px 0' }}>No upcoming dues in the next 14 days</p>
  }
  return (
    <motion.div variants={staggerContainer} style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {invoices.map((inv, i) => {
        const daysLeft = Math.ceil((new Date(inv.due_date).getTime() - Date.now()) / 86400000)
        const urgency = daysLeft <= 3 ? '#e54747' : daysLeft <= 7 ? '#e2b742' : '#36bd5f'
        return (
          <motion.a
            key={inv.id}
            href={`/invoices/${inv.id}`}
            variants={fadeInUp}
            whileHover={{ x: 3, backgroundColor: 'rgba(71,201,229,0.03)', transition: { duration: 0.15 } }}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 8px', borderBottom: '1px solid rgba(255,255,255,0.04)', textDecoration: 'none', borderRadius: 6 }}
          >
            <div>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#d0d0d0' }}>{inv.invoice_number}</p>
              <p style={{ margin: '2px 0 0', fontSize: 11, color: '#4a4a4a' }}>Due {formatDate(inv.due_date)}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 800, color: '#e3e3e3' }}>{formatCurrency(Number(inv.amount))}</p>
              <span style={{ fontSize: 10, fontWeight: 700, color: urgency, background: `${urgency}18`, padding: '2px 8px', borderRadius: 100, display: 'inline-block', marginTop: 2 }}>
                {daysLeft === 0 ? 'Due today' : daysLeft === 1 ? 'Due tomorrow' : `${daysLeft}d left`}
              </span>
            </div>
          </motion.a>
        )
      })}
    </motion.div>
  )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function Skeleton() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
      {[...Array(9)].map((_, i) => (
        <motion.div
          key={i}
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.1 }}
          style={{ height: i < 6 ? 108 : 180, background: '#111111', borderRadius: 12, gridColumn: i >= 6 ? 'span 1' : undefined }}
        />
      ))}
    </div>
  )
}

// ─── Custom tooltip for recharts ──────────────────────────────────────────────
const ChartTooltip = { contentStyle: { fontFamily: 'Raleway, sans-serif', fontSize: 12, background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.08)', color: '#e3e3e3', borderRadius: 8 } }

// ─── Main dashboard ───────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [forecast, setForecast] = useState<CashflowData | null>(null)
  const [riskClients, setRiskClients] = useState<RiskClient[]>([])
  const [loading, setLoading] = useState(true)
  const [recomputing, setRecomputing] = useState(false)
  const [activeTab, setActiveTab] = useState<'trend' | 'amount'>('trend')

  const load = useCallback(async () => {
    const [dashRes, forecastRes, clientRes, invoiceRes] = await Promise.all([
      fetch('/api/dashboard').then((r) => r.json()),
      fetch('/api/intelligence/forecast').then((r) => r.json()),
      fetch('/api/clients').then((r) => r.json()),
      fetch('/api/invoices').then((r) => r.json()),
    ])
    setData(dashRes)
    setForecast(forecastRes)
    const clients: Client[] = Array.isArray(clientRes) ? clientRes : []
    const invoices: Invoice[] = Array.isArray(invoiceRes) ? invoiceRes : []
    const high = clients
      .filter((c) => c.risk_score >= 60)
      .map((c) => ({ ...c, outstanding: invoices.filter((i) => i.client_id === c.id && i.status !== 'paid').reduce((s, i) => s + Number(i.amount), 0) }))
      .sort((a, b) => b.risk_score - a.risk_score).slice(0, 5)
    setRiskClients(high)
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const recompute = async () => {
    setRecomputing(true)
    await fetch('/api/intelligence/recompute', { method: 'POST' })
    await load()
    setRecomputing(false)
  }

  const forecastSeries = (() => {
    if (!forecast?.daily_buckets) return []
    let cum = 0
    return forecast.daily_buckets.map((b) => { cum += b.amount; return { date: b.date.slice(5), amount: Math.round(cum) } })
  })()

  const kpis = data ? [
    { label: 'Outstanding', numValue: data.outstanding_balance, icon: DollarSign, accent: '#47c9e5', prefix: '£', trend: 'neutral' as const },
    { label: 'Overdue Invoices', numValue: data.overdue_count, icon: AlertTriangle, accent: '#e54747', trend: data.overdue_count > 3 ? 'down' as const : 'neutral' as const },
    { label: 'Interest Recoverable', numValue: data.interest_recoverable, icon: TrendingUp, accent: '#36bd5f', prefix: '£', trend: 'up' as const },
    { label: 'Avg Days Late', numValue: data.avg_days_late, icon: Clock, accent: '#e2b742', suffix: 'd', trend: data.avg_days_late > 30 ? 'down' as const : 'neutral' as const },
    { label: 'Paid This Month', numValue: data.paid_this_month, icon: CheckCircle, accent: '#36bd5f', prefix: '£', trend: 'up' as const },
    { label: 'Recovery Rate', numValue: data.recovery_rate, icon: Zap, accent: '#a78bfa', suffix: '%', trend: data.recovery_rate > 70 ? 'up' as const : 'down' as const },
  ] : []

  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      style={{ fontFamily: "'Raleway', Helvetica, Arial, sans-serif", position: 'relative' }}
    >
      <CursorGlow />

      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 12 }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <h1 style={{ fontSize: 26, fontWeight: 900, color: '#ffffff', margin: 0, letterSpacing: '-0.5px' }}>Command Centre</h1>
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 2.5, repeat: Infinity }}
              style={{ width: 7, height: 7, borderRadius: '50%', background: '#36bd5f', boxShadow: '0 0 8px #36bd5f' }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <p style={{ color: '#3a3a3a', fontSize: 12, margin: 0 }}>Real-time payment intelligence</p>
            <span style={{ color: '#2a2a2a', margin: '0 4px' }}>·</span>
            <LiveClock />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <motion.a
            href="/invoices"
            whileHover={btnHover}
            whileTap={btnTap}
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.04)', color: '#aaaaaa', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 100, padding: '8px 18px', fontSize: 12, fontWeight: 600, cursor: 'pointer', textDecoration: 'none' }}
          >
            <FileText size={13} /> View All Invoices
          </motion.a>
          <motion.button
            onClick={recompute}
            disabled={recomputing}
            whileHover={btnHover}
            whileTap={btnTap}
            style={{ display: 'flex', alignItems: 'center', gap: 7, background: '#47c9e5', color: '#080808', border: 'none', borderRadius: 100, padding: '9px 20px', fontSize: 12, fontWeight: 800, cursor: 'pointer', opacity: recomputing ? 0.7 : 1, fontFamily: 'inherit' }}
          >
            <motion.span
              animate={recomputing ? { rotate: 360 } : { rotate: 0 }}
              transition={{ duration: 0.9, repeat: recomputing ? Infinity : 0, ease: 'linear' }}
              style={{ display: 'flex' }}
            >
              <RefreshCw size={13} />
            </motion.span>
            {recomputing ? 'Refreshing…' : 'Refresh Intel'}
          </motion.button>
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div key="sk" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Skeleton />
          </motion.div>
        ) : (
          <motion.div key="content" initial="hidden" animate="visible" variants={staggerContainer}>

            {/* ── 6 KPI cards ── */}
            <motion.div
              variants={staggerContainer}
              style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 14, marginBottom: 20 }}
            >
              {kpis.map((k) => <KpiCard key={k.label} {...k} />)}
            </motion.div>

            {/* ── Pipeline funnel (full width) ── */}
            <motion.div variants={fadeInUp} style={{ marginBottom: 20 }}>
              <SectionCard
                title="Invoice Pipeline"
                subtitle={`${data?.total_invoices ?? 0} invoices total`}
                action={
                  <span style={{ fontSize: 11, color: '#3a3a3a' }}>Status breakdown</span>
                }
              >
                <PipelineFunnel pipeline={data?.pipeline ?? {}} />
              </SectionCard>
            </motion.div>

            {/* ── Charts + Activity row ── */}
            <motion.div variants={staggerContainer} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 360px', gap: 16, marginBottom: 20 }}>

              {/* Invoice Trend chart */}
              <SectionCard
                title="Invoice Trend — 6 months"
                action={
                  <div style={{ display: 'flex', gap: 4 }}>
                    {(['trend', 'amount'] as const).map((t) => (
                      <button
                        key={t}
                        onClick={() => setActiveTab(t)}
                        style={{ fontSize: 10, fontWeight: 700, textTransform: 'capitalize', padding: '3px 10px', borderRadius: 100, border: 'none', cursor: 'pointer', fontFamily: 'inherit', background: activeTab === t ? '#47c9e5' : 'rgba(255,255,255,0.05)', color: activeTab === t ? '#080808' : '#555555', transition: 'all 0.2s' }}
                      >
                        {t === 'trend' ? 'Count' : 'Value'}
                      </button>
                    ))}
                  </div>
                }
              >
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={data?.monthly_trend ?? []} barGap={3}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                    <XAxis dataKey="month" tick={{ fontSize: 10, fontFamily: 'Raleway', fill: '#444' }} />
                    <YAxis tick={{ fontSize: 10, fontFamily: 'Raleway', fill: '#444' }} tickFormatter={activeTab === 'amount' ? (v) => `£${(v / 1000).toFixed(0)}k` : undefined} />
                    <Tooltip {...ChartTooltip} formatter={(v: unknown) => activeTab === 'amount' ? formatCurrency(Number(v)) : String(v)} />
                    <Bar dataKey={activeTab === 'trend' ? 'paid' : 'paid_amount'} name="Paid" fill="#36bd5f" radius={[4, 4, 0, 0]} />
                    <Bar dataKey={activeTab === 'trend' ? 'overdue' : 'overdue_amount'} name="Overdue" fill="#e54747" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </SectionCard>

              {/* Cashflow forecast */}
              <SectionCard title="90-Day Cashflow Forecast">
                {forecast && (
                  <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                    {[
                      { label: '30d', value: forecast.next_30_days_expected },
                      { label: '60d', value: forecast.next_60_days_expected },
                      { label: '90d', value: forecast.next_90_days_expected },
                    ].map(({ label, value }, i) => (
                      <motion.div
                        key={label}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 + i * 0.1 }}
                        style={{ flex: 1, background: 'rgba(71,201,229,0.05)', borderRadius: 8, padding: '10px 12px', border: '1px solid rgba(71,201,229,0.08)' }}
                      >
                        <p style={{ fontSize: 9, color: '#444', margin: '0 0 4px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</p>
                        <p style={{ fontSize: 14, fontWeight: 800, color: '#47c9e5', margin: 0 }}>{formatCurrency(value)}</p>
                      </motion.div>
                    ))}
                  </div>
                )}
                <ResponsiveContainer width="100%" height={140}>
                  <AreaChart data={forecastSeries}>
                    <defs>
                      <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#47c9e5" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#47c9e5" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#444' }} interval="preserveStartEnd" />
                    <YAxis hide />
                    <Tooltip {...ChartTooltip} formatter={(v: unknown) => formatCurrency(Number(v))} />
                    <Area type="monotone" dataKey="amount" stroke="#47c9e5" strokeWidth={2} fill="url(#cg)" name="Cumulative" />
                  </AreaChart>
                </ResponsiveContainer>
              </SectionCard>

              {/* Activity feed */}
              <SectionCard title="Live Activity" subtitle="Recent events">
                <ActivityFeed events={data?.activity_feed ?? []} />
              </SectionCard>
            </motion.div>

            {/* ── Bottom row: risk clients + upcoming + recent ── */}
            <motion.div variants={staggerContainer} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>

              {/* High-risk clients */}
              <SectionCard
                title="High-Risk Clients"
                action={<a href="/clients" style={{ fontSize: 11, color: '#47c9e5', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>All <ExternalLink size={10} /></a>}
              >
                {riskClients.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '28px 0' }}>
                    <Users size={28} color="#2a2a2a" style={{ marginBottom: 8 }} />
                    <p style={{ color: '#3a3a3a', fontSize: 12, margin: 0 }}>No high-risk clients detected</p>
                  </div>
                ) : (
                  <motion.div variants={staggerContainer} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {riskClients.map((c) => {
                      const tier = TIER_COLOURS[c.risk_tier as RiskTier]
                      return (
                        <motion.a
                          key={c.id}
                          href={`/clients`}
                          variants={fadeInUp}
                          whileHover={{ x: 2, backgroundColor: 'rgba(255,255,255,0.02)', transition: { duration: 0.15 } }}
                          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 10px', background: 'rgba(255,255,255,0.02)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.04)', textDecoration: 'none' }}
                        >
                          <div>
                            <p style={{ margin: 0, fontWeight: 700, color: '#d0d0d0', fontSize: 13 }}>{c.name}</p>
                            <p style={{ margin: '2px 0 0', fontSize: 11, color: '#3a3a3a' }}>{formatCurrency(c.outstanding)} outstanding</p>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <span style={{ display: 'inline-block', background: tier.bg, color: tier.text, fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 100 }}>{tier.label}</span>
                            <p style={{ margin: '3px 0 0', fontSize: 12, fontWeight: 800, color: '#aaa' }}>{c.risk_score}/100</p>
                          </div>
                        </motion.a>
                      )
                    })}
                  </motion.div>
                )}
              </SectionCard>

              {/* Upcoming due dates */}
              <SectionCard
                title="Upcoming Due"
                subtitle="Next 14 days"
                action={<Calendar size={14} color="#3a3a3a" />}
              >
                <UpcomingDue invoices={data?.upcoming_due ?? []} />
              </SectionCard>

              {/* Recent invoices */}
              <SectionCard
                title="Recent Invoices"
                action={<a href="/invoices" style={{ fontSize: 11, color: '#47c9e5', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>All <ExternalLink size={10} /></a>}
              >
                {(data?.recent_invoices ?? []).length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '28px 0' }}>
                    <FileText size={28} color="#2a2a2a" style={{ marginBottom: 8 }} />
                    <p style={{ color: '#3a3a3a', fontSize: 12, margin: 0 }}>
                      No invoices yet. <a href="/invoices" style={{ color: '#47c9e5' }}>Add one →</a>
                    </p>
                  </div>
                ) : (
                  <motion.div variants={staggerContainer} style={{ display: 'flex', flexDirection: 'column' }}>
                    {(data?.recent_invoices ?? []).map((inv) => (
                      <motion.a
                        key={inv.id}
                        href={`/invoices/${inv.id}`}
                        variants={fadeInUp}
                        whileHover={{ x: 3, backgroundColor: 'rgba(71,201,229,0.03)', transition: { duration: 0.15 } }}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 6px', borderBottom: '1px solid rgba(255,255,255,0.04)', textDecoration: 'none', borderRadius: 4 }}
                      >
                        <div>
                          <p style={{ margin: 0, fontWeight: 700, color: '#d0d0d0', fontSize: 13 }}>{inv.invoice_number}</p>
                          <p style={{ margin: '2px 0 0', fontSize: 11, color: '#3a3a3a' }}>Due {formatDate(inv.due_date)}</p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ fontWeight: 700, fontSize: 13, color: '#c0c0c0' }}>{formatCurrency(Number(inv.amount), inv.currency)}</span>
                          <InvoiceStatusBadge status={inv.status} />
                        </div>
                      </motion.a>
                    ))}
                  </motion.div>
                )}
              </SectionCard>
            </motion.div>

          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
