'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import {
  motion, useScroll, useTransform, useSpring, useInView,
  useMotionValue, animate, AnimatePresence,
} from 'framer-motion'
import {
  Shield, Clock, TrendingUp, FileText, CheckCircle,
  ArrowRight, Zap, Lock, BarChart3, Star, Menu, X,
  ChevronRight, Sparkles, BadgeCheck, Gavel, Scale, AlertTriangle,
} from 'lucide-react'

/* ─── helpers ─────────────────────────────────────────────────── */
function useCursor() {
  const x = useMotionValue(-200)
  const y = useMotionValue(-200)
  const sx = useSpring(x, { stiffness: 120, damping: 20 })
  const sy = useSpring(y, { stiffness: 120, damping: 20 })
  useEffect(() => {
    const move = (e: MouseEvent) => { x.set(e.clientX); y.set(e.clientY) }
    window.addEventListener('mousemove', move)
    return () => window.removeEventListener('mousemove', move)
  }, [])
  return { sx, sy }
}

function AnimCount({ to, prefix = '', suffix = '', duration = 2 }: { to: number; prefix?: string; suffix?: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })
  const val = useMotionValue(0)
  const [display, setDisplay] = useState('0')
  useEffect(() => {
    if (!inView) return
    const ctrl = animate(val, to, { duration, ease: 'easeOut' })
    const unsub = val.on('change', (v) => setDisplay(`${prefix}${Math.round(v).toLocaleString()}${suffix}`))
    return () => { ctrl.stop(); unsub() }
  }, [inView])
  return <span ref={ref}>{display}</span>
}

/* ─── data ────────────────────────────────────────────────────── */
const NAV = ['Features', 'How It Works', 'Pricing']

const FEATURES = [
  { icon: Clock, title: 'Automated Invoice Tracking', desc: 'Every invoice tracked in real time. Overdue detection runs daily — no manual chasing.', color: '#47c9e5' },
  { icon: TrendingUp, title: 'Statutory Interest Engine', desc: '8% above BoE base rate. Fixed £40–£100 compensation per invoice. Fully UK law-compliant.', color: '#36bd5f' },
  { icon: Zap, title: 'Payment Intelligence', desc: 'AI scores each client 0–100 for payment risk. Predicts when you\'ll actually get paid.', color: '#e2b742' },
  { icon: Shield, title: '4-Stage Reminder Pipeline', desc: 'Polite before due, legal language when overdue. Sent automatically on your behalf.', color: '#47c9e5' },
  { icon: FileText, title: 'Evidence Pack Generator', desc: 'One-click PDF packs for debt collectors, accountants, or small claims court.', color: '#937fd5' },
  { icon: BarChart3, title: '90-Day Cashflow Forecast', desc: 'See exactly what\'s coming in. Plan your business with confidence, not guesswork.', color: '#e54747' },
]

const STEPS = [
  { n: '01', title: 'Connect Your Invoices', desc: 'Upload CSV or add manually in seconds.', icon: FileText },
  { n: '02', title: 'Reminders Run Automatically', desc: 'Staged sequences sent on your behalf.', icon: Zap },
  { n: '03', title: 'Interest Calculated Daily', desc: 'Statutory interest & compensation tracked.', icon: TrendingUp },
  { n: '04', title: 'Evidence Ready to Go', desc: 'Professional PDF packs, one click.', icon: Shield },
]

const PRICING = [
  {
    name: 'Starter', monthly: 19, annual: 15, desc: 'For solo freelancers',
    features: ['50 invoices/month', 'Automated reminders', 'Interest calculator', 'Evidence packs', 'Email support'],
    color: '#47c9e5',
  },
  {
    name: 'Studio', monthly: 69, annual: 55, desc: 'For small agencies', highlight: true,
    features: ['Unlimited invoices', 'Multiple clients', 'CSV import', 'Payment intelligence', 'Priority support'],
    color: '#47c9e5',
  },
  {
    name: 'Firm', monthly: 149, annual: 119, desc: 'For accountants',
    features: ['Everything in Studio', 'Multi-organisation', 'API access', 'White-label reports', 'Dedicated support'],
    color: '#937fd5',
  },
]

const TESTIMONIALS = [
  { name: 'Sarah K.', role: 'Freelance Designer', text: 'Recovered £3,800 in overdue invoices within the first month. The automated reminders are firm but professional.', stars: 5 },
  { name: 'James T.', role: 'Web Development Agency', text: 'We had 12 clients with outstanding invoices. Irvo chased them all without us lifting a finger.', stars: 5 },
  { name: 'Priya M.', role: 'Marketing Consultant', text: 'The evidence pack feature is incredible. My accountant couldn\'t believe the quality of the PDF it generates.', stars: 5 },
  { name: 'Tom R.', role: 'Photographer', text: 'I used to avoid chasing payments because it felt awkward. Now it just happens. I\'ve been paid on time 4 months running.', stars: 5 },
  { name: 'Claire B.', role: 'Copywriter', text: 'The statutory interest calculator alone has recovered £600 in compensation fees I didn\'t know I was owed.', stars: 5 },
  { name: 'Marcus W.', role: 'UX Consultant', text: 'Setup took 3 minutes. My average payment time dropped from 47 days to 19 days in 6 weeks.', stars: 5 },
]

const INVOICE_FEED = [
  { inv: 'INV-284', client: 'Meridian Digital', amount: '£4,200', event: 'Reminder sent', color: '#47c9e5' },
  { inv: 'INV-271', client: 'Foxmoor Agency', amount: '£1,850', event: 'Interest calculated', color: '#e2b742' },
  { inv: 'INV-268', client: 'Apex Creative', amount: '£7,500', event: 'Evidence pack ready', color: '#36bd5f' },
  { inv: 'INV-259', client: 'Thornhill Co.', amount: '£920', event: 'Payment received', color: '#36bd5f' },
  { inv: 'INV-251', client: 'NovaSpark Ltd', amount: '£3,300', event: 'Escalation triggered', color: '#e54747' },
]

const STATS = [
  { to: 2400, prefix: '£', suffix: '', label: 'Average recovered per user/year' },
  { to: 14, prefix: '', suffix: ' days', label: 'Reduction in payment time' },
  { to: 94, prefix: '', suffix: '%', label: 'Reminder open rate' },
  { to: 3, prefix: '', suffix: ' mins', label: 'To set up first invoice' },
]

/* ─── components ──────────────────────────────────────────────── */
function TiltCard({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const rotX = useSpring(0, { stiffness: 300, damping: 30 })
  const rotY = useSpring(0, { stiffness: 300, damping: 30 })
  const scale = useSpring(1, { stiffness: 300, damping: 30 })

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = ref.current!.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    rotY.set(((e.clientX - cx) / rect.width) * 14)
    rotX.set(-((e.clientY - cy) / rect.height) * 14)
    scale.set(1.02)
  }
  const onLeave = () => { rotX.set(0); rotY.set(0); scale.set(1) }

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ rotateX: rotX, rotateY: rotY, scale, transformStyle: 'preserve-3d' }}
    >
      {children}
    </motion.div>
  )
}

function InvoiceMockup() {
  const [activeIdx, setActiveIdx] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setActiveIdx((i) => (i + 1) % INVOICE_FEED.length), 2200)
    return () => clearInterval(t)
  }, [])

  return (
    <div style={{
      background: '#1a1a1a', borderRadius: 16, border: '1px solid rgba(255,255,255,0.08)',
      overflow: 'hidden', boxShadow: '0 40px 100px rgba(0,0,0,0.6), 0 0 0 1px rgba(71,201,229,0.05)',
      fontFamily: "'Raleway', sans-serif",
    }}>
      {/* Window chrome */}
      <div style={{ background: '#141414', padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 8 }}>
        {['#e54747', '#e2b742', '#36bd5f'].map((c) => (
          <div key={c} style={{ width: 11, height: 11, borderRadius: '50%', background: c }} />
        ))}
        <div style={{ marginLeft: 12, background: 'rgba(255,255,255,0.06)', borderRadius: 6, padding: '4px 14px', fontSize: 11, color: '#5e5e5e' }}>
          app.irvo.co.uk/dashboard
        </div>
      </div>

      {/* KPIs */}
      <div style={{ padding: '20px 20px 0', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
        {[
          { label: 'Outstanding', value: '£18,420', c: '#e54747' },
          { label: 'Overdue', value: '7 invoices', c: '#e2b742' },
          { label: 'Recoverable', value: '£2,310', c: '#36bd5f' },
        ].map(({ label, value, c }) => (
          <div key={label} style={{ background: '#222', borderRadius: 8, padding: '10px 12px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <p style={{ fontSize: 10, color: '#5e5e5e', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.4px', fontWeight: 700 }}>{label}</p>
            <p style={{ fontSize: 14, fontWeight: 800, color: c, margin: 0 }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Live invoice feed */}
      <div style={{ padding: '16px 20px 0' }}>
        <p style={{ fontSize: 10, color: '#4e4e4e', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 700, marginBottom: 10 }}>Live Activity</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {INVOICE_FEED.map((item, i) => (
            <AnimatePresence key={item.inv} mode="popLayout">
              {i <= activeIdx && (
                <motion.div
                  initial={{ opacity: 0, x: 20, height: 0 }}
                  animate={{ opacity: 1, x: 0, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '8px 12px', background: '#222', borderRadius: 8,
                    border: `1px solid ${item.color}22`,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: item.color, flexShrink: 0 }} />
                    <div>
                      <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: '#e3e3e3' }}>{item.inv} · {item.client}</p>
                      <p style={{ margin: 0, fontSize: 10, color: '#5e5e5e' }}>{item.event}</p>
                    </div>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 800, color: item.color }}>{item.amount}</span>
                </motion.div>
              )}
            </AnimatePresence>
          ))}
        </div>
      </div>

      {/* Reminder notification pop */}
      <div style={{ padding: '14px 20px 20px' }}>
        <motion.div
          animate={{ y: [0, -2, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          style={{ background: 'rgba(71,201,229,0.08)', border: '1px solid rgba(71,201,229,0.2)', borderRadius: 8, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10 }}
        >
          <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }}>
            <Zap size={14} color="#47c9e5" />
          </motion.div>
          <div>
            <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: '#47c9e5' }}>Intelligence Alert</p>
            <p style={{ margin: 0, fontSize: 10, color: '#7e7e7e' }}>Apex Creative: payment predicted 8 days late</p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

function TestimonialMarquee() {
  return (
    <div style={{ overflow: 'hidden', maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)' }}>
      <motion.div
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 35, repeat: Infinity, ease: 'linear' }}
        style={{ display: 'flex', gap: 20, width: 'max-content' }}
      >
        {[...TESTIMONIALS, ...TESTIMONIALS].map((t, i) => (
          <div key={i} style={{
            width: 320, flexShrink: 0, background: '#1e1e1e', border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 12, padding: '24px 28px',
          }}>
            <div style={{ display: 'flex', gap: 3, marginBottom: 14 }}>
              {[...Array(t.stars)].map((_, s) => <Star key={s} size={13} color="#e2b742" fill="#e2b742" />)}
            </div>
            <p style={{ fontSize: 13, color: '#aaaaaa', lineHeight: 1.8, margin: '0 0 18px' }}>"{t.text}"</p>
            <div>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#e3e3e3' }}>{t.name}</p>
              <p style={{ margin: 0, fontSize: 11, color: '#5e5e5e' }}>{t.role}</p>
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  )
}

/* ─── main page ───────────────────────────────────────────────── */
/* ─── escalation modal ────────────────────────────────────────── */
type EscService = 'legal' | 'ccj'

interface EscForm {
  creditorName: string; creditorEmail: string
  clientName: string; clientEmail: string; clientCompany: string
  invoiceNumber: string; invoiceAmount: string; invoiceDate: string; dueDate: string
  description: string
}

const ESC_EMPTY: EscForm = { creditorName: '', creditorEmail: '', clientName: '', clientEmail: '', clientCompany: '', invoiceNumber: '', invoiceAmount: '', invoiceDate: '', dueDate: '', description: '' }

function Field({ label, value, onChange, type = 'text', placeholder, required }: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string; required?: boolean }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <label style={{ fontSize: 10, fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        {label}{required && <span style={{ color: '#e54747' }}> *</span>}
      </label>
      <input
        type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        style={{ background: '#0e0e0e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '10px 13px', fontSize: 13, color: '#e3e3e3', outline: 'none', fontFamily: 'inherit', width: '100%', boxSizing: 'border-box' }}
        onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(71,201,229,0.4)' }}
        onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)' }}
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
  const accent = isLegal ? '#e54747' : '#a78bfa'
  const price = isLegal ? '£9.99' : '£29'
  const endpoint = isLegal ? '/api/public/legal-demand' : '/api/public/ccj-pack'

  const submit = async () => {
    setError(null)
    const required: (keyof EscForm)[] = ['creditorName', 'creditorEmail', 'clientName', 'invoiceNumber', 'invoiceAmount', 'invoiceDate', 'dueDate']
    if (isLegal) required.push('clientEmail')
    const missing = required.filter((k) => !form[k].trim())
    if (missing.length) { setError('Please fill in all required fields.'); return }
    setLoading(true)
    try {
      const res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) }).then((r) => r.json())
      if (res.url) window.location.href = res.url
      else setError(res.error ?? 'Something went wrong. Please try again.')
    } catch { setError('Network error. Please try again.') }
    setLoading(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, overflowY: 'auto' }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.93, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 280, damping: 26 }}
        onClick={(e) => e.stopPropagation()}
        style={{ background: '#121212', border: `1px solid ${accent}30`, borderRadius: 16, padding: 32, maxWidth: 600, width: '100%', fontFamily: "'Raleway', sans-serif", position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}
      >
        {/* Top bar */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${accent}, transparent)`, borderRadius: '16px 16px 0 0' }} />
        <motion.button onClick={onClose} whileHover={{ rotate: 90 }} style={{ position: 'absolute', top: 14, right: 14, background: 'transparent', border: 'none', cursor: 'pointer', color: '#555', display: 'flex', padding: 4, borderRadius: '50%' }}>
          <X size={16} />
        </motion.button>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: `${accent}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            {isLegal ? <Gavel size={24} color={accent} /> : <Scale size={24} color={accent} />}
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#fff' }}>
              {isLegal ? 'Send Legal Demand Letter' : 'Generate CCJ Preparation Pack'}
            </h2>
            <p style={{ margin: '3px 0 0', fontSize: 12, color: '#555' }}>
              {isLegal ? 'No account needed — sent directly to your client' : 'No account needed — pack emailed to you instantly'}
              {' · '}<span style={{ color: accent, fontWeight: 700 }}>{price}</span>
            </p>
          </div>
        </div>

        {/* Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Creditor */}
          <div>
            <p style={{ fontSize: 10, fontWeight: 800, color: '#444', textTransform: 'uppercase', letterSpacing: '0.8px', margin: '0 0 10px' }}>Your Details (Creditor)</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="Your Name / Business" value={form.creditorName} onChange={set('creditorName')} placeholder="e.g. Jane Smith Design" required />
              <Field label="Your Email" value={form.creditorEmail} onChange={set('creditorEmail')} type="email" placeholder="jane@example.com" required />
            </div>
          </div>

          {/* Client */}
          <div>
            <p style={{ fontSize: 10, fontWeight: 800, color: '#444', textTransform: 'uppercase', letterSpacing: '0.8px', margin: '0 0 10px' }}>Client Details (Debtor)</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="Client Name" value={form.clientName} onChange={set('clientName')} placeholder="e.g. John Williams" required />
              <Field label={isLegal ? 'Client Email' : 'Client Email (optional)'} value={form.clientEmail} onChange={set('clientEmail')} type="email" placeholder="john@company.com" required={isLegal} />
            </div>
            <div style={{ marginTop: 12 }}>
              <Field label="Client Company (optional)" value={form.clientCompany} onChange={set('clientCompany')} placeholder="e.g. Acme Ltd" />
            </div>
          </div>

          {/* Invoice */}
          <div>
            <p style={{ fontSize: 10, fontWeight: 800, color: '#444', textTransform: 'uppercase', letterSpacing: '0.8px', margin: '0 0 10px' }}>Invoice Details</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              <Field label="Invoice Number" value={form.invoiceNumber} onChange={set('invoiceNumber')} placeholder="INV-001" required />
              <Field label="Amount (£)" value={form.invoiceAmount} onChange={set('invoiceAmount')} type="number" placeholder="2500" required />
              <Field label="Invoice Date" value={form.invoiceDate} onChange={set('invoiceDate')} type="date" required />
            </div>
            <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="Payment Due Date" value={form.dueDate} onChange={set('dueDate')} type="date" required />
              <Field label="Services Description (optional)" value={form.description} onChange={set('description')} placeholder="e.g. Web design services" />
            </div>
          </div>

          {/* What you get */}
          <div style={{ background: `${accent}08`, border: `1px solid ${accent}20`, borderRadius: 10, padding: '14px 16px' }}>
            <p style={{ margin: '0 0 8px', fontSize: 10, fontWeight: 800, color: '#444', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {isLegal ? 'What your client receives' : 'What you receive'}
            </p>
            {(isLegal ? [
              'Formal A4 PDF demand letter with statutory legal language',
              'Sent directly to client email with you CC\'d',
              '7-day payment ultimatum with CCJ warning',
              'Correct Late Payment Act 1998 interest calculation',
            ] : [
              'Pre-written Particulars of Claim for the N1 court form',
              'Statutory interest calculation schedule',
              'Evidence checklist (what to attach to your claim)',
              'Step-by-step MCOL filing guide + court fee table',
            ]).map((item) => (
              <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 5 }}>
                <CheckCircle size={12} color={accent} style={{ marginTop: 2, flexShrink: 0 }} />
                <span style={{ fontSize: 12, color: '#888', lineHeight: 1.5 }}>{item}</span>
              </div>
            ))}
          </div>

          {error && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ fontSize: 12, color: '#e54747', background: 'rgba(229,71,71,0.08)', border: '1px solid rgba(229,71,71,0.2)', padding: '10px 14px', borderRadius: 8, margin: 0 }}>
              {error}
            </motion.p>
          )}

          <motion.button
            onClick={submit} disabled={loading}
            whileHover={{ scale: 1.02, boxShadow: `0 0 30px ${accent}50` }}
            whileTap={{ scale: 0.97 }}
            style={{ width: '100%', background: loading ? `${accent}80` : accent, border: 'none', borderRadius: 100, padding: '14px 0', fontSize: 14, fontWeight: 800, color: '#fff', cursor: loading ? 'default' : 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          >
            {isLegal ? <Gavel size={16} /> : <Scale size={16} />}
            {loading ? 'Preparing checkout…' : `Confirm & Pay ${price}`}
          </motion.button>
          <p style={{ fontSize: 11, color: '#3a3a3a', textAlign: 'center', margin: 0 }}>
            Secure checkout via Stripe · PDF generated and sent within minutes of payment
          </p>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function LandingPage() {
  const { sx, sy } = useCursor()
  const [annual, setAnnual] = useState(false)
  const [mobileMenu, setMobileMenu] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [escModal, setEscModal] = useState<EscService | null>(null)
  const heroRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 })
  const featuresRef = useRef<HTMLDivElement>(null)
  const stepsRef = useRef<HTMLDivElement>(null)
  const pricingRef = useRef<HTMLDivElement>(null)
  const statsRef = useRef<HTMLDivElement>(null)

  const featuresInView = useInView(featuresRef, { once: true, margin: '-80px' })
  const stepsInView = useInView(stepsRef, { once: true, margin: '-80px' })
  const statsInView = useInView(statsRef, { once: true, margin: '-80px' })

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, -60])

  return (
    <div style={{ fontFamily: "'Raleway', Helvetica, Arial, sans-serif", background: '#111', color: '#8d8d8d', overflowX: 'hidden' }}>

      {/* ── Cursor glow ─────────────────────────────────────── */}
      <motion.div
        style={{
          position: 'fixed', top: 0, left: 0, pointerEvents: 'none', zIndex: 9999,
          x: sx, y: sy,
          translateX: '-50%', translateY: '-50%',
          width: 400, height: 400, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(71,201,229,0.06) 0%, transparent 70%)',
        }}
      />

      {/* ── Scroll progress bar ──────────────────────────────── */}
      <motion.div
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, height: 2, zIndex: 200,
          background: 'linear-gradient(90deg, #47c9e5, #309bee)',
          scaleX, transformOrigin: '0%',
        }}
      />

      {/* ── NAV ─────────────────────────────────────────────── */}
      <motion.header
        animate={{ background: scrolled ? 'rgba(17,17,17,0.92)' : 'transparent', backdropFilter: scrolled ? 'blur(20px)' : 'none', borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : '1px solid transparent' }}
        transition={{ duration: 0.3 }}
        style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100 }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 72 }}>
          {/* Logo */}
          <motion.div whileHover={{ scale: 1.04 }} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
            <motion.div animate={{ rotate: [0, 8, -5, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}>
              <Shield size={24} color="#47c9e5" />
            </motion.div>
            <span style={{ fontWeight: 800, fontSize: 18, color: '#ffffff', letterSpacing: '-0.3px' }}>Irvo</span>
          </motion.div>

          {/* Desktop nav */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: 36 }}>
            {NAV.map((item) => (
              <motion.a
                key={item}
                href={`#${item.toLowerCase().replace(' ', '-')}`}
                whileHover={{ color: '#47c9e5', y: -1 }}
                style={{ color: '#7e7e7e', textDecoration: 'none', fontSize: 14, fontWeight: 600, transition: 'color 0.2s' }}
              >
                {item}
              </motion.a>
            ))}
            <Link href="/login" style={{ color: '#7e7e7e', textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>Sign In</Link>
            <motion.div whileHover={{ scale: 1.04, boxShadow: '0 0 24px rgba(71,201,229,0.4)' }} whileTap={{ scale: 0.97 }}>
              <Link href="/signup" style={{ background: '#47c9e5', color: '#fff', textDecoration: 'none', fontSize: 13, fontWeight: 700, padding: '11px 26px', borderRadius: 100, display: 'inline-block', letterSpacing: '0.2px' }}>
                Get Started Free
              </Link>
            </motion.div>
          </nav>
        </div>
      </motion.header>

      {/* ── HERO ────────────────────────────────────────────── */}
      <section ref={heroRef} style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', position: 'relative', overflow: 'hidden', paddingTop: 72 }}>

        {/* Background orbs */}
        <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.25, 0.15] }} transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          style={{ position: 'absolute', top: '-20%', left: '-10%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, #47c9e5 0%, transparent 70%)', pointerEvents: 'none' }} />
        <motion.div animate={{ scale: [1, 1.15, 1], opacity: [0.08, 0.15, 0.08] }} transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          style={{ position: 'absolute', bottom: '-10%', right: '-5%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, #309bee 0%, transparent 70%)', pointerEvents: 'none' }} />
        <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.05, 0.12, 0.05] }} transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
          style={{ position: 'absolute', top: '40%', left: '40%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, #937fd5 0%, transparent 70%)', pointerEvents: 'none' }} />

        {/* Grid lines */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} />

        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center', width: '100%' }}>
          {/* Left */}
          <motion.div style={{ y: heroY }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(71,201,229,0.1)', border: '1px solid rgba(71,201,229,0.25)', borderRadius: 100, padding: '8px 18px', marginBottom: 32 }}
            >
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}>
                <Sparkles size={13} color="#47c9e5" />
              </motion.div>
              <span style={{ color: '#47c9e5', fontSize: 12, fontWeight: 700, letterSpacing: '0.6px' }}>UK LATE PAYMENT RIGHTS AUTOMATION</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65, delay: 0.1 }}
              style={{ fontSize: 64, fontWeight: 800, color: '#ffffff', lineHeight: 1.1, margin: '0 0 24px', letterSpacing: '-1.5px' }}
            >
              Stop Letting Late<br />
              <span style={{
                background: 'linear-gradient(135deg, #47c9e5 0%, #309bee 50%, #937fd5 100%)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>
                Payments Slide.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
              style={{ fontSize: 18, color: '#7e7e7e', lineHeight: 1.85, margin: '0 0 40px', maxWidth: 480 }}
            >
              Freelancers and agencies lose <strong style={{ color: '#e3e3e3' }}>thousands every year</strong> to late B2B payments. Irvo automates every step — from reminder to legal escalation.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
              style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 32 }}
            >
              <motion.div whileHover={{ scale: 1.04, boxShadow: '0 0 40px rgba(71,201,229,0.45)' }} whileTap={{ scale: 0.97 }}>
                <Link href="/signup" style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  background: 'linear-gradient(135deg, #47c9e5, #309bee)',
                  color: '#fff', textDecoration: 'none', fontSize: 15, fontWeight: 700,
                  padding: '16px 36px', borderRadius: 100,
                }}>
                  Start Free Trial <ArrowRight size={16} />
                </Link>
              </motion.div>
              <motion.a
                href="#how-it-works"
                whileHover={{ color: '#e3e3e3', borderColor: 'rgba(255,255,255,0.3)' }}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#7e7e7e', textDecoration: 'none', fontSize: 15, fontWeight: 600, padding: '16px 28px', borderRadius: 100, border: '1px solid rgba(255,255,255,0.1)', transition: 'all 0.25s' }}
              >
                See how it works <ChevronRight size={15} />
              </motion.a>
            </motion.div>

            {/* Trust signals */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
              {[
                { icon: BadgeCheck, text: 'UK Law Compliant' },
                { icon: Lock, text: 'No credit card' },
                { icon: CheckCircle, text: 'Cancel anytime' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Icon size={14} color="#47c9e5" />
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#5e5e5e' }}>{text}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right: floating mockup */}
          <motion.div
            initial={{ opacity: 0, x: 40, y: 20 }} animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{ position: 'relative' }}
          >
            {/* Glow behind card */}
            <div style={{ position: 'absolute', inset: -40, background: 'radial-gradient(ellipse, rgba(71,201,229,0.12) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              style={{ position: 'relative' }}
            >
              <InvoiceMockup />
            </motion.div>

            {/* Floating badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.2, duration: 0.4 }}
              style={{ position: 'absolute', top: -20, right: -20, background: '#1e1e1e', border: '1px solid rgba(54,189,95,0.3)', borderRadius: 12, padding: '10px 16px', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}
            >
              <p style={{ margin: 0, fontSize: 11, color: '#5e5e5e', fontWeight: 700 }}>INTEREST ACCRUED</p>
              <p style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#36bd5f' }}>+£847</p>
            </motion.div>

            {/* Floating badge 2 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.5, duration: 0.4 }}
              style={{ position: 'absolute', bottom: -16, left: -20, background: '#1e1e1e', border: '1px solid rgba(71,201,229,0.3)', borderRadius: 12, padding: '10px 16px', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}
            >
              <p style={{ margin: 0, fontSize: 11, color: '#5e5e5e', fontWeight: 700 }}>REMINDERS SENT TODAY</p>
              <p style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#47c9e5' }}>14 automatic</p>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 8, 0], opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{ position: 'absolute', bottom: 40, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, color: '#3e3e3e' }}
        >
          <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.5px' }}>SCROLL</span>
          <div style={{ width: 1, height: 40, background: 'linear-gradient(to bottom, #3e3e3e, transparent)' }} />
        </motion.div>
      </section>

      {/* ── STATS ───────────────────────────────────────────── */}
      <section ref={statsRef} style={{ background: 'linear-gradient(135deg, #47c9e5 0%, #309bee 100%)', padding: '64px 32px' }}>
        <motion.div
          initial="hidden" animate={statsInView ? 'visible' : 'hidden'}
          variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
          style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 24, textAlign: 'center' }}
        >
          {STATS.map(({ to, prefix, suffix, label }) => (
            <motion.div key={label} variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } }}>
              <div style={{ fontSize: 40, fontWeight: 800, color: '#fff', lineHeight: 1.2, letterSpacing: '-1px' }}>
                <AnimCount to={to} prefix={prefix} suffix={suffix} />
              </div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 6, fontWeight: 600 }}>{label}</div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── LEGAL CALLOUT ────────────────────────────────────── */}
      <section style={{ background: '#111', padding: '90px 32px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)', backgroundSize: '40px 40px', pointerEvents: 'none' }} />
        <motion.div
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6 }}
          style={{ maxWidth: 680, margin: '0 auto', position: 'relative' }}
        >
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(147,127,213,0.12)', border: '1px solid rgba(147,127,213,0.2)', borderRadius: 100, padding: '7px 16px', marginBottom: 24 }}>
            <BadgeCheck size={13} color="#937fd5" />
            <span style={{ color: '#937fd5', fontSize: 12, fontWeight: 700, letterSpacing: '0.5px' }}>LEGALLY PROTECTED RIGHTS</span>
          </div>
          <h2 style={{ fontSize: 36, fontWeight: 800, color: '#ffffff', marginBottom: 20, letterSpacing: '-0.5px' }}>The Law Is On Your Side</h2>
          <p style={{ fontSize: 15, lineHeight: 1.95, color: '#7e7e7e' }}>
            Under the <strong style={{ color: '#e3e3e3' }}>Late Payment of Commercial Debts Act 1998</strong>, you are legally entitled to charge statutory interest at{' '}
            <strong style={{ color: '#47c9e5' }}>8% above the Bank of England base rate</strong>, plus fixed compensation of{' '}
            <strong style={{ color: '#47c9e5' }}>£40–£100 per invoice</strong>.<br /><br />
            Most freelancers <em>never claim it</em>. Irvo does it automatically.
          </p>
        </motion.div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────── */}
      <section id="features" ref={featuresRef} style={{ background: '#0e0e0e', padding: '100px 32px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, y: 24 }} animate={featuresInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }}
            style={{ textAlign: 'center', marginBottom: 64 }}
          >
            <h2 style={{ fontSize: 40, fontWeight: 800, color: '#ffffff', marginBottom: 14, letterSpacing: '-0.8px' }}>Everything You Need to Get Paid</h2>
            <p style={{ fontSize: 15, color: '#5e5e5e', maxWidth: 480, margin: '0 auto' }}>One platform. No complexity. Built specifically for UK freelancers and agencies.</p>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
            {FEATURES.map(({ icon: Icon, title, desc, color }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 30 }}
                animate={featuresInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.08 }}
              >
                <TiltCard>
                  <motion.div
                    whileHover={{ borderColor: `${color}44`, boxShadow: `0 0 40px ${color}15, 0 20px 60px rgba(0,0,0,0.4)` }}
                    transition={{ duration: 0.25 }}
                    style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: 32, height: '100%', cursor: 'default' }}
                  >
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                      style={{ width: 52, height: 52, background: `${color}18`, border: `1px solid ${color}30`, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 22 }}
                    >
                      <Icon size={22} color={color} />
                    </motion.div>
                    <h3 style={{ fontSize: 17, fontWeight: 800, color: '#ffffff', marginBottom: 10, letterSpacing: '-0.2px' }}>{title}</h3>
                    <p style={{ fontSize: 13, lineHeight: 1.9, color: '#5e5e5e', margin: 0 }}>{desc}</p>
                  </motion.div>
                </TiltCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────── */}
      <section id="how-it-works" ref={stepsRef} style={{ background: '#111', padding: '100px 32px', position: 'relative', overflow: 'hidden' }}>
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
          style={{ position: 'absolute', top: '-30%', right: '-20%', width: 600, height: 600, borderRadius: '50%', border: '1px solid rgba(71,201,229,0.04)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, y: 24 }} animate={stepsInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }}
            style={{ textAlign: 'center', marginBottom: 72 }}
          >
            <h2 style={{ fontSize: 40, fontWeight: 800, color: '#fff', marginBottom: 14, letterSpacing: '-0.8px' }}>How It Works</h2>
            <p style={{ fontSize: 15, color: '#5e5e5e', maxWidth: 420, margin: '0 auto' }}>Set up in minutes. Enforcement runs on autopilot forever after.</p>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 0, position: 'relative' }}>
            {/* Connector line */}
            <div style={{ position: 'absolute', top: 36, left: '12.5%', right: '12.5%', height: 1, background: 'rgba(255,255,255,0.06)', zIndex: 0 }}>
              <motion.div
                initial={{ scaleX: 0 }}
                animate={stepsInView ? { scaleX: 1 } : {}}
                transition={{ duration: 1.5, delay: 0.4, ease: 'easeOut' }}
                style={{ height: '100%', background: 'linear-gradient(90deg, #47c9e5, #309bee)', transformOrigin: '0%' }}
              />
            </div>

            {STEPS.map(({ n, title, desc, icon: Icon }, i) => (
              <motion.div
                key={n}
                initial={{ opacity: 0, y: 30 }}
                animate={stepsInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.3 + i * 0.12 }}
                style={{ textAlign: 'center', padding: '0 20px', position: 'relative', zIndex: 1 }}
              >
                <motion.div
                  whileHover={{ scale: 1.1, boxShadow: '0 0 30px rgba(71,201,229,0.3)' }}
                  style={{ width: 72, height: 72, borderRadius: '50%', background: '#1a1a1a', border: '2px solid rgba(71,201,229,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}
                >
                  <Icon size={26} color="#47c9e5" />
                </motion.div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#47c9e5', letterSpacing: '1px', marginBottom: 8 }}>{n}</div>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: '#fff', marginBottom: 10, letterSpacing: '-0.2px' }}>{title}</h3>
                <p style={{ fontSize: 13, color: '#5e5e5e', lineHeight: 1.9, margin: 0 }}>{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────────────── */}
      <section style={{ background: '#0e0e0e', padding: '100px 0' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 32px', textAlign: 'center', marginBottom: 56 }}>
          <motion.h2
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            style={{ fontSize: 40, fontWeight: 800, color: '#ffffff', marginBottom: 12, letterSpacing: '-0.8px' }}
          >
            Loved by Freelancers & Agencies
          </motion.h2>
          <p style={{ fontSize: 15, color: '#5e5e5e' }}>Real people, real payments, real results.</p>
        </div>
        <TestimonialMarquee />
      </section>

      {/* ── PRICING ──────────────────────────────────────────── */}
      <section id="pricing" ref={pricingRef} style={{ background: '#111', padding: '100px 32px' }}>
        <div style={{ maxWidth: 1060, margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }}
            style={{ textAlign: 'center', marginBottom: 56 }}
          >
            <h2 style={{ fontSize: 40, fontWeight: 800, color: '#ffffff', marginBottom: 12, letterSpacing: '-0.8px' }}>Simple, Transparent Pricing</h2>
            <p style={{ fontSize: 15, color: '#5e5e5e', marginBottom: 28 }}>Recover one late invoice and it pays for itself.</p>
            {/* Toggle */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 14, background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 100, padding: '6px 8px' }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: annual ? '#5e5e5e' : '#e3e3e3', padding: '0 10px', transition: 'color 0.2s' }}>Monthly</span>
              <motion.div
                onClick={() => setAnnual(!annual)}
                style={{ width: 44, height: 24, borderRadius: 100, background: annual ? '#47c9e5' : 'rgba(255,255,255,0.1)', cursor: 'pointer', position: 'relative', transition: 'background 0.3s' }}
              >
                <motion.div
                  animate={{ x: annual ? 20 : 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  style={{ position: 'absolute', top: 3, left: 3, width: 18, height: 18, borderRadius: '50%', background: '#fff' }}
                />
              </motion.div>
              <span style={{ fontSize: 13, fontWeight: 700, color: annual ? '#e3e3e3' : '#5e5e5e', padding: '0 10px', transition: 'color 0.2s' }}>
                Annual <span style={{ color: '#36bd5f', fontSize: 11 }}>-20%</span>
              </span>
            </div>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
            {PRICING.map(({ name, monthly, annual: ann, desc, features, highlight, color }, i) => (
              <motion.div
                key={name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ y: -6, boxShadow: highlight ? '0 24px 80px rgba(71,201,229,0.2)' : '0 24px 60px rgba(0,0,0,0.5)' }}
                style={{
                  background: highlight ? 'linear-gradient(160deg, #1a2a32, #1a1a1a)' : '#1a1a1a',
                  border: highlight ? '1px solid rgba(71,201,229,0.3)' : '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 14, padding: 36, position: 'relative', overflow: 'hidden',
                  transform: highlight ? 'scale(1.02)' : 'none',
                  cursor: 'default',
                }}
              >
                {highlight && (
                  <>
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, #47c9e5, #309bee)' }} />
                    <motion.div
                      animate={{ opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 3, repeat: Infinity }}
                      style={{ position: 'absolute', top: -60, left: '50%', transform: 'translateX(-50%)', width: 200, height: 120, background: 'radial-gradient(circle, rgba(71,201,229,0.15), transparent)', borderRadius: '50%', pointerEvents: 'none' }}
                    />
                    <div style={{ position: 'absolute', top: 16, right: 16, background: '#47c9e5', color: '#fff', fontSize: 10, fontWeight: 700, padding: '4px 12px', borderRadius: 100, letterSpacing: '0.5px' }}>MOST POPULAR</div>
                  </>
                )}
                <h3 style={{ fontSize: 20, fontWeight: 800, color: '#ffffff', marginBottom: 4 }}>{name}</h3>
                <p style={{ fontSize: 13, color: '#5e5e5e', marginBottom: 20 }}>{desc}</p>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, marginBottom: 28 }}>
                  <motion.span
                    key={annual ? 'annual' : 'monthly'}
                    initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                    style={{ fontSize: 48, fontWeight: 800, color: '#47c9e5', lineHeight: 1 }}
                  >
                    £{annual ? ann : monthly}
                  </motion.span>
                  <span style={{ fontSize: 14, color: '#5e5e5e', paddingBottom: 8 }}>/mo</span>
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px', display: 'flex', flexDirection: 'column', gap: 11 }}>
                  {features.map((f) => (
                    <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#aaaaaa' }}>
                      <CheckCircle size={14} color="#36bd5f" style={{ flexShrink: 0 }} />
                      {f}
                    </li>
                  ))}
                </ul>
                <motion.div whileHover={{ scale: 1.03, boxShadow: '0 0 24px rgba(71,201,229,0.35)' }} whileTap={{ scale: 0.97 }}>
                  <Link href="/signup" style={{
                    display: 'block', textAlign: 'center', textDecoration: 'none',
                    background: highlight ? 'linear-gradient(135deg, #47c9e5, #309bee)' : 'transparent',
                    color: highlight ? '#fff' : '#47c9e5',
                    border: highlight ? 'none' : '1px solid rgba(71,201,229,0.3)',
                    padding: '13px 24px', borderRadius: 100, fontWeight: 700, fontSize: 14,
                  }}>
                    Get Started
                  </Link>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ESCALATION SERVICES ──────────────────────────────── */}
      <section style={{ background: '#080808', padding: '120px 32px', position: 'relative', overflow: 'hidden' }}>
        {/* Background grid */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(255,255,255,0.025) 1px, transparent 1px)', backgroundSize: '28px 28px', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative' }}>
          {/* Heading */}
          <motion.div
            initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
            style={{ textAlign: 'center', marginBottom: 72 }}
          >
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(229,71,71,0.1)', border: '1px solid rgba(229,71,71,0.2)', borderRadius: 100, padding: '6px 16px', marginBottom: 20 }}>
              <AlertTriangle size={12} color="#e54747" />
              <span style={{ fontSize: 11, fontWeight: 700, color: '#e54747', letterSpacing: '0.6px', textTransform: 'uppercase' }}>Escalation Services</span>
              <span style={{ fontSize: 11, color: '#5e5e5e' }}>No subscription required</span>
            </div>
            <h2 style={{ fontSize: 46, fontWeight: 900, color: '#ffffff', marginBottom: 16, letterSpacing: '-1px', lineHeight: 1.1 }}>
              They Still Haven&apos;t Paid?<br />
              <span style={{ background: 'linear-gradient(135deg, #e54747, #c23a3a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Escalate Immediately.</span>
            </h2>
            <p style={{ fontSize: 16, color: '#4a4a4a', maxWidth: 540, margin: '0 auto', lineHeight: 1.8 }}>
              One-time services for when reminders aren&apos;t enough. No account. Pay, and it&apos;s sent within minutes.
            </p>
          </motion.div>

          {/* Service cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 48 }}>

            {/* Legal Demand Letter */}
            <motion.div
              initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.55 }}
              whileHover={{ y: -6, boxShadow: '0 24px 60px rgba(229,71,71,0.2), 0 0 0 1px rgba(229,71,71,0.15)' }}
              style={{ background: '#111111', border: '1px solid rgba(229,71,71,0.12)', borderRadius: 16, padding: 36, position: 'relative', overflow: 'hidden', cursor: 'default' }}
            >
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, #e54747, transparent)' }} />
              <div style={{ position: 'absolute', bottom: -40, right: -40, width: 140, height: 140, borderRadius: '50%', background: 'rgba(229,71,71,0.04)' }} />
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
                <div>
                  <span style={{ fontSize: 10, fontWeight: 800, color: '#e54747', letterSpacing: '0.8px', textTransform: 'uppercase' }}>Step 01</span>
                  <h3 style={{ fontSize: 22, fontWeight: 900, color: '#ffffff', margin: '6px 0 0', letterSpacing: '-0.3px' }}>Legal Demand Letter</h3>
                </div>
                <div style={{ background: 'rgba(229,71,71,0.12)', borderRadius: 12, padding: 12 }}>
                  <Gavel size={24} color="#e54747" />
                </div>
              </div>
              <p style={{ fontSize: 14, color: '#5a5a5a', lineHeight: 1.75, marginBottom: 24 }}>
                A formal statutory demand letter issued under the Late Payment of Commercial Debts (Interest) Act 1998. Sent as a PDF directly to your client. Debtors respond to legal language differently than email reminders.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 28 }}>
                {[
                  'Sent to client email with you CC\'d',
                  '7-day payment ultimatum with CCJ warning',
                  'Statutory interest + compensation calculated',
                  'Official solicitor-style A4 letterhead',
                ].map((f) => (
                  <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#e54747', flexShrink: 0 }} />
                    <span style={{ fontSize: 13, color: '#6a6a6a' }}>{f}</span>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <span style={{ fontSize: 36, fontWeight: 900, color: '#ffffff', letterSpacing: '-1px' }}>£9.99</span>
                  <span style={{ fontSize: 13, color: '#4a4a4a', marginLeft: 6 }}>one-time</span>
                </div>
                <motion.button
                  onClick={() => setEscModal('legal')}
                  whileHover={{ scale: 1.04, boxShadow: '0 0 28px rgba(229,71,71,0.5)' }}
                  whileTap={{ scale: 0.96 }}
                  style={{ background: '#e54747', border: 'none', borderRadius: 100, padding: '12px 28px', fontSize: 14, fontWeight: 800, color: '#fff', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 8 }}
                >
                  <Gavel size={15} /> Send Now
                </motion.button>
              </div>
            </motion.div>

            {/* CCJ Preparation Pack */}
            <motion.div
              initial={{ opacity: 0, x: 24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.55 }}
              whileHover={{ y: -6, boxShadow: '0 24px 60px rgba(167,139,250,0.2), 0 0 0 1px rgba(167,139,250,0.15)' }}
              style={{ background: '#111111', border: '1px solid rgba(167,139,250,0.12)', borderRadius: 16, padding: 36, position: 'relative', overflow: 'hidden', cursor: 'default' }}
            >
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, #a78bfa, transparent)' }} />
              <div style={{ position: 'absolute', bottom: -40, right: -40, width: 140, height: 140, borderRadius: '50%', background: 'rgba(167,139,250,0.04)' }} />
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
                <div>
                  <span style={{ fontSize: 10, fontWeight: 800, color: '#a78bfa', letterSpacing: '0.8px', textTransform: 'uppercase' }}>Step 02</span>
                  <h3 style={{ fontSize: 22, fontWeight: 900, color: '#ffffff', margin: '6px 0 0', letterSpacing: '-0.3px' }}>CCJ Preparation Pack</h3>
                </div>
                <div style={{ background: 'rgba(167,139,250,0.12)', borderRadius: 12, padding: 12 }}>
                  <Scale size={24} color="#a78bfa" />
                </div>
              </div>
              <p style={{ fontSize: 14, color: '#5a5a5a', lineHeight: 1.75, marginBottom: 24 }}>
                Everything you need to file a money claim through Money Claim Online (MCOL). Pre-written Particulars of Claim, interest schedule, evidence checklist, and a step-by-step filing guide — ready to submit.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 28 }}>
                {[
                  'Pre-written Particulars of Claim (copy + paste)',
                  'Statutory interest calculation schedule',
                  'Evidence checklist — what to attach',
                  'MCOL step-by-step guide + court fee table',
                ].map((f) => (
                  <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#a78bfa', flexShrink: 0 }} />
                    <span style={{ fontSize: 13, color: '#6a6a6a' }}>{f}</span>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <span style={{ fontSize: 36, fontWeight: 900, color: '#ffffff', letterSpacing: '-1px' }}>£29</span>
                  <span style={{ fontSize: 13, color: '#4a4a4a', marginLeft: 6 }}>one-time</span>
                </div>
                <motion.button
                  onClick={() => setEscModal('ccj')}
                  whileHover={{ scale: 1.04, boxShadow: '0 0 28px rgba(167,139,250,0.5)' }}
                  whileTap={{ scale: 0.96 }}
                  style={{ background: '#a78bfa', border: 'none', borderRadius: 100, padding: '12px 28px', fontSize: 14, fontWeight: 800, color: '#fff', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 8 }}
                >
                  <Scale size={15} /> Get Pack
                </motion.button>
              </div>
            </motion.div>
          </div>

          {/* Escalation ladder graphic */}
          <motion.div
            initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
            style={{ textAlign: 'center', padding: '20px 0' }}
          >
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 0, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 100, overflow: 'hidden' }}>
              {[
                { label: 'Reminder emails', color: '#e2b742' },
                { label: '→', color: '#3a3a3a' },
                { label: 'Legal Demand', color: '#e54747' },
                { label: '→', color: '#3a3a3a' },
                { label: 'CCJ Filing', color: '#a78bfa' },
                { label: '→', color: '#3a3a3a' },
                { label: 'Paid', color: '#36bd5f' },
              ].map((item, i) => (
                <span key={i} style={{ padding: '10px 16px', fontSize: 12, fontWeight: 700, color: item.color, letterSpacing: '0.2px' }}>{item.label}</span>
              ))}
            </div>
            <p style={{ fontSize: 12, color: '#3a3a3a', marginTop: 14 }}>The full enforcement ladder — available on demand, no subscription required</p>
          </motion.div>
        </div>
      </section>

      {/* ── CTA BANNER ───────────────────────────────────────── */}
      <section style={{ background: '#0e0e0e', padding: '120px 32px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }} transition={{ duration: 6, repeat: Infinity }}
          style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 600, height: 300, background: 'radial-gradient(ellipse, rgba(71,201,229,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}
          style={{ maxWidth: 640, margin: '0 auto', position: 'relative' }}
        >
          <h2 style={{ fontSize: 52, fontWeight: 800, color: '#ffffff', marginBottom: 16, letterSpacing: '-1px', lineHeight: 1.1 }}>
            Start Enforcing<br />
            <span style={{ background: 'linear-gradient(135deg, #47c9e5, #309bee)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Late Payments Today.
            </span>
          </h2>
          <p style={{ fontSize: 16, color: '#5e5e5e', marginBottom: 40, lineHeight: 1.8 }}>
            Join freelancers and agencies already recovering what they&apos;re owed — automatically.
          </p>
          <motion.div whileHover={{ scale: 1.05, boxShadow: '0 0 60px rgba(71,201,229,0.5)' }} whileTap={{ scale: 0.97 }} style={{ display: 'inline-block' }}>
            <Link href="/signup" style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              background: 'linear-gradient(135deg, #47c9e5, #309bee)',
              color: '#fff', textDecoration: 'none', fontSize: 16, fontWeight: 700,
              padding: '18px 48px', borderRadius: 100,
            }}>
              <Sparkles size={18} />
              Start Free — No Card Needed
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* ── Escalation modal ─────────────────────────────────── */}
      <AnimatePresence>
        {escModal && <EscalationModal service={escModal} onClose={() => setEscModal(null)} />}
      </AnimatePresence>

      {/* ── FOOTER ───────────────────────────────────────────── */}
      <footer style={{ background: '#080808', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '72px 32px 40px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 48, marginBottom: 56 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
                <Shield size={22} color="#47c9e5" />
                <span style={{ fontWeight: 800, fontSize: 18, color: '#fff' }}>Irvo</span>
              </div>
              <p style={{ fontSize: 13, color: '#4e4e4e', lineHeight: 1.9, maxWidth: 240, marginBottom: 20 }}>
                Automating UK late payment enforcement for freelancers and small agencies.
              </p>
              <div style={{ display: 'flex', gap: 10 }}>
                {['UK Law', 'GDPR Safe', 'SOC 2'].map((badge) => (
                  <span key={badge} style={{ fontSize: 10, fontWeight: 700, color: '#3e3e3e', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', padding: '4px 10px', borderRadius: 100, letterSpacing: '0.3px' }}>{badge}</span>
                ))}
              </div>
            </div>
            {[
              { title: 'PRODUCT', links: ['Features', 'Pricing', 'How It Works', 'Changelog'] },
              { title: 'LEGAL', links: ['Privacy Policy', 'Terms of Service', 'Cookie Policy'] },
              { title: 'COMPANY', links: ['About', 'Blog', 'Contact', 'hello@irvo.co.uk'] },
            ].map(({ title, links }) => (
              <div key={title}>
                <h4 style={{ color: '#3e3e3e', fontWeight: 700, fontSize: 11, marginBottom: 20, letterSpacing: '0.8px' }}>{title}</h4>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {links.map((item) => (
                    <li key={item}>
                      <motion.a href="#" whileHover={{ color: '#47c9e5', x: 2 }} style={{ color: '#4e4e4e', textDecoration: 'none', fontSize: 13, display: 'inline-block', transition: 'color 0.2s' }}>{item}</motion.a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ color: '#2e2e2e', fontSize: 12, margin: 0 }}>© {new Date().getFullYear()} Irvo. All rights reserved.</p>
            <p style={{ color: '#2e2e2e', fontSize: 12, margin: 0 }}>Built for UK freelancers &amp; agencies</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
