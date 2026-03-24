'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import Link from 'next/link'
import { motion, useScroll, useSpring, useInView, useMotionValue, animate, AnimatePresence } from 'framer-motion'
import { Shield, FileText, CheckCircle, ArrowRight, Zap, BarChart3, AlertTriangle, Menu, X } from 'lucide-react'
import { track, type AnalyticsEvent } from '@/lib/analytics'

// ─── Design tokens ──────────────────────────────────────────────────────────
const T = {
  bg:          '#020203',
  surface:     '#080809',
  surface2:    '#0e0e10',
  card:        '#0b0b0d',
  border:      'rgba(255,255,255,0.06)',
  borderMid:   'rgba(255,255,255,0.10)',
  borderHi:    'rgba(255,255,255,0.16)',
  text:        '#efefef',
  text2:       '#555560',
  text3:       '#2a2a30',
  accent:      '#00e5bf',
  accentDim:   'rgba(0,229,191,0.08)',
  accentGlow:  'rgba(0,229,191,0.18)',
  blue:        '#47c9e5',
  red:         '#e54747',
  amber:       '#f59e0b',
  purple:      '#a78bfa',
  green:       '#36bd5f',
}

const FF = 'var(--font-raleway), Raleway, Helvetica, Arial, sans-serif'

// ─── Shared style helpers ────────────────────────────────────────────────────
const S = {
  overline: { fontSize: 9, fontWeight: 800, color: 'rgba(255,255,255,0.38)', textTransform: 'uppercase' as const, letterSpacing: '2.4px', margin: '0 0 22px', display: 'block' as const },
  h2: { fontWeight: 900, letterSpacing: '-0.04em', margin: 0, lineHeight: 1.05 } as React.CSSProperties,
  wallCell: { borderRight: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}` },
  dot4: { width: 4, height: 4, borderRadius: '50%', flexShrink: 0 as const },
  listItem: { display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: T.text2 },
  listItemStart: { display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 14, color: T.text2, lineHeight: 1.7 },
  cardPad: { padding: '40px 32px' },
  cardPadLg: { padding: '56px 48px' },
  inlineBtn: { display: 'inline-flex', alignItems: 'center', gap: 8, border: 'none', cursor: 'pointer', fontFamily: FF } as React.CSSProperties,
}

// ─── Animation helpers ───────────────────────────────────────────────────────
const SPRING_EASE = [0.16, 1, 0.3, 1] as [number, number, number, number]
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6, delay, ease: SPRING_EASE },
})
const fadeInOnce = (delay = 0) => ({
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.55, delay, ease: SPRING_EASE },
})

// ─── Data ────────────────────────────────────────────────────────────────────
const FEATURES = [
  { icon: Shield,        title: 'Risk Classification',  desc: 'Answer 12 structured questions and receive an Annex III risk classification plus a mapped list of obligations that apply to your specific system.' },
  { icon: FileText,      title: 'Evidence Packs',       desc: 'Per-workflow evidence packs structured for regulator and auditor review. Export as PDF or Word. One pack per system, not one generic policy doc.' },
  { icon: CheckCircle,   title: 'Obligations Map',      desc: 'Every obligation that applies to your workflow, mapped to the specific evidence you need to collect. No guesswork, no missing requirements.' },
  { icon: Zap,           title: 'Guided Workflow',      desc: 'A wizard-driven interface walks each stakeholder through exactly what to document, what to capture, and how to structure it.' },
  { icon: BarChart3,     title: 'Progress Tracking',    desc: 'See which systems are fully documented, which are in progress, and which still carry unaddressed risk across your organisation.' },
  { icon: AlertTriangle, title: 'Deadline Monitor',     desc: 'Track days remaining to August 2, 2026 per system. Get visibility on your risk exposure window before enforcement begins.' },
]

const STATS = [
  { to: 35,  prefix: '€', suffix: 'M',   label: 'maximum fine for non-compliance' },
  { to: 50,  prefix: '€', suffix: 'k',   label: 'avg. consultant cost per system' },
  { to: 50,  prefix: '',  suffix: 'h+',  label: 'manual documentation per system' },
  { to: 20,  prefix: '',  suffix: 'min', label: 'to document a workflow with Irvo' },
]

const STEPS = [
  { n: '01', title: 'Define your system',                desc: 'Describe the AI or automation system: what it does, who owns it, what data it uses, and which business process it supports.' },
  { n: '02', title: 'Answer 12 questions',               desc: 'Complete a guided questionnaire covering impact, automation level, data use, and potential harm. Takes about 15 minutes.' },
  { n: '03', title: 'Get your classification',           desc: 'Receive the likely risk level, any Annex III category that may apply, and a mapped list of the specific obligations you need to meet.' },
  { n: '04', title: 'Capture evidence and export',       desc: 'Attach documents, add notes, and complete each obligation. Export a regulator-ready evidence pack in PDF or Word format — one structured pack per system.' },
]

const TESTIMONIALS = [
  { name: 'Sophie M.',  role: 'Legal Counsel, Amsterdam',      text: 'We have been building spreadsheets for two years and still cannot give our board a clear picture of which systems are in scope. That is exactly the problem this solves.' },
  { name: 'Daniel F.',  role: 'Head of Compliance, Dublin',    text: 'Documenting 12 AI systems before August 2026 manually would take months. Any tool that compresses that into hours is immediately worth evaluating.' },
  { name: 'Elena V.',   role: 'Operations Director, Berlin',   text: 'Every consultant we spoke to quoted a minimum of €20,000 just for a scoping exercise. We needed something we could start ourselves.' },
]

interface PricingPlan { name: string; monthly: number; annual: number; desc: string; features: string[]; highlight?: boolean; plus?: boolean }
const PRICING: PricingPlan[] = [
  { name: 'Starter', monthly: 149, annual: 119, desc: '1 user · 3 systems',      features: ['3 AI systems', 'PDF export', 'Risk classification', 'Obligations map', 'Basic templates', 'Email support'] },
  { name: 'Growth',  monthly: 399, annual: 319, desc: 'Up to 5 users · 10 systems', highlight: true, features: ['10 AI systems', '5 users', 'PDF + Word export', 'AI drafting assistance', 'Custom templates', 'Priority support'] },
  { name: 'Plus',    monthly: 799, annual: 639, desc: 'Unlimited users',          plus: true, features: ['25+ AI systems', 'Unlimited users', 'Auditor view', 'API access', 'Custom templates', 'Dedicated support'] },
]

const FAQS = [
  { q: 'Is this legal advice?',                                 a: 'No. The product helps you organise documentation and evidence. It does not replace qualified legal advice. Consult a legal professional for binding compliance decisions.' },
  { q: 'Do I need this if I use Zapier, Make, or similar?',     a: 'Potentially yes. Some automation workflows may still fall within scope depending on what they do, who they affect, and how much decision-making is automated.' },
  { q: 'What counts as an AI system under the Act?',            a: 'Any workflow using models, automated decision logic, or AI-enabled tooling to influence outcomes affecting people may need review. The Act uses a broad definition intentionally.' },
  { q: 'What if I already have documentation?',                 a: 'You can use the product to structure existing documentation into a workflow-specific evidence pack in the format regulators and auditors expect.' },
  { q: 'What happens after August 2026?',                       a: 'You will still need to maintain documentation for new systems, updates, periodic reviews, and ongoing compliance activity. Documentation is not a one-time task.' },
  { q: 'What is Annex III?',                                    a: 'Annex III lists specific AI system categories the EU AI Act classifies as high-risk — including systems used in recruitment, credit, biometrics, critical infrastructure, and more.' },
]

// ─── Primitive components ────────────────────────────────────────────────────
const DEADLINE = new Date('2026-08-02T00:00:00Z').getTime()
function useDaysLeft() {
  const [now, setNow] = useState<number | null>(null)
  useEffect(() => { const id = setTimeout(() => setNow(Date.now()), 0); return () => clearTimeout(id) }, [])
  if (now === null) return null
  return Math.max(0, Math.ceil((DEADLINE - now) / 86400000))
}

function DaysLeft() {
  const days = useDaysLeft()
  return <>{days !== null ? days.toLocaleString() : '—'} days</>
}

function MonthsLeft() {
  const days = useDaysLeft()
  if (days === null) return <>—</>
  const months = Math.max(1, Math.ceil(days / 30.44))
  return <>{months} month{months !== 1 ? 's' : ''}</>
}

function Divider() {
  return <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06) 20%, rgba(255,255,255,0.06) 80%, transparent)' }} />
}

// Particle constellation — lives in the dark, revealed by the spotlight
// Cursor pushes particles away; connections light up as they enter the spotlight
function HeroCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let W = window.innerWidth
    let H = window.innerHeight
    canvas.width = W
    canvas.height = H

    // Cursor position (raw — not spring lagged)
    let mx = W / 2, my = H * 0.42

    // Deterministic particles — no Math.random() = no SSR hydration mismatch
    const N = 78
    const pts = Array.from({ length: N }, (_, i) => ({
      x:    (i * 131.7 + 20) % W,
      y:    (i * 97.4  + 15) % H,
      vx:   (((i * 13 + 7) % 21) - 10) * 0.032,
      vy:   (((i * 9  + 3) % 21) - 10) * 0.032,
      size: 1.1 + (i % 3) * 0.55,
    }))

    const LINK  = 138, LINK2  = LINK * LINK
    const GLOW  = 240, GLOW2  = GLOW * GLOW
    const PUSH  = 160, PUSH2  = PUSH * PUSH

    const onMove    = (e: MouseEvent) => { mx = e.clientX; my = e.clientY }
    const onResize  = () => {
      W = canvas.width = window.innerWidth
      H = canvas.height = window.innerHeight
    }
    window.addEventListener('mousemove', onMove,   { passive: true })
    window.addEventListener('resize',   onResize)

    let raf = 0

    const draw = () => {
      raf = requestAnimationFrame(draw)
      ctx.clearRect(0, 0, W, H)

      // Precompute squared cursor distances
      const cd2 = pts.map(p => {
        const dx = p.x - mx, dy = p.y - my
        return dx * dx + dy * dy
      })

      // ── Connections ──────────────────────────────────────────
      // Pass 1: batch all dim connections into one path (fast single flush)
      ctx.beginPath()
      ctx.lineWidth = 0.5
      for (let i = 0; i < N; i++) {
        if (cd2[i] < GLOW2) continue          // skip — handled in pass 2
        for (let j = i + 1; j < N; j++) {
          if (cd2[j] < GLOW2) continue
          const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y
          if (dx * dx + dy * dy < LINK2) {
            ctx.moveTo(pts[i].x, pts[i].y)
            ctx.lineTo(pts[j].x, pts[j].y)
          }
        }
      }
      ctx.strokeStyle = 'rgba(160,185,205,0.04)'
      ctx.stroke()

      // Pass 2: lit connections (variable alpha — individual strokes)
      ctx.lineWidth = 0.6
      for (let i = 0; i < N; i++) {
        for (let j = i + 1; j < N; j++) {
          if (cd2[i] >= GLOW2 && cd2[j] >= GLOW2) continue
          const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y
          const d2 = dx * dx + dy * dy
          if (d2 < LINK2) {
            const prox = 1 - Math.sqrt(d2) / LINK
            const gfI  = cd2[i] < GLOW2 ? 1 - Math.sqrt(cd2[i]) / GLOW : 0
            const gfJ  = cd2[j] < GLOW2 ? 1 - Math.sqrt(cd2[j]) / GLOW : 0
            const gf   = Math.max(gfI, gfJ)
            ctx.beginPath()
            ctx.moveTo(pts[i].x, pts[i].y)
            ctx.lineTo(pts[j].x, pts[j].y)
            ctx.strokeStyle = `rgba(0,229,191,${(prox * gf * 0.38).toFixed(3)})`
            ctx.stroke()
          }
        }
      }

      // ── Particles ────────────────────────────────────────────
      for (let i = 0; i < N; i++) {
        const p = pts[i]
        const d2 = cd2[i]

        // Cursor repulsion
        if (d2 < PUSH2 && d2 > 0) {
          const d = Math.sqrt(d2)
          const f = ((PUSH - d) / PUSH) * 0.10
          p.vx += ((p.x - mx) / d) * f
          p.vy += ((p.y - my) / d) * f
        }

        p.vx *= 0.974; p.vy *= 0.974
        p.x  += p.vx;  p.y  += p.vy

        if (p.x < -12)    p.x += W + 24
        else if (p.x > W + 12) p.x -= W + 24
        if (p.y < -12)    p.y += H + 24
        else if (p.y > H + 12) p.y -= H + 24

        const gf = d2 < GLOW2 ? 1 - Math.sqrt(d2) / GLOW : 0
        const a  = gf > 0 ? 0.10 + gf * 0.54 : 0.055

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = gf > 0.04
          ? `rgba(0,229,191,${a.toFixed(3)})`
          : `rgba(180,200,215,${(a * 0.5).toFixed(3)})`
        ctx.fill()
      }
    }

    raf = requestAnimationFrame(draw)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('resize',   onResize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }}
    />
  )
}

// Minimal ambient backdrop — the spotlight lives on top of this
function HeroBg() {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {/* Breathing top beam — brand signature light source */}
      <motion.div
        animate={{ opacity: [0.82, 1, 0.82], scale: [1, 1.04, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse 72% 44% at 50% -4%, rgba(0,229,191,0.20) 0%, rgba(0,229,191,0.04) 55%, transparent 70%)',
          transformOrigin: '50% 0%',
        }}
      />
      {/* Film grain — gives the darkness texture */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.024 }}>
        <filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="4" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter>
        <rect width="100%" height="100%" filter="url(#n)"/>
      </svg>
      {/* Deep vignette — edges fall to black, focuses attention */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse 100% 80% at 50% 50%, transparent 20%, rgba(2,2,3,0.94) 100%)',
      }} />
    </div>
  )
}

function FinalCtaBg() {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {/* Upward stage light — cinematic, not ambient */}
      <motion.div
        animate={{ opacity: [0.8, 1, 0.8] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse 700px 500px at 50% 105%, rgba(0,229,191,0.18) 0%, rgba(0,229,191,0.07) 42%, transparent 65%)',
        }}
      />
      {/* Thin vertical light column */}
      <div style={{
        position: 'absolute', top: 0, bottom: 0, left: '50%', width: 1, transform: 'translateX(-50%)',
        background: 'linear-gradient(transparent 0%, rgba(0,229,191,0.08) 40%, rgba(0,229,191,0.12) 60%, rgba(0,229,191,0.04) 85%, transparent 100%)',
      }} />
      {/* Strong edge vignette — stage effect */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse 120% 100% at 50% 50%, transparent 25%, rgba(2,2,3,0.85) 100%)',
      }} />
    </div>
  )
}

function Cursor() {
  const dotRef  = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let raf = 0
    let tx = -100, ty = -100
    let cx = tx, cy = ty, vx = 0, vy = 0

    const onMove = (e: MouseEvent) => { tx = e.clientX; ty = e.clientY }
    window.addEventListener('mousemove', onMove, { passive: true })

    const tick = () => {
      raf = requestAnimationFrame(tick)

      // Overdamped spring — glides, never bounces
      vx = vx * 0.85 + (tx - cx) * 0.10
      vy = vy * 0.85 + (ty - cy) * 0.10
      cx += vx; cy += vy

      if (dotRef.current)
        dotRef.current.style.transform =
          `translate(${tx}px,${ty}px) translate(-50%,-50%)`

      if (ringRef.current)
        ringRef.current.style.transform =
          `translate(${(cx - 12).toFixed(1)}px,${(cy - 12).toFixed(1)}px)`
    }

    raf = requestAnimationFrame(tick)
    return () => { cancelAnimationFrame(raf); window.removeEventListener('mousemove', onMove) }
  }, [])

  return (
    <>
      {/* 2px dot — snaps to exact cursor position */}
      <div ref={dotRef} style={{
        position: 'fixed', top: 0, left: 0, zIndex: 9999,
        width: 4, height: 4, borderRadius: '50%',
        background: 'rgba(255,255,255,0.9)',
        pointerEvents: 'none', willChange: 'transform',
      }} />
      {/* 24px outline ring — follows with soft lag */}
      <div ref={ringRef} style={{
        position: 'fixed', top: 0, left: 0, zIndex: 9998,
        width: 24, height: 24, borderRadius: '50%',
        border: '1px solid rgba(255,255,255,0.45)',
        pointerEvents: 'none', willChange: 'transform',
      }} />
    </>
  )
}

function ScrollBar() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 30 })
  return <motion.div style={{ scaleX, position: 'fixed', top: 0, left: 0, right: 0, height: 1, background: T.accent, transformOrigin: '0%', zIndex: 200 }} />
}

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

// ─── WaitlistModal ───────────────────────────────────────────────────────────
type WaitlistVariant = 'waitlist' | 'founding' | 'walkthrough'
interface WaitlistForm { email: string; full_name: string; company_name: string }
const WL_EMPTY: WaitlistForm = { email: '', full_name: '', company_name: '' }
const WL_CONFIG = {
  waitlist:    { overline: 'Join the Waitlist',  headline: 'Be first when we launch',       sub: 'We will notify you before public access opens and share early documentation resources.',                                                               cta: 'Join the Waitlist',       source: 'landing-waitlist' },
  founding:    { overline: 'Founding Access',    headline: 'Claim your founding discount',  sub: 'Founding members lock in 30% off for the lifetime of their plan. Limited to the first 20 customers who pre-pay 3 months upfront.',                   cta: 'Claim Founding Discount', source: 'landing-founding' },
  walkthrough: { overline: 'Book a Walkthrough', headline: 'See the product in 30 minutes', sub: 'Leave your details and we will reach out within one business day to schedule a walkthrough.',                                                        cta: 'Request Walkthrough',     source: 'landing-walkthrough' },
}

function Field({ label, id, name, value, onChange, type = 'text', placeholder, required }: { label: string; id: string; name: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string; required?: boolean }) {
  const [focused, setFocused] = useState(false)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label htmlFor={id} style={{ fontSize: 10, fontWeight: 700, color: T.text2, textTransform: 'uppercase', letterSpacing: '0.7px' }}>
        {label}{required && <span style={{ color: T.red }}> *</span>}
      </label>
      <input
        id={id} name={name}
        type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{ background: T.surface, border: `1px solid ${focused ? T.borderMid : T.border}`, padding: '10px 12px', fontSize: 13, color: T.text, outline: 'none', fontFamily: FF, width: '100%', boxSizing: 'border-box', transition: 'border-color 0.15s', caretColor: T.accent, borderRadius: 0 }}
      />
    </div>
  )
}

function WaitlistModal({ variant, onClose }: { variant: WaitlistVariant; onClose: () => void }) {
  const [form, setForm] = useState<WaitlistForm>(WL_EMPTY)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const set = (k: keyof WaitlistForm) => (v: string) => setForm((f) => ({ ...f, [k]: v }))
  const cfg = WL_CONFIG[variant]
  const dialogRef = useRef<HTMLDivElement>(null)

  // A1: Focus trap — keep Tab/Shift-Tab within the modal
  useEffect(() => {
    const el = dialogRef.current
    if (!el) return
    const focusable = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return
      const nodes = Array.from(el.querySelectorAll<HTMLElement>(focusable)).filter((n) => !(n as HTMLButtonElement).disabled)
      if (nodes.length === 0) return
      const first = nodes[0], last = nodes[nodes.length - 1]
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus() }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus() }
      }
    }
    el.addEventListener('keydown', handleKeyDown)
    return () => el.removeEventListener('keydown', handleKeyDown)
  }, [])

  // A5: Auto-focus email input when modal opens
  useEffect(() => {
    const t = setTimeout(() => (document.getElementById('wl-email') as HTMLInputElement | null)?.focus(), 60)
    return () => clearTimeout(t)
  }, [])

  // Close on Escape key
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onClose])

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    setError(null)
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { setError('Please enter a valid email address.'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email.trim(), full_name: form.full_name.trim() || undefined, company_name: form.company_name.trim() || undefined, source: cfg.source }),
      }).then((r) => r.json())
      if (res.success) {
        track({ event: res.duplicate ? 'waitlist_duplicate' : 'waitlist_submitted', cta_label: cfg.cta, section: 'modal', page: 'landing' })
        setSuccess(res.duplicate ? "You're already on the list — we'll be in touch before we launch." : "You're on the list. We'll reach out before launch with early access details.")
      } else { setError(res.error ?? 'Something went wrong. Please try again.') }
    } catch { setError('Network error. Please try again.') }
    setLoading(false)
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}
      role="dialog" aria-modal="true" aria-labelledby="wl-modal-title"
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <motion.div ref={dialogRef} initial={{ scale: 0.95, opacity: 0, y: 16 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.97, opacity: 0 }} transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
        style={{ background: T.surface, border: `1px solid ${T.borderMid}`, padding: 36, maxWidth: 480, width: '100%', fontFamily: FF, position: 'relative' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${T.accent}, transparent)` }} />
        <button onClick={onClose} aria-label="Close" style={{ position: 'absolute', top: 16, right: 16, background: 'transparent', border: 'none', cursor: 'pointer', color: T.text2, display: 'flex', padding: 6 }}>
          <X size={15} />
        </button>
        {success ? (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <CheckCircle size={40} color={T.green} style={{ margin: '0 auto 16px', display: 'block' }} />
            <h2 id="wl-modal-title" style={{ fontSize: 20, fontWeight: 800, color: T.text, margin: '0 0 8px', letterSpacing: '-0.3px' }}>You&apos;re on the list</h2>
            <p style={{ fontSize: 14, color: T.text2, margin: '0 0 24px', lineHeight: 1.7 }}>{success}</p>
            <button onClick={onClose} style={{ background: T.surface2, border: `1px solid ${T.border}`, padding: '10px 24px', fontSize: 13, fontWeight: 600, color: T.text, cursor: 'pointer', fontFamily: FF }}>Close</button>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: 28 }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: T.accent, textTransform: 'uppercase', letterSpacing: '0.8px', margin: '0 0 6px' }}>{cfg.overline}</p>
              <h2 id="wl-modal-title" style={{ fontSize: 22, fontWeight: 800, color: T.text, margin: '0 0 4px', letterSpacing: '-0.4px' }}>{cfg.headline}</h2>
              <p style={{ fontSize: 13, color: T.text2, margin: 0, lineHeight: 1.7 }}>{cfg.sub}</p>
            </div>
            <form onSubmit={submit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <Field label="Email address" id="wl-email" name="email" value={form.email} onChange={set('email')} type="email" placeholder="you@company.com" required />
              <Field label="Full name (optional)" id="wl-full-name" name="full_name" value={form.full_name} onChange={set('full_name')} placeholder="Jane Smith" />
              <Field label="Company (optional)" id="wl-company" name="company_name" value={form.company_name} onChange={set('company_name')} placeholder="Acme GmbH" />
              {/* Hidden honeypot field — bots fill this; humans never see it */}
              <input name="website" tabIndex={-1} aria-hidden="true" style={{ display: 'none' }} readOnly value="" />
              {error && <p role="alert" style={{ fontSize: 12, color: T.red, background: 'rgba(229,71,71,0.06)', border: '1px solid rgba(229,71,71,0.15)', padding: '10px 14px', margin: 0 }}>{error}</p>}
              <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
                <button type="button" onClick={onClose} style={{ flex: 1, background: 'transparent', border: `1px solid ${T.border}`, padding: '12px 0', fontSize: 13, fontWeight: 600, color: T.text2, cursor: 'pointer', fontFamily: FF, transition: 'border-color 0.15s', borderRadius: 0 }}>Cancel</button>
                <motion.button type="submit" disabled={loading} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                  style={{ flex: 2, background: T.accent, border: 'none', borderRadius: 100, padding: '12px 0', fontSize: 13, fontWeight: 800, color: T.bg, cursor: loading ? 'default' : 'pointer', fontFamily: FF, opacity: loading ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 0 24px rgba(0,229,191,0.15), 0 1px 0 rgba(255,255,255,0.12) inset' }}>
                  <ArrowRight size={14} />{loading ? 'Submitting…' : cfg.cta}
                </motion.button>
              </div>
              <p style={{ fontSize: 11, color: T.text3, textAlign: 'center', margin: 0 }}>No spam · Unsubscribe anytime · Guidance only, not legal advice</p>
            </form>
          </>
        )}
      </motion.div>
    </motion.div>
  )
}

function Logo({ size = 28 }: { size?: number }) {
  return (
    <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: Math.round(size * 0.38), userSelect: 'none', textDecoration: 'none' }}>
      <div style={{ width: 3, height: Math.round(size * 0.85), background: T.accent, flexShrink: 0, borderRadius: 1 }} />
      <span style={{ fontSize: size, fontWeight: 900, letterSpacing: '-0.5px', color: T.text, fontFamily: FF, lineHeight: 1, whiteSpace: 'nowrap' }}>IRVO</span>
    </Link>
  )
}

// ─── SystemsEstimator ────────────────────────────────────────────────────────
function SystemsEstimator({ onOpenWaitlist }: { onOpenWaitlist: (v: WaitlistVariant) => void }) {
  const [systems, setSystems] = useState('3')
  const [rate, setRate] = useState('150')
  const [sysFocus, setSysFocus] = useState(false)
  const [rateFocus, setRateFocus] = useState(false)

  const systemsNum = Math.max(0, parseInt(systems) || 0)
  const rateNum = Math.max(0, parseFloat(rate) || 0)
  const manualHours = systemsNum * 50
  const consultantCost = systemsNum * rateNum * 50
  const irvoMinutes = systemsNum * 20
  const savings = Math.max(0, consultantCost - 149 * 12)
  const hasResult = systemsNum > 0 && rateNum > 0
  const fmtGbp = (n: number) => `£${n.toLocaleString('en-GB')}`
  const inputStyle = { fontSize: 40, fontWeight: 900, color: T.text, background: 'transparent', border: 'none', outline: 'none', width: '100%', fontFamily: FF, letterSpacing: '-2px', caretColor: T.accent, appearance: 'textfield' as const }

  return (
    <section className="hp-section-pad" style={{ background: T.surface }}>
      <div style={{ maxWidth: 1160, margin: '0 auto' }}>
        <motion.div {...fadeUp()} style={{ marginBottom: 64 }}>
          <p style={S.overline}>Documentation Burden Calculator</p>
          <h2 style={{ fontSize: 'clamp(30px, 4vw, 48px)', fontWeight: 900, letterSpacing: '-0.04em', margin: '0 0 14px', lineHeight: 1.05 }}>
            What are undocumented AI systems <em style={{ fontStyle: 'normal', color: T.accent }}>costing you?</em>
          </h2>
          <p style={{ fontSize: 15, color: T.text2, margin: 0, maxWidth: 480, lineHeight: 1.75 }}>
            Enter your AI or automation workflow count and internal hourly rate. See the documentation burden at current market rates.
          </p>
        </motion.div>

        <motion.div {...fadeUp(0.1)} style={{ border: `1px solid ${T.border}`, background: T.card }}>
          <div className="r-grid-2" style={{ borderBottom: `1px solid ${T.border}` }}>
            <div style={{ padding: '32px 36px', borderRight: `1px solid ${T.border}` }}>
              <label style={{ fontSize: 10, fontWeight: 700, color: T.text2, textTransform: 'uppercase', letterSpacing: '0.8px', display: 'block', marginBottom: 12 }}>AI / Automation Systems</label>
              <input type="number" value={systems} onChange={(e) => setSystems(e.target.value)} onFocus={() => setSysFocus(true)} onBlur={() => setSysFocus(false)} placeholder="3" style={inputStyle} />
              <div style={{ height: 2, background: sysFocus ? T.accent : T.border, marginTop: 8, transition: 'background 0.2s' }} />
            </div>
            <div style={{ padding: '32px 36px' }}>
              <label style={{ fontSize: 10, fontWeight: 700, color: T.text2, textTransform: 'uppercase', letterSpacing: '0.8px', display: 'block', marginBottom: 12 }}>Internal Hourly Rate (£)</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 32, fontWeight: 900, color: T.text3 }}>£</span>
                <input type="number" value={rate} onChange={(e) => setRate(e.target.value)} onFocus={() => setRateFocus(true)} onBlur={() => setRateFocus(false)} placeholder="150" style={inputStyle} />
              </div>
              <div style={{ height: 2, background: rateFocus ? T.accent : T.border, marginTop: 8, transition: 'background 0.2s' }} />
            </div>
          </div>

          <div className="r-grid-4" style={{ borderBottom: `1px solid ${T.border}` }}>
            {[
              { label: 'Manual documentation hours',    value: hasResult ? `${manualHours}h`       : '—', note: `${systemsNum} system${systemsNum !== 1 ? 's' : ''} × 50 hrs`, highlight: false },
              { label: 'Consultant cost estimate',      value: hasResult ? fmtGbp(consultantCost)  : '—', note: `£${rateNum}/hr × 50 hrs each`,                                highlight: false },
              { label: 'Documentation time with Irvo', value: hasResult ? `${irvoMinutes} min`     : '—', note: '~20 min per system',                                         highlight: false },
              { label: 'Potential savings',             value: hasResult ? fmtGbp(savings)         : '—', note: 'vs Irvo Starter plan',                                        highlight: true  },
            ].map((col, i) => (
              <motion.div key={col.label} animate={{ opacity: hasResult ? 1 : 0.4 }} transition={{ duration: 0.3 }}
                style={{ padding: '32px 36px', borderRight: i < 3 ? `1px solid ${T.border}` : 'none', borderTop: col.highlight ? `2px solid ${T.accent}` : undefined, background: col.highlight ? T.accentDim : 'transparent' }}>
                <p style={{ fontSize: 9, fontWeight: 700, color: col.highlight ? T.accent : T.text2, textTransform: 'uppercase', letterSpacing: '0.8px', margin: '0 0 16px' }}>{col.label}</p>
                <AnimatePresence mode="wait">
                  <motion.p key={col.value} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }}
                    style={{ fontSize: col.highlight ? 28 : 22, fontWeight: 900, color: col.highlight ? T.accent : T.text, margin: '0 0 6px', letterSpacing: '-1px', fontVariantNumeric: 'tabular-nums' }}>
                    {col.value}
                  </motion.p>
                </AnimatePresence>
                <p style={{ fontSize: 10, color: T.text3, margin: 0, fontWeight: 600 }}>{col.note}</p>
              </motion.div>
            ))}
          </div>

          <div style={{ padding: '24px 36px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <p style={{ fontSize: 13, color: T.text2, margin: 0, maxWidth: 520, lineHeight: 1.7 }}>
              {hasResult ? `Manual documentation at £${rateNum}/hr costs ${fmtGbp(consultantCost)}. Irvo Starter is £149/mo. Documentation pays for itself in week one.` : 'Enter your AI system count and internal hourly rate to see your documentation burden.'}
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => { track({ event: 'landing_cta_clicked', cta_label: 'Get Early Access', section: 'estimator', page: 'landing' }); onOpenWaitlist('waitlist') }}
                style={{ ...S.inlineBtn, background: T.accent, color: T.bg, fontSize: 13, fontWeight: 700, padding: '11px 24px', borderRadius: 100, boxShadow: '0 0 24px rgba(0,229,191,0.15), 0 1px 0 rgba(255,255,255,0.12) inset' }}>
                Get Early Access <ArrowRight size={14} />
              </button>
              <button onClick={() => { setSystems('3'); setRate('150') }}
                style={{ background: 'transparent', border: `1px solid ${T.border}`, color: T.text2, fontSize: 12, fontWeight: 600, padding: '11px 16px', cursor: 'pointer', fontFamily: FF }}>
                Reset
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

// ─── Visual effects ───────────────────────────────────────────────────────────
// Spring-physics spotlight — 3 layers at different masses create trailing depth
function CursorSpotlight() {
  const innerRef = useRef<HTMLDivElement>(null)
  const midRef   = useRef<HTMLDivElement>(null)
  const outerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let raf = 0
    // Cursor target
    let tx = window.innerWidth / 2, ty = window.innerHeight * 0.44
    // Mid layer — moderate mass
    let mx = tx, my = ty, mvx = 0, mvy = 0
    // Outer layer — heavy mass, drifts behind
    let ox = tx, oy = ty, ovx = 0, ovy = 0

    const onMove = (e: MouseEvent) => { tx = e.clientX; ty = e.clientY }

    const tick = () => {
      raf = requestAnimationFrame(tick)

      mvx = mvx * 0.76 + (tx - mx) * 0.11
      mvy = mvy * 0.76 + (ty - my) * 0.11
      mx += mvx; my += mvy

      ovx = ovx * 0.84 + (tx - ox) * 0.052
      ovy = ovy * 0.84 + (ty - oy) * 0.052
      ox += ovx; oy += ovy

      if (innerRef.current)
        innerRef.current.style.background =
          `radial-gradient(140px circle at ${tx}px ${ty}px, rgba(0,229,191,0.11) 0%, rgba(0,229,191,0.03) 55%, transparent 100%)`
      if (midRef.current)
        midRef.current.style.background =
          `radial-gradient(480px circle at ${mx}px ${my}px, rgba(0,229,191,0.05) 0%, rgba(71,201,229,0.015) 60%, transparent 100%)`
      if (outerRef.current)
        outerRef.current.style.background =
          `radial-gradient(880px circle at ${ox}px ${oy}px, rgba(0,229,191,0.022) 0%, transparent 62%)`
    }

    raf = requestAnimationFrame(tick)
    window.addEventListener('mousemove', onMove, { passive: true })
    return () => { cancelAnimationFrame(raf); window.removeEventListener('mousemove', onMove) }
  }, [])

  return (
    <>
      <div ref={outerRef} style={{ position: 'fixed', inset: 0, zIndex: 3, pointerEvents: 'none' }} />
      <div ref={midRef}   style={{ position: 'fixed', inset: 0, zIndex: 3, pointerEvents: 'none' }} />
      <div ref={innerRef} style={{ position: 'fixed', inset: 0, zIndex: 3, pointerEvents: 'none' }} />
    </>
  )
}

// Card glow — call onMouseMove / onMouseLeave on the card element
const cardGlowMove = (e: React.MouseEvent<HTMLDivElement>) => {
  const r = e.currentTarget.getBoundingClientRect()
  const g = e.currentTarget.querySelector<HTMLElement>('[data-glow]')
  if (g) g.style.background = `radial-gradient(280px circle at ${e.clientX - r.left}px ${e.clientY - r.top}px, rgba(0,229,191,0.09) 0%, transparent 70%)`
}
const cardGlowLeave = (e: React.MouseEvent<HTMLDivElement>) => {
  const g = e.currentTarget.querySelector<HTMLElement>('[data-glow]')
  if (g) g.style.background = 'none'
}

// ─── Main page ───────────────────────────────────────────────────────────────
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
    <div style={{ background: T.bg, color: T.text, fontFamily: FF, minHeight: '100vh', cursor: 'none' }}>
      <HeroCanvas />
      <CursorSpotlight />
      <Cursor />
      <ScrollBar />

      {/* Content wrapper — sits above canvas (z:0) but below spotlight (z:3) */}
      <div style={{ position: 'relative', zIndex: 2 }}>

      {/* Mobile nav overlay */}
      <div className={`mobile-nav-overlay${mobileMenu ? ' open' : ''}`} style={{ background: T.bg }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 40 }}>
          <Logo size={28} />
          <button onClick={() => setMobileMenu(false)} aria-label="Close menu" style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: T.text2, display: 'flex', padding: 8, touchAction: 'manipulation' }}><X size={22} /></button>
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
          {NAV.map((item) => (
            <a key={item} href={`#${item.toLowerCase().replace(/ /g, '-')}`} onClick={() => setMobileMenu(false)}
              style={{ fontSize: 22, fontWeight: 700, color: T.text2, textDecoration: 'none', padding: '12px 0', borderBottom: `1px solid ${T.border}` }}>{item}</a>
          ))}
          <button onClick={() => { setMobileMenu(false); track({ event: 'landing_cta_clicked', cta_label: 'Get Early Access', section: 'mobile-nav', page: 'landing' }); openWaitlist('waitlist') }}
            style={{ fontSize: 22, fontWeight: 700, color: T.accent, textDecoration: 'none', padding: '12px 0', background: 'transparent', border: 'none', borderBottom: `1px solid ${T.border}`, cursor: 'pointer', fontFamily: FF, textAlign: 'left' } as React.CSSProperties}>
            Get Early Access ↗
          </button>
        </nav>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingTop: 32 }}>
          <Link href="/login" onClick={() => setMobileMenu(false)} style={{ fontSize: 15, color: T.text2, textDecoration: 'none', fontWeight: 500, padding: '12px 0', textAlign: 'center', border: `1px solid ${T.border}` }}>Sign in</Link>
          <button onClick={() => { setMobileMenu(false); openWaitlist('waitlist') }}
            style={{ background: T.accent, color: T.bg, fontSize: 15, fontWeight: 700, padding: '14px 0', borderRadius: 100, border: 'none', cursor: 'pointer', fontFamily: FF, letterSpacing: '-0.2px' }}>
            Get Early Access
          </button>
        </div>
      </div>

      {/* Header */}
      <motion.header
        animate={{ borderBottomColor: scrolled ? T.border : 'transparent', background: scrolled ? 'rgba(2,2,3,0.94)' : 'transparent' }}
        transition={{ duration: 0.3 }}
        style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, borderBottom: '1px solid transparent' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto', padding: '0 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
          <Logo size={32} />
          <nav className="desktop-only" style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
            {NAV.map((item) => (
              <motion.a key={item} href={`#${item.toLowerCase().replace(/ /g, '-')}`} whileHover={{ color: T.text }} style={{ fontSize: 12, color: 'rgba(255,255,255,0.38)', textDecoration: 'none', fontWeight: 600, letterSpacing: '0.2px', transition: 'color 0.15s' }}>{item}</motion.a>
            ))}
            <button onClick={() => { track({ event: 'landing_cta_clicked', cta_label: 'Get Early Access', section: 'nav', page: 'landing' }); openWaitlist('waitlist') }}
              style={{ fontSize: 13, color: T.accent, fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', fontFamily: FF }}>
              Early Access ↗
            </button>
          </nav>
          <div className="desktop-only" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link href="/login" style={{ fontSize: 13, color: T.text2, textDecoration: 'none', fontWeight: 500 }}>Sign in</Link>
            <Magnetic>
              <button onClick={() => { track({ event: 'landing_cta_clicked', cta_label: 'Get Early Access', section: 'nav', page: 'landing' }); openWaitlist('waitlist') }}
                style={{ background: T.accent, color: T.bg, fontSize: 13, fontWeight: 700, padding: '8px 20px', borderRadius: 100, border: 'none', cursor: 'pointer', fontFamily: FF, letterSpacing: '-0.2px', boxShadow: '0 0 24px rgba(0,229,191,0.15), 0 1px 0 rgba(255,255,255,0.12) inset' }}>
                Get Early Access
              </button>
            </Magnetic>
          </div>
          <button className="mobile-only" onClick={() => setMobileMenu(true)} aria-label="Open menu" style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: T.text2, padding: 8, touchAction: 'manipulation' }}>
            <Menu size={22} />
          </button>
        </div>
      </motion.header>

      {/* ── HERO ── */}
      <section className="hp-hero-pad" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <HeroBg />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 860 }}>
          {/* Badge */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, border: `1px solid rgba(229,71,71,0.5)`, borderRadius: 100, padding: '6px 14px', marginBottom: 52, fontSize: 10, letterSpacing: '0.3px', background: 'rgba(4,4,4,0.82)', backdropFilter: 'blur(8px)' }}>
            <motion.div animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 1.3, repeat: Infinity }}
              style={{ width: 5, height: 5, borderRadius: '50%', background: T.red, boxShadow: '0 0 6px rgba(229,71,71,0.8)', flexShrink: 0 }} />
            <span style={{ fontWeight: 700, color: T.red, letterSpacing: '0.5px', textTransform: 'uppercase' as const }}>Enforcement</span>
            <span style={{ width: 1, height: 10, background: 'rgba(255,255,255,0.12)', flexShrink: 0 }} />
            <span style={{ color: 'rgba(255,255,255,0.75)', fontWeight: 600 }}><DaysLeft /></span>
            <span style={{ color: 'rgba(255,255,255,0.35)', letterSpacing: '0.1px' }}>EU AI Act · High-risk</span>
          </motion.div>

          {/* H1 */}
          <motion.h1 initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: SPRING_EASE }}
            style={{ fontSize: 'clamp(52px, 9.5vw, 112px)', fontWeight: 900, lineHeight: 0.97, letterSpacing: '-0.05em', margin: '0 0 36px' }}>
            Your AI is running.<br />
            <span style={{ color: 'rgba(229,71,71,0.48)' }}>Your documentation isn&apos;t.</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.6 }}
            style={{ fontSize: 17, color: 'rgba(255,255,255,0.42)', lineHeight: 1.75, maxWidth: 440, margin: '0 auto 44px', letterSpacing: '-0.01em' }}>
            The EU AI Act requires structured evidence for every high-risk AI workflow. Irvo generates it in 20 minutes.
          </motion.p>

          {/* CTAs */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Magnetic>
              <motion.button
                onClick={() => { track({ event: 'founding_discount_clicked', cta_label: 'Claim Your Founding Spot', section: 'hero', page: 'landing' }); openWaitlist('founding') }}
                whileHover={{ boxShadow: '0 0 0 1px rgba(0,229,191,0.4), 0 0 48px rgba(0,229,191,0.22)' }}
                style={{ ...S.inlineBtn, background: T.accent, color: T.bg, fontSize: 15, fontWeight: 700, padding: '14px 32px', borderRadius: 100, letterSpacing: '-0.2px', boxShadow: '0 0 24px rgba(0,229,191,0.15), 0 1px 0 rgba(255,255,255,0.12) inset' }}>
                Claim Your Founding Spot <ArrowRight size={16} />
              </motion.button>
            </Magnetic>
            <Magnetic>
              <a href="#how-it-works" onClick={() => track({ event: 'landing_cta_clicked', cta_label: 'See How It Works', section: 'hero', page: 'landing' })}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: T.accentDim, color: T.accent, fontSize: 15, fontWeight: 700, padding: '14px 32px', borderRadius: 100, textDecoration: 'none', border: `1px solid rgba(0,229,191,0.18)` }}>
                See how it works
              </a>
            </Magnetic>
          </motion.div>

          {/* Trust + scarcity */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, marginTop: 28 }}>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', margin: 0, letterSpacing: '0.3px' }}>
              No credit card required · EU &amp; UK coverage · First system free
            </p>
            <p style={{ fontSize: 11, fontWeight: 700, color: T.accent, margin: 0, opacity: 0.75, letterSpacing: '0.2px' }}>
              17 of 20 founding spots claimed
            </p>
          </motion.div>

          {/* Stat strip */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
            style={{ display: 'inline-flex', gap: 0, border: `1px solid ${T.border}`, borderTop: `1px solid ${T.borderMid}`, marginTop: 52, overflow: 'hidden' }}>
            {[{ value: '€35M', label: 'max fine', accent: false }, { value: '50h+', label: 'manual per system', accent: false }, { value: '20min', label: 'with Irvo', accent: true }].map(({ value, label, accent }, i) => (
              <div key={label} style={{ padding: '18px 32px', borderRight: i < 2 ? `1px solid ${T.border}` : 'none', textAlign: 'center', background: accent ? T.accentDim : 'transparent' }}>
                <div style={{ fontSize: accent ? 32 : 26, fontWeight: 900, color: accent ? T.accent : T.text, letterSpacing: '-0.04em', lineHeight: 1 }}>{value}</div>
                <div style={{ fontSize: 10, color: accent ? T.accent : T.text3, marginTop: 6, letterSpacing: '0.4px', textTransform: 'uppercase' as const, fontWeight: 700, opacity: accent ? 0.7 : 1 }}>{label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}
          style={{ position: 'absolute', bottom: 40, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 10, color: T.text3, letterSpacing: '0.5px', textTransform: 'uppercase' }}>scroll</span>
          <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            style={{ width: 1, height: 24, background: `linear-gradient(${T.text3}, transparent)` }} />
        </motion.div>
      </section>

      <Divider />

      {/* ── MARQUEE ── */}
      <div style={{ overflow: 'hidden', padding: '20px 0', background: T.surface }}>
        <motion.div animate={{ x: ['0%', '-50%'] }} transition={{ duration: 30, repeat: Infinity, ease: 'linear' }} style={{ display: 'flex', gap: 0, width: 'max-content' }}>
          {[...Array(2)].map((_, outer) => (
            <span key={outer} style={{ display: 'flex' }}>
              {['THE CLOCK IS RUNNING', 'AUGUST 2, 2026', 'HIGH-RISK OBLIGATIONS ARE ENFORCEABLE', 'NO GRACE PERIOD', '€35M MAXIMUM FINE', 'STRUCTURED EVIDENCE — NOT SPREADSHEETS', 'EVERY AI WORKFLOW NEEDS DOCUMENTATION', 'ARE YOU READY?'].map((item, i) => (
                <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 28, fontSize: 11, color: T.text2, fontWeight: 700, letterSpacing: '1.2px', padding: '0 28px', whiteSpace: 'nowrap' }}>
                  {item}
                  <span style={{ width: 3, height: 3, borderRadius: '50%', background: T.accentGlow, flexShrink: 0, display: 'inline-block' }} />
                </span>
              ))}
            </span>
          ))}
        </motion.div>
      </div>

      {/* ── ESTIMATOR ── */}
      <SystemsEstimator onOpenWaitlist={openWaitlist} />

      <Divider />

      {/* ── FEATURES ── */}
      <section id="features" className="hp-section-pad">
        <div style={{ maxWidth: 1160, margin: '0 auto' }}>
          <motion.div {...fadeUp()} style={{ marginBottom: 80 }}>
            <p style={S.overline}>What you get</p>
            <h2 style={{ ...S.h2, fontSize: 'clamp(34px, 4.5vw, 52px)', maxWidth: 600 }}>
              The compliance stack your consultants charge&nbsp;€20k to build. Included.
            </h2>
          </motion.div>
          <div className="r-grid-3 wall-grid">
            {FEATURES.map((f, i) => (
              <motion.div key={f.title} {...fadeInOnce((i % 3) * 0.07)}
                style={{ ...S.cardPad, ...S.wallCell, background: T.card, borderLeft: `2px solid transparent`, borderTop: `1px solid ${T.border}`, position: 'relative', overflow: 'hidden', transition: 'border-left-color 0.25s' }}
                onMouseEnter={(e) => (e.currentTarget.style.borderLeftColor = T.accent)}
                onMouseMove={cardGlowMove}
                onMouseLeave={(e) => { e.currentTarget.style.borderLeftColor = 'transparent'; cardGlowLeave(e) }}>
                {/* Cursor glow overlay */}
                <div data-glow="" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0, transition: 'none' }} />
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                    <f.icon size={17} color="rgba(255,255,255,0.28)" />
                    <span style={{ fontSize: 9, fontWeight: 900, color: T.accent, letterSpacing: '1.6px', fontVariantNumeric: 'tabular-nums' as const, opacity: 0.65 }}>{String(i + 1).padStart(2, '0')}</span>
                  </div>
                  <h3 style={{ fontSize: 16, fontWeight: 800, color: T.text, margin: '0 0 10px', letterSpacing: '-0.5px' }}>{f.title}</h3>
                  <p style={{ fontSize: 13, color: T.text2, lineHeight: 1.8, margin: 0 }}>{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="hp-section-pad">
        <div style={{ maxWidth: 1160, margin: '0 auto' }}>
          <motion.div {...fadeUp()} style={{ marginBottom: 56 }}>
            <p style={S.overline}>The cost of the status quo</p>
            <h2 style={{ ...S.h2, fontSize: 'clamp(26px, 3vw, 38px)', maxWidth: 420 }}>
              What manual compliance costs. What Irvo costs.
            </h2>
          </motion.div>
          <div className="r-grid-4 wall-grid">
            {STATS.map((s, i) => (
              <motion.div key={s.label} {...fadeInOnce(i * 0.06)} style={{ padding: '48px 36px', ...S.wallCell, borderTop: i === 3 ? `2px solid ${T.accent}` : `1px solid ${T.border}`, background: i === 3 ? T.accentDim : 'transparent', position: 'relative' }}>
                {i === 3 && (
                  <p style={{ fontSize: 9, fontWeight: 800, color: T.accent, textTransform: 'uppercase' as const, letterSpacing: '1.8px', margin: '0 0 16px', opacity: 0.7 }}>vs 50+ hours manually</p>
                )}
                <p style={{ fontSize: i === 3 ? 'clamp(64px, 8vw, 96px)' : 'clamp(48px, 5.5vw, 68px)', fontWeight: 900, color: i === 3 ? T.accent : 'rgba(255,255,255,0.65)', margin: '0 0 10px', letterSpacing: '-0.05em', fontVariantNumeric: 'tabular-nums' as const, lineHeight: 1 }}>
                  <Count to={s.to} prefix={s.prefix} suffix={s.suffix} />
                </p>
                <p style={{ fontSize: 11, color: i === 3 ? T.accent : 'rgba(255,255,255,0.3)', margin: 0, letterSpacing: '0.3px', opacity: i === 3 ? 0.75 : 1, lineHeight: 1.5 }}>{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Divider />

      {/* ── COMPLIANCE STAKES ── */}
      <section className="hp-section-pad" style={{ background: T.surface }}>
        <div className="hp-law-grid" style={{ maxWidth: 1160, margin: '0 auto' }}>
          <motion.div initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <p style={S.overline}>The compliance gap</p>
            <h2 style={{ ...S.h2, fontSize: 'clamp(30px, 3.5vw, 46px)', margin: '0 0 24px' }}>Regulators will not accept good intentions.</h2>
            <p style={{ fontSize: 15, color: T.text2, lineHeight: 1.9, margin: '0 0 20px' }}>
              The EU AI Act requires organisations to produce structured technical documentation and evidence packs for AI systems classified as high-risk — before enforcement begins.
            </p>
            <div style={{ margin: '0 0 24px', border: `1px solid ${T.border}` }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: `1px solid ${T.border}`, background: T.surface2 }}>
                <div style={{ padding: '8px 14px' }}><span style={{ fontSize: 8, fontWeight: 800, color: T.text3, letterSpacing: '1.4px', textTransform: 'uppercase' as const }}>Regulation requires</span></div>
                <div style={{ padding: '8px 14px', borderLeft: `1px solid ${T.border}` }}><span style={{ fontSize: 8, fontWeight: 800, color: T.red, opacity: 0.7, letterSpacing: '1.4px', textTransform: 'uppercase' as const }}>Most organisations have</span></div>
              </div>
              {([
                ['Risk classification per system', 'No formal classification process'],
                ['Technical documentation (Annex IV)', 'Internal notes and wikis'],
                ['Per-workflow evidence pack', 'Generic policy documents'],
                ['Human oversight procedures', 'Assumed, rarely documented'],
                ['Regulator-ready evidence on request', 'Spreadsheets, if anything'],
              ] as const).map(([req, have], i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: i < 4 ? `1px solid ${T.border}` : 'none' }}>
                  <div style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 3, height: 3, borderRadius: '50%', background: T.accent, opacity: 0.5, flexShrink: 0 }} />
                    <span style={{ fontSize: 12, color: T.text, lineHeight: 1.4 }}>{req}</span>
                  </div>
                  <div style={{ padding: '10px 14px', borderLeft: `1px solid ${T.border}`, display: 'flex', alignItems: 'center' }}>
                    <span style={{ fontSize: 12, color: T.red, opacity: 0.6, lineHeight: 1.4 }}>{have}</span>
                  </div>
                </div>
              ))}
            </div>
            <p style={{ fontSize: 15, color: T.text, lineHeight: 1.85, margin: '0 0 16px', padding: '20px 24px', borderLeft: `2px solid ${T.accent}`, background: 'rgba(0,229,191,0.05)', letterSpacing: '-0.01em' }}>
              The market is full of policy templates and inventory spreadsheets. Nobody is building the actual artefact regulators and auditors will ask to see: a structured, per-workflow evidence pack. That is what Irvo builds.
            </p>
            <p style={{ fontSize: 12, color: T.text3, margin: 0, fontStyle: 'italic' }}>
              This tool provides guidance only and does not constitute legal advice. Consult a qualified legal professional for binding compliance decisions.
            </p>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            {[
              { label: 'High-risk obligation start', value: 'Aug 2026', note: 'Annex III systems' },
              { label: 'Maximum fine',               value: '€35M',    note: 'Or 7% of global annual turnover' },
              { label: 'GPAI model obligations',     value: 'Aug 2025', note: 'Already in force' },
              { label: 'Annex III categories',       value: '8+',      note: 'High-risk use case groups' },
            ].map((row, i) => (
              <motion.div key={row.label} {...fadeInOnce(i * 0.07)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 0', borderBottom: `1px solid ${T.border}` }}>
                <div>
                  <p style={{ margin: 0, fontSize: 14, color: T.text }}>{row.label}</p>
                  <p style={{ margin: '2px 0 0', fontSize: 11, color: T.text2 }}>{row.note}</p>
                </div>
                <span style={{ fontSize: 24, fontWeight: 800, color: T.accent, letterSpacing: '-0.5px', fontVariantNumeric: 'tabular-nums' }}>{row.value}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="hp-section-pad">
        <div style={{ maxWidth: 1160, margin: '0 auto' }}>
          <motion.div {...fadeUp()} style={{ marginBottom: 72 }}>
            <p style={S.overline}>Process</p>
            <h2 style={{ ...S.h2, fontSize: 'clamp(32px, 4vw, 50px)' }}>Twelve questions. One complete evidence pack.</h2>
          </motion.div>
          <div className="r-grid-4 wall-grid">
            {STEPS.map((step, i) => (
              <motion.div key={step.n} {...fadeInOnce(i * 0.08)}
                style={{ ...S.cardPad, ...S.wallCell, background: T.card, position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 4, right: 14, fontSize: 96, fontWeight: 900, color: T.text, opacity: 0.025, lineHeight: 1, userSelect: 'none', pointerEvents: 'none', letterSpacing: '-0.05em' }}>{step.n}</div>
                <span style={{ fontSize: 9, fontWeight: 900, color: T.accent, letterSpacing: '1.6px', display: 'block', marginBottom: 10, opacity: 0.6 }}>{step.n}</span>
                <div style={{ width: 18, height: 1, background: T.accent, opacity: 0.35, marginBottom: 22 }} />
                <h3 style={{ fontSize: 16, fontWeight: 800, color: T.text, margin: '0 0 12px', letterSpacing: '-0.3px' }}>{step.title}</h3>
                <p style={{ fontSize: 13, color: T.text2, lineHeight: 1.75, margin: 0 }}>{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Divider />

      {/* ── TESTIMONIALS ── */}
      <section className="hp-section-pad" style={{ background: T.surface }}>
        <div style={{ maxWidth: 1160, margin: '0 auto' }}>
          <motion.div {...fadeInOnce()} style={{ marginBottom: 64 }}>
            <p style={S.overline}>From compliance teams across Europe</p>
            <h2 style={{ ...S.h2, fontSize: 'clamp(28px, 3.5vw, 42px)', margin: '0 0 12px' }}>The problem is real.</h2>
            <p style={{ fontSize: 14, color: T.text2, margin: 0, lineHeight: 1.7, maxWidth: 520 }}>We spoke to compliance teams, legal counsel, and operations leaders before writing a line of code. This is what they said.</p>
          </motion.div>
          <div className="r-grid-3 wall-grid">
            {TESTIMONIALS.map((t, i) => (
              <motion.div key={t.name} {...fadeInOnce(i * 0.08)} whileHover={{ background: 'rgba(255,255,255,0.015)' }}
                style={{ padding: '40px 36px', ...S.wallCell, background: T.card, transition: 'background 0.2s' }}>
                <div style={{ fontSize: 72, lineHeight: 0.75, color: T.text, opacity: 0.06, fontFamily: 'Georgia, serif', marginBottom: 20, letterSpacing: '-4px', userSelect: 'none', pointerEvents: 'none' }}>&ldquo;</div>
                <p style={{ fontSize: 15, color: T.text, lineHeight: 1.85, margin: '0 0 32px', letterSpacing: '-0.01em' }}>{t.text}</p>
                <div>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: T.text }}>{t.name}</p>
                  <p style={{ margin: '2px 0 0', fontSize: 11, color: T.text2 }}>{t.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <motion.section id="pricing" className="hp-section-pad" onViewportEnter={() => track({ event: 'pricing_viewed', page: 'landing' })}>
        <div style={{ maxWidth: 1160, margin: '0 auto' }}>
          <motion.div {...fadeUp()} className="hp-pricing-header" style={{ marginBottom: 64 }}>
            <div>
              <p style={S.overline}>Pricing</p>
              <h2 style={{ ...S.h2, fontSize: 'clamp(30px, 4vw, 46px)', margin: '0 0 16px' }}>Every obligation covered. One subscription.</h2>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: T.accentDim, border: `1px solid rgba(0,229,191,0.2)`, borderRadius: 100, padding: '6px 14px' }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: T.accent, flexShrink: 0 }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: T.accent, letterSpacing: '0.2px' }}>Founding offer: 30% lifetime off · First 20 customers · Pre-pay 3 months</span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 13, color: T.text2 }}>
              <span style={{ opacity: annual ? 0.5 : 1 }}>Monthly</span>
              <motion.div onClick={() => setAnnual((a) => !a)} style={{ width: 44, height: 24, background: annual ? T.accent : T.surface2, borderRadius: 100, cursor: 'pointer', position: 'relative', border: `1px solid ${T.border}` }}>
                <motion.div animate={{ x: annual ? 22 : 2 }} transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  style={{ position: 'absolute', top: 2, width: 18, height: 18, borderRadius: '50%', background: '#fff' }} />
              </motion.div>
              <span style={{ opacity: annual ? 1 : 0.5 }}>Annual <span style={{ color: T.green, fontSize: 11, fontWeight: 700 }}>–20%</span></span>
            </div>
          </motion.div>

          <div className="r-grid-3 wall-grid">
            {PRICING.map((plan, i) => (
              <motion.div key={plan.name} {...fadeUp(i * 0.08)}
                style={{ padding: '48px 36px', ...S.wallCell, background: plan.highlight ? T.surface : T.card, position: 'relative' }}>
                {plan.highlight && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: T.accent }} />}
                {plan.highlight && (
                  <div style={{ position: 'absolute', top: 14, right: 14, fontSize: 9, fontWeight: 800, color: T.bg, background: T.accent, padding: '3px 10px', borderRadius: 100, letterSpacing: '0.8px', textTransform: 'uppercase' as const }}>
                    Recommended
                  </div>
                )}
                <p style={{ fontSize: 11, fontWeight: 700, color: plan.highlight ? T.accent : T.text2, textTransform: 'uppercase', letterSpacing: '0.8px', margin: '0 0 8px' }}>{plan.name}</p>
                <p style={{ fontSize: 12, color: T.text2, margin: '0 0 24px' }}>{plan.desc}</p>
                <p style={{ fontSize: 48, fontWeight: 900, color: T.text, margin: '0 0 4px', letterSpacing: '-0.04em', fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
                  £<AnimatePresence mode="wait">
                    <motion.span key={String(annual)} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
                      {annual ? plan.annual : plan.monthly}
                    </motion.span>
                  </AnimatePresence>{plan.plus ? '+' : ''}
                </p>
                <p style={{ fontSize: 12, color: T.text2, margin: '0 0 32px' }}>per month</p>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 36px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {plan.features.map((f) => (
                    <li key={f} style={S.listItem}><CheckCircle size={13} color={T.accent} />{f}</li>
                  ))}
                </ul>
                <Magnetic>
                  <motion.button
                    onClick={() => { track({ event: 'founding_discount_clicked', cta_label: 'Claim Founding Discount', section: 'pricing', page: 'landing' }); openWaitlist('founding') }}
                    whileHover={{ boxShadow: plan.highlight ? '0 0 0 1px rgba(0,229,191,0.4), 0 0 32px rgba(0,229,191,0.18)' : 'none' }}
                    style={{ display: 'block', width: '100%', textAlign: 'center', background: plan.highlight ? T.accent : 'transparent', color: plan.highlight ? T.bg : T.text, border: `1px solid ${plan.highlight ? T.accent : T.border}`, borderRadius: 100, padding: '12px 0', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: FF, transition: 'border-color 0.15s', boxShadow: plan.highlight ? '0 0 24px rgba(0,229,191,0.15), 0 1px 0 rgba(255,255,255,0.12) inset' : 'none' }}>
                    Claim Founding Discount
                  </motion.button>
                </Magnetic>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      <Divider />

      {/* ── URGENCY / ENFORCEMENT TIMELINE ── */}
      <section className="hp-section-pad">
        <div style={{ maxWidth: 1160, margin: '0 auto' }}>
          <motion.div {...fadeUp()} style={{ marginBottom: 72 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <p style={{ ...S.overline, margin: 0 }}>Enforcement Timeline</p>
              <span style={{ fontSize: 11, color: T.text3, border: `1px solid ${T.border}`, borderRadius: 100, padding: '2px 10px' }}>August 2, 2026</span>
            </div>
            <h2 style={{ ...S.h2, fontSize: 'clamp(32px, 4.5vw, 52px)', margin: '0 0 16px' }}>The clock does not care<br />about your backlog.</h2>
            <p style={{ fontSize: 15, color: T.text2, margin: 0, maxWidth: 520, lineHeight: 1.8 }}>
              High-risk AI obligations come into force on August 2, 2026. Fines can reach €35M or 7% of global annual turnover. Most SMEs are still starting from zero.
            </p>
          </motion.div>

          <motion.div {...fadeInOnce(0.08)} style={{ border: `1px solid ${T.border}`, background: T.card, overflow: 'hidden' }}>
            {/* Status bar */}
            <div style={{ padding: '14px 24px', borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(229,71,71,0.03)' }}>
              <motion.div animate={{ opacity: [1, 0.15, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
                style={{ width: 6, height: 6, borderRadius: '50%', background: T.red, boxShadow: '0 0 7px rgba(229,71,71,0.8)', flexShrink: 0 }} />
              <span style={{ fontSize: 9, fontWeight: 800, color: T.red, letterSpacing: '0.8px', textTransform: 'uppercase' as const }}>Enforcement Active</span>
              <span style={{ fontSize: 9, color: T.text3 }}>·</span>
              <span style={{ fontSize: 9, color: T.text3, fontWeight: 600 }}>High-risk AI Act obligations come into force August 2, 2026</span>
              <span style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 700, color: T.text2, fontVariantNumeric: 'tabular-nums' as const }}><DaysLeft /> remaining</span>
            </div>
            {/* Two-column body */}
            <div className="hp-esc-grid">
              {/* Left: timeline */}
              <div style={{ padding: '28px 24px', borderRight: `1px solid ${T.border}` }}>
                <p style={{ fontSize: 8, fontWeight: 800, color: T.text3, letterSpacing: '1.6px', textTransform: 'uppercase' as const, margin: '0 0 18px' }}>Enforcement Timeline</p>
                {([
                  { date: 'Feb 2025', label: 'Prohibited AI systems ban', active: true },
                  { date: 'Aug 2025', label: 'GPAI model obligations', active: true },
                  { date: 'Aug 2026', label: 'High-risk system obligations', active: false },
                  { date: 'Aug 2027', label: 'Embedded AI products', active: false },
                ] as const).map((row, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: `1px solid ${T.border}` }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: row.active ? T.red : 'rgba(255,255,255,0.3)', width: 54, flexShrink: 0, fontVariantNumeric: 'tabular-nums' as const }}>{row.date}</span>
                    <span style={{ fontSize: 12, color: row.active ? T.text2 : T.text, flex: 1 }}>{row.label}</span>
                    <span style={{ fontSize: 7, fontWeight: 800, letterSpacing: '0.5px', textTransform: 'uppercase' as const, color: row.active ? T.red : T.accent, background: row.active ? 'rgba(229,71,71,0.1)' : 'rgba(0,229,191,0.08)', padding: '2px 7px', flexShrink: 0 }}>{row.active ? 'In force' : 'Upcoming'}</span>
                  </div>
                ))}
              </div>
              {/* Right: penalty structure */}
              <div style={{ padding: '28px 24px' }}>
                <p style={{ fontSize: 8, fontWeight: 800, color: T.text3, letterSpacing: '1.6px', textTransform: 'uppercase' as const, margin: '0 0 18px' }}>Penalty Structure</p>
                {([
                  { type: 'Prohibited AI systems', fine: '€35M', sub: 'or 7% of global annual turnover' },
                  { type: 'High-risk non-compliance', fine: '€15M', sub: 'or 3% of global annual turnover' },
                  { type: 'Insufficient cooperation', fine: '€7.5M', sub: 'or 1.5% of global annual turnover' },
                ] as const).map((row, i) => (
                  <div key={i} style={{ padding: '12px 0', borderBottom: `1px solid ${T.border}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                      <span style={{ fontSize: 12, color: T.text2 }}>{row.type}</span>
                      <span style={{ fontSize: 20, fontWeight: 900, color: i === 0 ? T.red : 'rgba(255,255,255,0.7)', letterSpacing: '-0.04em', fontVariantNumeric: 'tabular-nums' as const }}>{row.fine}</span>
                    </div>
                    <p style={{ fontSize: 10, color: T.text3, margin: 0, textAlign: 'right' }}>{row.sub}</p>
                  </div>
                ))}
                <div style={{ marginTop: 24 }}>
                  <Magnetic>
                    <motion.button onClick={() => { track({ event: 'founding_discount_clicked', cta_label: 'Claim Founding Discount', section: 'urgency', page: 'landing' }); openWaitlist('founding') }}
                      whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                      style={{ ...S.inlineBtn, background: T.accent, borderRadius: 100, padding: '11px 22px', fontSize: 13, fontWeight: 700, color: T.bg }}>
                      <ArrowRight size={14} /> Claim Founding Discount
                    </motion.button>
                  </Magnetic>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div {...fadeInOnce(0.2)} style={{ marginTop: 40, padding: '28px 36px', border: `1px solid ${T.border}`, background: T.card, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 0 }}>
            {[
              { n: '01', label: 'Define workflow', color: T.text2 },
              { n: '02', label: 'Classify risk', color: T.accent },
              { n: '03', label: 'Capture evidence', color: T.purple },
              { n: '04', label: 'Export pack', color: T.green },
            ].map((item, i) => (
              <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 0, flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: T.text3, letterSpacing: '0.3px' }}>{item.n}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: item.color, letterSpacing: '-0.2px' }}>{item.label}</span>
                </div>
                {i < 3 && <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, ${T.border}, transparent)`, margin: '0 20px' }} />}
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="hp-section-pad" style={{ background: T.surface }}>
        <div style={{ maxWidth: 1160, margin: '0 auto' }}>
          <motion.div {...fadeUp()} style={{ marginBottom: 80 }}>
            <p style={S.overline}>FAQ</p>
            <h2 style={{ ...S.h2, fontSize: 'clamp(30px, 4vw, 46px)' }}>Every question before the decision.</h2>
          </motion.div>
          <div className="r-grid-3 wall-grid">
            {FAQS.map((faq, i) => (
              <motion.div key={faq.q} {...fadeInOnce((i % 3) * 0.07)} whileHover={{ background: 'rgba(255,255,255,0.015)' }}
                style={{ padding: '36px 32px', ...S.wallCell, background: T.card, transition: 'background 0.2s' }}>
                <h3 style={{ fontSize: 15, fontWeight: 800, color: T.text, margin: '0 0 12px', letterSpacing: '-0.2px', lineHeight: 1.3 }}>{faq.q}</h3>
                <p style={{ fontSize: 13, color: T.text2, lineHeight: 1.75, margin: 0 }}>{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Divider />

      {/* ── FINAL CTA ── */}
      <section className="hp-cta-pad" style={{ textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <FinalCtaBg />
        <div style={{ maxWidth: 700, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <motion.div initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <h2 style={{ fontSize: 'clamp(44px, 7vw, 84px)', fontWeight: 900, letterSpacing: '-0.05em', lineHeight: 0.97, margin: '0 0 28px', color: T.text }}>
              Do not wait until<br />someone asks for proof.
            </h2>
            <p style={{ fontSize: 16, color: T.text2, margin: '0 auto 32px', lineHeight: 1.85, maxWidth: 480 }}>
              The first 20 founding customers lock in 30% off for life. Pre-pay 3 months upfront, get access before public launch.
            </p>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 40, background: 'rgba(0,229,191,0.06)', border: `1px solid rgba(0,229,191,0.22)`, borderRadius: 100, padding: '7px 18px' }}>
              <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.6, repeat: Infinity }}
                style={{ width: 5, height: 5, borderRadius: '50%', background: T.accent, flexShrink: 0 }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: T.accent, letterSpacing: '0.2px' }}>3 of 20 founding spots remaining</span>
            </div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Magnetic>
                <motion.button
                  onClick={() => { track({ event: 'founding_discount_clicked', cta_label: 'Claim Founding Discount', section: 'final-cta', page: 'landing' }); openWaitlist('founding') }}
                  whileHover={{ boxShadow: '0 0 0 1px rgba(0,229,191,0.4), 0 0 48px rgba(0,229,191,0.22)' }}
                  whileTap={{ scale: 0.98 }}
                  style={{ ...S.inlineBtn, gap: 10, background: T.accent, color: T.bg, fontSize: 16, fontWeight: 800, padding: '16px 40px', borderRadius: 100, letterSpacing: '-0.3px', boxShadow: '0 0 24px rgba(0,229,191,0.15), 0 1px 0 rgba(255,255,255,0.12) inset' }}>
                  Claim Founding Discount <ArrowRight size={18} />
                </motion.button>
              </Magnetic>
              <Magnetic>
                <motion.button
                  onClick={() => { track({ event: 'walkthrough_clicked', cta_label: 'Book a Walkthrough', section: 'final-cta', page: 'landing' }); openWaitlist('walkthrough') }}
                  whileHover={{ borderColor: T.borderMid }} whileTap={{ scale: 0.98 }}
                  style={{ ...S.inlineBtn, gap: 10, background: 'transparent', color: T.text2, fontSize: 15, fontWeight: 700, padding: '16px 32px', borderRadius: 100, border: `1px solid ${T.border}`, letterSpacing: '-0.2px', transition: 'border-color 0.15s' }}>
                  Book a Walkthrough
                </motion.button>
              </Magnetic>
            </div>
            <p style={{ fontSize: 11, color: T.text3, margin: '24px 0 0', lineHeight: 1.7 }}>
              Guidance only — not legal advice · Consult a qualified professional for binding decisions
            </p>
          </motion.div>
        </div>
      </section>

      <Divider />

      {/* ── FOOTER ── */}
      <footer style={{ padding: '64px 32px', background: T.surface }}>
        <div style={{ maxWidth: 1160, margin: '0 auto' }}>
          <div className="r-grid-footer" style={{ marginBottom: 64 }}>
            <div>
              <div style={{ marginBottom: 16 }}><Logo size={24} /></div>
              <p style={{ fontSize: 13, color: T.text2, lineHeight: 1.85, maxWidth: 240, margin: '0 0 20px' }}>AI compliance documentation, without the consultant bill.</p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {['EU AI Act', 'GDPR Safe', 'Guidance Only'].map((b) => (
                  <span key={b} style={{ fontSize: 10, fontWeight: 700, color: T.text3, border: `1px solid ${T.border}`, padding: '3px 10px', borderRadius: 100, letterSpacing: '0.3px' }}>{b}</span>
                ))}
              </div>
            </div>
            {[
              { title: 'Product', links: [{ label: 'Features', href: '#features' }, { label: 'Pricing', href: '#pricing' }, { label: 'How It Works', href: '#how-it-works' }] },
              { title: 'Contact', links: [{ label: 'hello@irvo.co.uk', href: 'mailto:hello@irvo.co.uk' }] },
            ].map(({ title, links }) => (
              <div key={title}>
                <h4 style={{ color: T.text3, fontWeight: 700, fontSize: 10, marginBottom: 20, letterSpacing: '0.8px', textTransform: 'uppercase' }}>{title}</h4>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {links.map(({ label, href }) => (
                    <li key={label}><motion.a href={href} whileHover={{ color: T.text }} style={{ color: T.text2, textDecoration: 'none', fontSize: 13, display: 'inline-block', transition: 'color 0.15s' }}>{label}</motion.a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 24, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
            <p style={{ color: T.text3, fontSize: 12, margin: 0 }}>© {new Date().getFullYear()} Irvo. Guidance only — not legal advice.</p>
            <p style={{ color: T.text3, fontSize: 12, margin: 0 }}>irvo.co.uk</p>
          </div>
        </div>
      </footer>

      <AnimatePresence>
        {waitlistModal && <WaitlistModal variant={waitlistModal} onClose={() => setWaitlistModal(null)} />}
      </AnimatePresence>

      </div>{/* end content wrapper */}
    </div>
  )
}
