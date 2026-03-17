'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import Link from 'next/link'
import {
  motion, useScroll, useSpring, useInView, useMotionValue,
  animate, AnimatePresence,
} from 'framer-motion'
import {
  Shield, FileText, CheckCircle, ArrowRight, Zap, BarChart3,
  Star, X, Gavel, Scale, AlertTriangle, TrendingUp, Clock,
} from 'lucide-react'

/* ─── Design tokens ───────────────────────────────────────────── */
const T = {
  bg: '#040404',
  surface: '#0c0c0c',
  surface2: '#131313',
  border: 'rgba(255,255,255,0.07)',
  borderHover: 'rgba(255,255,255,0.14)',
  text: '#e8e8e8',
  text2: '#666',
  text3: '#333',
  accent: '#47c9e5',
  red: '#e54747',
  purple: '#a78bfa',
  green: '#36bd5f',
}

/* ─── Custom cursor ───────────────────────────────────────────── */
function Cursor() {
  const x = useMotionValue(-40); const y = useMotionValue(-40)
  const rx = useSpring(x, { stiffness: 600, damping: 35 })
  const ry = useSpring(y, { stiffness: 600, damping: 35 })
  const [hovered, setHovered] = useState(false)
  useEffect(() => {
    const m = (e: MouseEvent) => { x.set(e.clientX); y.set(e.clientY) }
    const on = () => setHovered(true); const off = () => setHovered(false)
    window.addEventListener('mousemove', m)
    document.querySelectorAll('a,button,[data-hover]').forEach((el) => { el.addEventListener('mouseenter', on); el.addEventListener('mouseleave', off) })
    return () => { window.removeEventListener('mousemove', m) }
  }, [x, y])
  return (
    <>
      <motion.div style={{ x: rx, y: ry, position: 'fixed', top: -4, left: -4, width: 8, height: 8, borderRadius: '50%', background: T.accent, pointerEvents: 'none', zIndex: 9999, translateX: '-50%', translateY: '-50%' }} />
      <motion.div animate={{ width: hovered ? 40 : 28, height: hovered ? 40 : 28, opacity: hovered ? 0.6 : 0.3 }} transition={{ duration: 0.2 }} style={{ x: rx, y: ry, position: 'fixed', top: -14, left: -14, borderRadius: '50%', border: `1px solid ${T.accent}`, pointerEvents: 'none', zIndex: 9998, translateX: '-50%', translateY: '-50%' }} />
    </>
  )
}

/* ─── Scroll progress ─────────────────────────────────────────── */
function ScrollBar() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 30 })
  return <motion.div style={{ scaleX, position: 'fixed', top: 0, left: 0, right: 0, height: 1, background: T.accent, transformOrigin: '0%', zIndex: 200 }} />
}

/* ─── Magnetic button ─────────────────────────────────────────── */
function Magnetic({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0); const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 350, damping: 28 })
  const sy = useSpring(y, { stiffness: 350, damping: 28 })
  const onMove = useCallback((e: React.MouseEvent) => {
    const r = ref.current!.getBoundingClientRect()
    x.set((e.clientX - r.left - r.width / 2) * 0.22)
    y.set((e.clientY - r.top - r.height / 2) * 0.22)
  }, [x, y])
  const onLeave = useCallback(() => { x.set(0); y.set(0) }, [x, y])
  return <motion.div ref={ref} style={{ x: sx, y: sy, display: 'inline-block' }} onMouseMove={onMove} onMouseLeave={onLeave}>{children}</motion.div>
}

/* ─── Animated counter ────────────────────────────────────────── */
function Count({ to, prefix = '', suffix = '' }: { to: number; prefix?: string; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const val = useMotionValue(0)
  const [display, setDisplay] = useState('0')
  useEffect(() => {
    if (!inView) return
    const ctrl = animate(val, to, { duration: 1.8, ease: 'easeOut' })
    const unsub = val.on('change', (v) => setDisplay(`${prefix}${Math.round(v).toLocaleString()}${suffix}`))
    return () => { ctrl.stop(); unsub() }
  }, [inView]) // eslint-disable-line
  return <span ref={ref}>{display}</span>
}

/* ─── Word cycle ──────────────────────────────────────────────── */
const WORDS = ['clients', 'agencies', 'freelancers', 'studios', 'consultants']
function CycleWord() {
  const [idx, setIdx] = useState(0)
  useEffect(() => { const t = setInterval(() => setIdx((i) => (i + 1) % WORDS.length), 2200); return () => clearInterval(t) }, [])
  return (
    <span style={{ position: 'relative', display: 'inline-block', minWidth: 260 }}>
      <AnimatePresence mode="wait">
        <motion.span
          key={idx}
          initial={{ opacity: 0, y: 28, filter: 'blur(4px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -20, filter: 'blur(4px)' }}
          transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
          style={{ display: 'inline-block', color: T.accent }}
        >
          {WORDS[idx]}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}

/* ─── Data ────────────────────────────────────────────────────── */
const FEATURES = [
  { icon: Clock, title: 'Invoice Tracking', desc: 'Every invoice monitored in real time. Overdue detection runs automatically — no manual chasing.' },
  { icon: TrendingUp, title: 'Statutory Interest', desc: '8% above BoE base rate, plus fixed compensation. Calculated to the day, fully UK law-compliant.' },
  { icon: Zap, title: 'Payment Intelligence', desc: 'AI risk-scores each client 0–100. Predicts payment date before the invoice is even late.' },
  { icon: Shield, title: 'Reminder Pipeline', desc: 'Four staged reminders, escalating from polite to firm legal language. Sent automatically.' },
  { icon: FileText, title: 'Evidence Packs', desc: 'One-click PDF packs for debt collectors, accountants, or small claims court filings.' },
  { icon: BarChart3, title: 'Cashflow Forecast', desc: '90-day forward view of expected income. Plan your business with certainty, not guesswork.' },
]

const STATS = [
  { to: 2400, prefix: '£', suffix: '', label: 'avg. recovered per user/yr' },
  { to: 14, prefix: '', suffix: 'd', label: 'reduction in payment time' },
  { to: 94, prefix: '', suffix: '%', label: 'reminder open rate' },
  { to: 3, prefix: '', suffix: 'min', label: 'to set up first invoice' },
]

const STEPS = [
  { n: '01', title: 'Add your invoices', desc: 'Upload CSV or add manually. Takes three minutes.' },
  { n: '02', title: 'Reminders run automatically', desc: 'Staged sequences sent on your behalf, escalating by stage.' },
  { n: '03', title: 'Interest calculated daily', desc: 'Statutory interest and compensation tracked to the penny.' },
  { n: '04', title: 'Evidence ready instantly', desc: 'Professional PDF packs generated at the click of a button.' },
]

const TESTIMONIALS = [
  { name: 'Sarah K.', role: 'Freelance Designer', text: 'Recovered £3,800 in overdue invoices within the first month. The automated reminders are firm but professional.', stars: 5 },
  { name: 'James T.', role: 'Web Development Agency', text: 'We had 12 clients with outstanding invoices. Irvo chased them all without us lifting a finger.', stars: 5 },
  { name: 'Marcus W.', role: 'UX Consultant', text: 'My average payment time dropped from 47 days to 19 days in 6 weeks. Setup took three minutes.', stars: 5 },
]

const PRICING = [
  { name: 'Starter', monthly: 19, annual: 15, desc: 'Solo freelancers', features: ['50 invoices/month', 'Automated reminders', 'Interest calculator', 'Evidence packs'] },
  { name: 'Studio', monthly: 69, annual: 55, desc: 'Small agencies', highlight: true, features: ['Unlimited invoices', 'Multiple clients', 'CSV import', 'Payment intelligence', 'Priority support'] },
  { name: 'Firm', monthly: 149, annual: 119, desc: 'Accountants', features: ['Everything in Studio', 'Multi-organisation', 'API access', 'White-label reports', 'Dedicated support'] },
]

/* ─── Escalation modal ────────────────────────────────────────── */
type EscService = 'legal' | 'ccj'
interface EscForm { creditorName: string; creditorEmail: string; clientName: string; clientEmail: string; clientCompany: string; invoiceNumber: string; invoiceAmount: string; invoiceDate: string; dueDate: string; description: string }
const ESC_EMPTY: EscForm = { creditorName: '', creditorEmail: '', clientName: '', clientEmail: '', clientCompany: '', invoiceNumber: '', invoiceAmount: '', invoiceDate: '', dueDate: '', description: '' }

function Field({ label, value, onChange, type = 'text', placeholder, required }: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string; required?: boolean }) {
  const [focused, setFocused] = useState(false)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 10, fontWeight: 700, color: T.text2, textTransform: 'uppercase', letterSpacing: '0.7px' }}>
        {label}{required && <span style={{ color: T.red }}> *</span>}
      </label>
      <input
        type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{ background: T.surface, border: `1px solid ${focused ? T.borderHover : T.border}`, borderRadius: 6, padding: '10px 12px', fontSize: 13, color: T.text, outline: 'none', fontFamily: 'inherit', width: '100%', boxSizing: 'border-box', transition: 'border-color 0.15s', caretColor: T.accent }}
      />
    </div>
  )
}

function EscalationModal({ service, onClose }: { service: EscService; onClose: () => void }) {
  const [form, setForm] = useState<EscForm>(ESC_EMPTY)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const set = (k: keyof EscForm) => (v: string) => setForm((f) => ({ ...f, [k]: v }))
  const isLegal = service === 'legal'
  const accent = isLegal ? T.red : T.purple

  const submit = async () => {
    setError(null)
    const required: (keyof EscForm)[] = ['creditorName', 'creditorEmail', 'clientName', 'invoiceNumber', 'invoiceAmount', 'invoiceDate', 'dueDate']
    if (isLegal) required.push('clientEmail')
    if (required.some((k) => !form[k].trim())) { setError('Please fill in all required fields.'); return }
    setLoading(true)
    try {
      const res = await fetch(isLegal ? '/api/public/legal-demand' : '/api/public/ccj-pack', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) }).then((r) => r.json())
      if (res.url) window.location.href = res.url
      else setError(res.error ?? 'Something went wrong.')
    } catch { setError('Network error. Please try again.') }
    setLoading(false)
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(12px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, overflowY: 'auto' }}
    >
      <motion.div initial={{ scale: 0.95, opacity: 0, y: 16 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.97, opacity: 0 }}
        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
        style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, padding: 36, maxWidth: 580, width: '100%', fontFamily: 'inherit', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}
      >
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${accent}, transparent)`, borderRadius: '12px 12px 0 0' }} />
        <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: 'transparent', border: 'none', cursor: 'pointer', color: T.text2, display: 'flex', padding: 6, borderRadius: 6 }}>
          <X size={15} />
        </button>

        <div style={{ marginBottom: 28 }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: accent, textTransform: 'uppercase', letterSpacing: '0.8px', margin: '0 0 6px' }}>
            {isLegal ? 'Legal Demand Letter — £9.99' : 'CCJ Preparation Pack — £29'}
          </p>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: T.text, margin: '0 0 4px', letterSpacing: '-0.4px' }}>
            {isLegal ? 'Send a formal demand' : 'Prepare your court claim'}
          </h2>
          <p style={{ fontSize: 13, color: T.text2, margin: 0 }}>
            {isLegal ? 'No account required. Sent to your client within minutes of payment.' : 'No account required. PDF emailed to you instantly after payment.'}
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div>
            <p style={{ fontSize: 10, fontWeight: 700, color: T.text3, textTransform: 'uppercase', letterSpacing: '0.7px', margin: '0 0 10px', borderBottom: `1px solid ${T.border}`, paddingBottom: 8 }}>Your Details</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="Your Name / Business" value={form.creditorName} onChange={set('creditorName')} placeholder="Jane Smith Design" required />
              <Field label="Your Email" value={form.creditorEmail} onChange={set('creditorEmail')} type="email" placeholder="jane@example.com" required />
            </div>
          </div>
          <div>
            <p style={{ fontSize: 10, fontWeight: 700, color: T.text3, textTransform: 'uppercase', letterSpacing: '0.7px', margin: '0 0 10px', borderBottom: `1px solid ${T.border}`, paddingBottom: 8 }}>Client Details</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <Field label="Client Name" value={form.clientName} onChange={set('clientName')} placeholder="John Williams" required />
              <Field label={isLegal ? 'Client Email' : 'Client Email (optional)'} value={form.clientEmail} onChange={set('clientEmail')} type="email" placeholder="john@company.com" required={isLegal} />
            </div>
            <Field label="Client Company (optional)" value={form.clientCompany} onChange={set('clientCompany')} placeholder="Acme Ltd" />
          </div>
          <div>
            <p style={{ fontSize: 10, fontWeight: 700, color: T.text3, textTransform: 'uppercase', letterSpacing: '0.7px', margin: '0 0 10px', borderBottom: `1px solid ${T.border}`, paddingBottom: 8 }}>Invoice Details</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
              <Field label="Invoice Number" value={form.invoiceNumber} onChange={set('invoiceNumber')} placeholder="INV-001" required />
              <Field label="Amount (£)" value={form.invoiceAmount} onChange={set('invoiceAmount')} type="number" placeholder="2500" required />
              <Field label="Invoice Date" value={form.invoiceDate} onChange={set('invoiceDate')} type="date" required />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="Due Date" value={form.dueDate} onChange={set('dueDate')} type="date" required />
              <Field label="Services (optional)" value={form.description} onChange={set('description')} placeholder="Web design services" />
            </div>
          </div>

          {error && <p style={{ fontSize: 12, color: T.red, background: 'rgba(229,71,71,0.06)', border: '1px solid rgba(229,71,71,0.15)', padding: '10px 14px', borderRadius: 6, margin: 0 }}>{error}</p>}

          <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
            <button onClick={onClose} style={{ flex: 1, background: 'transparent', border: `1px solid ${T.border}`, borderRadius: 8, padding: '12px 0', fontSize: 13, fontWeight: 600, color: T.text2, cursor: 'pointer', fontFamily: 'inherit', transition: 'border-color 0.15s' }}>Cancel</button>
            <motion.button onClick={submit} disabled={loading} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
              style={{ flex: 2, background: accent, border: 'none', borderRadius: 8, padding: '12px 0', fontSize: 13, fontWeight: 800, color: '#fff', cursor: loading ? 'default' : 'pointer', fontFamily: 'inherit', opacity: loading ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            >
              {isLegal ? <Gavel size={14} /> : <Scale size={14} />}
              {loading ? 'Redirecting…' : `Pay ${isLegal ? '£9.99' : '£29'} & Send`}
            </motion.button>
          </div>
          <p style={{ fontSize: 11, color: T.text3, textAlign: 'center', margin: 0 }}>Secured by Stripe · No account required · Refundable if we fail to deliver</p>
        </div>
      </motion.div>
    </motion.div>
  )
}

/* ─── Logo mark ───────────────────────────────────────────────── */
function Logo({ size = 28 }: { size?: number }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: Math.round(size * 0.38), userSelect: 'none' }}>
      {/* Accent bar */}
      <div style={{ width: 2, height: Math.round(size * 0.78), background: T.accent, flexShrink: 0 }} />
      {/* Wordmark */}
      <span style={{
        fontSize: size,
        fontWeight: 900,
        letterSpacing: '2px',
        color: T.text,
        fontFamily: 'var(--font-raleway), Raleway, Helvetica, Arial, sans-serif',
        lineHeight: 1,
        whiteSpace: 'nowrap',
      }}>
        IRVO
      </span>
    </div>
  )
}

/* ─── Live Interest Calculator ────────────────────────────────── */
function InterestCalculator() {
  const [amount, setAmount] = useState('5000')
  const [days, setDays] = useState('47')
  const [amtFocus, setAmtFocus] = useState(false)
  const [daysFocus, setDaysFocus] = useState(false)

  const principal = parseFloat(amount.replace(/,/g, '')) || 0
  const daysNum = parseInt(days) || 0
  const interest = Math.round(principal * (0.13 / 365) * daysNum * 100) / 100
  const compensation = principal >= 10000 ? 100 : principal >= 1000 ? 70 : 40
  const total = principal + interest + compensation
  const hasResult = principal > 0 && daysNum > 0

  const fmt = (n: number) => `£${n.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  return (
    <section style={{ padding: '100px 32px', background: T.surface }}>
      <div style={{ maxWidth: 1160, margin: '0 auto' }}>
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ marginBottom: 64 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: T.text2, textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 16px' }}>
            Statutory Entitlement Calculator
          </p>
          <h2 style={{ fontSize: 'clamp(30px, 4vw, 48px)', fontWeight: 900, letterSpacing: '-1.5px', margin: '0 0 14px', lineHeight: 1.05 }}>
            How much are you owed <em style={{ fontStyle: 'normal', color: T.accent }}>right now?</em>
          </h2>
          <p style={{ fontSize: 15, color: T.text2, margin: 0, maxWidth: 480, lineHeight: 1.75 }}>
            Enter your invoice details below. Statutory interest under the Late Payment Act 1998 accrues every single day.
          </p>
        </motion.div>

        {/* Calculator card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
          style={{ border: `1px solid ${T.border}`, background: T.bg }}
        >
          {/* Inputs row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: `1px solid ${T.border}` }}>
            <div style={{ padding: '32px 36px', borderRight: `1px solid ${T.border}` }}>
              <label style={{ fontSize: 10, fontWeight: 700, color: T.text2, textTransform: 'uppercase', letterSpacing: '0.8px', display: 'block', marginBottom: 12 }}>
                Invoice Amount
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 32, fontWeight: 900, color: T.text3 }}>£</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  onFocus={() => setAmtFocus(true)}
                  onBlur={() => setAmtFocus(false)}
                  placeholder="5000"
                  style={{ fontSize: 40, fontWeight: 900, color: T.text, background: 'transparent', border: 'none', outline: 'none', width: '100%', fontFamily: 'inherit', letterSpacing: '-2px', caretColor: T.accent, appearance: 'textfield' }}
                />
              </div>
              <div style={{ height: 2, background: amtFocus ? T.accent : T.border, marginTop: 8, transition: 'background 0.2s' }} />
            </div>
            <div style={{ padding: '32px 36px' }}>
              <label style={{ fontSize: 10, fontWeight: 700, color: T.text2, textTransform: 'uppercase', letterSpacing: '0.8px', display: 'block', marginBottom: 12 }}>
                Days Overdue
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  type="number"
                  value={days}
                  onChange={(e) => setDays(e.target.value)}
                  onFocus={() => setDaysFocus(true)}
                  onBlur={() => setDaysFocus(false)}
                  placeholder="30"
                  style={{ fontSize: 40, fontWeight: 900, color: T.text, background: 'transparent', border: 'none', outline: 'none', width: '100%', fontFamily: 'inherit', letterSpacing: '-2px', caretColor: T.accent, appearance: 'textfield' }}
                />
                <span style={{ fontSize: 20, fontWeight: 700, color: T.text3, flexShrink: 0 }}>days</span>
              </div>
              <div style={{ height: 2, background: daysFocus ? T.accent : T.border, marginTop: 8, transition: 'background 0.2s' }} />
            </div>
          </div>

          {/* Results row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', borderBottom: `1px solid ${T.border}` }}>
            {[
              { label: 'Invoice Principal', value: hasResult ? fmt(principal) : '—', note: 'Original amount', dim: true },
              { label: 'Statutory Interest', value: hasResult ? `+${fmt(interest)}` : '—', note: `13% p.a. × ${daysNum} days`, dim: false },
              { label: 'Fixed Compensation', value: hasResult ? `+${fmt(compensation)}` : '—', note: 's.5A of the Act', dim: false },
              { label: 'Total You Are Owed', value: hasResult ? fmt(total) : '—', note: 'Claim this now', dim: false, highlight: true },
            ].map((col, i) => (
              <motion.div
                key={col.label}
                animate={{ opacity: hasResult ? 1 : 0.4 }}
                transition={{ duration: 0.3 }}
                style={{ padding: '32px 36px', borderRight: i < 3 ? `1px solid ${T.border}` : 'none', borderTop: col.highlight ? `2px solid ${T.accent}` : undefined, background: col.highlight ? 'rgba(71,201,229,0.03)' : 'transparent' }}
              >
                <p style={{ fontSize: 9, fontWeight: 700, color: col.highlight ? T.accent : T.text2, textTransform: 'uppercase', letterSpacing: '0.8px', margin: '0 0 16px' }}>{col.label}</p>
                <AnimatePresence mode="wait">
                  <motion.p
                    key={col.value}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2 }}
                    style={{ fontSize: col.highlight ? 28 : 22, fontWeight: 900, color: col.highlight ? T.accent : T.text, margin: '0 0 6px', letterSpacing: '-1px', fontVariantNumeric: 'tabular-nums' }}
                  >
                    {col.value}
                  </motion.p>
                </AnimatePresence>
                <p style={{ fontSize: 10, color: T.text3, margin: 0, fontWeight: 600 }}>{col.note}</p>
              </motion.div>
            ))}
          </div>

          {/* CTA row */}
          <div style={{ padding: '24px 36px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <p style={{ fontSize: 13, color: T.text2, margin: 0, maxWidth: 520, lineHeight: 1.7 }}>
              {hasResult
                ? `Interest accrues at £${(principal * 0.13 / 365).toFixed(2)} per day. Every day you wait costs you money.`
                : 'Enter your invoice details above to see your statutory entitlement.'}
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <Link href="/signup" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: T.text, color: T.bg, fontSize: 13, fontWeight: 700, padding: '11px 24px', textDecoration: 'none', letterSpacing: '-0.2px' }}>
                Recover this automatically <ArrowRight size={14} />
              </Link>
              <button
                onClick={() => { setAmount('5000'); setDays('47') }}
                style={{ background: 'transparent', border: `1px solid ${T.border}`, color: T.text2, fontSize: 12, fontWeight: 600, padding: '11px 16px', cursor: 'pointer', fontFamily: 'inherit' }}
              >
                Reset example
              </button>
            </div>
          </div>
        </motion.div>

        {/* Footer note */}
        <p style={{ fontSize: 11, color: T.text3, margin: '16px 0 0', textAlign: 'center' }}>
          Calculation based on Late Payment of Commercial Debts (Interest) Act 1998 · 13% p.a. (BoE base rate 5% + statutory 8%) · Compensation per s.5A
        </p>
      </div>
    </section>
  )
}

/* ─── Divider ─────────────────────────────────────────────────── */
function Divider() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true })
  return (
    <div ref={ref} style={{ height: 1, background: T.border, overflow: 'hidden' }}>
      <motion.div initial={{ scaleX: 0, originX: 0 }} animate={inView ? { scaleX: 1 } : {}} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }} style={{ height: '100%', background: T.border, transformOrigin: '0% 50%' }} />
    </div>
  )
}

/* ─── Main page ───────────────────────────────────────────────── */
export default function LandingPage() {
  const [annual, setAnnual] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [escModal, setEscModal] = useState<EscService | null>(null)
  const [mobileMenu, setMobileMenu] = useState(false)

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', h, { passive: true })
    return () => window.removeEventListener('scroll', h)
  }, [])

  const NAV = ['Features', 'How It Works', 'Pricing']

  return (
    <div style={{ background: T.bg, color: T.text, fontFamily: "'Raleway', Helvetica, Arial, sans-serif", minHeight: '100vh' }}>
      <Cursor />
      <ScrollBar />

      {/* ── NAV ─────────────────────────────────────────────────── */}
      <motion.header
        animate={{ borderBottomColor: scrolled ? T.border : 'transparent', background: scrolled ? 'rgba(4,4,4,0.92)' : 'transparent', backdropFilter: scrolled ? 'blur(20px)' : 'none' }}
        transition={{ duration: 0.3 }}
        style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, borderBottom: '1px solid transparent' }}
      >
        <div style={{ maxWidth: 1160, margin: '0 auto', padding: '0 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
          <Logo size={32} />
          <nav style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
            {NAV.map((item) => (
              <motion.a key={item} href={`#${item.toLowerCase().replace(' ', '-')}`} whileHover={{ color: T.text }} style={{ fontSize: 13, color: T.text2, textDecoration: 'none', fontWeight: 500, transition: 'color 0.15s' }}>{item}</motion.a>
            ))}
          </nav>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link href="/login" style={{ fontSize: 13, color: T.text2, textDecoration: 'none', fontWeight: 500 }}>Sign in</Link>
            <Magnetic>
              <Link href="/signup" style={{ background: T.text, color: T.bg, fontSize: 13, fontWeight: 700, padding: '8px 20px', borderRadius: 100, textDecoration: 'none', display: 'inline-block', letterSpacing: '-0.2px' }}>
                Get started
              </Link>
            </Magnetic>
          </div>
        </div>
      </motion.header>

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', padding: '120px 32px 80px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        {/* Subtle grid */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px)', backgroundSize: '80px 80px', pointerEvents: 'none' }} />

        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, border: `1px solid ${T.border}`, borderRadius: 100, padding: '5px 14px', marginBottom: 40, fontSize: 11, color: T.text2, letterSpacing: '0.4px' }}
          >
            <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 2, repeat: Infinity }} style={{ width: 5, height: 5, borderRadius: '50%', background: T.green }} />
            UK statutory debt recovery, automated
          </motion.div>

          <h1 style={{ fontSize: 'clamp(52px, 8vw, 96px)', fontWeight: 900, lineHeight: 1.0, letterSpacing: '-3px', margin: '0 0 32px', maxWidth: 860 }}>
            Built for{' '}
            <CycleWord />
            <br />
            <span style={{ color: T.text2 }}>who deserve to get paid.</span>
          </h1>

          <p style={{ fontSize: 18, color: T.text2, lineHeight: 1.8, maxWidth: 480, margin: '0 auto 48px' }}>
            Irvo tracks overdue invoices, applies UK statutory interest automatically, and escalates through reminders to legal demand — without you lifting a finger.
          </p>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Magnetic>
              <Link href="/signup" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: T.text, color: T.bg, fontSize: 15, fontWeight: 700, padding: '14px 32px', borderRadius: 100, textDecoration: 'none', letterSpacing: '-0.2px' }}>
                Start free <ArrowRight size={16} />
              </Link>
            </Magnetic>
            <Magnetic>
              <Link href="#features" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'transparent', color: T.text2, fontSize: 15, fontWeight: 500, padding: '14px 32px', borderRadius: 100, textDecoration: 'none', border: `1px solid ${T.border}` }}>
                See how it works
              </Link>
            </Magnetic>
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}
          style={{ position: 'absolute', bottom: 40, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}
        >
          <span style={{ fontSize: 10, color: T.text3, letterSpacing: '0.5px', textTransform: 'uppercase' }}>scroll</span>
          <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 1.6, repeat: Infinity }} style={{ width: 1, height: 24, background: `linear-gradient(${T.text3}, transparent)` }} />
        </motion.div>
      </section>

      <Divider />

      {/* ── MARQUEE STRIP ────────────────────────────────────────── */}
      <div style={{ overflow: 'hidden', padding: '20px 0', background: T.surface }}>
        <motion.div animate={{ x: ['0%', '-50%'] }} transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
          style={{ display: 'flex', gap: 0, width: 'max-content' }}
        >
          {[...Array(2)].map((_, outer) => (
            <span key={outer} style={{ display: 'flex' }}>
              {['STATUTORY INTEREST', 'LEGAL ENFORCEMENT', 'EVIDENCE PACKS', 'CCJ PREPARATION', 'AUTOMATED REMINDERS', 'CASHFLOW FORECASTING', 'PAYMENT INTELLIGENCE'].map((item, i) => (
                <span key={i} style={{ fontSize: 11, color: T.text3, fontWeight: 700, letterSpacing: '1.2px', padding: '0 32px', whiteSpace: 'nowrap' }}>
                  {item} <span style={{ color: T.text3, margin: '0 0 0 32px' }}>·</span>
                </span>
              ))}
            </span>
          ))}
        </motion.div>
      </div>

      <InterestCalculator />

      <Divider />

      {/* ── FEATURES ─────────────────────────────────────────────── */}
      <section id="features" style={{ padding: '120px 32px' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto' }}>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} style={{ marginBottom: 80 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: T.text2, textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 16px' }}>Features</p>
            <h2 style={{ fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 900, letterSpacing: '-1.5px', margin: 0, maxWidth: 560, lineHeight: 1.1 }}>
              Every tool you need to enforce payment.
            </h2>
          </motion.div>

          {/* Feature grid with dividing lines */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', borderTop: `1px solid ${T.border}`, borderLeft: `1px solid ${T.border}` }}>
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.45, delay: (i % 3) * 0.07 }}
                whileHover={{ background: T.surface }}
                style={{ padding: '36px 32px', borderRight: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}`, transition: 'background 0.2s' }}
              >
                <f.icon size={20} color={T.accent} style={{ marginBottom: 18 }} />
                <h3 style={{ fontSize: 16, fontWeight: 800, color: T.text, margin: '0 0 10px', letterSpacing: '-0.3px' }}>{f.title}</h3>
                <p style={{ fontSize: 13, color: T.text2, lineHeight: 1.75, margin: 0 }}>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Divider />

      {/* ── STATS ────────────────────────────────────────────────── */}
      <section style={{ padding: '100px 32px' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', borderTop: `1px solid ${T.border}`, borderLeft: `1px solid ${T.border}` }}>
          {STATS.map((s) => (
            <div key={s.label} style={{ padding: '48px 36px', borderRight: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}` }}>
              <p style={{ fontSize: 'clamp(40px, 5vw, 58px)', fontWeight: 900, color: T.text, margin: '0 0 8px', letterSpacing: '-2px', fontVariantNumeric: 'tabular-nums' }}>
                <Count to={s.to} prefix={s.prefix} suffix={s.suffix} />
              </p>
              <p style={{ fontSize: 12, color: T.text2, margin: 0, letterSpacing: '0.2px' }}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      <Divider />

      {/* ── LAW SECTION ──────────────────────────────────────────── */}
      <section style={{ padding: '120px 32px', background: T.surface }}>
        <div style={{ maxWidth: 1160, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
          <motion.div initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: T.text2, textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 20px' }}>Legal basis</p>
            <h2 style={{ fontSize: 'clamp(28px, 3.5vw, 44px)', fontWeight: 900, letterSpacing: '-1.5px', margin: '0 0 24px', lineHeight: 1.1 }}>
              The law is on your side. Use it.
            </h2>
            <p style={{ fontSize: 15, color: T.text2, lineHeight: 1.9, margin: '0 0 32px' }}>
              Under the <strong style={{ color: T.text }}>Late Payment of Commercial Debts Act 1998</strong>, every B2B invoice is subject to 8% statutory interest above the Bank of England base rate from the day it becomes overdue — plus fixed compensation of £40–£100 per invoice.
            </p>
            <p style={{ fontSize: 15, color: T.text2, lineHeight: 1.9, margin: 0 }}>
              Most freelancers never claim it. Irvo does it automatically, to the penny, every day.
            </p>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            {[
              { label: 'Interest rate', value: '13% p.a.', note: '8% + BoE base rate' },
              { label: 'Compensation (< £1,000)', value: '£40', note: 'Fixed, per invoice' },
              { label: 'Compensation (£1k – £10k)', value: '£70', note: 'Fixed, per invoice' },
              { label: 'Compensation (> £10,000)', value: '£100', note: 'Fixed, per invoice' },
            ].map((row, i) => (
              <motion.div
                key={row.label}
                initial={{ opacity: 0, x: 16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 0', borderBottom: `1px solid ${T.border}` }}
              >
                <div>
                  <p style={{ margin: 0, fontSize: 14, color: T.text }}>{row.label}</p>
                  <p style={{ margin: '2px 0 0', fontSize: 11, color: T.text2 }}>{row.note}</p>
                </div>
                <span style={{ fontSize: 22, fontWeight: 800, color: T.accent, letterSpacing: '-0.5px', fontVariantNumeric: 'tabular-nums' }}>{row.value}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <Divider />

      {/* ── HOW IT WORKS ─────────────────────────────────────────── */}
      <section id="how-it-works" style={{ padding: '120px 32px' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto' }}>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ marginBottom: 72 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: T.text2, textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 16px' }}>Process</p>
            <h2 style={{ fontSize: 'clamp(30px, 4vw, 46px)', fontWeight: 900, letterSpacing: '-1.5px', margin: 0, lineHeight: 1.1 }}>Set up once. Runs forever.</h2>
          </motion.div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', borderTop: `1px solid ${T.border}`, borderLeft: `1px solid ${T.border}` }}>
            {STEPS.map((step, i) => (
              <motion.div
                key={step.n}
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                whileHover={{ background: T.surface }}
                style={{ padding: '40px 32px', borderRight: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}`, transition: 'background 0.2s' }}
              >
                <span style={{ fontSize: 11, fontWeight: 700, color: T.text3, letterSpacing: '0.5px', display: 'block', marginBottom: 24 }}>{step.n}</span>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: T.text, margin: '0 0 12px', letterSpacing: '-0.3px' }}>{step.title}</h3>
                <p style={{ fontSize: 13, color: T.text2, lineHeight: 1.75, margin: 0 }}>{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Divider />

      {/* ── TESTIMONIALS ─────────────────────────────────────────── */}
      <section style={{ padding: '120px 32px', background: T.surface }}>
        <div style={{ maxWidth: 1160, margin: '0 auto' }}>
          <motion.p initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ fontSize: 11, fontWeight: 700, color: T.text2, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 64 }}>
            What people say
          </motion.p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 0, borderTop: `1px solid ${T.border}`, borderLeft: `1px solid ${T.border}` }}>
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                whileHover={{ background: 'rgba(255,255,255,0.02)' }}
                style={{ padding: '40px 36px', borderRight: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}`, transition: 'background 0.2s' }}
              >
                <div style={{ display: 'flex', gap: 2, marginBottom: 20 }}>
                  {[...Array(t.stars)].map((_, s) => <Star key={s} size={12} color={T.accent} fill={T.accent} />)}
                </div>
                <p style={{ fontSize: 15, color: T.text, lineHeight: 1.8, margin: '0 0 28px', fontStyle: 'italic' }}>&ldquo;{t.text}&rdquo;</p>
                <div>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: T.text }}>{t.name}</p>
                  <p style={{ margin: '2px 0 0', fontSize: 11, color: T.text2 }}>{t.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Divider />

      {/* ── PRICING ──────────────────────────────────────────────── */}
      <section id="pricing" style={{ padding: '120px 32px' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto' }}>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ marginBottom: 64, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: T.text2, textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 16px' }}>Pricing</p>
              <h2 style={{ fontSize: 'clamp(30px, 4vw, 46px)', fontWeight: 900, letterSpacing: '-1.5px', margin: 0, lineHeight: 1.1 }}>Simple, transparent plans.</h2>
            </div>
            {/* Toggle */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 13, color: T.text2 }}>
              <span style={{ opacity: annual ? 0.5 : 1 }}>Monthly</span>
              <motion.div onClick={() => setAnnual((a) => !a)} style={{ width: 44, height: 24, background: annual ? T.accent : T.surface2, borderRadius: 100, cursor: 'pointer', position: 'relative', border: `1px solid ${T.border}` }}>
                <motion.div animate={{ x: annual ? 22 : 2 }} transition={{ type: 'spring', stiffness: 500, damping: 35 }} style={{ position: 'absolute', top: 2, width: 18, height: 18, borderRadius: '50%', background: '#fff' }} />
              </motion.div>
              <span style={{ opacity: annual ? 1 : 0.5 }}>Annual <span style={{ color: T.green, fontSize: 11, fontWeight: 700 }}>–20%</span></span>
            </div>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', borderTop: `1px solid ${T.border}`, borderLeft: `1px solid ${T.border}` }}>
            {PRICING.map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                style={{ padding: '48px 36px', borderRight: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}`, background: plan.highlight ? T.surface : 'transparent', position: 'relative' }}
              >
                {plan.highlight && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: T.accent }} />}
                <p style={{ fontSize: 11, fontWeight: 700, color: plan.highlight ? T.accent : T.text2, textTransform: 'uppercase', letterSpacing: '0.8px', margin: '0 0 8px' }}>{plan.name}</p>
                <p style={{ fontSize: 12, color: T.text2, margin: '0 0 24px' }}>{plan.desc}</p>
                <p style={{ fontSize: 44, fontWeight: 900, color: T.text, margin: '0 0 4px', letterSpacing: '-2px', fontVariantNumeric: 'tabular-nums' }}>
                  £<AnimatePresence mode="wait"><motion.span key={String(annual)} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>{annual ? plan.annual : plan.monthly}</motion.span></AnimatePresence>
                </p>
                <p style={{ fontSize: 12, color: T.text2, margin: '0 0 32px' }}>per month</p>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 36px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {plan.features.map((f) => (
                    <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: T.text2 }}>
                      <CheckCircle size={13} color={T.accent} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Magnetic>
                  <Link href="/signup" style={{ display: 'block', textAlign: 'center', background: plan.highlight ? T.text : 'transparent', color: plan.highlight ? T.bg : T.text, border: `1px solid ${plan.highlight ? T.text : T.border}`, borderRadius: 8, padding: '12px 0', fontSize: 13, fontWeight: 700, textDecoration: 'none', transition: 'all 0.15s' }}>
                    Get started
                  </Link>
                </Magnetic>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Divider />

      {/* ── ESCALATION SERVICES ──────────────────────────────────── */}
      <section style={{ padding: '120px 32px', background: T.surface }}>
        <div style={{ maxWidth: 1160, margin: '0 auto' }}>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ marginBottom: 72 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: T.text2, textTransform: 'uppercase', letterSpacing: '1px', margin: 0 }}>Escalation Services</p>
              <span style={{ fontSize: 11, color: T.text3, border: `1px solid ${T.border}`, borderRadius: 100, padding: '2px 10px' }}>No subscription required</span>
            </div>
            <h2 style={{ fontSize: 'clamp(30px, 4vw, 46px)', fontWeight: 900, letterSpacing: '-1.5px', margin: '0 0 16px', lineHeight: 1.1 }}>
              They still haven&apos;t paid?<br />Escalate immediately.
            </h2>
            <p style={{ fontSize: 15, color: T.text2, margin: 0, maxWidth: 480, lineHeight: 1.8 }}>
              One-time services for when reminders aren&apos;t enough. Pay once, done in minutes.
            </p>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderTop: `1px solid ${T.border}`, borderLeft: `1px solid ${T.border}` }}>
            {/* Legal Demand */}
            <motion.div
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              style={{ padding: '56px 48px', borderRight: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}`, position: 'relative' }}
            >
              <div style={{ position: 'absolute', top: 0, left: 0, width: 2, height: '100%', background: T.red }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                <div>
                  <span style={{ fontSize: 10, fontWeight: 700, color: T.red, textTransform: 'uppercase', letterSpacing: '0.8px', display: 'block', marginBottom: 8 }}>Step 01</span>
                  <h3 style={{ fontSize: 26, fontWeight: 900, color: T.text, margin: 0, letterSpacing: '-0.5px' }}>Legal Demand Letter</h3>
                </div>
                <Gavel size={20} color={T.red} style={{ marginTop: 4 }} />
              </div>
              <p style={{ fontSize: 14, color: T.text2, lineHeight: 1.8, margin: '0 0 32px' }}>
                A formal statutory demand issued under the Late Payment of Commercial Debts (Interest) Act 1998. Sent as a PDF to your client. Debtors respond to legal language — this isn&apos;t a reminder.
              </p>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 40px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {['Sent to client email with you CC\'d', '7-day ultimatum with CCJ warning', 'Correct statutory interest calculated', 'Solicitor-style A4 letter'].map((f) => (
                  <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: T.text2 }}>
                    <div style={{ width: 4, height: 4, borderRadius: '50%', background: T.red, flexShrink: 0 }} />{f}
                  </li>
                ))}
              </ul>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <span style={{ fontSize: 42, fontWeight: 900, color: T.text, letterSpacing: '-1.5px' }}>£9.99</span>
                  <span style={{ fontSize: 12, color: T.text2, marginLeft: 8 }}>one-time</span>
                </div>
                <Magnetic>
                  <motion.button onClick={() => setEscModal('legal')} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    style={{ background: T.red, border: 'none', borderRadius: 8, padding: '12px 24px', fontSize: 13, fontWeight: 700, color: '#fff', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 8 }}
                  >
                    <Gavel size={14} /> Send now
                  </motion.button>
                </Magnetic>
              </div>
            </motion.div>

            {/* CCJ Pack */}
            <motion.div
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.07 }}
              style={{ padding: '56px 48px', borderRight: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}`, position: 'relative' }}
            >
              <div style={{ position: 'absolute', top: 0, left: 0, width: 2, height: '100%', background: T.purple }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                <div>
                  <span style={{ fontSize: 10, fontWeight: 700, color: T.purple, textTransform: 'uppercase', letterSpacing: '0.8px', display: 'block', marginBottom: 8 }}>Step 02</span>
                  <h3 style={{ fontSize: 26, fontWeight: 900, color: T.text, margin: 0, letterSpacing: '-0.5px' }}>CCJ Preparation Pack</h3>
                </div>
                <Scale size={20} color={T.purple} style={{ marginTop: 4 }} />
              </div>
              <p style={{ fontSize: 14, color: T.text2, lineHeight: 1.8, margin: '0 0 32px' }}>
                Everything you need to file a money claim through Money Claim Online. Pre-written court language, interest schedules, evidence checklist, and step-by-step MCOL guide.
              </p>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 40px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {['Particulars of Claim — ready to paste', 'Statutory interest schedule', 'Evidence checklist', 'MCOL guide + court fee table'].map((f) => (
                  <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: T.text2 }}>
                    <div style={{ width: 4, height: 4, borderRadius: '50%', background: T.purple, flexShrink: 0 }} />{f}
                  </li>
                ))}
              </ul>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <span style={{ fontSize: 42, fontWeight: 900, color: T.text, letterSpacing: '-1.5px' }}>£29</span>
                  <span style={{ fontSize: 12, color: T.text2, marginLeft: 8 }}>one-time</span>
                </div>
                <Magnetic>
                  <motion.button onClick={() => setEscModal('ccj')} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    style={{ background: T.purple, border: 'none', borderRadius: 8, padding: '12px 24px', fontSize: 13, fontWeight: 700, color: '#fff', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 8 }}
                  >
                    <Scale size={14} /> Get pack
                  </motion.button>
                </Magnetic>
              </div>
            </motion.div>
          </div>

          {/* Ladder */}
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
            style={{ marginTop: 32, display: 'flex', alignItems: 'center', gap: 0, borderTop: `1px solid ${T.border}`, borderLeft: `1px solid ${T.border}` }}
          >
            {[
              { label: 'Reminders', color: T.text3 },
              { label: 'Legal Demand', color: T.red },
              { label: 'CCJ Filing', color: T.purple },
              { label: 'Paid', color: T.green },
            ].map((item, i) => (
              <div key={item.label} style={{ flex: 1, padding: '16px 24px', borderRight: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', gap: 10 }}>
                {i > 0 && <ArrowRight size={12} color={T.text3} />}
                <span style={{ fontSize: 12, fontWeight: 700, color: item.color, letterSpacing: '0.2px' }}>{item.label}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      <Divider />

      {/* ── CTA ──────────────────────────────────────────────────── */}
      <section style={{ padding: '160px 32px', textAlign: 'center' }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <motion.div initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <h2 style={{ fontSize: 'clamp(40px, 6vw, 72px)', fontWeight: 900, letterSpacing: '-2.5px', lineHeight: 1.0, margin: '0 0 32px', color: T.text }}>
              Stop chasing.<br />Start enforcing.
            </h2>
            <p style={{ fontSize: 16, color: T.text2, margin: '0 0 48px', lineHeight: 1.8 }}>
              Join freelancers and agencies already recovering what they&apos;re owed — automatically.
            </p>
            <Magnetic>
              <Link href="/signup" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: T.text, color: T.bg, fontSize: 16, fontWeight: 800, padding: '16px 40px', borderRadius: 100, textDecoration: 'none', letterSpacing: '-0.3px' }}>
                Start free — no card needed <ArrowRight size={18} />
              </Link>
            </Magnetic>
          </motion.div>
        </div>
      </section>

      <Divider />

      {/* ── FOOTER ───────────────────────────────────────────────── */}
      <footer style={{ padding: '64px 32px', background: T.surface }}>
        <div style={{ maxWidth: 1160, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 48, marginBottom: 64 }}>
            <div>
              <div style={{ marginBottom: 16 }}>
                <Logo size={24} />
              </div>
              <p style={{ fontSize: 13, color: T.text2, lineHeight: 1.85, maxWidth: 220, margin: '0 0 20px' }}>
                UK late payment enforcement for freelancers and agencies.
              </p>
              <div style={{ display: 'flex', gap: 8 }}>
                {['UK Law', 'GDPR Safe'].map((b) => (
                  <span key={b} style={{ fontSize: 10, fontWeight: 700, color: T.text3, border: `1px solid ${T.border}`, padding: '3px 10px', borderRadius: 100, letterSpacing: '0.3px' }}>{b}</span>
                ))}
              </div>
            </div>
            {[
              { title: 'Product', links: ['Features', 'Pricing', 'How It Works'] },
              { title: 'Legal', links: ['Privacy Policy', 'Terms of Service'] },
              { title: 'Company', links: ['About', 'Contact', 'hello@irvo.co.uk'] },
            ].map(({ title, links }) => (
              <div key={title}>
                <h4 style={{ color: T.text3, fontWeight: 700, fontSize: 10, marginBottom: 20, letterSpacing: '0.8px', textTransform: 'uppercase' }}>{title}</h4>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {links.map((item) => (
                    <li key={item}>
                      <motion.a href="#" whileHover={{ color: T.text }} style={{ color: T.text2, textDecoration: 'none', fontSize: 13, display: 'inline-block', transition: 'color 0.15s' }}>{item}</motion.a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 24, display: 'flex', justifyContent: 'space-between' }}>
            <p style={{ color: T.text3, fontSize: 12, margin: 0 }}>© {new Date().getFullYear()} Irvo. All rights reserved.</p>
            <p style={{ color: T.text3, fontSize: 12, margin: 0 }}>irvo.co.uk</p>
          </div>
        </div>
      </footer>

      {/* ── Escalation modal ─────────────────────────────────────── */}
      <AnimatePresence>
        {escModal && <EscalationModal service={escModal} onClose={() => setEscModal(null)} />}
      </AnimatePresence>
    </div>
  )
}
