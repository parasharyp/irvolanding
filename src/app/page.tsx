'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import Link from 'next/link'
import {
  motion, useScroll, useSpring, useInView, useMotionValue,
  animate, AnimatePresence,
} from 'framer-motion'
import {
  Shield, FileText, CheckCircle, ArrowRight, Zap, BarChart3,
  AlertTriangle, Clock, Menu, X, TrendingUp,
} from 'lucide-react'
import { track } from '@/lib/analytics'

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
const WORDS = ['your AI systems', 'your automation', 'your HR tools', 'your AI workflows', 'your deployments']
function CycleWord() {
  const [idx, setIdx] = useState(0)
  useEffect(() => { const t = setInterval(() => setIdx((i) => (i + 1) % WORDS.length), 2200); return () => clearInterval(t) }, [])
  return (
    <span style={{ position: 'relative', display: 'inline-block', minWidth: 'min(260px, 72vw)' }}>
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
  { icon: Shield, title: 'Risk Classification', desc: 'Answer 12 structured questions and receive an Annex III risk classification plus a mapped list of obligations that apply to your specific system.' },
  { icon: FileText, title: 'Evidence Packs', desc: 'Per-workflow evidence packs structured for regulator and auditor review. Export as PDF or Word. One pack per system, not one generic policy doc.' },
  { icon: CheckCircle, title: 'Obligations Map', desc: 'Every obligation that applies to your workflow, mapped to the specific evidence you need to collect. No guesswork, no missing requirements.' },
  { icon: Zap, title: 'Guided Workflow', desc: 'A wizard-driven interface walks each stakeholder through exactly what to document, what to capture, and how to structure it.' },
  { icon: BarChart3, title: 'Progress Tracking', desc: 'See which systems are fully documented, which are in progress, and which still carry unaddressed risk across your organisation.' },
  { icon: AlertTriangle, title: 'Deadline Monitor', desc: 'Track days remaining to August 2, 2026 per system. Get visibility on your risk exposure window before enforcement begins.' },
]

const STATS = [
  { to: 35, prefix: '€', suffix: 'M', label: 'maximum fine for non-compliance' },
  { to: 50, prefix: '€', suffix: 'k', label: 'avg. consultant cost per system' },
  { to: 50, prefix: '', suffix: 'h+', label: 'manual documentation per system' },
  { to: 20, prefix: '', suffix: 'min', label: 'to document a workflow with AIED' },
]

const STEPS = [
  { n: '01', title: 'Define your system', desc: 'Describe the AI or automation system: what it does, who owns it, what data it uses, and which business process it supports.' },
  { n: '02', title: 'Answer 12 questions', desc: 'Complete a guided questionnaire covering impact, automation level, data use, and potential harm. Takes about 15 minutes.' },
  { n: '03', title: 'Get your classification', desc: 'Receive the likely risk level, any Annex III category that may apply, and a mapped list of the specific obligations you need to meet.' },
  { n: '04', title: 'Capture evidence and export your pack', desc: 'Attach documents, add notes, and complete each obligation. Export a regulator-ready evidence pack in PDF or Word format — one structured pack per system.' },
]

const TESTIMONIALS = [
  { name: 'Sophie M.', role: 'Legal Counsel, Amsterdam', text: 'We have been building spreadsheets for two years and still cannot give our board a clear picture of which systems are in scope. That is exactly the problem this solves.', stars: 5 },
  { name: 'Daniel F.', role: 'Head of Compliance, Dublin', text: 'Documenting 12 AI systems before August 2026 manually would take months. Any tool that compresses that into hours is immediately worth evaluating.', stars: 5 },
  { name: 'Elena V.', role: 'Operations Director, Berlin', text: 'Every consultant we spoke to quoted a minimum of €20,000 just for a scoping exercise. We needed something we could start ourselves.', stars: 5 },
]

const PRICING = [
  { name: 'Starter', monthly: 149, annual: 119, desc: '1 user · 3 systems', features: ['3 AI systems', 'PDF export', 'Risk classification', 'Obligations map', 'Basic templates', 'Email support'] },
  { name: 'Growth', monthly: 399, annual: 319, desc: 'Up to 5 users · 10 systems', highlight: true, features: ['10 AI systems', '5 users', 'PDF + Word export', 'AI drafting assistance', 'Custom templates', 'Priority support'] },
  { name: 'Plus', monthly: 799, annual: 639, plus: true, desc: 'Unlimited users', features: ['25+ AI systems', 'Unlimited users', 'Auditor view', 'API access', 'Custom templates', 'Dedicated support'] },
]

const FAQS = [
  { q: 'Is this legal advice?', a: 'No. The product helps you organise documentation and evidence. It does not replace qualified legal advice. Consult a legal professional for binding compliance decisions.' },
  { q: 'Do I need this if I use Zapier, Make, or similar tools?', a: 'Potentially yes. Some automation workflows may still fall within scope depending on what they do, who they affect, and how much decision-making is automated.' },
  { q: 'What counts as an AI system under the Act?', a: 'Any workflow using models, automated decision logic, or AI-enabled tooling to influence outcomes affecting people may need review. The Act uses a broad definition intentionally.' },
  { q: 'What if I already have documentation?', a: 'You can use the product to structure existing documentation into a workflow-specific evidence pack in the format regulators and auditors expect.' },
  { q: 'What happens after August 2026?', a: 'You will still need to maintain documentation for new systems, updates, periodic reviews, and ongoing compliance activity. Documentation is not a one-time task.' },
  { q: 'What is Annex III?', a: 'Annex III lists specific AI system categories the EU AI Act classifies as high-risk — including systems used in recruitment, credit, biometrics, critical infrastructure, and more.' },
]

/* ─── Field component ─────────────────────────────────────────── */
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

/* ─── Waitlist modal ──────────────────────────────────────────── */
type WaitlistVariant = 'waitlist' | 'founding' | 'walkthrough'
interface WaitlistForm { email: string; full_name: string; company_name: string }
const WL_EMPTY: WaitlistForm = { email: '', full_name: '', company_name: '' }

const WL_CONFIG = {
  waitlist: {
    overline: 'Join the Waitlist',
    headline: 'Be first when we launch',
    sub: 'We will notify you before public access opens and share early documentation resources.',
    cta: 'Join the Waitlist',
    source: 'landing-waitlist',
  },
  founding: {
    overline: 'Founding Access',
    headline: 'Claim your founding discount',
    sub: 'Founding members lock in 40% off for the lifetime of their plan. Limited to the first 100 organisations.',
    cta: 'Claim Founding Discount',
    source: 'landing-founding',
  },
  walkthrough: {
    overline: 'Book a Walkthrough',
    headline: 'See the product in 30 minutes',
    sub: 'Leave your details and we will reach out within one business day to schedule a walkthrough.',
    cta: 'Request Walkthrough',
    source: 'landing-walkthrough',
  },
}

function WaitlistModal({ variant, onClose }: { variant: WaitlistVariant; onClose: () => void }) {
  const [form, setForm] = useState<WaitlistForm>(WL_EMPTY)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const set = (k: keyof WaitlistForm) => (v: string) => setForm((f) => ({ ...f, [k]: v }))
  const cfg = WL_CONFIG[variant]

  const submit = async () => {
    setError(null)
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError('Please enter a valid email address.')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email.trim(), full_name: form.full_name.trim() || undefined, company_name: form.company_name.trim() || undefined, source: cfg.source }),
      }).then((r) => r.json())

      if (res.success) {
        track({ event: res.duplicate ? 'waitlist_duplicate' : 'waitlist_submitted', cta_label: cfg.cta, section: 'modal', page: 'landing' })
        setSuccess(res.duplicate
          ? "You're already on the list — we'll be in touch before we launch."
          : "You're on the list. We'll reach out before launch with early access details.")
      } else {
        setError(res.error ?? 'Something went wrong. Please try again.')
      }
    } catch {
      setError('Network error. Please try again.')
    }
    setLoading(false)
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(12px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
    >
      <motion.div initial={{ scale: 0.95, opacity: 0, y: 16 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.97, opacity: 0 }}
        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
        style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, padding: 36, maxWidth: 480, width: '100%', fontFamily: 'inherit', position: 'relative' }}
      >
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${T.accent}, transparent)`, borderRadius: '12px 12px 0 0' }} />
        <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: 'transparent', border: 'none', cursor: 'pointer', color: T.text2, display: 'flex', padding: 6, borderRadius: 6 }}>
          <X size={15} />
        </button>

        {success ? (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <CheckCircle size={40} color={T.green} style={{ margin: '0 auto 16px', display: 'block' }} />
            <h2 style={{ fontSize: 20, fontWeight: 800, color: T.text, margin: '0 0 8px', letterSpacing: '-0.3px' }}>You&apos;re on the list</h2>
            <p style={{ fontSize: 14, color: T.text2, margin: '0 0 24px', lineHeight: 1.7 }}>{success}</p>
            <button onClick={onClose} style={{ background: T.surface2, border: `1px solid ${T.border}`, borderRadius: 8, padding: '10px 24px', fontSize: 13, fontWeight: 600, color: T.text, cursor: 'pointer', fontFamily: 'inherit' }}>Close</button>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: 28 }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: T.accent, textTransform: 'uppercase', letterSpacing: '0.8px', margin: '0 0 6px' }}>{cfg.overline}</p>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: T.text, margin: '0 0 4px', letterSpacing: '-0.4px' }}>{cfg.headline}</h2>
              <p style={{ fontSize: 13, color: T.text2, margin: 0, lineHeight: 1.7 }}>{cfg.sub}</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <Field label="Email address" value={form.email} onChange={set('email')} type="email" placeholder="you@company.com" required />
              <Field label="Full name (optional)" value={form.full_name} onChange={set('full_name')} placeholder="Jane Smith" />
              <Field label="Company (optional)" value={form.company_name} onChange={set('company_name')} placeholder="Acme GmbH" />
              {error && <p style={{ fontSize: 12, color: T.red, background: 'rgba(229,71,71,0.06)', border: '1px solid rgba(229,71,71,0.15)', padding: '10px 14px', borderRadius: 6, margin: 0 }}>{error}</p>}
              <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
                <button onClick={onClose} style={{ flex: 1, background: 'transparent', border: `1px solid ${T.border}`, borderRadius: 8, padding: '12px 0', fontSize: 13, fontWeight: 600, color: T.text2, cursor: 'pointer', fontFamily: 'inherit', transition: 'border-color 0.15s' }}>Cancel</button>
                <motion.button onClick={submit} disabled={loading} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                  style={{ flex: 2, background: T.accent, border: 'none', borderRadius: 8, padding: '12px 0', fontSize: 13, fontWeight: 800, color: T.bg, cursor: loading ? 'default' : 'pointer', fontFamily: 'inherit', opacity: loading ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                >
                  <ArrowRight size={14} />
                  {loading ? 'Submitting…' : cfg.cta}
                </motion.button>
              </div>
              <p style={{ fontSize: 11, color: T.text3, textAlign: 'center', margin: 0 }}>No spam · Unsubscribe anytime · Guidance only, not legal advice</p>
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  )
}

/* ─── Logo mark ───────────────────────────────────────────────── */
function Logo({ size = 28 }: { size?: number }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: Math.round(size * 0.38), userSelect: 'none' }}>
      <div style={{ width: 2, height: Math.round(size * 0.78), background: T.accent, flexShrink: 0 }} />
      <span style={{ fontSize: size, fontWeight: 900, letterSpacing: '2px', color: T.text, fontFamily: 'var(--font-raleway), Raleway, Helvetica, Arial, sans-serif', lineHeight: 1, whiteSpace: 'nowrap' }}>
        AIED
      </span>
    </div>
  )
}

/* ─── Systems burden estimator ────────────────────────────────── */
function SystemsEstimator({ onOpenWaitlist }: { onOpenWaitlist: (v: WaitlistVariant) => void }) {
  const [systems, setSystems] = useState('3')
  const [rate, setRate] = useState('150')
  const [sysFocus, setSysFocus] = useState(false)
  const [rateFocus, setRateFocus] = useState(false)

  const systemsNum = Math.max(0, parseInt(systems) || 0)
  const rateNum = Math.max(0, parseFloat(rate) || 0)
  const manualHours = systemsNum * 50
  const consultantCost = systemsNum * rateNum * 50
  const aiedMinutes = systemsNum * 20
  const savings = Math.max(0, consultantCost - 149 * 12)
  const hasResult = systemsNum > 0 && rateNum > 0

  const fmtEur = (n: number) => `€${n.toLocaleString('de-DE')}`

  return (
    <section className="hp-section-pad" style={{ background: T.surface }}>
      <div style={{ maxWidth: 1160, margin: '0 auto' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ marginBottom: 64 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: T.text2, textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 16px' }}>
            Documentation Burden Calculator
          </p>
          <h2 style={{ fontSize: 'clamp(30px, 4vw, 48px)', fontWeight: 900, letterSpacing: '-1.5px', margin: '0 0 14px', lineHeight: 1.05 }}>
            What are undocumented AI systems <em style={{ fontStyle: 'normal', color: T.accent }}>costing you?</em>
          </h2>
          <p style={{ fontSize: 15, color: T.text2, margin: 0, maxWidth: 480, lineHeight: 1.75 }}>
            Enter your AI or automation workflow count and internal hourly rate. See the documentation burden at current market rates.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
          style={{ border: `1px solid ${T.border}`, background: T.bg }}
        >
          <div className="r-grid-2" style={{ borderBottom: `1px solid ${T.border}` }}>
            <div style={{ padding: '32px 36px', borderRight: `1px solid ${T.border}` }}>
              <label style={{ fontSize: 10, fontWeight: 700, color: T.text2, textTransform: 'uppercase', letterSpacing: '0.8px', display: 'block', marginBottom: 12 }}>
                AI / Automation Systems
              </label>
              <input
                type="number" value={systems} onChange={(e) => setSystems(e.target.value)}
                onFocus={() => setSysFocus(true)} onBlur={() => setSysFocus(false)}
                placeholder="3"
                style={{ fontSize: 40, fontWeight: 900, color: T.text, background: 'transparent', border: 'none', outline: 'none', width: '100%', fontFamily: 'inherit', letterSpacing: '-2px', caretColor: T.accent, appearance: 'textfield' }}
              />
              <div style={{ height: 2, background: sysFocus ? T.accent : T.border, marginTop: 8, transition: 'background 0.2s' }} />
            </div>
            <div style={{ padding: '32px 36px' }}>
              <label style={{ fontSize: 10, fontWeight: 700, color: T.text2, textTransform: 'uppercase', letterSpacing: '0.8px', display: 'block', marginBottom: 12 }}>
                Internal Hourly Rate (€)
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 32, fontWeight: 900, color: T.text3 }}>€</span>
                <input
                  type="number" value={rate} onChange={(e) => setRate(e.target.value)}
                  onFocus={() => setRateFocus(true)} onBlur={() => setRateFocus(false)}
                  placeholder="150"
                  style={{ fontSize: 40, fontWeight: 900, color: T.text, background: 'transparent', border: 'none', outline: 'none', width: '100%', fontFamily: 'inherit', letterSpacing: '-2px', caretColor: T.accent, appearance: 'textfield' }}
                />
              </div>
              <div style={{ height: 2, background: rateFocus ? T.accent : T.border, marginTop: 8, transition: 'background 0.2s' }} />
            </div>
          </div>

          <div className="r-grid-4" style={{ borderBottom: `1px solid ${T.border}` }}>
            {[
              { label: 'Manual documentation hours', value: hasResult ? `${manualHours}h` : '—', note: `${systemsNum} system${systemsNum !== 1 ? 's' : ''} × 50 hrs`, dim: true },
              { label: 'Consultant cost estimate', value: hasResult ? fmtEur(consultantCost) : '—', note: `€${rateNum}/hr × 50 hrs each`, dim: false },
              { label: 'Documentation time with AIED', value: hasResult ? `${aiedMinutes} min` : '—', note: '~20 min per system', dim: false },
              { label: 'Potential savings', value: hasResult ? fmtEur(savings) : '—', note: 'vs AIED Starter plan', dim: false, highlight: true },
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
                    initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }}
                    style={{ fontSize: col.highlight ? 28 : 22, fontWeight: 900, color: col.highlight ? T.accent : T.text, margin: '0 0 6px', letterSpacing: '-1px', fontVariantNumeric: 'tabular-nums' }}
                  >
                    {col.value}
                  </motion.p>
                </AnimatePresence>
                <p style={{ fontSize: 10, color: T.text3, margin: 0, fontWeight: 600 }}>{col.note}</p>
              </motion.div>
            ))}
          </div>

          <div style={{ padding: '24px 36px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <p style={{ fontSize: 13, color: T.text2, margin: 0, maxWidth: 520, lineHeight: 1.7 }}>
              {hasResult
                ? `Manual documentation at €${rateNum}/hr costs ${fmtEur(consultantCost)}. AIED Starter is €149/mo. Documentation pays for itself in week one.`
                : 'Enter your AI system count and internal hourly rate to see your documentation burden.'}
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => { track({ event: 'landing_cta_clicked', cta_label: 'Get Early Access', section: 'estimator', page: 'landing' }); onOpenWaitlist('waitlist') }}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: T.text, color: T.bg, fontSize: 13, fontWeight: 700, padding: '11px 24px', border: 'none', cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '-0.2px' }}
              >
                Get Early Access <ArrowRight size={14} />
              </button>
              <button
                onClick={() => { setSystems('3'); setRate('150') }}
                style={{ background: 'transparent', border: `1px solid ${T.border}`, color: T.text2, fontSize: 12, fontWeight: 600, padding: '11px 16px', cursor: 'pointer', fontFamily: 'inherit' }}
              >
                Reset example
              </button>
            </div>
          </div>
        </motion.div>

        <p style={{ fontSize: 11, color: T.text3, margin: '16px 0 0', textAlign: 'center' }}>
          Estimates based on industry benchmarks · Manual documentation assumes 40–60 hrs per system · Results are indicative only
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
  const [waitlistModal, setWaitlistModal] = useState<WaitlistVariant | null>(null)
  const [mobileMenu, setMobileMenu] = useState(false)

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', h, { passive: true })
    return () => window.removeEventListener('scroll', h)
  }, [])

  const openWaitlist = (v: WaitlistVariant) => setWaitlistModal(v)

  const NAV = ['Features', 'How It Works', 'Pricing']

  return (
    <div style={{ background: T.bg, color: T.text, fontFamily: "'Raleway', Helvetica, Arial, sans-serif", minHeight: '100vh' }}>
      <Cursor />
      <ScrollBar />

      {/* ── Mobile nav overlay ───────────────────────────────────── */}
      <div className={`mobile-nav-overlay${mobileMenu ? ' open' : ''}`}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 40 }}>
          <Logo size={28} />
          <button onClick={() => setMobileMenu(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: T.text2, display: 'flex', padding: 8, touchAction: 'manipulation' }}>
            <X size={22} />
          </button>
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
          {NAV.map((item) => (
            <a key={item} href={`#${item.toLowerCase().replace(' ', '-')}`} onClick={() => setMobileMenu(false)}
              style={{ fontSize: 22, fontWeight: 700, color: T.text2, textDecoration: 'none', padding: '12px 0', borderBottom: `1px solid ${T.border}` }}>
              {item}
            </a>
          ))}
          <button
            onClick={() => { setMobileMenu(false); track({ event: 'landing_cta_clicked', cta_label: 'Get Early Access', section: 'mobile-nav', page: 'landing' }); openWaitlist('waitlist') }}
            style={{ fontSize: 22, fontWeight: 700, color: T.accent, textDecoration: 'none', padding: '12px 0', background: 'transparent', border: 'none', borderBottom: `1px solid ${T.border}`, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' } as React.CSSProperties}
          >
            Get Early Access ↗
          </button>
        </nav>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingTop: 32 }}>
          <Link href="/login" onClick={() => setMobileMenu(false)} style={{ fontSize: 15, color: T.text2, textDecoration: 'none', fontWeight: 500, padding: '12px 0', textAlign: 'center', border: `1px solid ${T.border}`, borderRadius: 8 }}>Sign in</Link>
          <button
            onClick={() => { setMobileMenu(false); openWaitlist('waitlist') }}
            style={{ background: T.text, color: T.bg, fontSize: 15, fontWeight: 700, padding: '14px 0', borderRadius: 100, border: 'none', cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '-0.2px' }}
          >
            Get Early Access
          </button>
        </div>
      </div>

      {/* ── NAV ─────────────────────────────────────────────────── */}
      <motion.header
        animate={{ borderBottomColor: scrolled ? T.border : 'transparent', background: scrolled ? 'rgba(4,4,4,0.92)' : 'transparent', backdropFilter: scrolled ? 'blur(20px)' : 'none' }}
        transition={{ duration: 0.3 }}
        style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, borderBottom: '1px solid transparent' }}
      >
        <div style={{ maxWidth: 1160, margin: '0 auto', padding: '0 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
          <Logo size={32} />
          <nav className="desktop-only" style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
            {NAV.map((item) => (
              <motion.a key={item} href={`#${item.toLowerCase().replace(' ', '-')}`} whileHover={{ color: T.text }} style={{ fontSize: 13, color: T.text2, textDecoration: 'none', fontWeight: 500, transition: 'color 0.15s' }}>{item}</motion.a>
            ))}
            <button
              onClick={() => { track({ event: 'landing_cta_clicked', cta_label: 'Get Early Access', section: 'nav', page: 'landing' }); openWaitlist('waitlist') }}
              style={{ fontSize: 13, color: T.accent, fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
            >
              Early Access ↗
            </button>
          </nav>
          <div className="desktop-only" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link href="/login" style={{ fontSize: 13, color: T.text2, textDecoration: 'none', fontWeight: 500 }}>Sign in</Link>
            <Magnetic>
              <button
                onClick={() => { track({ event: 'landing_cta_clicked', cta_label: 'Get Early Access', section: 'nav', page: 'landing' }); openWaitlist('waitlist') }}
                style={{ background: T.text, color: T.bg, fontSize: 13, fontWeight: 700, padding: '8px 20px', borderRadius: 100, border: 'none', cursor: 'pointer', fontFamily: 'inherit', display: 'inline-block', letterSpacing: '-0.2px' }}
              >
                Get Early Access
              </button>
            </Magnetic>
          </div>
          <button className="mobile-only" onClick={() => setMobileMenu(true)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: T.text2, padding: 8, touchAction: 'manipulation' }}>
            <Menu size={22} />
          </button>
        </div>
      </motion.header>

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section className="hp-hero-pad" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px)', backgroundSize: '80px 80px', pointerEvents: 'none' }} />

        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, border: `1px solid ${T.border}`, borderRadius: 100, padding: '5px 14px', marginBottom: 40, fontSize: 11, color: T.text2, letterSpacing: '0.4px' }}
          >
            <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 2, repeat: Infinity }} style={{ width: 5, height: 5, borderRadius: '50%', background: T.red }} />
            EU AI Act high-risk obligations: August 2, 2026
          </motion.div>

          <h1 style={{ fontSize: 'clamp(40px, 8vw, 96px)', fontWeight: 900, lineHeight: 1.0, letterSpacing: '-3px', margin: '0 0 32px', maxWidth: 860 }}>
            You have 15 months to prove{' '}
            <CycleWord />
            <br />
            <span style={{ color: T.text2 }}>are compliant.</span>
          </h1>

          <p style={{ fontSize: 18, color: T.text2, lineHeight: 1.8, maxWidth: 480, margin: '0 auto 48px' }}>
            Turn each AI or automation workflow into a regulator-ready evidence pack in 20 minutes, not 40+ hours with spreadsheets or consultants.
          </p>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Magnetic>
              <button
                onClick={() => { track({ event: 'landing_cta_clicked', cta_label: 'Get Early Access', section: 'hero', page: 'landing' }); openWaitlist('waitlist') }}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: T.text, color: T.bg, fontSize: 15, fontWeight: 700, padding: '14px 32px', borderRadius: 100, border: 'none', cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '-0.2px' }}
              >
                Get Early Access <ArrowRight size={16} />
              </button>
            </Magnetic>
            <Magnetic>
              <a
                href="#how-it-works"
                onClick={() => track({ event: 'landing_cta_clicked', cta_label: 'See How It Works', section: 'hero', page: 'landing' })}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(71,201,229,0.08)', color: T.accent, fontSize: 15, fontWeight: 700, padding: '14px 32px', borderRadius: 100, textDecoration: 'none', border: `1px solid rgba(71,201,229,0.25)` }}
              >
                See How It Works
              </a>
            </Magnetic>
          </div>

          <p style={{ fontSize: 12, color: T.text3, margin: '24px 0 0', letterSpacing: '0.2px' }}>
            Built for EU/UK SMEs facing the August 2, 2026 deadline.
          </p>
        </motion.div>

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
              {['EU AI ACT COMPLIANCE', 'RISK CLASSIFICATION', 'EVIDENCE PACKS', 'ANNEX III MAPPING', 'OBLIGATIONS TRACKER', 'REGULATOR-READY DOCS', 'SME DOCUMENTATION'].map((item, i) => (
                <span key={i} style={{ fontSize: 11, color: T.text3, fontWeight: 700, letterSpacing: '1.2px', padding: '0 32px', whiteSpace: 'nowrap' }}>
                  {item} <span style={{ color: T.text3, margin: '0 0 0 32px' }}>·</span>
                </span>
              ))}
            </span>
          ))}
        </motion.div>
      </div>

      <SystemsEstimator onOpenWaitlist={openWaitlist} />

      <Divider />

      {/* ── FEATURES ─────────────────────────────────────────────── */}
      <section id="features" className="hp-section-pad">
        <div style={{ maxWidth: 1160, margin: '0 auto' }}>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} style={{ marginBottom: 80 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: T.text2, textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 16px' }}>Features</p>
            <h2 style={{ fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 900, letterSpacing: '-1.5px', margin: 0, maxWidth: 560, lineHeight: 1.1 }}>
              A structured evidence system for AI workflows.
            </h2>
          </motion.div>

          <div className="r-grid-3" style={{ borderTop: `1px solid ${T.border}`, borderLeft: `1px solid ${T.border}` }}>
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
      <section className="hp-section-pad">
        <div className="r-grid-4" style={{ maxWidth: 1160, margin: '0 auto', borderTop: `1px solid ${T.border}`, borderLeft: `1px solid ${T.border}` }}>
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

      {/* ── PROBLEM / COMPLIANCE STAKES ──────────────────────────── */}
      <section className="hp-section-pad" style={{ background: T.surface }}>
        <div className="hp-law-grid" style={{ maxWidth: 1160, margin: '0 auto' }}>
          <motion.div initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: T.text2, textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 20px' }}>The compliance gap</p>
            <h2 style={{ fontSize: 'clamp(28px, 3.5vw, 44px)', fontWeight: 900, letterSpacing: '-1.5px', margin: '0 0 24px', lineHeight: 1.1 }}>
              Most SMEs are not ready for AI Act evidence requirements.
            </h2>
            <p style={{ fontSize: 15, color: T.text2, lineHeight: 1.9, margin: '0 0 20px' }}>
              The EU AI Act requires organisations to produce structured technical documentation and evidence packs for AI systems classified as high-risk — before enforcement begins.
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                'AI workflows are documented across spreadsheets, notes, and internal wikis',
                'One system can take 40–60 hours to document manually',
                'Consultants typically charge €15,000–€50,000 per system',
                'Many teams do not yet know which workflows may be high-risk',
                'Regulators will ask for evidence packs, not good intentions',
              ].map((pt) => (
                <li key={pt} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 14, color: T.text2, lineHeight: 1.7 }}>
                  <div style={{ width: 4, height: 4, borderRadius: '50%', background: T.red, flexShrink: 0, marginTop: 8 }} />
                  {pt}
                </li>
              ))}
            </ul>
            <p style={{ fontSize: 12, color: T.text3, margin: 0, fontStyle: 'italic' }}>
              This tool provides guidance only and does not constitute legal advice. Consult a qualified legal professional for binding compliance decisions.
            </p>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            {[
              { label: 'High-risk obligation start', value: 'Aug 2026', note: 'Annex III systems' },
              { label: 'Maximum fine', value: '€35M', note: 'Or 7% of global annual turnover' },
              { label: 'GPAI model obligations', value: 'Aug 2025', note: 'Already in force' },
              { label: 'Annex III categories', value: '8+', note: 'High-risk use case groups' },
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
      <section id="how-it-works" className="hp-section-pad">
        <div style={{ maxWidth: 1160, margin: '0 auto' }}>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ marginBottom: 72 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: T.text2, textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 16px' }}>Process</p>
            <h2 style={{ fontSize: 'clamp(30px, 4vw, 46px)', fontWeight: 900, letterSpacing: '-1.5px', margin: 0, lineHeight: 1.1 }}>From workflow description to evidence pack.</h2>
          </motion.div>
          <div className="r-grid-4" style={{ borderTop: `1px solid ${T.border}`, borderLeft: `1px solid ${T.border}` }}>
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
      <section className="hp-section-pad" style={{ background: T.surface }}>
        <div style={{ maxWidth: 1160, margin: '0 auto' }}>
          <motion.p initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ fontSize: 11, fontWeight: 700, color: T.text2, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 64 }}>
            What compliance teams told us
          </motion.p>
          <div className="r-grid-3" style={{ gap: 0, borderTop: `1px solid ${T.border}`, borderLeft: `1px solid ${T.border}` }}>
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                whileHover={{ background: 'rgba(255,255,255,0.02)' }}
                style={{ padding: '40px 36px', borderRight: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}`, transition: 'background 0.2s' }}
              >
                <div style={{ display: 'flex', gap: 2, marginBottom: 20 }}>
                  {[...Array(t.stars)].map((_, s) => (
                    <svg key={s} width="12" height="12" viewBox="0 0 12 12" fill={T.accent}><polygon points="6,1 7.5,4.5 11,5 8.5,7.5 9.2,11 6,9.2 2.8,11 3.5,7.5 1,5 4.5,4.5" /></svg>
                  ))}
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
      <motion.section id="pricing" className="hp-section-pad" onViewportEnter={() => track({ event: 'pricing_viewed', page: 'landing' })}>
        <div style={{ maxWidth: 1160, margin: '0 auto' }}>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="hp-pricing-header" style={{ marginBottom: 64 }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: T.text2, textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 16px' }}>Pricing</p>
              <h2 style={{ fontSize: 'clamp(30px, 4vw, 46px)', fontWeight: 900, letterSpacing: '-1.5px', margin: 0, lineHeight: 1.1 }}>Simple, transparent plans.</h2>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 13, color: T.text2 }}>
              <span style={{ opacity: annual ? 0.5 : 1 }}>Monthly</span>
              <motion.div onClick={() => setAnnual((a) => !a)} style={{ width: 44, height: 24, background: annual ? T.accent : T.surface2, borderRadius: 100, cursor: 'pointer', position: 'relative', border: `1px solid ${T.border}` }}>
                <motion.div animate={{ x: annual ? 22 : 2 }} transition={{ type: 'spring', stiffness: 500, damping: 35 }} style={{ position: 'absolute', top: 2, width: 18, height: 18, borderRadius: '50%', background: '#fff' }} />
              </motion.div>
              <span style={{ opacity: annual ? 1 : 0.5 }}>Annual <span style={{ color: T.green, fontSize: 11, fontWeight: 700 }}>–20%</span></span>
            </div>
          </motion.div>

          <div className="r-grid-3" style={{ borderTop: `1px solid ${T.border}`, borderLeft: `1px solid ${T.border}` }}>
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
                  €<AnimatePresence mode="wait"><motion.span key={String(annual)} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>{annual ? plan.annual : plan.monthly}</motion.span></AnimatePresence>{(plan as any).plus ? '+' : ''}
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <Magnetic>
                    <button
                      onClick={() => { track({ event: 'founding_discount_clicked', cta_label: 'Claim Founding Discount', section: 'pricing', page: 'landing' }); openWaitlist('founding') }}
                      style={{ display: 'block', width: '100%', textAlign: 'center', background: plan.highlight ? T.text : 'transparent', color: plan.highlight ? T.bg : T.text, border: `1px solid ${plan.highlight ? T.text : T.border}`, borderRadius: 8, padding: '12px 0', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}
                    >
                      Claim Founding Discount
                    </button>
                  </Magnetic>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      <Divider />

      {/* ── FAQ ──────────────────────────────────────────────────── */}
      <section className="hp-section-pad" style={{ background: T.surface }}>
        <div style={{ maxWidth: 1160, margin: '0 auto' }}>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ marginBottom: 72 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: T.text2, textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 16px' }}>FAQ</p>
            <h2 style={{ fontSize: 'clamp(30px, 4vw, 46px)', fontWeight: 900, letterSpacing: '-1.5px', margin: 0, lineHeight: 1.1 }}>Common questions.</h2>
          </motion.div>
          <div className="r-grid-3" style={{ borderTop: `1px solid ${T.border}`, borderLeft: `1px solid ${T.border}` }}>
            {FAQS.map((faq, i) => (
              <motion.div
                key={faq.q}
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: (i % 3) * 0.07 }}
                whileHover={{ background: 'rgba(255,255,255,0.02)' }}
                style={{ padding: '36px 32px', borderRight: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}`, transition: 'background 0.2s' }}
              >
                <h3 style={{ fontSize: 15, fontWeight: 800, color: T.text, margin: '0 0 12px', letterSpacing: '-0.2px', lineHeight: 1.3 }}>{faq.q}</h3>
                <p style={{ fontSize: 13, color: T.text2, lineHeight: 1.75, margin: 0 }}>{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Divider />

      {/* ── URGENCY BAND ─────────────────────────────────────────── */}
      <section className="hp-section-pad">
        <div style={{ maxWidth: 1160, margin: '0 auto' }}>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ marginBottom: 72 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: T.text2, textTransform: 'uppercase', letterSpacing: '1px', margin: 0 }}>Enforcement Timeline</p>
              <span style={{ fontSize: 11, color: T.text3, border: `1px solid ${T.border}`, borderRadius: 100, padding: '2px 10px' }}>August 2, 2026</span>
            </div>
            <h2 style={{ fontSize: 'clamp(30px, 4vw, 46px)', fontWeight: 900, letterSpacing: '-1.5px', margin: '0 0 16px', lineHeight: 1.1 }}>
              August 2, 2026 is the deadline<br />that matters.
            </h2>
            <p style={{ fontSize: 15, color: T.text2, margin: 0, maxWidth: 520, lineHeight: 1.8 }}>
              High-risk AI obligations come into force on August 2, 2026. Fines can reach €35M or 7% of global annual turnover. Most SMEs are still starting from zero.
            </p>
          </motion.div>

          <div className="hp-esc-grid" style={{ borderTop: `1px solid ${T.border}`, borderLeft: `1px solid ${T.border}` }}>
            {/* Deadline card */}
            <motion.div
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              style={{ padding: '56px 48px', borderRight: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}`, position: 'relative' }}
            >
              <div style={{ position: 'absolute', top: 0, left: 0, width: 2, height: '100%', background: T.red }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                <div>
                  <span style={{ fontSize: 10, fontWeight: 700, color: T.red, textTransform: 'uppercase', letterSpacing: '0.8px', display: 'block', marginBottom: 8 }}>The deadline</span>
                  <h3 style={{ fontSize: 26, fontWeight: 900, color: T.text, margin: 0, letterSpacing: '-0.5px' }}>August 2, 2026</h3>
                </div>
                <Clock size={20} color={T.red} style={{ marginTop: 4 }} />
              </div>
              <p style={{ fontSize: 14, color: T.text2, lineHeight: 1.8, margin: '0 0 32px' }}>
                This is the date high-risk AI system obligations under the EU AI Act become enforceable. Technical documentation, risk management, and evidence packs must exist before this date — not after.
              </p>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 40px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {['Risk classification required per system', 'Technical documentation must be current', 'Human oversight measures must be in place', 'Evidence available for regulator review'].map((f) => (
                  <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: T.text2 }}>
                    <div style={{ width: 4, height: 4, borderRadius: '50%', background: T.red, flexShrink: 0 }} />{f}
                  </li>
                ))}
              </ul>
              <Magnetic>
                <motion.button
                  onClick={() => { track({ event: 'landing_cta_clicked', cta_label: 'Join the Waitlist', section: 'urgency', page: 'landing' }); openWaitlist('waitlist') }}
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  style={{ background: T.red, border: 'none', borderRadius: 8, padding: '12px 24px', fontSize: 13, fontWeight: 700, color: '#fff', cursor: 'pointer', fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', gap: 8 }}
                >
                  <ArrowRight size={14} /> Join the Waitlist
                </motion.button>
              </Magnetic>
            </motion.div>

            {/* Exposure card */}
            <motion.div
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.07 }}
              style={{ padding: '56px 48px', borderRight: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}`, position: 'relative' }}
            >
              <div style={{ position: 'absolute', top: 0, left: 0, width: 2, height: '100%', background: T.purple }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                <div>
                  <span style={{ fontSize: 10, fontWeight: 700, color: T.purple, textTransform: 'uppercase', letterSpacing: '0.8px', display: 'block', marginBottom: 8 }}>The exposure</span>
                  <h3 style={{ fontSize: 26, fontWeight: 900, color: T.text, margin: 0, letterSpacing: '-0.5px' }}>Up to €35M in fines</h3>
                </div>
                <TrendingUp size={20} color={T.purple} style={{ marginTop: 4 }} />
              </div>
              <p style={{ fontSize: 14, color: T.text2, lineHeight: 1.8, margin: '0 0 32px' }}>
                Non-compliance with high-risk AI obligations can result in fines of up to €35,000,000 or 7% of total worldwide annual turnover — whichever is higher. For SMEs, that exposure is existential.
              </p>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 40px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {['€35M or 7% of global turnover for prohibited AI', '€15M or 3% for high-risk non-compliance', 'National supervisory authorities begin audits 2026', 'No grace period after enforcement starts'].map((f) => (
                  <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: T.text2 }}>
                    <div style={{ width: 4, height: 4, borderRadius: '50%', background: T.purple, flexShrink: 0 }} />{f}
                  </li>
                ))}
              </ul>
              <Magnetic>
                <motion.button
                  onClick={() => { track({ event: 'founding_discount_clicked', cta_label: 'Claim Founding Discount', section: 'urgency', page: 'landing' }); openWaitlist('founding') }}
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  style={{ background: T.purple, border: 'none', borderRadius: 8, padding: '12px 24px', fontSize: 13, fontWeight: 700, color: '#fff', cursor: 'pointer', fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', gap: 8 }}
                >
                  <ArrowRight size={14} /> Claim Founding Discount
                </motion.button>
              </Magnetic>
            </motion.div>
          </div>

          {/* Documentation progression ladder */}
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
            style={{ marginTop: 32, display: 'flex', alignItems: 'center', gap: 0, borderTop: `1px solid ${T.border}`, borderLeft: `1px solid ${T.border}` }}
          >
            {[
              { label: 'Define workflow', color: T.text3 },
              { label: 'Classify risk', color: T.accent },
              { label: 'Capture evidence', color: T.purple },
              { label: 'Export pack', color: T.green },
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

      {/* ── FINAL CTA ─────────────────────────────────────────────── */}
      <section className="hp-cta-pad" style={{ textAlign: 'center' }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <motion.div initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <h2 style={{ fontSize: 'clamp(40px, 6vw, 72px)', fontWeight: 900, letterSpacing: '-2.5px', lineHeight: 1.0, margin: '0 0 24px', color: T.text }}>
              Do not wait until<br />someone asks for proof.
            </h2>
            <p style={{ fontSize: 16, color: T.text2, margin: '0 0 16px', lineHeight: 1.8 }}>
              Start documenting your highest-risk workflow now and secure founding access before the deadline pressure hits.
            </p>
            <p style={{ fontSize: 12, color: T.text3, margin: '0 0 40px', lineHeight: 1.7 }}>
              This tool provides guidance only and does not constitute legal advice.<br />Consult a qualified legal professional for binding compliance decisions.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Magnetic>
                <motion.button
                  onClick={() => { track({ event: 'founding_discount_clicked', cta_label: 'Claim Founding Discount', section: 'final-cta', page: 'landing' }); openWaitlist('founding') }}
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: T.text, color: T.bg, fontSize: 16, fontWeight: 800, padding: '16px 40px', borderRadius: 100, border: 'none', cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '-0.3px' }}
                >
                  Claim Founding Discount <ArrowRight size={18} />
                </motion.button>
              </Magnetic>
              <Magnetic>
                <motion.button
                  onClick={() => { track({ event: 'walkthrough_clicked', cta_label: 'Book a Walkthrough', section: 'final-cta', page: 'landing' }); openWaitlist('walkthrough') }}
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: 'transparent', color: T.text2, fontSize: 15, fontWeight: 700, padding: '16px 32px', borderRadius: 100, border: `1px solid ${T.border}`, cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '-0.2px' }}
                >
                  Book a Walkthrough
                </motion.button>
              </Magnetic>
            </div>
          </motion.div>
        </div>
      </section>

      <Divider />

      {/* ── FOOTER ───────────────────────────────────────────────── */}
      <footer style={{ padding: '64px 32px', background: T.surface }}>
        <div style={{ maxWidth: 1160, margin: '0 auto' }}>
          <div className="r-grid-footer" style={{ marginBottom: 64 }}>
            <div>
              <div style={{ marginBottom: 16 }}>
                <Logo size={24} />
              </div>
              <p style={{ fontSize: 13, color: T.text2, lineHeight: 1.85, maxWidth: 220, margin: '0 0 20px' }}>
                EU AI Act documentation and evidence pack software for SMEs.
              </p>
              <div style={{ display: 'flex', gap: 8 }}>
                {['EU AI Act', 'GDPR Safe', 'Guidance Only'].map((b) => (
                  <span key={b} style={{ fontSize: 10, fontWeight: 700, color: T.text3, border: `1px solid ${T.border}`, padding: '3px 10px', borderRadius: 100, letterSpacing: '0.3px' }}>{b}</span>
                ))}
              </div>
            </div>
            {[
              {
                title: 'Product',
                links: [
                  { label: 'Features', href: '#features' },
                  { label: 'Pricing', href: '#pricing' },
                  { label: 'How It Works', href: '#how-it-works' },
                ],
              },
              {
                title: 'Legal',
                links: [
                  { label: 'Privacy Policy', href: '#' },
                  { label: 'Terms of Service', href: '#' },
                  { label: 'Guidance Disclaimer', href: '#' },
                ],
              },
              {
                title: 'Company',
                links: [
                  { label: 'About', href: '#' },
                  { label: 'Contact', href: '#' },
                  { label: 'hello@aied.io', href: 'mailto:hello@aied.io' },
                ],
              },
            ].map(({ title, links }) => (
              <div key={title}>
                <h4 style={{ color: T.text3, fontWeight: 700, fontSize: 10, marginBottom: 20, letterSpacing: '0.8px', textTransform: 'uppercase' }}>{title}</h4>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {links.map(({ label, href }) => (
                    <li key={label}>
                      <motion.a href={href} whileHover={{ color: T.text }} style={{ color: T.text2, textDecoration: 'none', fontSize: 13, display: 'inline-block', transition: 'color 0.15s' }}>{label}</motion.a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 24, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
            <p style={{ color: T.text3, fontSize: 12, margin: 0 }}>© {new Date().getFullYear()} AI Act Evidence Desk. Guidance only — not legal advice.</p>
            <p style={{ color: T.text3, fontSize: 12, margin: 0 }}>aied.io</p>
          </div>
        </div>
      </footer>

      {/* ── Waitlist modal ────────────────────────────────────────── */}
      <AnimatePresence>
        {waitlistModal && <WaitlistModal variant={waitlistModal} onClose={() => setWaitlistModal(null)} />}
      </AnimatePresence>
    </div>
  )
}
