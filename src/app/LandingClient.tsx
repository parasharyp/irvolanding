'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import Link from 'next/link'
import {
  motion,
  AnimatePresence,
  useScroll,
  useSpring,
  useReducedMotion,
} from 'framer-motion'
import {
  Shield,
  FileText,
  CheckCircle,
  ArrowRight,
  Bot,
  Download,
  Clock,
  Layers,
  Menu,
  X,
} from 'lucide-react'
import { track } from '@/lib/analytics'

/* CONSTANTS & DATA */

const DEADLINE = new Date('2026-08-02T00:00:00Z').getTime()
const NAV_ITEMS = ['Features', 'How It Works', 'Pricing', 'FAQ']

const FEATURES = [
  { icon: Shield, title: 'Risk Classification Engine', desc: '12-question questionnaire mapped to Annex III. AI classifies your system in seconds — not weeks.' },
  { icon: FileText, title: 'Obligations Mapping', desc: 'Every applicable Article surfaced with required evidence. No legal interpretation needed.' },
  { icon: Bot, title: 'AI Evidence Drafting', desc: 'Claude drafts each evidence section from your system description. You edit, review, approve.' },
  { icon: Download, title: 'Evidence Pack Export', desc: '8-section PDF: cover, classification, obligations, evidence, gaps, declaration. Auditor-ready.' },
  { icon: Clock, title: 'Deadline Tracking', desc: 'Countdown to August 2, 2026. Urgency states. Progress dashboards per system.' },
  { icon: Layers, title: 'Multi-System Management', desc: 'Document 3 to 25+ systems. Track completion across your entire AI inventory.' },
]

const PROBLEM_CARDS = [
  { stat: '40\u201360 hrs', title: 'per system, manually', desc: 'Your compliance consultant won\u2019t start until June. Each workflow takes weeks to document \u2014 and you have twelve.' },
  { stat: '\u00A315\u2013\u00A350k', title: 'per consulting engagement', desc: 'Enterprise platforms start at \u00A350k. Boutique firms bill \u00A3400/hour. Neither is built for a 40-person company.' },
  { stat: 'Zero', title: 'structured SME tooling', desc: 'OneTrust targets Fortune 500. Generic templates leave gaps. No one builds the actual evidence pack regulators request.' },
]

const SOLUTION_STEPS = [
  { n: '01', title: 'Describe your AI system', desc: 'Name the workflow, describe what it does, identify who\u2019s affected. Two minutes.' },
  { n: '02', title: 'Answer 12 questions', desc: 'AI classifies your risk level, maps the Annex III category, and generates every obligation that applies. Instant.' },
  { n: '03', title: 'Capture evidence, export', desc: 'AI drafts each evidence section. You review, edit, upload supporting files. Download an 8-section PDF ready for any auditor.' },
]

const WORKFLOW_STEPS = [
  { n: '01', label: 'Name & describe', color: 'text-[#888]' },
  { n: '02', label: 'Risk questionnaire', color: 'text-[#00e5bf]' },
  { n: '03', label: 'Classification result', color: 'text-[#f59e0b]' },
  { n: '04', label: 'Evidence capture', color: 'text-[#a78bfa]' },
  { n: '05', label: 'Export PDF', color: 'text-[#36bd5f]' },
]

interface PricingPlan {
  name: string
  price: number
  desc: string
  features: string[]
  highlight?: boolean
  plus?: boolean
}

const PRICING: PricingPlan[] = [
  { name: 'Starter', price: 149, desc: '1 user \u00B7 3 systems', features: ['3 AI systems', 'PDF export', 'Risk classification', 'Obligations map', 'Basic templates', 'Email support'] },
  { name: 'Growth', price: 399, desc: 'Up to 5 users \u00B7 10 systems', highlight: true, features: ['10 AI systems', '5 users', 'PDF + Word export', 'AI drafting assistance', 'Custom templates', 'Priority support'] },
  { name: 'Plus', price: 799, desc: 'Unlimited users', plus: true, features: ['25+ AI systems', 'Unlimited users', 'Auditor view', 'API access', 'Custom templates', 'Dedicated support'] },
]

const FAQS = [
  { q: 'Is this legal advice?', a: 'No. Irvo provides compliance guidance and structured documentation tools. Always consult qualified legal counsel for binding decisions.' },
  { q: 'What AI systems need documenting?', a: 'Any workflow using automation, ML models, or AI-enabled tools that falls under Annex III categories: HR/recruitment, credit scoring, safety-critical systems, and more.' },
  { q: 'What if my system is low-risk?', a: 'You\u2019ll know in 2 minutes. The questionnaire classifies your system and only generates obligations that apply. Limited-risk systems have lighter requirements.' },
  { q: 'Can I try before I pay?', a: 'Yes. We offer a free concierge session where we document one workflow for you at no cost.' },
  { q: 'How long does it actually take?', a: '20 minutes per system for a complete evidence pack. Compare that to 40\u201360 hours with a consultant.' },
  { q: 'What happens after August 2026?', a: 'The Act requires ongoing compliance, not a one-time exercise. Irvo supports annual reviews and updates whenever your systems change.' },
]

const FOOTER_LINKS = [
  {
    title: 'Product',
    links: [
      { label: 'Features', href: '#features' },
      { label: 'Pricing', href: '#pricing' },
      { label: 'Guides', href: '/guides' },
    ],
  },
  {
    title: 'Company',
    links: [{ label: 'Contact', href: 'mailto:hello@irvo.co.uk' }],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy', href: '/privacy' },
      { label: 'Terms', href: '/terms' },
      { label: 'EU AI Act Text', href: 'https://artificialintelligenceact.eu/' },
    ],
  },
]

/* CSS KEYFRAMES */

const CSS_KEYFRAMES = `
@keyframes fadeSlideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}
@keyframes heroEntrance {
  from { opacity: 0; transform: translateY(32px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes pulseGlow {
  0%, 100% { box-shadow: 0 0 8px rgba(229,71,71,0.6); }
  50% { box-shadow: 0 0 16px rgba(229,71,71,0.9); }
}
@keyframes highRiskPulse {
  0%, 100% { box-shadow: 0 0 12px rgba(229,71,71,0.3); }
  50% { box-shadow: 0 0 24px rgba(229,71,71,0.6); }
}
`

/* CUSTOM HOOKS */

function useDaysLeft() {
  const [now, setNow] = useState<number | null>(null)
  useEffect(() => {
    setNow(Date.now())
  }, [])
  if (now === null) return null
  return Math.max(0, Math.ceil((DEADLINE - now) / 86400000))
}

function useReveal() {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold: 0.15, rootMargin: '-60px' }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return { ref, visible }
}

/* PRIMITIVES */

function Logo({ size = 28 }: { size?: number }) {
  return (
    <Link href="/" className="inline-flex items-center no-underline select-none" style={{ gap: Math.round(size * 0.38) }}>
      <div className="shrink-0 bg-[#00e5bf]" style={{ width: 2, height: Math.round(size * 0.85) }} />
      <span
        className="font-[var(--font-raleway),Raleway,Helvetica,Arial,sans-serif] text-[#e8e8e8] font-black whitespace-nowrap leading-none"
        style={{ fontSize: size, letterSpacing: '-0.5px' }}
      >
        IRVO
      </span>
    </Link>
  )
}

function ScrollProgressBar() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 30 })
  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-px bg-[#00e5bf] z-[200] origin-left"
      style={{ scaleX }}
    />
  )
}

function BrandDivider() {
  return (
    <div className="flex justify-center py-1">
      <div
        className="w-[2px] h-[40px]"
        style={{
          background: 'linear-gradient(to bottom, transparent, #00e5bf 30%, #00e5bf 70%, transparent)',
        }}
      />
    </div>
  )
}

/* VISUAL EFFECTS — desktop only, disabled for reduced-motion */

function HeroCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    let W = window.innerWidth, H = window.innerHeight
    canvas.width = W; canvas.height = H
    let mx = W / 2, my = H * 0.42
    const N = 78
    const pts = Array.from({ length: N }, (_, i) => ({
      x: (i * 131.7 + 20) % W, y: (i * 97.4 + 15) % H,
      vx: (((i * 13 + 7) % 21) - 10) * 0.032, vy: (((i * 9 + 3) % 21) - 10) * 0.032,
      size: 1.1 + (i % 3) * 0.55,
    }))
    const LINK = 138, LINK2 = LINK * LINK, GLOW = 240, GLOW2 = GLOW * GLOW, PUSH = 160, PUSH2 = PUSH * PUSH
    const onMove = (e: MouseEvent) => { mx = e.clientX; my = e.clientY }
    const onResize = () => { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight }
    window.addEventListener('mousemove', onMove, { passive: true })
    window.addEventListener('resize', onResize)
    let raf = 0
    const draw = () => {
      raf = requestAnimationFrame(draw)
      ctx.clearRect(0, 0, W, H)
      const cd2 = pts.map(p => { const dx = p.x - mx, dy = p.y - my; return dx * dx + dy * dy })
      ctx.beginPath(); ctx.lineWidth = 0.5
      for (let i = 0; i < N; i++) { if (cd2[i] < GLOW2) continue; for (let j = i + 1; j < N; j++) { if (cd2[j] < GLOW2) continue; const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y; if (dx * dx + dy * dy < LINK2) { ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y) } } }
      ctx.strokeStyle = 'rgba(160,185,205,0.04)'; ctx.stroke()
      ctx.lineWidth = 0.6
      for (let i = 0; i < N; i++) { for (let j = i + 1; j < N; j++) { if (cd2[i] >= GLOW2 && cd2[j] >= GLOW2) continue; const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y, d2 = dx * dx + dy * dy; if (d2 < LINK2) { const prox = 1 - Math.sqrt(d2) / LINK, gfI = cd2[i] < GLOW2 ? 1 - Math.sqrt(cd2[i]) / GLOW : 0, gfJ = cd2[j] < GLOW2 ? 1 - Math.sqrt(cd2[j]) / GLOW : 0; ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y); ctx.strokeStyle = `rgba(0,229,191,${(prox * Math.max(gfI, gfJ) * 0.38).toFixed(3)})`; ctx.stroke() } } }
      for (let i = 0; i < N; i++) { const p = pts[i], d2 = cd2[i]; if (d2 < PUSH2 && d2 > 0) { const d = Math.sqrt(d2), f = ((PUSH - d) / PUSH) * 0.10; p.vx += ((p.x - mx) / d) * f; p.vy += ((p.y - my) / d) * f }; p.vx *= 0.974; p.vy *= 0.974; p.x += p.vx; p.y += p.vy; if (p.x < -12) p.x += W + 24; else if (p.x > W + 12) p.x -= W + 24; if (p.y < -12) p.y += H + 24; else if (p.y > H + 12) p.y -= H + 24; const gf = d2 < GLOW2 ? 1 - Math.sqrt(d2) / GLOW : 0, a = gf > 0 ? 0.10 + gf * 0.54 : 0.055; ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fillStyle = gf > 0.04 ? `rgba(0,229,191,${a.toFixed(3)})` : `rgba(180,200,215,${(a * 0.5).toFixed(3)})`; ctx.fill() }
    }
    raf = requestAnimationFrame(draw)
    return () => { cancelAnimationFrame(raf); window.removeEventListener('mousemove', onMove); window.removeEventListener('resize', onResize) }
  }, [])
  return <canvas ref={canvasRef} aria-hidden="true" className="fixed inset-0 w-full h-full pointer-events-none z-0 hidden md:block" />
}

function CursorSpotlight() {
  const innerRef = useRef<HTMLDivElement>(null)
  const midRef = useRef<HTMLDivElement>(null)
  const outerRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    let raf = 0, tx = window.innerWidth / 2, ty = window.innerHeight * 0.44
    let mx = tx, my = ty, mvx = 0, mvy = 0, ox = tx, oy = ty, ovx = 0, ovy = 0
    const onMove = (e: MouseEvent) => { tx = e.clientX; ty = e.clientY }
    const tick = () => {
      raf = requestAnimationFrame(tick)
      mvx = mvx * 0.76 + (tx - mx) * 0.11; mvy = mvy * 0.76 + (ty - my) * 0.11; mx += mvx; my += mvy
      ovx = ovx * 0.84 + (tx - ox) * 0.052; ovy = ovy * 0.84 + (ty - oy) * 0.052; ox += ovx; oy += ovy
      if (innerRef.current) innerRef.current.style.background = `radial-gradient(140px circle at ${tx}px ${ty}px, rgba(0,229,191,0.11) 0%, rgba(0,229,191,0.03) 55%, transparent 100%)`
      if (midRef.current) midRef.current.style.background = `radial-gradient(480px circle at ${mx}px ${my}px, rgba(0,229,191,0.05) 0%, rgba(71,201,229,0.015) 60%, transparent 100%)`
      if (outerRef.current) outerRef.current.style.background = `radial-gradient(880px circle at ${ox}px ${oy}px, rgba(0,229,191,0.022) 0%, transparent 62%)`
    }
    raf = requestAnimationFrame(tick)
    window.addEventListener('mousemove', onMove, { passive: true })
    return () => { cancelAnimationFrame(raf); window.removeEventListener('mousemove', onMove) }
  }, [])
  return (
    <>
      <div ref={outerRef} className="fixed inset-0 z-[3] pointer-events-none hidden md:block" />
      <div ref={midRef} className="fixed inset-0 z-[3] pointer-events-none hidden md:block" />
      <div ref={innerRef} className="fixed inset-0 z-[3] pointer-events-none hidden md:block" />
    </>
  )
}

function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    let raf = 0, tx = -100, ty = -100, cx = tx, cy = ty, vx = 0, vy = 0
    const onMove = (e: MouseEvent) => { tx = e.clientX; ty = e.clientY }
    window.addEventListener('mousemove', onMove, { passive: true })
    const tick = () => {
      raf = requestAnimationFrame(tick)
      vx = vx * 0.85 + (tx - cx) * 0.10; vy = vy * 0.85 + (ty - cy) * 0.10; cx += vx; cy += vy
      if (dotRef.current) dotRef.current.style.transform = `translate(${tx}px,${ty}px) translate(-50%,-50%)`
      if (ringRef.current) ringRef.current.style.transform = `translate(${(cx - 12).toFixed(1)}px,${(cy - 12).toFixed(1)}px)`
    }
    raf = requestAnimationFrame(tick)
    return () => { cancelAnimationFrame(raf); window.removeEventListener('mousemove', onMove) }
  }, [])
  return (
    <>
      <div ref={dotRef} className="fixed top-0 left-0 z-[9999] w-1 h-1 rounded-full bg-white/90 pointer-events-none will-change-transform hidden md:block" />
      <div ref={ringRef} className="fixed top-0 left-0 z-[9998] w-6 h-6 rounded-full border border-white/45 pointer-events-none will-change-transform hidden md:block" />
    </>
  )
}

/* BACKGROUNDS */

function GrainTexture() {
  return (
    <div className="absolute inset-0 opacity-[0.04] pointer-events-none" aria-hidden="true">
      <svg className="w-full h-full">
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="4" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain)" />
      </svg>
    </div>
  )
}

function HeroBg() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 72% 44% at 50% -4%, rgba(0,229,191,0.18) 0%, rgba(0,229,191,0.04) 55%, transparent 70%)',
        }}
      />
      <GrainTexture />
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 100% 80% at 50% 50%, transparent 20%, rgba(4,4,4,0.94) 100%)',
        }}
      />
    </div>
  )
}

function FinalCtaBg() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 700px 500px at 50% 105%, rgba(0,229,191,0.16) 0%, rgba(0,229,191,0.06) 42%, transparent 65%)',
        }}
      />
      <div
        className="absolute top-0 bottom-0 left-1/2 w-px -translate-x-1/2"
        style={{
          background: 'linear-gradient(transparent 0%, rgba(0,229,191,0.08) 40%, rgba(0,229,191,0.12) 60%, rgba(0,229,191,0.04) 85%, transparent 100%)',
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 120% 100% at 50% 50%, transparent 25%, rgba(4,4,4,0.85) 100%)',
        }}
      />
    </div>
  )
}

/* WAITLIST MODAL */

type WaitlistVariant = 'waitlist' | 'founding' | 'walkthrough'
interface WaitlistForm { email: string; full_name: string; company_name: string }
const WL_EMPTY: WaitlistForm = { email: '', full_name: '', company_name: '' }

const WL_CONFIG = {
  waitlist: {
    overline: 'JOIN THE WAITLIST',
    headline: 'Be first when we launch',
    sub: 'We will notify you before public access opens and share early documentation resources.',
    cta: 'Join the Waitlist',
    source: 'landing-waitlist',
  },
  founding: {
    overline: 'FOUNDING ACCESS',
    headline: 'Claim your founding discount',
    sub: 'Founding members lock in 30\u00A0% off for the lifetime of their plan. Limited to the first 20 customers who pre-pay 3 months upfront. After submitting, we\u2019ll send you a secure payment link within one business day.',
    cta: 'Reserve Founding Spot',
    source: 'landing-founding',
  },
  walkthrough: {
    overline: 'BOOK A WALKTHROUGH',
    headline: 'See the product in 30 minutes',
    sub: 'Leave your details and we will reach out within one business day to schedule a walkthrough.',
    cta: 'Request Walkthrough',
    source: 'landing-walkthrough',
  },
}

function ModalField({ label, id, name, value, onChange, type = 'text', placeholder, required }: {
  label: string; id: string; name: string; value: string; onChange: (v: string) => void
  type?: string; placeholder?: string; required?: boolean
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[11px] font-semibold text-[#888] uppercase tracking-[0.08em]">
        {label}{required && <span className="text-[#e54747]"> *</span>}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="bg-[#131313] border border-white/[0.07] focus:border-white/10 px-3.5 py-3 text-[13px] text-[#e8e8e8] outline-none font-[var(--font-raleway),Raleway,Helvetica,Arial,sans-serif] w-full transition-[border-color] duration-150 caret-[#00e5bf]"
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

  useEffect(() => {
    const t = setTimeout(() => (document.getElementById('wl-email') as HTMLInputElement | null)?.focus(), 60)
    return () => clearTimeout(t)
  }, [])

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
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email.trim(),
          full_name: form.full_name.trim() || undefined,
          company_name: form.company_name.trim() || undefined,
          source: cfg.source,
        }),
      })
      if (!response.ok) {
        const text = await response.text()
        try {
          const j = JSON.parse(text)
          setError(j.error ?? 'Something went wrong.')
        } catch {
          setError(`Server error (${response.status}). Please try again.`)
        }
      } else {
        const res = await response.json()
        if (res.success) {
          track({ event: 'waitlist_submitted', cta_label: cfg.cta, section: 'modal', page: 'landing' })
          setSuccess("You\u2019re on the list. We\u2019ll reach out before launch with early access details.")
        } else {
          setError(res.error ?? 'Something went wrong. Please try again.')
        }
      }
    } catch {
      setError('Could not connect. Check your internet and try again.')
    }
    setLoading(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="wl-modal-title"
      className="fixed inset-0 bg-black/92 z-[1000] flex items-center justify-center p-5"
    >
      <motion.div
        ref={dialogRef}
        initial={{ scale: 0.95, opacity: 0, y: 16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.97, opacity: 0 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="bg-[#0c0c0c] border border-white/10 p-9 max-w-[480px] w-full relative"
      >
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#00e5bf] to-transparent" />

        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 bg-transparent border-none cursor-pointer text-[#888] flex p-1.5"
        >
          <X size={15} />
        </button>

        {success ? (
          <div className="text-center py-6">
            <CheckCircle size={40} className="text-[#36bd5f] mx-auto mb-4" />
            <h2 id="wl-modal-title" className="text-[22px] font-extrabold text-[#e8e8e8] mb-2 tracking-tight">
              You&apos;re on the list
            </h2>
            <p className="text-sm text-[#888] mb-6 leading-relaxed">{success}</p>
            <button
              onClick={onClose}
              className="bg-[#131313] border border-white/[0.07] px-6 py-2.5 text-[13px] font-semibold text-[#e8e8e8] cursor-pointer font-[var(--font-raleway),Raleway,Helvetica,Arial,sans-serif]"
            >
              Close
            </button>
          </div>
        ) : (
          <>
            <div className="mb-7">
              <p className="text-[11px] font-semibold text-[#00e5bf] uppercase tracking-[0.08em] mb-2">{cfg.overline}</p>
              <h2 id="wl-modal-title" className="text-[22px] font-extrabold text-[#e8e8e8] mb-1.5 tracking-tight">{cfg.headline}</h2>
              <p className="text-[13px] text-[#888] leading-relaxed">{cfg.sub}</p>
            </div>
            <form onSubmit={submit} noValidate className="flex flex-col gap-3.5">
              <ModalField label="Email address" id="wl-email" name="email" value={form.email} onChange={set('email')} type="email" placeholder="you@company.com" required />
              <ModalField label="Full name (optional)" id="wl-full-name" name="full_name" value={form.full_name} onChange={set('full_name')} placeholder="Jane Smith" />
              <ModalField label="Company (optional)" id="wl-company" name="company_name" value={form.company_name} onChange={set('company_name')} placeholder="Acme GmbH" />
              {/* Honeypot */}
              <input name="website" tabIndex={-1} aria-hidden="true" className="hidden" readOnly value="" />
              {error && (
                <p role="alert" className="text-xs text-[#e54747] bg-[#e54747]/[0.06] border border-[#e54747]/15 px-3.5 py-2.5">
                  {error}
                </p>
              )}
              <div className="flex gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 bg-transparent border border-white/[0.07] py-3 text-[13px] font-semibold text-[#888] cursor-pointer font-[var(--font-raleway),Raleway,Helvetica,Arial,sans-serif]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-[2] bg-[#00e5bf] border-none rounded-full py-3 text-[13px] font-extrabold text-[#040404] cursor-pointer font-[var(--font-raleway),Raleway,Helvetica,Arial,sans-serif] flex items-center justify-center gap-2 shadow-[0_0_24px_rgba(0,229,191,0.15),0_1px_0_rgba(255,255,255,0.12)_inset] disabled:opacity-70 disabled:cursor-default hover:shadow-[0_0_32px_rgba(0,229,191,0.25),0_1px_0_rgba(255,255,255,0.12)_inset] transition-shadow duration-150"
                >
                  <ArrowRight size={14} />
                  {loading ? 'Submitting\u2026' : cfg.cta}
                </button>
              </div>
              <p className="text-[11px] text-[#555] text-center">
                No spam &middot; Unsubscribe anytime &middot; Guidance only, not legal advice
              </p>
            </form>
          </>
        )}
      </motion.div>
    </motion.div>
  )
}

/* REVEAL WRAPPER */

function Reveal({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const { ref, visible } = useReveal()
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(20px)',
        transition: `opacity 0.6s ease ${delay}s, transform 0.6s ease ${delay}s`,
      }}
    >
      {children}
    </div>
  )
}

/* MAIN COMPONENT */

export default function LandingClient() {
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

  useEffect(() => {
    document.body.style.overflow = mobileMenu ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileMenu])

  const openWaitlist = useCallback((v: WaitlistVariant) => setWaitlistModal(v), [])

  return (
    <div className="bg-[#040404] text-[#e8e8e8] font-[var(--font-raleway),Raleway,Helvetica,Arial,sans-serif] min-h-screen">
      {/* Inject CSS keyframes */}
      <style dangerouslySetInnerHTML={{ __html: CSS_KEYFRAMES }} />

      {/* Skip to content */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[300] focus:bg-[#00e5bf] focus:text-[#040404] focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:rounded-full"
      >
        Skip to content
      </a>

      {!prefersReducedMotion && <ScrollProgressBar />}
      {!prefersReducedMotion && <HeroCanvas />}
      {!prefersReducedMotion && <CursorSpotlight />}
      {!prefersReducedMotion && <CustomCursor />}

      <div className="relative z-[2]">
      {/* ── MOBILE NAV OVERLAY ── */}
      <div
        className={`fixed inset-0 bg-[#040404] z-[200] flex-col p-6 overflow-y-auto ${mobileMenu ? 'flex' : 'hidden'}`}
        role="dialog"
        aria-modal={mobileMenu}
        aria-label="Mobile navigation"
      >
        <div className="flex items-center justify-between mb-10">
          <Logo size={28} />
          <button
            onClick={() => setMobileMenu(false)}
            aria-label="Close menu"
            className="bg-transparent border-none cursor-pointer text-[#888] flex p-2 min-h-[44px] min-w-[44px] items-center justify-center"
          >
            <X size={22} />
          </button>
        </div>
        <nav aria-label="Mobile navigation" className="flex flex-col gap-2 flex-1">
          {NAV_ITEMS.map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase().replace(/ /g, '-')}`}
              onClick={() => setMobileMenu(false)}
              className="text-[22px] font-bold text-[#888] no-underline py-3.5 border-b border-white/[0.07] min-h-[44px] hover:text-[#e8e8e8] transition-colors duration-150"
            >
              {item}
            </a>
          ))}
          <button
            onClick={() => { setMobileMenu(false); openWaitlist('waitlist') }}
            className="text-[22px] font-bold text-[#00e5bf] no-underline py-3.5 bg-transparent border-none border-b border-white/[0.07] cursor-pointer font-[var(--font-raleway),Raleway,Helvetica,Arial,sans-serif] text-left min-h-[44px]"
          >
            Build your evidence pack
          </button>
        </nav>
        <div className="flex flex-col gap-2.5 pt-8">
          <Link
            href="/login"
            onClick={() => setMobileMenu(false)}
            className="text-[15px] text-[#888] no-underline font-medium py-3.5 text-center border border-white/[0.07] min-h-[44px] flex items-center justify-center hover:text-[#e8e8e8] transition-colors duration-150"
          >
            Sign in
          </Link>
          <button
            onClick={() => { setMobileMenu(false); openWaitlist('waitlist') }}
            className="bg-[#00e5bf] text-[#040404] text-[15px] font-bold py-3.5 rounded-full border-none cursor-pointer font-[var(--font-raleway),Raleway,Helvetica,Arial,sans-serif] min-h-[44px]"
          >
            Build your evidence pack
          </button>
        </div>
      </div>

      {/* ── NAVIGATION ── */}
      <header
        className={`fixed top-0 left-0 right-0 z-[100] border-b transition-all duration-300 ${
          scrolled
            ? 'border-white/[0.07] bg-[#040404]/94 backdrop-blur-[12px]'
            : 'border-transparent bg-transparent'
        }`}
      >
        <div className="max-w-[1160px] mx-auto px-4 md:px-8 flex items-center justify-between h-16">
          <Logo size={28} />
          <nav aria-label="Main" className="hidden md:flex items-center gap-8">
            {NAV_ITEMS.map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(/ /g, '-')}`}
                className="text-xs text-white/55 no-underline font-medium tracking-wide hover:text-[#e8e8e8] transition-colors duration-150"
              >
                {item}
              </a>
            ))}
          </nav>
          <div className="hidden md:flex items-center gap-4">
            <Link href="/login" className="text-[13px] text-[#888] no-underline font-medium hover:text-[#e8e8e8] transition-colors duration-150">
              Sign in
            </Link>
            <button
              onClick={() => { track({ event: 'landing_cta_clicked', cta_label: 'Build your evidence pack', section: 'nav', page: 'landing' }); openWaitlist('waitlist') }}
              className="bg-[#00e5bf] text-[#040404] text-[13px] font-bold px-5 py-2.5 rounded-full border-none cursor-pointer font-[var(--font-raleway),Raleway,Helvetica,Arial,sans-serif] min-h-[44px] shadow-[0_0_24px_rgba(0,229,191,0.15),0_1px_0_rgba(255,255,255,0.12)_inset] hover:shadow-[0_0_32px_rgba(0,229,191,0.25),0_1px_0_rgba(255,255,255,0.12)_inset] transition-shadow duration-150"
            >
              Build your evidence pack
            </button>
          </div>
          <button
            className="md:hidden bg-transparent border-none cursor-pointer text-[#888] p-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
            onClick={() => setMobileMenu(true)}
            aria-label="Open menu"
            aria-expanded={mobileMenu}
          >
            <Menu size={22} />
          </button>
        </div>
      </header>

      {/* ── HERO ── */}
      <section
        id="main-content"
        className="min-h-screen flex items-center justify-center flex-col text-center relative overflow-hidden px-4 pt-20 pb-10 md:px-8 md:pt-[120px] md:pb-20"
      >
        <HeroBg />

        <div className="relative z-10 max-w-[900px]">
          {/* Urgency badge */}
          <div
            className="inline-flex items-center gap-2.5 border border-[#e54747]/40 rounded-full px-4 py-[7px] mb-12 text-[11px] tracking-[0.08em] font-semibold bg-[#040404]/82 backdrop-blur-[8px]"
            style={prefersReducedMotion ? {} : {
              animation: 'heroEntrance 0.6s ease both',
              animationDelay: '0.1s',
            }}
          >
            <div
              className="w-[5px] h-[5px] rounded-full bg-[#e54747] shrink-0"
              style={prefersReducedMotion ? {} : { animation: 'pulse 1.3s infinite' }}
            />
            <span className="text-white/70 uppercase">EU AI ACT</span>
            <span className="w-px h-2.5 bg-white/12 shrink-0" />
            <span className="text-[#e54747] font-bold uppercase">ENFORCEMENT: AUGUST 2, 2026</span>
          </div>

          {/* Headline: "The deadline doesn't move." */}
          <h1
            className="text-[clamp(36px,5.5vw,80px)] font-black leading-[1.0] tracking-[-0.04em] mb-0"
            style={prefersReducedMotion ? {} : {
              animation: 'heroEntrance 0.7s ease both',
              animationDelay: '0.25s',
            }}
          >
            The deadline doesn&apos;t move.
          </h1>

          {/* Brand signature: vertical teal line between headline and subhead */}
          <div
            className="flex justify-center my-4"
            style={prefersReducedMotion ? {} : {
              animation: 'heroEntrance 0.6s ease both',
              animationDelay: '0.5s',
            }}
          >
            <div className="w-[2px] h-[12px] bg-[#00e5bf]" />
          </div>

          {/* Headline line 2: "Your compliance can." in teal */}
          <p
            className="text-[clamp(36px,5.5vw,80px)] font-black leading-[1.0] tracking-[-0.04em] mb-8 text-[#00e5bf]"
            style={prefersReducedMotion ? {} : {
              animation: 'heroEntrance 0.7s ease both',
              animationDelay: '0.55s',
            }}
          >
            Your compliance can.
          </p>

          {/* Subtext: old headline + bridge pitch */}
          <p
            className="text-lg text-white/60 leading-relaxed max-w-[560px] mx-auto mb-10 tracking-[-0.01em]"
            style={prefersReducedMotion ? {} : {
              animation: 'heroEntrance 0.6s ease both',
              animationDelay: '0.75s',
            }}
          >
            Your AI systems need evidence packs. Build them in hours instead of weeks, at a fraction of consulting cost.
          </p>

          {/* CTAs */}
          <div
            className="flex gap-3 justify-center flex-wrap"
            style={prefersReducedMotion ? {} : {
              animation: 'heroEntrance 0.6s ease both',
              animationDelay: '0.9s',
            }}
          >
            <button
              onClick={() => { track({ event: 'landing_cta_clicked', cta_label: 'Build your evidence pack', section: 'hero', page: 'landing' }); openWaitlist('waitlist') }}
              className="inline-flex items-center gap-2 bg-[#00e5bf] text-[#040404] text-[15px] font-extrabold px-9 py-4 rounded-full border-none cursor-pointer font-[var(--font-raleway),Raleway,Helvetica,Arial,sans-serif] min-h-[48px] shadow-[0_0_24px_rgba(0,229,191,0.15),0_1px_0_rgba(255,255,255,0.12)_inset] hover:shadow-[0_0_48px_rgba(0,229,191,0.25),0_1px_0_rgba(255,255,255,0.12)_inset] transition-shadow duration-150"
            >
              Build your evidence pack <ArrowRight size={16} />
            </button>
            <a
              href="#how-it-works"
              onClick={() => track({ event: 'landing_cta_clicked', cta_label: 'See the process', section: 'hero', page: 'landing' })}
              className="inline-flex items-center gap-2 bg-transparent text-[#888] text-[15px] font-semibold px-8 py-4 rounded-full no-underline border border-white/[0.07] min-h-[48px] hover:border-white/15 transition-[border-color] duration-150"
            >
              See the process
            </a>
          </div>

          {/* Trust line */}
          <p
            className="text-xs text-white/45 mt-6 tracking-wide"
            style={prefersReducedMotion ? {} : {
              animation: 'heroEntrance 0.6s ease both',
              animationDelay: '1.1s',
            }}
          >
            Covers all Annex III high-risk categories &middot; EU &amp; UK jurisdiction &middot; Guidance only, not legal advice
          </p>
        </div>
      </section>

      {/* ── URGENCY BAR ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 bg-[#0c0c0c] border-t border-b border-white/[0.07]">
        <div className="px-8 py-6 text-center">
          <span className="text-[11px] font-semibold text-white/55 uppercase tracking-[0.08em] block mb-1.5">Enforcement countdown</span>
          <span className="text-4xl font-black text-[#00e5bf] tracking-tight leading-none block mb-0.5">
            {daysLeft !== null ? daysLeft : '\u2014'}
          </span>
          <span className="text-[13px] font-semibold text-[#888]">days until enforcement</span>
        </div>
        <div className="px-8 py-6 text-center border-t md:border-t-0 md:border-l md:border-r border-white/[0.07]">
          <span className="text-[11px] font-semibold text-white/55 uppercase tracking-[0.08em] block mb-1.5">Maximum penalty</span>
          <span className="text-4xl font-black text-[#e8e8e8]/70 tracking-tight leading-none block mb-0.5">&pound;35M</span>
          <span className="text-[13px] font-semibold text-[#888]">or 7% global turnover</span>
          <span className="text-[10px] text-[#555] block mt-1">(EU AI Act Art. 99)</span>
        </div>
        <div className="px-8 py-6 text-center border-t md:border-t-0 border-white/[0.07]">
          <span className="text-[11px] font-semibold text-white/55 uppercase tracking-[0.08em] block mb-1.5">Awareness gap</span>
          <span className="text-4xl font-black text-[#e8e8e8]/70 tracking-tight leading-none block mb-0.5">67%</span>
          <span className="text-[13px] font-semibold text-[#888]">of SMEs unaware they qualify</span>
          <span className="text-[10px] text-[#555] block mt-1">(2024 SME survey)</span>
        </div>
      </div>

      <BrandDivider />

      {/* ── PROBLEM ── */}
      <section className="py-16 px-5 md:py-[120px] md:px-8 bg-[#0c0c0c]">
        <div className="max-w-[1160px] mx-auto">
          <Reveal className="mb-16">
            <p className="text-[11px] font-semibold text-white/55 uppercase tracking-[0.08em] mb-5">THE COMPLIANCE GAP</p>
            <h2 className="font-extrabold tracking-tight leading-[1.15] text-[clamp(28px,4vw,48px)] max-w-[560px]">
              Your consultant hasn&apos;t started. August is coming.
            </h2>
          </Reveal>

          {/* 2-column layout: 1 large + 2 stacked */}
          <div className="grid grid-cols-1 md:grid-cols-[1.3fr_1fr] border border-white/[0.07]">
            {/* Large stat card */}
            <Reveal className="p-8 md:p-12 bg-[#0c0c0c] border-b md:border-b-0 md:border-r border-white/[0.07]">
              <p className="text-[clamp(48px,5vw,72px)] font-black tracking-[-0.04em] leading-none mb-1 tabular-nums text-[#e8e8e8]/70">
                {PROBLEM_CARDS[0].stat}
              </p>
              <p className="text-[13px] font-bold text-[#888] mb-4 tracking-[-0.01em]">{PROBLEM_CARDS[0].title}</p>
              <p className="text-[15px] text-[#888] leading-relaxed">{PROBLEM_CARDS[0].desc}</p>
            </Reveal>

            {/* Two stacked smaller cards */}
            <div className="flex flex-col">
              <Reveal delay={0.08} className="p-8 md:p-10 bg-[#0c0c0c] border-b border-white/[0.07] flex-1">
                <p className="text-[clamp(36px,4vw,48px)] font-black tracking-[-0.04em] leading-none mb-1 tabular-nums text-[#e8e8e8]/70">
                  {PROBLEM_CARDS[1].stat}
                </p>
                <p className="text-[13px] font-bold text-[#888] mb-4 tracking-[-0.01em]">{PROBLEM_CARDS[1].title}</p>
                <p className="text-[13px] text-[#888] leading-relaxed">{PROBLEM_CARDS[1].desc}</p>
              </Reveal>
              <Reveal delay={0.16} className="p-8 md:p-10 bg-[#0c0c0c] flex-1">
                <p className="text-[clamp(36px,4vw,48px)] font-black tracking-[-0.04em] leading-none mb-1 tabular-nums text-[#e54747]/60">
                  {PROBLEM_CARDS[2].stat}
                </p>
                <p className="text-[13px] font-bold text-[#888] mb-4 tracking-[-0.01em]">{PROBLEM_CARDS[2].title}</p>
                <p className="text-[13px] text-[#888] leading-relaxed">{PROBLEM_CARDS[2].desc}</p>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      <BrandDivider />

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="py-16 px-5 md:py-[120px] md:px-8">
        <div className="max-w-[1160px] mx-auto">
          <Reveal className="mb-16">
            <p className="text-[11px] font-semibold text-white/55 uppercase tracking-[0.08em] mb-5">HOW IRVO WORKS</p>
            <h2 className="font-extrabold tracking-tight leading-[1.15] text-[clamp(28px,4vw,48px)] max-w-[560px]">
              From workflow to evidence pack in 20 minutes
            </h2>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 border border-white/[0.07]">
            {SOLUTION_STEPS.map((step, i) => (
              <Reveal
                key={step.n}
                delay={i * 0.1}
                className={`p-10 md:p-12 bg-[#0c0c0c] relative overflow-hidden group ${
                  i < SOLUTION_STEPS.length - 1 ? 'border-b md:border-b-0 md:border-r border-white/[0.07]' : ''
                }`}
              >
                {/* Large bg number */}
                <div className="absolute -top-4 -right-2 text-[120px] font-black text-[#e8e8e8] opacity-[0.02] leading-none select-none pointer-events-none tracking-[-0.05em]">
                  {step.n}
                </div>
                <div className="relative z-10">
                  <span className="text-[11px] font-semibold text-white/20 tracking-[0.08em] block mb-2">STEP {step.n}</span>
                  <div className="w-5 h-0.5 bg-[#00e5bf]/40 mb-6" />
                  <h3 className="text-lg font-extrabold text-[#e8e8e8] mb-3 tracking-tight">{step.title}</h3>
                  <p className="text-[15px] text-[#888] leading-relaxed">{step.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>

          {/* Workflow CTA */}
          <Reveal delay={0.2} className="mt-8 flex justify-center">
            <button
              onClick={() => { track({ event: 'landing_cta_clicked', cta_label: 'Start your first system', section: 'workflow', page: 'landing' }); openWaitlist('waitlist') }}
              className="inline-flex items-center gap-2 bg-[#00e5bf] text-[#040404] text-sm font-bold px-7 py-3.5 rounded-full border-none cursor-pointer font-[var(--font-raleway),Raleway,Helvetica,Arial,sans-serif] min-h-[44px] shadow-[0_0_24px_rgba(0,229,191,0.15),0_1px_0_rgba(255,255,255,0.12)_inset] hover:shadow-[0_0_32px_rgba(0,229,191,0.25),0_1px_0_rgba(255,255,255,0.12)_inset] transition-shadow duration-150"
            >
              Start your first system <ArrowRight size={14} />
            </button>
          </Reveal>
        </div>
      </section>

      <BrandDivider />

      {/* ── FEATURES ── */}
      <section id="features" className="py-16 px-5 md:py-[120px] md:px-8 bg-[#0c0c0c]">
        <div className="max-w-[1160px] mx-auto">
          <Reveal className="mb-16">
            <p className="text-[11px] font-semibold text-white/55 uppercase tracking-[0.08em] mb-5">CAPABILITIES</p>
            <h2 className="font-extrabold tracking-tight leading-[1.15] text-[clamp(28px,4vw,48px)] max-w-[560px]">
              Everything the Act requires. Nothing it doesn&apos;t.
            </h2>
          </Reveal>

          {/* 2 primary (double-height) + 4 secondary grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 border border-white/[0.07]">
            {/* Primary features: first 2 span 2 rows each on desktop */}
            {FEATURES.slice(0, 2).map((f, i) => (
              <Reveal
                key={f.title}
                delay={i * 0.07}
                className={`p-8 md:p-10 md:py-14 bg-[#0c0c0c] relative overflow-hidden border-l-2 border-l-transparent hover:border-l-[#00e5bf] transition-[border-color] duration-250 ${
                  i === 0 ? 'md:border-r border-white/[0.07]' : ''
                } border-b border-white/[0.07] md:row-span-2`}
              >
                <div className="flex justify-between items-start mb-6">
                  <f.icon size={20} className="text-white/28" />
                  <span className="text-[9px] font-extrabold text-white/20 tracking-[0.08em] tabular-nums">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                </div>
                <h3 className="text-[17px] font-extrabold text-[#e8e8e8] mb-3 tracking-tight">{f.title}</h3>
                <p className="text-[14px] text-[#888] leading-relaxed">{f.desc}</p>
              </Reveal>
            ))}

            {/* Secondary features: 4 cards in the third column, stacked */}
            {FEATURES.slice(2).map((f, i) => (
              <Reveal
                key={f.title}
                delay={(i + 2) * 0.07}
                className={`p-8 md:p-8 bg-[#0c0c0c] relative overflow-hidden border-l-2 border-l-transparent hover:border-l-[#00e5bf] transition-[border-color] duration-250 ${
                  i < FEATURES.length - 3 ? 'border-b border-white/[0.07]' : ''
                } max-md:border-b max-md:border-white/[0.07]`}
              >
                <div className="flex justify-between items-start mb-4">
                  <f.icon size={15} className="text-white/28" />
                  <span className="text-[9px] font-extrabold text-white/20 tracking-[0.08em] tabular-nums">
                    {String(i + 3).padStart(2, '0')}
                  </span>
                </div>
                <h3 className="text-[15px] font-extrabold text-[#e8e8e8] mb-2 tracking-tight">{f.title}</h3>
                <p className="text-[13px] text-[#888] leading-relaxed">{f.desc}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <BrandDivider />

      {/* ── PRODUCT VISUAL ── */}
      <section className="py-16 px-5 md:py-[120px] md:px-8">
        <div className="max-w-[1160px] mx-auto">
          <Reveal className="mb-16">
            <p className="text-[11px] font-semibold text-white/55 uppercase tracking-[0.08em] mb-5">THE 5-STEP WIZARD</p>
            <h2 className="font-extrabold tracking-tight leading-[1.15] text-[clamp(28px,4vw,48px)] max-w-[560px]">
              Twelve questions. One complete evidence pack.
            </h2>
          </Reveal>

          <Reveal delay={0.1} className="border border-white/[0.07] bg-[#0c0c0c] overflow-hidden">
            {/* Status bar */}
            <div className="px-6 py-3.5 border-b border-white/[0.07] flex items-center gap-2.5 bg-[#00e5bf]/[0.03]">
              <div
                className="w-1.5 h-1.5 rounded-full bg-[#00e5bf] shrink-0"
                style={prefersReducedMotion ? {} : { animation: 'pulse 1.3s infinite' }}
              />
              <span className="text-[11px] font-semibold text-[#00e5bf] tracking-[0.08em] uppercase">Wizard Journey</span>
              <span className="text-[11px] text-[#555]">&middot;</span>
              <span className="text-[11px] text-[#555] font-medium">Average completion: 20 minutes per system</span>
            </div>

            {/* Steps row */}
            <div className="px-6 py-8 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 md:gap-0">
              {WORKFLOW_STEPS.map((step, i) => (
                <div key={step.label} className="flex items-center gap-0 flex-1 min-w-0">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-[10px] font-bold text-[#555] tracking-wide shrink-0">{step.n}</span>
                    <span className={`text-[13px] font-bold tracking-[-0.01em] whitespace-nowrap ${step.color}`}>{step.label}</span>
                  </div>
                  {i < WORKFLOW_STEPS.length - 1 && (
                    <div className="hidden md:block flex-1 h-px min-w-4 mx-4 bg-gradient-to-r from-white/[0.07] to-transparent" />
                  )}
                </div>
              ))}
            </div>

            {/* Mock product UI */}
            <div className="px-6 pb-0 border-t border-white/[0.07]">
              <div className="bg-[#040404] border border-white/[0.07] overflow-hidden mt-6">
                {/* Mock browser bar */}
                <div className="px-4 py-2.5 border-b border-white/[0.07] flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#e54747]/50" />
                  <div className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]/50" />
                  <div className="w-1.5 h-1.5 rounded-full bg-[#36bd5f]/50" />
                  <span className="flex-1 text-center text-[10px] text-[#555] font-medium">irvo.co.uk/systems/new</span>
                </div>
                {/* Mock wizard content */}
                <div className="p-5">
                  <div className="flex items-center gap-2.5 mb-4">
                    <div className="w-5 h-5 rounded-full bg-[#00e5bf] flex items-center justify-center text-[10px] font-bold text-[#040404]">3</div>
                    <span className="text-xs font-bold text-[#e8e8e8]">Classification Result</span>
                    <span className="text-[10px] text-[#555] ml-auto">Step 3 of 5</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div
                      className="p-4 bg-[#0c0c0c] border border-[#e54747]/30"
                      style={prefersReducedMotion ? {} : { animation: 'highRiskPulse 2.5s ease-in-out infinite' }}
                    >
                      <div className="text-[9px] font-semibold text-[#555] uppercase tracking-[0.08em] mb-1.5">Risk Level</div>
                      <div className="text-[22px] font-black text-[#e54747]">High Risk</div>
                      <div className="text-[10px] text-[#888] mt-1">Annex III.4.a — Employment</div>
                    </div>
                    <div className="p-4 bg-[#0c0c0c] border border-white/[0.07]">
                      <div className="text-[9px] font-semibold text-[#555] uppercase tracking-[0.08em] mb-1.5">Obligations</div>
                      <div className="text-[22px] font-black text-[#e8e8e8]/70">5</div>
                      <div className="text-[10px] text-[#888] mt-1">Art. 9, 10, 11, 13, 14</div>
                    </div>
                    <div className="p-4 bg-[#0c0c0c] border border-white/[0.07]">
                      <div className="text-[9px] font-semibold text-[#555] uppercase tracking-[0.08em] mb-1.5">Immediate Actions</div>
                      <div className="text-[22px] font-black text-[#f59e0b]">3</div>
                      <div className="text-[10px] text-[#888] mt-1">Start documenting now</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom bar */}
            <div className="px-6 py-4 border-t border-white/[0.07] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#131313] mt-6">
              <p className="text-xs text-[#888]">
                Output: 8-section PDF &middot; Cover, classification, obligations, evidence, gaps, declaration
              </p>
              <button
                onClick={() => { track({ event: 'landing_cta_clicked', cta_label: 'Start your first system', section: 'workflow', page: 'landing' }); openWaitlist('waitlist') }}
                className="inline-flex items-center gap-2 bg-[#00e5bf] text-[#040404] text-xs font-bold px-5 py-2.5 rounded-full border-none cursor-pointer font-[var(--font-raleway),Raleway,Helvetica,Arial,sans-serif] min-h-[44px] shrink-0 hover:shadow-[0_0_32px_rgba(0,229,191,0.25)] transition-shadow duration-150"
              >
                Start your first system <ArrowRight size={13} />
              </button>
            </div>
          </Reveal>
        </div>
      </section>

      <BrandDivider />

      {/* ── PRICING ── */}
      <section id="pricing" className="py-16 px-5 md:py-[120px] md:px-8 bg-[#0c0c0c]">
        <div className="max-w-[1160px] mx-auto">
          <Reveal className="mb-16 flex flex-col md:flex-row md:items-end md:justify-between gap-5">
            <div>
              <p className="text-[11px] font-semibold text-white/55 uppercase tracking-[0.08em] mb-5">PRICING</p>
              <h2 className="font-extrabold tracking-tight leading-[1.15] text-[clamp(28px,4vw,48px)] mb-4">
                Built for SME budgets. Not enterprise procurement.
              </h2>
              <div className="inline-flex items-center gap-2 bg-[#00e5bf]/[0.08] border border-[#00e5bf]/20 rounded-full px-4 py-[7px]">
                <div
                  className="w-[5px] h-[5px] rounded-full bg-[#00e5bf] shrink-0"
                  style={prefersReducedMotion ? {} : { animation: 'pulse 1.6s infinite' }}
                />
                <span className="text-xs font-bold text-[#00e5bf] tracking-wide">
                  30% lifetime discount for first 20 customers
                </span>
              </div>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 border border-white/[0.07]">
            {PRICING.map((plan, i) => (
              <Reveal
                key={plan.name}
                delay={i * 0.08}
                className={`p-8 md:p-12 relative ${
                  plan.highlight ? 'bg-[#131313]' : 'bg-[#0c0c0c]'
                } ${i < PRICING.length - 1 ? 'border-b md:border-b-0 md:border-r border-white/[0.07]' : ''}`}
              >
                {plan.highlight && (
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-[#00e5bf]" />
                )}
                {plan.highlight && (
                  <div className="absolute top-3.5 right-3.5 text-[9px] font-extrabold text-[#040404] bg-[#00e5bf] px-2.5 py-[3px] rounded-full tracking-[0.08em] uppercase">
                    Recommended
                  </div>
                )}

                <p className={`text-[11px] font-semibold uppercase tracking-[0.08em] mb-2 ${plan.highlight ? 'text-[#00e5bf]' : 'text-[#888]'}`}>
                  {plan.name}
                </p>
                <p className="text-xs text-[#888] mb-6">{plan.desc}</p>

                <p className="text-5xl font-black text-[#e8e8e8] mb-1 tracking-[-0.04em] tabular-nums leading-none">
                  &pound;{plan.price}{plan.plus ? '+' : ''}
                </p>
                <p className="text-xs text-[#888] mb-8">per month</p>

                <ul className="list-none p-0 mb-9 flex flex-col gap-2.5">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-[13px] text-[#888]">
                      <CheckCircle size={13} className="text-[#00e5bf] shrink-0" />{f}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => {
                    track({
                      event: plan.highlight ? 'founding_discount_clicked' : 'landing_cta_clicked',
                      cta_label: plan.highlight ? 'Claim founding rate' : `Choose plan ${plan.name}`,
                      section: 'pricing',
                      page: 'landing',
                    })
                    openWaitlist(plan.highlight ? 'founding' : 'waitlist')
                  }}
                  className={`flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-[13px] font-bold cursor-pointer font-[var(--font-raleway),Raleway,Helvetica,Arial,sans-serif] min-h-[44px] transition-all duration-150 ${
                    plan.highlight
                      ? 'bg-[#00e5bf] text-[#040404] border border-[#00e5bf] shadow-[0_0_24px_rgba(0,229,191,0.15),0_1px_0_rgba(255,255,255,0.12)_inset] hover:shadow-[0_0_40px_rgba(0,229,191,0.25),0_1px_0_rgba(255,255,255,0.12)_inset]'
                      : 'bg-[#131313] text-[#00e5bf] border border-[#00e5bf]/20 hover:border-[#00e5bf]/40 hover:shadow-[0_0_24px_rgba(0,229,191,0.1)]'
                  }`}
                >
                  {plan.highlight ? 'Claim founding rate' : 'Choose plan'}
                  <ArrowRight size={14} className={plan.highlight ? '' : 'opacity-60'} />
                </button>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONCIERGE ── */}
      <section className="py-16 px-5 md:py-20 md:px-8">
        <Reveal className="max-w-[720px] mx-auto text-center bg-[#0c0c0c] border border-white/[0.07] px-8 py-12 md:px-10 md:py-12 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-[#00e5bf]" />
          <p className="text-[11px] font-semibold text-white/55 uppercase tracking-[0.08em] mb-4">ZERO-RISK PILOT</p>
          <h2 className="font-extrabold tracking-tight leading-[1.15] text-[clamp(22px,3vw,32px)] mb-4">
            We&apos;ll document your first system for free
          </h2>
          <p className="text-[15px] text-[#888] leading-relaxed mb-8 max-w-[520px] mx-auto">
            The first 10 customers get one AI workflow documented end-to-end by the founder &mdash; at zero cost.
            You get a complete evidence pack. We get your feedback.
          </p>
          <button
            onClick={() => { track({ event: 'walkthrough_clicked', cta_label: 'Book your free session', section: 'concierge', page: 'landing' }); openWaitlist('walkthrough') }}
            className="inline-flex items-center gap-2.5 bg-[#00e5bf] text-[#040404] text-sm font-extrabold px-8 py-3.5 rounded-full border-none cursor-pointer font-[var(--font-raleway),Raleway,Helvetica,Arial,sans-serif] min-h-[44px] shadow-[0_0_24px_rgba(0,229,191,0.15),0_1px_0_rgba(255,255,255,0.12)_inset] hover:shadow-[0_0_32px_rgba(0,229,191,0.25),0_1px_0_rgba(255,255,255,0.12)_inset] transition-shadow duration-150"
          >
            Book your free session <ArrowRight size={15} />
          </button>
        </Reveal>
      </section>

      <BrandDivider />

      {/* ── FAQ ── */}
      <section id="faq" className="py-16 px-5 md:py-[120px] md:px-8">
        <div className="max-w-[1160px] mx-auto">
          <Reveal className="mb-16">
            <p className="text-[11px] font-semibold text-white/55 uppercase tracking-[0.08em] mb-5">FAQ</p>
            <h2 className="font-extrabold tracking-tight leading-[1.15] text-[clamp(28px,4vw,48px)] max-w-[560px]">
              Every question before the decision.
            </h2>
          </Reveal>

          {/* 2-column FAQ layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 border border-white/[0.07]">
            {FAQS.map((faq, i) => (
              <Reveal
                key={faq.q}
                delay={(i % 2) * 0.07}
                className={`p-8 md:p-9 bg-[#0c0c0c] hover:bg-white/[0.015] transition-colors duration-200 ${
                  i % 2 !== 1 ? 'md:border-r border-white/[0.07]' : ''
                } ${i < FAQS.length - 2 ? 'border-b border-white/[0.07]' : ''} ${
                  i < FAQS.length - 1 ? 'max-md:border-b max-md:border-white/[0.07]' : ''
                }`}
              >
                <h3 className="text-[15px] font-extrabold text-[#e8e8e8] mb-3 tracking-tight leading-snug">{faq.q}</h3>
                <p className="text-[13px] text-[#888] leading-relaxed">{faq.a}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <BrandDivider />

      {/* ── FINAL CTA ── */}
      <section className="py-20 px-5 md:py-40 md:px-8 text-center relative overflow-hidden">
        <FinalCtaBg />
        <div className="max-w-[700px] mx-auto relative z-10">
          <Reveal>
            <h2 className="text-[clamp(36px,6vw,80px)] font-black tracking-[-0.04em] leading-[1.0] mb-0 text-[#e8e8e8]">
              The deadline doesn&apos;t move.
            </h2>

            {/* Brand signature line */}
            <div className="flex justify-center my-4">
              <div className="w-[2px] h-[12px] bg-[#00e5bf]" />
            </div>

            <h2 className="text-[clamp(36px,6vw,80px)] font-black tracking-[-0.04em] leading-[1.0] mb-8 text-[#00e5bf]">
              Your compliance can.
            </h2>

            <p className="text-lg text-[#888] mx-auto mb-10 leading-relaxed max-w-[520px]">
              Start documenting your AI systems today. First 20 customers get 30% off for life.
            </p>

            <div className="inline-flex items-center gap-2 mb-10 bg-[#00e5bf]/[0.06] border border-[#00e5bf]/[0.22] rounded-full px-[18px] py-[7px]">
              <div
                className="w-[5px] h-[5px] rounded-full bg-[#00e5bf] shrink-0"
                style={prefersReducedMotion ? {} : { animation: 'pulse 1.6s infinite' }}
              />
              <span className="text-xs font-bold text-[#00e5bf] tracking-wide">
                3 of 20 founding spots remaining
              </span>
            </div>

            <div className="flex gap-3 justify-center flex-wrap">
              <button
                onClick={() => { track({ event: 'founding_discount_clicked', cta_label: 'Secure founding access', section: 'final-cta', page: 'landing' }); openWaitlist('founding') }}
                className="inline-flex items-center gap-2.5 bg-[#00e5bf] text-[#040404] text-base font-extrabold px-10 py-4 rounded-full border-none cursor-pointer font-[var(--font-raleway),Raleway,Helvetica,Arial,sans-serif] min-h-[48px] shadow-[0_0_24px_rgba(0,229,191,0.15),0_1px_0_rgba(255,255,255,0.12)_inset] hover:shadow-[0_0_48px_rgba(0,229,191,0.25),0_1px_0_rgba(255,255,255,0.12)_inset] transition-shadow duration-150"
              >
                Secure founding access <ArrowRight size={18} />
              </button>
              <button
                onClick={() => { track({ event: 'walkthrough_clicked', cta_label: 'Book a walkthrough', section: 'final-cta', page: 'landing' }); openWaitlist('walkthrough') }}
                className="inline-flex items-center gap-2.5 bg-transparent text-[#888] text-[15px] font-semibold px-8 py-4 rounded-full border border-white/[0.07] cursor-pointer font-[var(--font-raleway),Raleway,Helvetica,Arial,sans-serif] min-h-[48px] hover:border-white/15 transition-[border-color] duration-150"
              >
                Book a walkthrough
              </button>
            </div>

            <p className="text-[11px] text-[#555] mt-6 leading-relaxed">
              Irvo does not provide legal advice &middot; Consult a qualified professional for binding decisions
            </p>
          </Reveal>
        </div>
      </section>

      <BrandDivider />

      {/* ── FOOTER ── */}
      <footer className="py-16 px-5 md:px-8 bg-[#0c0c0c]">
        <div className="max-w-[1160px] mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr] gap-8 md:gap-12 mb-16">
            {/* Brand column */}
            <div>
              <div className="mb-4"><Logo size={24} /></div>
              <p className="text-[13px] text-[#888] leading-relaxed max-w-[240px] mb-5">
                AI compliance documentation, without the consultant bill.
              </p>
              <div className="flex gap-2 flex-wrap">
                {['EU AI Act', 'GDPR Safe', 'Guidance Only'].map((b) => (
                  <span key={b} className="text-[10px] font-semibold text-[#555] border border-white/[0.07] px-2.5 py-[3px] rounded-full tracking-wide">
                    {b}
                  </span>
                ))}
              </div>
            </div>

            {/* Link columns */}
            {FOOTER_LINKS.map(({ title, links }) => (
              <div key={title}>
                <h4 className="text-[#555] font-semibold text-[11px] mb-5 tracking-[0.08em] uppercase">{title}</h4>
                <ul className="list-none p-0 flex flex-col gap-3">
                  {links.map(({ label, href }) => (
                    <li key={label}>
                      <a href={href} className="text-[#888] no-underline text-[13px] hover:text-[#e8e8e8] transition-colors duration-150">
                        {label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Brand close line */}
          <p className="text-[13px] font-semibold text-[#888] text-center mb-6 tracking-[-0.01em]">
            {daysLeft !== null ? daysLeft : '---'} days. The countdown is live.
          </p>

          <div className="border-t border-white/[0.07] pt-6 flex flex-col sm:flex-row justify-between gap-2">
            <p className="text-[#555] text-xs">&copy; {new Date().getFullYear()} Irvo. Irvo does not provide legal advice.</p>
            <p className="text-[#555] text-xs">irvo.co.uk</p>
          </div>
        </div>
      </footer>

      {/* ── WAITLIST MODAL ── */}
      <AnimatePresence>
        {waitlistModal && <WaitlistModal variant={waitlistModal} onClose={() => setWaitlistModal(null)} />}
      </AnimatePresence>
      </div>{/* end content z-wrapper */}
    </div>
  )
}
