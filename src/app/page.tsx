'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import Link from 'next/link'
import { motion, useScroll, useSpring, useInView, useMotionValue, animate, AnimatePresence, useReducedMotion } from 'framer-motion'
import { Shield, FileText, CheckCircle, ArrowRight, Zap, BarChart3, AlertTriangle, Menu, X, Clock, Layers, Bot, Download } from 'lucide-react'
import { track } from '@/lib/analytics'

// ─── Design tokens ──────────────────────────────────────────────────────────
const T = {
  bg:          '#040404',
  surface:     '#0c0c0c',
  surface2:    '#131313',
  card:        '#0c0c0c',
  appShell:    '#080808',
  border:      'rgba(255,255,255,0.07)',
  borderMid:   'rgba(255,255,255,0.10)',
  borderHi:    'rgba(255,255,255,0.16)',
  text:        '#e8e8e8',
  text2:       '#888',
  text3:       '#555',
  accent:      '#00e5bf',
  accentDim:   'rgba(0,229,191,0.08)',
  accentGlow:  'rgba(0,229,191,0.15)',
  red:         '#e54747',
  green:       '#36bd5f',
  amber:       '#f59e0b',
}

const FF = 'var(--font-raleway), Raleway, Helvetica, Arial, sans-serif'
const SPRING_EASE = [0.16, 1, 0.3, 1] as [number, number, number, number]

// ─── Shared style helpers ────────────────────────────────────────────────────
const S = {
  overline: {
    fontSize: 11, fontWeight: 600, color: T.accent, textTransform: 'uppercase' as const,
    letterSpacing: '0.08em', margin: '0 0 20px', display: 'block' as const,
  },
  h2: {
    fontWeight: 800, letterSpacing: '-0.02em', margin: 0, lineHeight: 1.15,
  } as React.CSSProperties,
  wallCell: {
    borderRight: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}`,
  },
  cardPad: { padding: '40px 32px' },
  inlineBtn: {
    display: 'inline-flex', alignItems: 'center', gap: 8, border: 'none',
    cursor: 'pointer', fontFamily: FF,
  } as React.CSSProperties,
  listItem: {
    display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: T.text2,
  },
}

// ─── Animation helpers ───────────────────────────────────────────────────────
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
  { icon: Shield,        title: 'Risk Classification Engine',   desc: '12-question questionnaire mapped to Annex III. AI classifies your system in seconds.' },
  { icon: FileText,      title: 'Obligations Mapping',          desc: 'Every applicable Article surfaced with required evidence. No legal interpretation needed.' },
  { icon: Bot,           title: 'AI Evidence Drafting',          desc: 'Claude drafts evidence sections from your system description. Edit, review, approve.' },
  { icon: Download,      title: 'Evidence Pack Export',          desc: '8-section PDF: cover, classification, obligations, evidence, gaps, declaration. Auditor-ready.' },
  { icon: Clock,         title: 'Deadline Tracking',             desc: 'Countdown to August 2, 2026. Urgency states. Progress dashboards per system.' },
  { icon: Layers,        title: 'Multi-System Management',       desc: 'Document 3 to 25+ systems. Track completion across your entire AI inventory.' },
]

const PROBLEM_CARDS = [
  { stat: '40\u201360 hours',         title: 'per system',                 desc: 'Your compliance consultant won\u2019t start until June. Each workflow takes weeks to document manually \u2014 and you have twelve.' },
  { stat: '\u00A315,000\u2013\u00A350,000', title: 'per engagement',       desc: 'Enterprise platforms start at \u00A350k. Boutique firms bill \u00A3400/hour. Neither is built for a 40-person company.' },
  { stat: 'Zero',                      title: 'structured tooling',        desc: 'OneTrust targets Fortune 500. Generic templates leave gaps. No one builds the actual evidence pack regulators request.' },
]

const SOLUTION_STEPS = [
  { n: '01', title: 'Describe your AI system',   desc: 'Name the workflow, describe what it does, identify who\u2019s affected. Two minutes.' },
  { n: '02', title: 'Answer 12 questions',         desc: 'AI classifies your risk level, maps the Annex III category, and generates every obligation that applies. Instant.' },
  { n: '03', title: 'Capture evidence, export',    desc: 'AI drafts each evidence section. You review, edit, upload supporting files. Download an 8-section PDF ready for any auditor.' },
]

const WORKFLOW_STEPS = [
  { n: '01', label: 'Name & describe',          color: T.text2 },
  { n: '02', label: 'Risk questionnaire',        color: T.accent },
  { n: '03', label: 'Classification result',     color: T.amber },
  { n: '04', label: 'Evidence capture',           color: '#a78bfa' },
  { n: '05', label: 'Export PDF',                 color: T.green },
]

interface PricingPlan {
  name: string; price: number; desc: string; features: string[];
  highlight?: boolean; plus?: boolean
}
const PRICING: PricingPlan[] = [
  { name: 'Starter', price: 149, desc: '1 user \u00B7 3 systems', features: ['3 AI systems', 'PDF export', 'Risk classification', 'Obligations map', 'Basic templates', 'Email support'] },
  { name: 'Growth',  price: 399, desc: 'Up to 5 users \u00B7 10 systems', highlight: true, features: ['10 AI systems', '5 users', 'PDF + Word export', 'AI drafting assistance', 'Custom templates', 'Priority support'] },
  { name: 'Plus',    price: 799, desc: 'Unlimited users', plus: true, features: ['25+ AI systems', 'Unlimited users', 'Auditor view', 'API access', 'Custom templates', 'Dedicated support'] },
]

const FAQS = [
  { q: 'Is this legal advice?', a: 'No. Irvo provides compliance guidance and structured documentation tools. Always consult qualified legal counsel for binding decisions.' },
  { q: 'What AI systems need documenting?', a: 'Any workflow using automation, ML models, or AI-enabled tools that falls under Annex III categories: HR/recruitment, credit scoring, safety-critical systems, and more.' },
  { q: 'What if my system is low-risk?', a: 'You\u2019ll know in 2 minutes. The questionnaire classifies your system and only generates obligations that apply. Limited-risk systems have lighter requirements.' },
  { q: 'Can I try before I pay?', a: 'Yes. We offer a free concierge session where we document one workflow for you at no cost.' },
  { q: 'How long does it actually take?', a: '20 minutes per system for a complete evidence pack. Compare that to 40\u201360 hours with a consultant.' },
  { q: 'What happens after August 2026?', a: 'The Act requires ongoing compliance, not a one-time exercise. Irvo supports annual reviews and updates whenever your systems change.' },
]

// ─── Primitive components ────────────────────────────────────────────────────
const DEADLINE = new Date('2026-08-02T00:00:00Z').getTime()

function useDaysLeft() {
  const [now, setNow] = useState<number | null>(null)
  useEffect(() => {
    const id = setTimeout(() => setNow(Date.now()), 0)
    return () => clearTimeout(id)
  }, [])
  if (now === null) return null
  return Math.max(0, Math.ceil((DEADLINE - now) / 86400000))
}

function DaysLeft() {
  const days = useDaysLeft()
  return <>{days !== null ? days.toLocaleString() : '\u2014'}</>
}

function Divider() {
  return (
    <div style={{
      height: 1,
      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06) 20%, rgba(255,255,255,0.06) 80%, transparent)',
    }} />
  )
}

function Magnetic({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 350, damping: 28 })
  const sy = useSpring(y, { stiffness: 350, damping: 28 })
  const onMove = useCallback((e: React.MouseEvent) => {
    const r = ref.current!.getBoundingClientRect()
    x.set((e.clientX - r.left - r.width / 2) * 0.22)
    y.set((e.clientY - r.top - r.height / 2) * 0.22)
  }, [x, y])
  const onLeave = useCallback(() => { x.set(0); y.set(0) }, [x, y])
  return (
    <motion.div ref={ref} style={{ x: sx, y: sy, display: 'inline-block' }} onMouseMove={onMove} onMouseLeave={onLeave}>
      {children}
    </motion.div>
  )
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

function Logo({ size = 28 }: { size?: number }) {
  return (
    <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: Math.round(size * 0.38), userSelect: 'none', textDecoration: 'none' }}>
      <div style={{ width: 2, height: Math.round(size * 0.85), background: T.accent, flexShrink: 0 }} />
      <span style={{ fontSize: size, fontWeight: 900, letterSpacing: '-0.5px', color: T.text, fontFamily: FF, lineHeight: 1, whiteSpace: 'nowrap' }}>IRVO</span>
    </Link>
  )
}

function ScrollBar() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 30 })
  return (
    <motion.div style={{
      scaleX, position: 'fixed', top: 0, left: 0, right: 0, height: 1,
      background: T.accent, transformOrigin: '0%', zIndex: 200,
    }} />
  )
}

// ─── Hero backgrounds ────────────────────────────────────────────────────────
function HeroBg() {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {/* Cinematic teal spotlight from top-center */}
      <motion.div
        animate={{ opacity: [0.82, 1, 0.82], scale: [1, 1.04, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse 72% 44% at 50% -4%, rgba(0,229,191,0.18) 0%, rgba(0,229,191,0.04) 55%, transparent 70%)',
          transformOrigin: '50% 0%',
        }}
      />
      {/* Animated grain texture */}
      <motion.div
        animate={{ x: [0, -20, 10, -5, 0], y: [0, 10, -15, 5, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        style={{ position: 'absolute', inset: -20, opacity: 0.04 }}
      >
        <svg style={{ width: '100%', height: '100%' }}>
          <filter id="grain">
            <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="4" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#grain)" />
        </svg>
      </motion.div>
      {/* Deep vignette */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse 100% 80% at 50% 50%, transparent 20%, rgba(4,4,4,0.94) 100%)',
      }} />
    </div>
  )
}

function FinalCtaBg() {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      <motion.div
        animate={{ opacity: [0.8, 1, 0.8] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse 700px 500px at 50% 105%, rgba(0,229,191,0.16) 0%, rgba(0,229,191,0.06) 42%, transparent 65%)',
        }}
      />
      <div style={{
        position: 'absolute', top: 0, bottom: 0, left: '50%', width: 1, transform: 'translateX(-50%)',
        background: 'linear-gradient(transparent 0%, rgba(0,229,191,0.08) 40%, rgba(0,229,191,0.12) 60%, rgba(0,229,191,0.04) 85%, transparent 100%)',
      }} />
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse 120% 100% at 50% 50%, transparent 25%, rgba(4,4,4,0.85) 100%)',
      }} />
    </div>
  )
}

// ─── Particle constellation ──────────────────────────────────────────────────
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

    let mx = W / 2, my = H * 0.42

    const N = 78
    const pts = Array.from({ length: N }, (_, i) => ({
      x:    (i * 131.7 + 20) % W,
      y:    (i * 97.4  + 15) % H,
      vx:   (((i * 13 + 7) % 21) - 10) * 0.032,
      vy:   (((i * 9  + 3) % 21) - 10) * 0.032,
      size: 1.1 + (i % 3) * 0.55,
    }))

    const LINK = 138, LINK2 = LINK * LINK
    const GLOW = 240, GLOW2 = GLOW * GLOW
    const PUSH = 160, PUSH2 = PUSH * PUSH

    const onMove    = (e: MouseEvent) => { mx = e.clientX; my = e.clientY }
    const onResize  = () => { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight }
    window.addEventListener('mousemove', onMove, { passive: true })
    window.addEventListener('resize', onResize)

    let raf = 0
    const draw = () => {
      raf = requestAnimationFrame(draw)
      ctx.clearRect(0, 0, W, H)

      const cd2 = pts.map(p => {
        const dx = p.x - mx, dy = p.y - my
        return dx * dx + dy * dy
      })

      // Dim connections
      ctx.beginPath()
      ctx.lineWidth = 0.5
      for (let i = 0; i < N; i++) {
        if (cd2[i] < GLOW2) continue
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

      // Lit connections
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

      // Particles
      for (let i = 0; i < N; i++) {
        const p = pts[i]
        const d2 = cd2[i]
        if (d2 < PUSH2 && d2 > 0) {
          const d = Math.sqrt(d2)
          const f = ((PUSH - d) / PUSH) * 0.10
          p.vx += ((p.x - mx) / d) * f
          p.vy += ((p.y - my) / d) * f
        }
        p.vx *= 0.974; p.vy *= 0.974
        p.x  += p.vx;  p.y  += p.vy
        if (p.x < -12) p.x += W + 24
        else if (p.x > W + 12) p.x -= W + 24
        if (p.y < -12) p.y += H + 24
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
      window.removeEventListener('resize', onResize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }}
    />
  )
}

// ─── Cursor spotlight ────────────────────────────────────────────────────────
function CursorSpotlight() {
  const innerRef = useRef<HTMLDivElement>(null)
  const midRef   = useRef<HTMLDivElement>(null)
  const outerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let raf = 0
    let tx = window.innerWidth / 2, ty = window.innerHeight * 0.44
    let mx = tx, my = ty, mvx = 0, mvy = 0
    let ox = tx, oy = ty, ovx = 0, ovy = 0

    const onMove = (e: MouseEvent) => { tx = e.clientX; ty = e.clientY }
    const tick = () => {
      raf = requestAnimationFrame(tick)
      mvx = mvx * 0.76 + (tx - mx) * 0.11; mvy = mvy * 0.76 + (ty - my) * 0.11
      mx += mvx; my += mvy
      ovx = ovx * 0.84 + (tx - ox) * 0.052; ovy = ovy * 0.84 + (ty - oy) * 0.052
      ox += ovx; oy += ovy
      if (innerRef.current) innerRef.current.style.background = `radial-gradient(140px circle at ${tx}px ${ty}px, rgba(0,229,191,0.11) 0%, rgba(0,229,191,0.03) 55%, transparent 100%)`
      if (midRef.current)   midRef.current.style.background   = `radial-gradient(480px circle at ${mx}px ${my}px, rgba(0,229,191,0.05) 0%, rgba(71,201,229,0.015) 60%, transparent 100%)`
      if (outerRef.current) outerRef.current.style.background = `radial-gradient(880px circle at ${ox}px ${oy}px, rgba(0,229,191,0.022) 0%, transparent 62%)`
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

// ─── Custom cursor ───────────────────────────────────────────────────────────
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
      vx = vx * 0.85 + (tx - cx) * 0.10
      vy = vy * 0.85 + (ty - cy) * 0.10
      cx += vx; cy += vy
      if (dotRef.current)  dotRef.current.style.transform  = `translate(${tx}px,${ty}px) translate(-50%,-50%)`
      if (ringRef.current) ringRef.current.style.transform = `translate(${(cx - 12).toFixed(1)}px,${(cy - 12).toFixed(1)}px)`
    }

    raf = requestAnimationFrame(tick)
    return () => { cancelAnimationFrame(raf); window.removeEventListener('mousemove', onMove) }
  }, [])

  return (
    <>
      <div ref={dotRef} className="desktop-only" style={{
        position: 'fixed', top: 0, left: 0, zIndex: 9999,
        width: 4, height: 4, borderRadius: '50%',
        background: 'rgba(255,255,255,0.9)',
        pointerEvents: 'none', willChange: 'transform',
      }} />
      <div ref={ringRef} className="desktop-only" style={{
        position: 'fixed', top: 0, left: 0, zIndex: 9998,
        width: 24, height: 24, borderRadius: '50%',
        border: '1px solid rgba(255,255,255,0.45)',
        pointerEvents: 'none', willChange: 'transform',
      }} />
    </>
  )
}

// ─── Card glow effect ────────────────────────────────────────────────────────
const cardGlowMove = (e: React.MouseEvent<HTMLDivElement>) => {
  const r = e.currentTarget.getBoundingClientRect()
  const g = e.currentTarget.querySelector<HTMLElement>('[data-glow]')
  if (g) g.style.background = `radial-gradient(280px circle at ${e.clientX - r.left}px ${e.clientY - r.top}px, rgba(0,229,191,0.09) 0%, transparent 70%)`
}
const cardGlowLeave = (e: React.MouseEvent<HTMLDivElement>) => {
  const g = e.currentTarget.querySelector<HTMLElement>('[data-glow]')
  if (g) g.style.background = 'none'
}

// ─── WaitlistModal ───────────────────────────────────────────────────────────
type WaitlistVariant = 'waitlist' | 'founding' | 'walkthrough'
interface WaitlistForm { email: string; full_name: string; company_name: string }
const WL_EMPTY: WaitlistForm = { email: '', full_name: '', company_name: '' }
const WL_CONFIG = {
  waitlist:    { overline: 'JOIN THE WAITLIST',   headline: 'Be first when we launch',        sub: 'We will notify you before public access opens and share early documentation resources.',                                                cta: 'Join the Waitlist',       source: 'landing-waitlist' },
  founding:    { overline: 'FOUNDING ACCESS',     headline: 'Claim your founding discount',   sub: 'Founding members lock in 30\u00A0% off for the lifetime of their plan. Limited to the first 20 customers who pre-pay 3 months upfront. After submitting, we\u2019ll send you a secure payment link within one business day.',    cta: 'Reserve Founding Spot', source: 'landing-founding' },
  walkthrough: { overline: 'BOOK A WALKTHROUGH',  headline: 'See the product in 30 minutes',  sub: 'Leave your details and we will reach out within one business day to schedule a walkthrough.',                                         cta: 'Request Walkthrough',     source: 'landing-walkthrough' },
}

function Field({ label, id, name, value, onChange, type = 'text', placeholder, required }: {
  label: string; id: string; name: string; value: string; onChange: (v: string) => void;
  type?: string; placeholder?: string; required?: boolean
}) {
  const [focused, setFocused] = useState(false)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label htmlFor={id} style={{
        fontSize: 11, fontWeight: 600, color: T.text2,
        textTransform: 'uppercase', letterSpacing: '0.08em',
      }}>
        {label}{required && <span style={{ color: T.red }}> *</span>}
      </label>
      <input
        id={id} name={name} type={type} value={value}
        onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{
          background: T.surface2, border: `1px solid ${focused ? T.borderMid : T.border}`,
          padding: '12px 14px', fontSize: 13, color: T.text, outline: 'none',
          fontFamily: FF, width: '100%', boxSizing: 'border-box',
          transition: 'border-color 0.15s', caretColor: T.accent, borderRadius: 0,
        }}
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

  // Focus trap
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

  // Auto-focus email
  useEffect(() => {
    const t = setTimeout(() => (document.getElementById('wl-email') as HTMLInputElement | null)?.focus(), 60)
    return () => clearTimeout(t)
  }, [])

  // Close on Escape
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onClose])

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    setError(null)
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError('Please enter a valid email address.')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email.trim(),
          full_name: form.full_name.trim() || undefined,
          company_name: form.company_name.trim() || undefined,
          source: cfg.source,
        }),
      }).then((r) => r.json())
      if (res.success) {
        track({
          event: 'waitlist_submitted',
          cta_label: cfg.cta, section: 'modal', page: 'landing',
        })
        setSuccess("You\u2019re on the list. We\u2019ll reach out before launch with early access details.")
      } else {
        setError(res.error ?? 'Something went wrong. Please try again.')
      }
    } catch {
      setError('Network error. Please try again.')
    }
    setLoading(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      role="dialog" aria-modal="true" aria-labelledby="wl-modal-title"
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
      }}
    >
      <motion.div
        ref={dialogRef}
        initial={{ scale: 0.95, opacity: 0, y: 16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.97, opacity: 0 }}
        transition={{ duration: 0.28, ease: SPRING_EASE }}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: T.surface, border: `1px solid ${T.borderMid}`,
          padding: 36, maxWidth: 480, width: '100%', fontFamily: FF, position: 'relative',
        }}
      >
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 2,
          background: `linear-gradient(90deg, ${T.accent}, transparent)`,
        }} />
        <button
          onClick={onClose} aria-label="Close"
          style={{
            position: 'absolute', top: 16, right: 16, background: 'transparent',
            border: 'none', cursor: 'pointer', color: T.text2, display: 'flex', padding: 6,
          }}
        >
          <X size={15} />
        </button>

        {success ? (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <CheckCircle size={40} color={T.green} style={{ margin: '0 auto 16px', display: 'block' }} />
            <h2 id="wl-modal-title" style={{
              fontSize: 22, fontWeight: 800, color: T.text, margin: '0 0 8px', letterSpacing: '-0.02em',
            }}>You&apos;re on the list</h2>
            <p style={{ fontSize: 14, color: T.text2, margin: '0 0 24px', lineHeight: 1.6 }}>{success}</p>
            <button onClick={onClose} style={{
              background: T.surface2, border: `1px solid ${T.border}`,
              padding: '10px 24px', fontSize: 13, fontWeight: 600, color: T.text,
              cursor: 'pointer', fontFamily: FF,
            }}>Close</button>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: 28 }}>
              <p style={{
                fontSize: 11, fontWeight: 600, color: T.accent,
                textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 8px',
              }}>{cfg.overline}</p>
              <h2 id="wl-modal-title" style={{
                fontSize: 22, fontWeight: 800, color: T.text, margin: '0 0 6px', letterSpacing: '-0.02em',
              }}>{cfg.headline}</h2>
              <p style={{ fontSize: 13, color: T.text2, margin: 0, lineHeight: 1.6 }}>{cfg.sub}</p>
            </div>
            <form onSubmit={submit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <Field label="Email address" id="wl-email" name="email" value={form.email} onChange={set('email')} type="email" placeholder="you@company.com" required />
              <Field label="Full name (optional)" id="wl-full-name" name="full_name" value={form.full_name} onChange={set('full_name')} placeholder="Jane Smith" />
              <Field label="Company (optional)" id="wl-company" name="company_name" value={form.company_name} onChange={set('company_name')} placeholder="Acme GmbH" />
              <input name="website" tabIndex={-1} aria-hidden="true" style={{ display: 'none' }} readOnly value="" />
              {error && (
                <p role="alert" style={{
                  fontSize: 12, color: T.red,
                  background: 'rgba(229,71,71,0.06)', border: '1px solid rgba(229,71,71,0.15)',
                  padding: '10px 14px', margin: 0,
                }}>{error}</p>
              )}
              <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
                <button type="button" onClick={onClose} style={{
                  flex: 1, background: 'transparent', border: `1px solid ${T.border}`,
                  padding: '12px 0', fontSize: 13, fontWeight: 600, color: T.text2,
                  cursor: 'pointer', fontFamily: FF, borderRadius: 0,
                }}>Cancel</button>
                <motion.button
                  type="submit" disabled={loading}
                  whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                  style={{
                    flex: 2, background: T.accent, border: 'none', borderRadius: 100,
                    padding: '12px 0', fontSize: 13, fontWeight: 800, color: T.bg,
                    cursor: loading ? 'default' : 'pointer', fontFamily: FF,
                    opacity: loading ? 0.7 : 1, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', gap: 8,
                    boxShadow: '0 0 24px rgba(0,229,191,0.15), 0 1px 0 rgba(255,255,255,0.12) inset',
                  }}
                >
                  <ArrowRight size={14} />{loading ? 'Submitting\u2026' : cfg.cta}
                </motion.button>
              </div>
              <p style={{ fontSize: 11, color: T.text3, textAlign: 'center', margin: 0 }}>
                No spam \u00B7 Unsubscribe anytime \u00B7 Guidance only, not legal advice
              </p>
            </form>
          </>
        )}
      </motion.div>
    </motion.div>
  )
}

// ─── Hero headline staggered entrance ────────────────────────────────────────
function StaggeredHeadline({ words, style }: { words: string[]; style?: React.CSSProperties }) {
  return (
    <h1 style={{
      fontSize: 'clamp(36px, 5.5vw, 80px)', fontWeight: 900, lineHeight: 1.0,
      letterSpacing: '-0.04em', margin: 0,
      ...style,
    }}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 + i * 0.08, ease: SPRING_EASE }}
          style={{ display: 'inline-block', marginRight: '0.28em' }}
        >
          {word}
        </motion.span>
      ))}
    </h1>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════════
export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false)
  const [waitlistModal, setWaitlistModal] = useState<WaitlistVariant | null>(null)
  const [mobileMenu, setMobileMenu] = useState(false)
  const prefersReducedMotion = useReducedMotion()
  const daysLeft = useDaysLeft()

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', h, { passive: true })
    return () => window.removeEventListener('scroll', h)
  }, [])

  const openWaitlist = (v: WaitlistVariant) => setWaitlistModal(v)
  const NAV = ['Features', 'How It Works', 'Pricing', 'FAQ']

  return (
    <div style={{ background: T.bg, color: T.text, fontFamily: FF, minHeight: '100vh' }}>
      {!prefersReducedMotion && <HeroCanvas />}
      {!prefersReducedMotion && <CursorSpotlight />}
      {!prefersReducedMotion && <Cursor />}
      {!prefersReducedMotion && <ScrollBar />}

      <div style={{ position: 'relative', zIndex: 2 }}>

      {/* ── MOBILE NAV OVERLAY ── */}
      <div className={`mobile-nav-overlay${mobileMenu ? ' open' : ''}`} style={{ background: T.bg }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 40 }}>
          <Logo size={28} />
          <button onClick={() => setMobileMenu(false)} aria-label="Close menu" style={{
            background: 'transparent', border: 'none', cursor: 'pointer', color: T.text2,
            display: 'flex', padding: 8, minHeight: 44, minWidth: 44, alignItems: 'center', justifyContent: 'center',
          }}><X size={22} /></button>
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
          {NAV.map((item) => (
            <a key={item} href={`#${item.toLowerCase().replace(/ /g, '-')}`} onClick={() => setMobileMenu(false)}
              style={{ fontSize: 22, fontWeight: 700, color: T.text2, textDecoration: 'none', padding: '14px 0', borderBottom: `1px solid ${T.border}`, minHeight: 44 }}>
              {item}
            </a>
          ))}
          <button onClick={() => { setMobileMenu(false); track({ event: 'landing_cta_clicked', cta_label: 'Start documenting', section: 'mobile-nav', page: 'landing' }); openWaitlist('waitlist') }}
            style={{ fontSize: 22, fontWeight: 700, color: T.accent, textDecoration: 'none', padding: '14px 0', background: 'transparent', border: 'none', borderBottom: `1px solid ${T.border}`, cursor: 'pointer', fontFamily: FF, textAlign: 'left', minHeight: 44 } as React.CSSProperties}>
            Start documenting
          </button>
        </nav>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingTop: 32 }}>
          <Link href="/login" onClick={() => setMobileMenu(false)} style={{
            fontSize: 15, color: T.text2, textDecoration: 'none', fontWeight: 500,
            padding: '14px 0', textAlign: 'center', border: `1px solid ${T.border}`, minHeight: 44,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>Sign in</Link>
          <button onClick={() => { setMobileMenu(false); openWaitlist('waitlist') }}
            style={{
              background: T.accent, color: T.bg, fontSize: 15, fontWeight: 700,
              padding: '14px 0', borderRadius: 100, border: 'none', cursor: 'pointer',
              fontFamily: FF, minHeight: 44,
            }}>
            Start documenting
          </button>
        </div>
      </div>

      {/* ── NAVIGATION ── */}
      <motion.header
        animate={{
          borderBottomColor: scrolled ? T.border : 'transparent',
          background: scrolled ? 'rgba(4,4,4,0.94)' : 'transparent',
        }}
        transition={{ duration: 0.3 }}
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
          borderBottom: '1px solid transparent',
          backdropFilter: scrolled ? 'blur(12px)' : 'none',
        }}
      >
        <div style={{
          maxWidth: 1160, margin: '0 auto', padding: '0 32px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64,
        }}>
          <Logo size={28} />
          <nav className="desktop-only" style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
            {NAV.map((item) => (
              <motion.a
                key={item}
                href={`#${item.toLowerCase().replace(/ /g, '-')}`}
                whileHover={{ color: T.text }}
                style={{
                  fontSize: 12, color: 'rgba(255,255,255,0.55)', textDecoration: 'none',
                  fontWeight: 500, letterSpacing: '0.02em', transition: 'color 0.15s',
                }}
              >{item}</motion.a>
            ))}
          </nav>
          <div className="desktop-only" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Link href="/login" style={{ fontSize: 13, color: T.text2, textDecoration: 'none', fontWeight: 500 }}>Sign in</Link>
            <Magnetic>
              <button
                onClick={() => { track({ event: 'landing_cta_clicked', cta_label: 'Start documenting', section: 'nav', page: 'landing' }); openWaitlist('waitlist') }}
                style={{
                  background: T.accent, color: T.bg, fontSize: 13, fontWeight: 700,
                  padding: '9px 22px', borderRadius: 100, border: 'none', cursor: 'pointer',
                  fontFamily: FF, letterSpacing: '-0.01em', minHeight: 44,
                  boxShadow: '0 0 24px rgba(0,229,191,0.15), 0 1px 0 rgba(255,255,255,0.12) inset',
                }}
              >Start documenting</button>
            </Magnetic>
          </div>
          <button className="mobile-only" onClick={() => setMobileMenu(true)} aria-label="Open menu" aria-expanded={mobileMenu} style={{
            background: 'transparent', border: 'none', cursor: 'pointer', color: T.text2,
            padding: 8, minHeight: 44, minWidth: 44, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Menu size={22} />
          </button>
        </div>
      </motion.header>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* HERO                                                                   */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <section className="hp-hero-pad" style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', textAlign: 'center', position: 'relative', overflow: 'hidden',
      }}>
        <HeroBg />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 900 }}>
          {/* Overline badge */}
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6, ease: SPRING_EASE }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              border: '1px solid rgba(229,71,71,0.4)', borderRadius: 100,
              padding: '7px 16px', marginBottom: 48,
              fontSize: 11, letterSpacing: '0.08em', fontWeight: 600,
              background: 'rgba(4,4,4,0.82)', backdropFilter: 'blur(8px)',
            }}
          >
            <motion.div
              animate={{ opacity: [1, 0.2, 1] }}
              transition={{ duration: 1.3, repeat: Infinity }}
              style={{
                width: 5, height: 5, borderRadius: '50%', background: T.red,
                boxShadow: '0 0 6px rgba(229,71,71,0.8)', flexShrink: 0,
              }}
            />
            <span style={{ color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase' }}>
              EU AI ACT
            </span>
            <span style={{ width: 1, height: 10, background: 'rgba(255,255,255,0.12)', flexShrink: 0 }} />
            <span style={{ color: T.red, fontWeight: 700, textTransform: 'uppercase' }}>
              ENFORCEMENT: AUGUST 2, 2026
            </span>
          </motion.div>

          {/* Staggered headline */}
          <StaggeredHeadline
            words={['Your', 'AI', 'systems', 'need', 'evidence', 'packs.']}
          />
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.7, ease: SPRING_EASE }}
          >
            <h1 style={{
              fontSize: 'clamp(36px, 5.5vw, 80px)', fontWeight: 900, lineHeight: 1.0,
              letterSpacing: '-0.04em', margin: '0 0 32px', color: T.accent,
            }}>
              Build them in minutes.
            </h1>
          </motion.div>

          {/* Subtext */}
          <motion.p
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.85, duration: 0.6 }}
            style={{
              fontSize: 18, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6,
              maxWidth: 520, margin: '0 auto 40px', letterSpacing: '-0.01em',
            }}
          >
            The only tool that builds the evidence pack regulators will actually ask for.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
            style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}
          >
            <Magnetic>
              <motion.button
                onClick={() => {
                  track({ event: 'landing_cta_clicked', cta_label: 'Start documenting', section: 'hero', page: 'landing' })
                  openWaitlist('waitlist')
                }}
                whileHover={{ boxShadow: '0 0 0 1px rgba(0,229,191,0.4), 0 0 48px rgba(0,229,191,0.22)' }}
                whileTap={{ scale: 0.98 }}
                style={{
                  ...S.inlineBtn, background: T.accent, color: T.bg,
                  fontSize: 15, fontWeight: 800, padding: '16px 36px', borderRadius: 100,
                  letterSpacing: '-0.01em', minHeight: 48,
                  boxShadow: '0 0 24px rgba(0,229,191,0.15), 0 1px 0 rgba(255,255,255,0.12) inset',
                }}
              >
                Start documenting <ArrowRight size={16} />
              </motion.button>
            </Magnetic>
            <Magnetic>
              <a
                href="#how-it-works"
                onClick={() => track({ event: 'landing_cta_clicked', cta_label: 'Watch the walkthrough', section: 'hero', page: 'landing' })}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  background: 'transparent', color: T.text2,
                  fontSize: 15, fontWeight: 600, padding: '16px 32px', borderRadius: 100,
                  textDecoration: 'none', border: `1px solid ${T.border}`, minHeight: 48,
                  transition: 'border-color 0.15s',
                }}
              >
                Watch the walkthrough
              </a>
            </Magnetic>
          </motion.div>

          {/* Trust line */}
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}
            style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', margin: '24px 0 0', letterSpacing: '0.02em' }}
          >
            Covers all Annex III high-risk categories &middot; EU &amp; UK jurisdiction &middot; Guidance only, not legal advice
          </motion.p>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}
          style={{
            position: 'absolute', bottom: 40, left: '50%', transform: 'translateX(-50%)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
          }}
        >
          <span style={{ fontSize: 10, color: T.text3, letterSpacing: '0.08em', textTransform: 'uppercase' }}>scroll</span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            style={{ width: 1, height: 24, background: `linear-gradient(${T.text3}, transparent)` }}
          />
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* URGENCY BAR                                                            */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <div className="r-grid-3" style={{ background: T.surface, borderTop: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}` }}>
        <div style={{ padding: '24px 32px', textAlign: 'center' }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: T.accent, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>Enforcement countdown</span>
          <span style={{ fontSize: 36, fontWeight: 900, color: T.accent, letterSpacing: '-0.03em', lineHeight: 1, display: 'block', marginBottom: 2 }}>{daysLeft !== null ? daysLeft.toLocaleString() : '\u2014'}</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: T.text2 }}>days until enforcement</span>
        </div>
        <div style={{ padding: '24px 32px', textAlign: 'center', borderLeft: `1px solid ${T.border}`, borderRight: `1px solid ${T.border}` }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: T.accent, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>Maximum penalty</span>
          <span style={{ fontSize: 36, fontWeight: 900, color: T.text, letterSpacing: '-0.03em', lineHeight: 1, display: 'block', marginBottom: 2, opacity: 0.7 }}>&pound;35M</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: T.text2 }}>maximum fine</span>
        </div>
        <div style={{ padding: '24px 32px', textAlign: 'center' }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: T.accent, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>Awareness gap</span>
          <span style={{ fontSize: 36, fontWeight: 900, color: T.text, letterSpacing: '-0.03em', lineHeight: 1, display: 'block', marginBottom: 2, opacity: 0.7 }}>67%</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: T.text2 }}>of SMEs unaware their workflows qualify</span>
        </div>
      </div>

      <Divider />

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* PROBLEM SECTION                                                        */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <section className="hp-section-pad" style={{ background: T.surface }}>
        <div style={{ maxWidth: 1160, margin: '0 auto' }}>
          <motion.div {...fadeUp()} style={{ marginBottom: 64 }}>
            <p style={S.overline}>THE COMPLIANCE GAP</p>
            <h2 style={{ ...S.h2, fontSize: 'clamp(28px, 4vw, 48px)', maxWidth: 560 }}>
              Most SMEs are starting from zero
            </h2>
          </motion.div>

          <div className="r-grid-3 wall-grid">
            {PROBLEM_CARDS.map((card, i) => (
              <motion.div
                key={card.title}
                {...fadeInOnce(i * 0.08)}
                style={{
                  ...S.cardPad, ...S.wallCell, background: T.card,
                  borderTop: `1px solid ${T.border}`, position: 'relative',
                }}
              >
                <p style={{
                  fontSize: 'clamp(36px, 4vw, 56px)', fontWeight: 900,
                  color: i === 2 ? T.red : T.text, letterSpacing: '-0.04em',
                  lineHeight: 1, margin: '0 0 4px', opacity: i === 2 ? 0.6 : 0.7,
                  fontVariantNumeric: 'tabular-nums',
                }}>
                  {card.stat}
                </p>
                <p style={{
                  fontSize: 13, fontWeight: 700, color: T.text2,
                  margin: '0 0 16px', letterSpacing: '-0.01em',
                }}>
                  {card.title}
                </p>
                <p style={{ fontSize: 13, color: T.text2, lineHeight: 1.6, margin: 0 }}>
                  {card.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* PITCH + ICP BRIDGE                                                     */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <section style={{ padding: '80px 32px', textAlign: 'center' }}>
        <motion.div {...fadeUp()} style={{ maxWidth: 720, margin: '0 auto' }}>
          <p style={{
            fontSize: 'clamp(18px, 2.5vw, 24px)', fontWeight: 600, color: T.text,
            lineHeight: 1.6, margin: '0 0 24px', letterSpacing: '-0.01em',
          }}>
            We turn each of your AI and automation workflows into a structured evidence pack
            for your legal team &mdash; in hours instead of weeks, at a fraction of consulting cost.
          </p>
          <p style={{ fontSize: 14, color: T.text2, margin: 0 }}>
            Built for compliance leads, ops directors, and CTOs at EU/UK companies with 10&ndash;500 employees.
          </p>
        </motion.div>
      </section>

      <Divider />

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* SOLUTION SECTION                                                       */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <section id="how-it-works" className="hp-section-pad">
        <div style={{ maxWidth: 1160, margin: '0 auto' }}>
          <motion.div {...fadeUp()} style={{ marginBottom: 64 }}>
            <p style={S.overline}>HOW IRVO WORKS</p>
            <h2 style={{ ...S.h2, fontSize: 'clamp(28px, 4vw, 48px)', maxWidth: 600 }}>
              From workflow to evidence pack in 20 minutes
            </h2>
          </motion.div>

          <div className="r-grid-3 wall-grid">
            {SOLUTION_STEPS.map((step, i) => (
              <motion.div
                key={step.n}
                {...fadeInOnce(i * 0.1)}
                onMouseMove={cardGlowMove}
                onMouseLeave={cardGlowLeave}
                style={{
                  padding: '48px 36px', ...S.wallCell, background: T.card,
                  position: 'relative', overflow: 'hidden',
                  borderTop: i === 2 ? `2px solid ${T.accent}` : `1px solid ${T.border}`,
                }}
              >
                <div data-glow="" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }} />
                <div style={{ position: 'relative', zIndex: 1 }}>
                  {/* Large background number */}
                  <div style={{
                    position: 'absolute', top: -16, right: -8,
                    fontSize: 120, fontWeight: 900, color: T.text,
                    opacity: 0.02, lineHeight: 1, userSelect: 'none', pointerEvents: 'none',
                    letterSpacing: '-0.05em',
                  }}>{step.n}</div>

                  <span style={{
                    fontSize: 11, fontWeight: 600, color: T.accent,
                    letterSpacing: '0.08em', display: 'block', marginBottom: 8,
                  }}>STEP {step.n}</span>
                  <div style={{ width: 20, height: 2, background: T.accent, opacity: 0.4, marginBottom: 24 }} />
                  <h3 style={{
                    fontSize: 18, fontWeight: 800, color: T.text,
                    margin: '0 0 12px', letterSpacing: '-0.02em',
                  }}>{step.title}</h3>
                  <p style={{ fontSize: 15, color: T.text2, lineHeight: 1.6, margin: 0 }}>
                    {step.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Divider />

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* FEATURES                                                               */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <section id="features" className="hp-section-pad" style={{ background: T.surface }}>
        <div style={{ maxWidth: 1160, margin: '0 auto' }}>
          <motion.div {...fadeUp()} style={{ marginBottom: 80 }}>
            <p style={S.overline}>CAPABILITIES</p>
            <h2 style={{ ...S.h2, fontSize: 'clamp(28px, 4vw, 48px)', maxWidth: 600 }}>
              Everything the Act requires. Nothing it doesn&apos;t.
            </h2>
          </motion.div>

          <div className="r-grid-3 wall-grid">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                {...fadeInOnce((i % 3) * 0.07)}
                style={{
                  ...S.cardPad, ...S.wallCell, background: T.card,
                  borderLeft: '2px solid transparent', borderTop: `1px solid ${T.border}`,
                  position: 'relative', overflow: 'hidden', transition: 'border-left-color 0.25s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderLeftColor = T.accent)}
                onMouseMove={cardGlowMove}
                onMouseLeave={(e) => { e.currentTarget.style.borderLeftColor = 'transparent'; cardGlowLeave(e) }}
              >
                <div data-glow="" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }} />
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                    <f.icon size={17} color="rgba(255,255,255,0.28)" />
                    <span style={{
                      fontSize: 9, fontWeight: 800, color: T.accent,
                      letterSpacing: '0.08em', fontVariantNumeric: 'tabular-nums' as const, opacity: 0.6,
                    }}>{String(i + 1).padStart(2, '0')}</span>
                  </div>
                  <h3 style={{
                    fontSize: 15, fontWeight: 800, color: T.text,
                    margin: '0 0 10px', letterSpacing: '-0.02em',
                  }}>{f.title}</h3>
                  <p style={{ fontSize: 13, color: T.text2, lineHeight: 1.6, margin: 0 }}>{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Divider />

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* PRODUCT WORKFLOW VISUAL                                                */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <section className="hp-section-pad">
        <div style={{ maxWidth: 1160, margin: '0 auto' }}>
          <motion.div {...fadeUp()} style={{ marginBottom: 64 }}>
            <p style={S.overline}>THE 5-STEP WIZARD</p>
            <h2 style={{ ...S.h2, fontSize: 'clamp(28px, 4vw, 48px)' }}>
              Twelve questions. One complete evidence pack.
            </h2>
          </motion.div>

          <motion.div
            {...fadeInOnce(0.1)}
            style={{
              border: `1px solid ${T.border}`, background: T.card, overflow: 'hidden',
            }}
          >
            {/* Status bar */}
            <div style={{
              padding: '14px 24px', borderBottom: `1px solid ${T.border}`,
              display: 'flex', alignItems: 'center', gap: 10,
              background: 'rgba(0,229,191,0.03)',
            }}>
              <div style={{
                width: 6, height: 6, borderRadius: '50%', background: T.accent,
                boxShadow: '0 0 7px rgba(0,229,191,0.6)', flexShrink: 0,
              }} />
              <span style={{
                fontSize: 11, fontWeight: 600, color: T.accent,
                letterSpacing: '0.08em', textTransform: 'uppercase',
              }}>Wizard Journey</span>
              <span style={{ fontSize: 11, color: T.text3 }}>&middot;</span>
              <span style={{ fontSize: 11, color: T.text3, fontWeight: 500 }}>
                Average completion: 20 minutes per system
              </span>
            </div>

            {/* Steps row */}
            <div style={{
              padding: '32px 24px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 0,
              flexWrap: 'wrap',
            }}>
              {WORKFLOW_STEPS.map((step, i) => (
                <div key={step.label} style={{ display: 'flex', alignItems: 'center', gap: 0, flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                    <span style={{
                      fontSize: 10, fontWeight: 700, color: T.text3,
                      letterSpacing: '0.02em', flexShrink: 0,
                    }}>{step.n}</span>
                    <span style={{
                      fontSize: 13, fontWeight: 700, color: step.color,
                      letterSpacing: '-0.01em', whiteSpace: 'nowrap',
                    }}>{step.label}</span>
                  </div>
                  {i < WORKFLOW_STEPS.length - 1 && (
                    <div style={{
                      flex: 1, height: 1, minWidth: 16,
                      background: `linear-gradient(90deg, ${T.border}, transparent)`,
                      margin: '0 16px',
                    }} />
                  )}
                </div>
              ))}
            </div>

            {/* Product visual mock — styled wizard screenshot */}
            <div style={{ padding: '24px 24px 0', borderTop: `1px solid ${T.border}` }}>
              <div style={{
                background: T.bg, border: `1px solid ${T.border}`, overflow: 'hidden',
              }}>
                {/* Mock app header */}
                <div style={{ padding: '10px 16px', borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: T.red, opacity: 0.5 }} />
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: T.amber, opacity: 0.5 }} />
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: T.green, opacity: 0.5 }} />
                  <span style={{ flex: 1, textAlign: 'center', fontSize: 10, color: T.text3, fontWeight: 500 }}>irvo.co.uk/systems/new</span>
                </div>
                {/* Mock wizard content */}
                <div style={{ padding: '20px 24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                    <div style={{ width: 20, height: 20, borderRadius: '50%', background: T.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: T.bg }}>3</div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: T.text }}>Classification Result</span>
                    <span style={{ fontSize: 10, color: T.text3, marginLeft: 'auto' }}>Step 3 of 5</span>
                  </div>
                  <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                    <div style={{ flex: '1 1 200px', padding: '14px 16px', background: T.surface, border: `1px solid rgba(229,71,71,0.3)` }}>
                      <div style={{ fontSize: 9, fontWeight: 600, color: T.text3, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Risk Level</div>
                      <div style={{ fontSize: 22, fontWeight: 900, color: T.red }}>High Risk</div>
                      <div style={{ fontSize: 10, color: T.text2, marginTop: 4 }}>Annex III.4.a — Employment</div>
                    </div>
                    <div style={{ flex: '1 1 200px', padding: '14px 16px', background: T.surface, border: `1px solid ${T.border}` }}>
                      <div style={{ fontSize: 9, fontWeight: 600, color: T.text3, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Obligations</div>
                      <div style={{ fontSize: 22, fontWeight: 900, color: T.accent }}>5</div>
                      <div style={{ fontSize: 10, color: T.text2, marginTop: 4 }}>Art. 9, 10, 11, 13, 14</div>
                    </div>
                    <div style={{ flex: '1 1 200px', padding: '14px 16px', background: T.surface, border: `1px solid ${T.border}` }}>
                      <div style={{ fontSize: 9, fontWeight: 600, color: T.text3, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Immediate Actions</div>
                      <div style={{ fontSize: 22, fontWeight: 900, color: T.amber }}>3</div>
                      <div style={{ fontSize: 10, color: T.text2, marginTop: 4 }}>Start documenting now</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom bar */}
            <div style={{
              padding: '16px 24px', borderTop: `1px solid ${T.border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: T.surface2, marginTop: 0,
            }}>
              <p style={{ fontSize: 12, color: T.text2, margin: 0 }}>
                Output: 8-section PDF evidence pack &middot; Cover, classification, obligations, evidence, gaps, declaration
              </p>
              <button
                onClick={() => {
                  track({ event: 'landing_cta_clicked', cta_label: 'Start documenting', section: 'workflow', page: 'landing' })
                  openWaitlist('waitlist')
                }}
                style={{
                  ...S.inlineBtn, background: T.accent, color: T.bg,
                  fontSize: 12, fontWeight: 700, padding: '8px 20px',
                  borderRadius: 100, minHeight: 44,
                }}
              >
                Start documenting <ArrowRight size={13} />
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      <Divider />

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* PRICING                                                                */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <motion.section
        id="pricing"
        className="hp-section-pad"
        style={{ background: T.surface }}
        onViewportEnter={() => track({ event: 'pricing_viewed', page: 'landing' })}
      >
        <div style={{ maxWidth: 1160, margin: '0 auto' }}>
          <motion.div {...fadeUp()} className="hp-pricing-header" style={{ marginBottom: 64 }}>
            <div>
              <p style={S.overline}>PRICING</p>
              <h2 style={{ ...S.h2, fontSize: 'clamp(28px, 4vw, 48px)', margin: '0 0 16px' }}>
                Built for SME budgets. Not enterprise procurement.
              </h2>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: T.accentDim, border: '1px solid rgba(0,229,191,0.2)',
                borderRadius: 100, padding: '7px 16px',
              }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: T.accent, flexShrink: 0 }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: T.accent, letterSpacing: '0.02em' }}>
                  30% lifetime discount for first 20 customers
                </span>
              </div>
            </div>
          </motion.div>

          <div className="r-grid-3 wall-grid">
            {PRICING.map((plan, i) => (
              <motion.div
                key={plan.name}
                {...fadeUp(i * 0.08)}
                style={{
                  padding: '48px 36px', ...S.wallCell,
                  background: plan.highlight ? T.surface2 : T.card, position: 'relative',
                }}
              >
                {plan.highlight && (
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: T.accent }} />
                )}
                {plan.highlight && (
                  <div style={{
                    position: 'absolute', top: 14, right: 14,
                    fontSize: 9, fontWeight: 800, color: T.bg, background: T.accent,
                    padding: '3px 10px', borderRadius: 100,
                    letterSpacing: '0.08em', textTransform: 'uppercase',
                  }}>
                    Recommended
                  </div>
                )}

                <p style={{
                  fontSize: 11, fontWeight: 600,
                  color: plan.highlight ? T.accent : T.text2,
                  textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 8px',
                }}>{plan.name}</p>
                <p style={{ fontSize: 12, color: T.text2, margin: '0 0 24px' }}>{plan.desc}</p>

                <p style={{
                  fontSize: 48, fontWeight: 900, color: T.text,
                  margin: '0 0 4px', letterSpacing: '-0.04em',
                  fontVariantNumeric: 'tabular-nums', lineHeight: 1,
                }}>
                  &pound;{plan.price}{plan.plus ? '+' : ''}
                </p>
                <p style={{ fontSize: 12, color: T.text2, margin: '0 0 32px' }}>per month</p>

                <ul style={{
                  listStyle: 'none', padding: 0, margin: '0 0 36px',
                  display: 'flex', flexDirection: 'column', gap: 10,
                }}>
                  {plan.features.map((f) => (
                    <li key={f} style={S.listItem}>
                      <CheckCircle size={13} color={T.accent} />{f}
                    </li>
                  ))}
                </ul>

                <Magnetic>
                  <motion.button
                    onClick={() => {
                      track({ event: 'founding_discount_clicked', cta_label: 'Claim founding discount', section: 'pricing', page: 'landing' })
                      openWaitlist('founding')
                    }}
                    whileHover={{
                      boxShadow: plan.highlight
                        ? '0 0 0 1px rgba(0,229,191,0.4), 0 0 32px rgba(0,229,191,0.18)'
                        : 'none',
                    }}
                    style={{
                      display: 'block', width: '100%', textAlign: 'center',
                      background: plan.highlight ? T.accent : 'transparent',
                      color: plan.highlight ? T.bg : T.text,
                      border: `1px solid ${plan.highlight ? T.accent : T.border}`,
                      borderRadius: 100, padding: '12px 0', fontSize: 13, fontWeight: 700,
                      cursor: 'pointer', fontFamily: FF, minHeight: 44,
                      boxShadow: plan.highlight
                        ? '0 0 24px rgba(0,229,191,0.15), 0 1px 0 rgba(255,255,255,0.12) inset'
                        : 'none',
                    }}
                  >
                    Claim founding discount
                  </motion.button>
                </Magnetic>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* CONCIERGE OFFER                                                        */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <section style={{ padding: '80px 32px' }}>
        <motion.div {...fadeUp()} style={{
          maxWidth: 720, margin: '0 auto', textAlign: 'center',
          background: T.surface, border: `1px solid ${T.border}`, padding: '48px 40px',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: T.accent }} />
          <p style={{ ...S.overline, marginBottom: 16 }}>ZERO-RISK PILOT</p>
          <h2 style={{ ...S.h2, fontSize: 'clamp(22px, 3vw, 32px)', marginBottom: 16 }}>
            We&apos;ll document your first system for free
          </h2>
          <p style={{ fontSize: 15, color: T.text2, lineHeight: 1.6, margin: '0 0 32px', maxWidth: 520, marginLeft: 'auto', marginRight: 'auto' }}>
            The first 10 customers get one AI workflow documented end-to-end by the founder &mdash; at zero cost.
            You get a complete evidence pack. We get your feedback.
          </p>
          <Magnetic>
            <motion.button
              onClick={() => {
                track({ event: 'walkthrough_clicked', cta_label: 'Book concierge session', section: 'concierge', page: 'landing' })
                openWaitlist('walkthrough')
              }}
              whileHover={{ boxShadow: '0 0 0 1px rgba(0,229,191,0.4), 0 0 32px rgba(0,229,191,0.18)' }}
              style={{
                ...S.inlineBtn, gap: 10, background: T.accent, color: T.bg,
                fontSize: 14, fontWeight: 800, padding: '14px 32px', borderRadius: 100, minHeight: 44,
                boxShadow: '0 0 24px rgba(0,229,191,0.15), 0 1px 0 rgba(255,255,255,0.12) inset',
              }}
            >
              Book a free concierge session <ArrowRight size={15} />
            </motion.button>
          </Magnetic>
        </motion.div>
      </section>

      <Divider />

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* FAQ                                                                    */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <section id="faq" className="hp-section-pad">
        <div style={{ maxWidth: 1160, margin: '0 auto' }}>
          <motion.div {...fadeUp()} style={{ marginBottom: 80 }}>
            <p style={S.overline}>FAQ</p>
            <h2 style={{ ...S.h2, fontSize: 'clamp(28px, 4vw, 48px)' }}>
              Every question before the decision.
            </h2>
          </motion.div>

          <div className="r-grid-3 wall-grid">
            {FAQS.map((faq, i) => (
              <motion.div
                key={faq.q}
                {...fadeInOnce((i % 3) * 0.07)}
                whileHover={{ background: 'rgba(255,255,255,0.015)' }}
                style={{
                  padding: '36px 32px', ...S.wallCell,
                  background: T.card, transition: 'background 0.2s',
                }}
              >
                <h3 style={{
                  fontSize: 15, fontWeight: 800, color: T.text,
                  margin: '0 0 12px', letterSpacing: '-0.02em', lineHeight: 1.3,
                }}>{faq.q}</h3>
                <p style={{ fontSize: 13, color: T.text2, lineHeight: 1.6, margin: 0 }}>
                  {faq.a}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Divider />

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* FINAL CTA                                                              */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <section className="hp-cta-pad" style={{ textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <FinalCtaBg />
        <div style={{ maxWidth: 700, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 style={{
              fontSize: 'clamp(36px, 6vw, 80px)', fontWeight: 900,
              letterSpacing: '-0.04em', lineHeight: 1.0, margin: '0 0 24px', color: T.text,
            }}>
              The deadline doesn&apos;t move.
            </h2>
            <h2 style={{
              fontSize: 'clamp(36px, 6vw, 80px)', fontWeight: 900,
              letterSpacing: '-0.04em', lineHeight: 1.0, margin: '0 0 32px', color: T.accent,
            }}>
              Your compliance can.
            </h2>

            <p style={{
              fontSize: 18, color: T.text2, margin: '0 auto 40px',
              lineHeight: 1.6, maxWidth: 520,
            }}>
              Start documenting your AI systems today. First 20 customers get 30% off for life.
            </p>

            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 40,
              background: 'rgba(0,229,191,0.06)', border: '1px solid rgba(0,229,191,0.22)',
              borderRadius: 100, padding: '7px 18px',
            }}>
              <motion.div
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.6, repeat: Infinity }}
                style={{
                  width: 5, height: 5, borderRadius: '50%', background: T.accent, flexShrink: 0,
                }}
              />
              <span style={{ fontSize: 12, fontWeight: 700, color: T.accent, letterSpacing: '0.02em' }}>
                3 of 20 founding spots remaining
              </span>
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Magnetic>
                <motion.button
                  onClick={() => {
                    track({ event: 'founding_discount_clicked', cta_label: 'Claim founding discount', section: 'final-cta', page: 'landing' })
                    openWaitlist('founding')
                  }}
                  whileHover={{ boxShadow: '0 0 0 1px rgba(0,229,191,0.4), 0 0 48px rgba(0,229,191,0.22)' }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    ...S.inlineBtn, gap: 10, background: T.accent, color: T.bg,
                    fontSize: 16, fontWeight: 800, padding: '16px 40px', borderRadius: 100,
                    letterSpacing: '-0.01em', minHeight: 48,
                    boxShadow: '0 0 24px rgba(0,229,191,0.15), 0 1px 0 rgba(255,255,255,0.12) inset',
                  }}
                >
                  Claim founding discount <ArrowRight size={18} />
                </motion.button>
              </Magnetic>
              <Magnetic>
                <motion.button
                  onClick={() => {
                    track({ event: 'walkthrough_clicked', cta_label: 'Book a walkthrough', section: 'final-cta', page: 'landing' })
                    openWaitlist('walkthrough')
                  }}
                  whileHover={{ borderColor: T.borderMid }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    ...S.inlineBtn, gap: 10, background: 'transparent', color: T.text2,
                    fontSize: 15, fontWeight: 600, padding: '16px 32px', borderRadius: 100,
                    border: `1px solid ${T.border}`, transition: 'border-color 0.15s', minHeight: 48,
                  }}
                >
                  Book a walkthrough
                </motion.button>
              </Magnetic>
            </div>

            <p style={{ fontSize: 11, color: T.text3, margin: '24px 0 0', lineHeight: 1.6 }}>
              Irvo does not provide legal advice &middot; Consult a qualified professional for binding decisions
            </p>
          </motion.div>
        </div>
      </section>

      <Divider />

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* FOOTER                                                                 */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <footer style={{ padding: '64px 32px', background: T.surface }}>
        <div style={{ maxWidth: 1160, margin: '0 auto' }}>
          <div className="r-grid-footer" style={{ marginBottom: 64 }}>
            {/* Brand column */}
            <div>
              <div style={{ marginBottom: 16 }}><Logo size={24} /></div>
              <p style={{
                fontSize: 13, color: T.text2, lineHeight: 1.6, maxWidth: 240, margin: '0 0 20px',
              }}>
                AI compliance documentation, without the consultant bill.
              </p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {['EU AI Act', 'GDPR Safe', 'Guidance Only'].map((b) => (
                  <span key={b} style={{
                    fontSize: 10, fontWeight: 600, color: T.text3,
                    border: `1px solid ${T.border}`, padding: '3px 10px',
                    borderRadius: 100, letterSpacing: '0.02em',
                  }}>{b}</span>
                ))}
              </div>
            </div>

            {/* Link columns */}
            {[
              {
                title: 'Product',
                links: [
                  { label: 'Features', href: '#features' },
                  { label: 'Pricing', href: '#pricing' },
                  { label: 'Documentation', href: '#how-it-works' },
                ],
              },
              {
                title: 'Company',
                links: [
                  { label: 'Contact', href: 'mailto:hello@irvo.co.uk' },
                ],
              },
              {
                title: 'Legal',
                links: [
                  { label: 'Privacy', href: '/privacy' },
                  { label: 'Terms', href: '/terms' },
                  { label: 'EU AI Act Text', href: 'https://artificialintelligenceact.eu/' },
                ],
              },
            ].map(({ title, links }) => (
              <div key={title}>
                <h4 style={{
                  color: T.text3, fontWeight: 600, fontSize: 11,
                  marginBottom: 20, letterSpacing: '0.08em', textTransform: 'uppercase',
                }}>{title}</h4>
                <ul style={{
                  listStyle: 'none', padding: 0, margin: 0,
                  display: 'flex', flexDirection: 'column', gap: 12,
                }}>
                  {links.map(({ label, href }) => (
                    <li key={label}>
                      <motion.a
                        href={href}
                        whileHover={{ color: T.text }}
                        style={{
                          color: T.text2, textDecoration: 'none', fontSize: 13,
                          display: 'inline-block', transition: 'color 0.15s',
                        }}
                      >{label}</motion.a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div style={{
            borderTop: `1px solid ${T.border}`, paddingTop: 24,
            display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8,
          }}>
            <p style={{ color: T.text3, fontSize: 12, margin: 0 }}>
              &copy; {new Date().getFullYear()} Irvo. Irvo does not provide legal advice.
            </p>
            <p style={{ color: T.text3, fontSize: 12, margin: 0 }}>irvo.co.uk</p>
          </div>
        </div>
      </footer>

      {/* ── WAITLIST MODAL ── */}
      <AnimatePresence>
        {waitlistModal && <WaitlistModal variant={waitlistModal} onClose={() => setWaitlistModal(null)} />}
      </AnimatePresence>

      </div>{/* end content wrapper */}
    </div>
  )
}
