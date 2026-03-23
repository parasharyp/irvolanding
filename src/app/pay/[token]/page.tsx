'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion'
import { Shield, AlertTriangle, Lock, CheckCircle, Clock, ExternalLink, ChevronRight, BadgeCheck, Landmark, TrendingUp } from 'lucide-react'

const INTEREST_RATE = 0.13 // 8% + 5% BoE base
const PER_SECOND = INTEREST_RATE / 365 / 86400

function fmt(n: number, decimals = 2) {
  return '£' + n.toLocaleString('en-GB', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
}

function formatDuration(ms: number) {
  const totalSecs = Math.floor(ms / 1000)
  const d = Math.floor(totalSecs / 86400)
  const h = Math.floor((totalSecs % 86400) / 3600)
  const m = Math.floor((totalSecs % 3600) / 60)
  const s = totalSecs % 60
  return { d, h, m, s }
}

/* ─── live interest ticker ─────────────────────────────────────── */
function LiveInterest({ principal, dueDateStr }: { principal: number; dueDateStr: string }) {
  const [interest, setInterest] = useState(0)
  const rafRef = useRef<number>(0)
  const dueDate = useRef(new Date(dueDateStr).getTime())

  useEffect(() => {
    function tick() {
      const secondsOverdue = Math.max(0, (Date.now() - dueDate.current) / 1000)
      setInterest(principal * PER_SECOND * secondsOverdue)
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [principal])

  const perDay = principal * INTEREST_RATE / 365

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#e2b742', letterSpacing: '1px', marginBottom: 8, textTransform: 'uppercase' }}>
        Statutory Interest Accrued
      </div>
      <motion.div
        animate={{ scale: [1, 1.005, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        style={{ fontSize: 'clamp(30px, 9vw, 44px)', fontWeight: 800, color: '#e2b742', letterSpacing: '-1px', fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}
      >
        {fmt(interest, 4)}
      </motion.div>
      <div style={{ fontSize: 12, color: '#5e5e5e', marginTop: 8 }}>
        Adding <strong style={{ color: '#e2b742' }}>{fmt(perDay)}</strong> per day · <strong style={{ color: '#e2b742' }}>{fmt(perDay / 24, 4)}</strong> per hour
      </div>
    </div>
  )
}

/* ─── overdue clock ────────────────────────────────────────────── */
function OverdueClock({ dueDateStr }: { dueDateStr: string }) {
  const [dur, setDur] = useState({ d: 0, h: 0, m: 0, s: 0 })
  const dueDate = useRef(new Date(dueDateStr).getTime())

  useEffect(() => {
    const t = setInterval(() => setDur(formatDuration(Date.now() - dueDate.current)), 1000)
    setDur(formatDuration(Math.max(0, Date.now() - dueDate.current)))
    return () => clearInterval(t)
  }, [])

  return (
    <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
      {[
        { val: dur.d, label: 'Days' },
        { val: dur.h, label: 'Hours' },
        { val: dur.m, label: 'Mins' },
        { val: dur.s, label: 'Secs' },
      ].map(({ val, label }) => (
        <div key={label} style={{ textAlign: 'center', minWidth: 58 }}>
          <AnimatePresence mode="popLayout">
            <motion.div
              key={val}
              initial={{ y: -12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 12, opacity: 0 }}
              transition={{ duration: 0.18 }}
              style={{ fontSize: 28, fontWeight: 800, color: '#ffffff', lineHeight: 1, letterSpacing: '-0.5px', background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: '8px 10px', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              {String(val).padStart(2, '0')}
            </motion.div>
          </AnimatePresence>
          <div style={{ fontSize: 10, color: '#4e4e4e', fontWeight: 700, letterSpacing: '0.5px', marginTop: 5, textTransform: 'uppercase' }}>{label}</div>
        </div>
      ))}
    </div>
  )
}

/* ─── paid state ───────────────────────────────────────────────── */
function PaidState({ orgName, invoiceNumber, amount }: { orgName: string; invoiceNumber: string; amount: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
      style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#080808', fontFamily: "'Raleway', sans-serif", padding: 24 }}
    >
      <div style={{ maxWidth: 520, width: '100%', textAlign: 'center' }}>
        <motion.div
          initial={{ scale: 0 }} animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.2 }}
          style={{ width: 90, height: 90, borderRadius: '50%', background: 'rgba(54,189,95,0.12)', border: '2px solid rgba(54,189,95,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 32px' }}
        >
          <CheckCircle size={44} color="#36bd5f" />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <h1 style={{ fontSize: 36, fontWeight: 800, color: '#ffffff', margin: '0 0 12px', letterSpacing: '-0.5px' }}>Payment Complete</h1>
          <p style={{ fontSize: 16, color: '#5e5e5e', margin: '0 0 32px', lineHeight: 1.7 }}>
            {fmt(amount)} has been paid to <strong style={{ color: '#e3e3e3' }}>{orgName}</strong>.<br />
            Invoice <strong style={{ color: '#e3e3e3' }}>{invoiceNumber}</strong> is now settled.
          </p>
          <div style={{ background: 'rgba(54,189,95,0.08)', border: '1px solid rgba(54,189,95,0.2)', borderRadius: 12, padding: '16px 24px', fontSize: 13, color: '#36bd5f', lineHeight: 1.7 }}>
            A confirmation has been sent to your email. Thank you for your prompt payment.
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}

/* ─── main portal ──────────────────────────────────────────────── */
interface PortalData {
  invoice: {
    id: string; invoice_number: string; amount: number; currency: string;
    issue_date: string; due_date: string; status: string; paid_at: string | null
  }
  client: { id: string; name: string; email: string; company: string | null } | null
  org_name: string
}

function Portal() {
  const { token } = useParams<{ token: string }>()
  const searchParams = useSearchParams()
  const justPaid = searchParams.get('paid') === 'true'

  const [data, setData] = useState<PortalData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [paying, setPaying] = useState(false)
  const [totalNow, setTotalNow] = useState(0)

  // Cursor glow
  const cx = useMotionValue(-400); const cy = useMotionValue(-400)
  const sx = useSpring(cx, { stiffness: 80, damping: 20 })
  const sy = useSpring(cy, { stiffness: 80, damping: 20 })
  useEffect(() => {
    const fn = (e: MouseEvent) => { cx.set(e.clientX); cy.set(e.clientY) }
    window.addEventListener('mousemove', fn)
    return () => window.removeEventListener('mousemove', fn)
  }, [])

  useEffect(() => {
    fetch(`/api/pay/${token}`)
      .then((r) => r.json())
      .then((d) => { if (d.error) setError(d.error); else setData(d) })
      .catch(() => setError('Failed to load payment details'))
      .finally(() => setLoading(false))
  }, [token])

  // Live total
  useEffect(() => {
    if (!data) return
    const { amount, due_date } = data.invoice
    const compensation = amount < 1000 ? 40 : amount < 10000 ? 70 : 100
    const dueMs = new Date(due_date).getTime()
    const tick = () => {
      const secs = Math.max(0, (Date.now() - dueMs) / 1000)
      setTotalNow(amount + amount * PER_SECOND * secs + compensation)
    }
    tick()
    const t = setInterval(tick, 500)
    return () => clearInterval(t)
  }, [data])

  const pay = async () => {
    setPaying(true)
    const res = await fetch(`/api/pay/${token}/checkout`, { method: 'POST' }).then((r) => r.json())
    if (res.url) window.location.href = res.url
    else setPaying(false)
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#080808', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}>
          <Shield size={32} color="#00e5bf" />
        </motion.div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', background: '#080808', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Raleway', sans-serif", textAlign: 'center', padding: 24 }}>
        <div>
          <AlertTriangle size={48} color="#e54747" style={{ marginBottom: 16 }} />
          <h2 style={{ color: '#ffffff', fontSize: 22, fontWeight: 800, margin: '0 0 10px' }}>Invalid Payment Link</h2>
          <p style={{ color: '#5e5e5e', fontSize: 14 }}>{error}</p>
        </div>
      </div>
    )
  }

  if (!data) return null

  const { invoice, client, org_name } = data
  const isPaid = invoice.status === 'paid' || justPaid

  if (isPaid) return <PaidState orgName={org_name} invoiceNumber={invoice.invoice_number} amount={invoice.amount} />

  const principal = invoice.amount
  const compensation = principal < 1000 ? 40 : principal < 10000 ? 70 : 100
  const perDay = principal * INTEREST_RATE / 365

  return (
    <div style={{ minHeight: '100vh', background: '#080808', fontFamily: "'Raleway', Helvetica, Arial, sans-serif", color: '#8d8d8d', position: 'relative', overflowX: 'hidden' }}>

      {/* Cursor glow */}
      <motion.div style={{ position: 'fixed', top: 0, left: 0, pointerEvents: 'none', zIndex: 9999, x: sx, y: sy, translateX: '-50%', translateY: '-50%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(226,183,66,0.05) 0%, transparent 70%)' }} />

      {/* Background orbs */}
      <motion.div animate={{ scale: [1, 1.15, 1], opacity: [0.06, 0.1, 0.06] }} transition={{ duration: 10, repeat: Infinity }}
        style={{ position: 'fixed', top: '-20%', left: '-10%', width: 700, height: 700, borderRadius: '50%', background: 'radial-gradient(circle, #e2b742 0%, transparent 70%)', pointerEvents: 'none' }} />
      <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.04, 0.08, 0.04] }} transition={{ duration: 14, repeat: Infinity, delay: 3 }}
        style={{ position: 'fixed', bottom: '-20%', right: '-10%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, #e54747 0%, transparent 70%)', pointerEvents: 'none' }} />

      {/* Grid */}
      <div style={{ position: 'fixed', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)', backgroundSize: '60px 60px', pointerEvents: 'none' }} />

      {/* Top bar */}
      <div style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(8,8,8,0.92)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          {/* | IRVO logo */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, flexShrink: 0 }}>
            <div style={{ width: 2, height: 16, background: '#00e5bf' }} />
            <span style={{ fontWeight: 900, fontSize: 15, color: '#ffffff', letterSpacing: '2px', fontFamily: "'Raleway', sans-serif" }}>IRVO</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(229,71,71,0.08)', border: '1px solid rgba(229,71,71,0.18)', padding: '5px 12px', flexShrink: 0 }}>
            <AlertTriangle size={10} color="#e54747" />
            <span style={{ fontSize: 10, fontWeight: 700, color: '#e54747', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>OFFICIAL PAYMENT NOTICE</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
            <Lock size={11} color="#444" />
            <span style={{ fontSize: 10, color: '#444', fontWeight: 600, whiteSpace: 'nowrap' }}>Stripe Secured</span>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 680, margin: '0 auto', padding: '32px 16px 80px' }}>

        {/* From / invoice badge */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} style={{ textAlign: 'center', marginBottom: 40 }}>
          <p style={{ fontSize: 13, color: '#5e5e5e', margin: '0 0 8px', fontWeight: 600 }}>Payment request from</p>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#ffffff', margin: '0 0 16px', letterSpacing: '-0.5px' }}>{org_name}</h1>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(0,229,191,0.08)', border: '1px solid rgba(0,229,191,0.15)', borderRadius: 100, padding: '6px 16px' }}>
            <span style={{ fontSize: 12, color: '#00e5bf', fontWeight: 700 }}>Invoice {invoice.invoice_number}</span>
            <span style={{ width: 3, height: 3, borderRadius: '50%', background: '#3e3e3e', display: 'inline-block' }} />
            {client && <span style={{ fontSize: 12, color: '#5e5e5e', fontWeight: 600 }}>{client.name}{client.company ? ` · ${client.company}` : ''}</span>}
          </div>
        </motion.div>

        {/* ── AMOUNT DUE HERO ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.1 }}
          style={{ background: 'linear-gradient(160deg, #1a1400 0%, #0e0e0e 60%)', border: '1px solid rgba(226,183,66,0.2)', borderRadius: 20, padding: '40px 32px', marginBottom: 20, position: 'relative', overflow: 'hidden' }}
        >
          {/* Top accent line */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, #e2b742, #e54747, transparent)' }} />

          {/* Total due */}
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#5e5e5e', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 10px' }}>Total Now Due</p>
            <motion.div
              key={Math.floor(totalNow * 100)}
              style={{ fontSize: 'clamp(36px, 12vw, 68px)', fontWeight: 800, color: '#ffffff', letterSpacing: '-2px', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}
            >
              {fmt(totalNow)}
            </motion.div>
            <p style={{ fontSize: 12, color: '#5e5e5e', marginTop: 10 }}>
              Including statutory interest &amp; compensation under the{' '}
              <span style={{ color: '#e2b742', fontWeight: 700 }}>Late Payment of Commercial Debts Act 1998</span>
            </p>
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', margin: '0 0 32px' }} />

          {/* Live interest */}
          <div style={{ marginBottom: 36 }}>
            <LiveInterest principal={principal} dueDateStr={invoice.due_date} />
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', margin: '0 0 28px' }} />

          {/* Overdue clock */}
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#e54747', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 14 }}>
              ⚠ Overdue for
            </p>
            <OverdueClock dueDateStr={invoice.due_date} />
          </div>
        </motion.div>

        {/* ── BREAKDOWN ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
          style={{ background: '#111', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, overflow: 'hidden', marginBottom: 20 }}
        >
          <div style={{ padding: '20px 28px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#4e4e4e', textTransform: 'uppercase', letterSpacing: '0.8px', margin: 0 }}>Invoice Breakdown</p>
          </div>
          {[
            { label: `Original Invoice (${invoice.invoice_number})`, value: fmt(principal), sub: `Due ${new Date(invoice.due_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`, color: '#e3e3e3' },
            { label: 'Statutory Interest (13% p.a.)', value: fmt(Math.max(0, totalNow - principal - compensation), 4), sub: `Bank of England 5% + 8% statutory addition`, color: '#e2b742', live: true },
            { label: 'Late Payment Compensation', value: fmt(compensation), sub: `Fixed fee under the 1998 Act (invoice £${principal < 1000 ? '<1k →£40' : principal < 10000 ? '1k–10k →£70' : '>10k →£100'})`, color: '#e2b742' },
          ].map(({ label, value, sub, color }) => (
            <div key={label} style={{ padding: '16px 28px', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
              <div>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#e3e3e3' }}>{label}</p>
                <p style={{ margin: '3px 0 0', fontSize: 11, color: '#4e4e4e' }}>{sub}</p>
              </div>
              <span style={{ fontSize: 15, fontWeight: 800, color, flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}>{value}</span>
            </div>
          ))}
          {/* Total row */}
          <div style={{ padding: '20px 28px', background: 'rgba(255,255,255,0.02)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 15, fontWeight: 800, color: '#ffffff' }}>Total Due Now</span>
            <span style={{ fontSize: 22, fontWeight: 800, color: '#00e5bf', fontVariantNumeric: 'tabular-nums' }}>{fmt(totalNow)}</span>
          </div>
        </motion.div>

        {/* ── PAY NOW ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}
          style={{ marginBottom: 20 }}
        >
          <motion.button
            onClick={pay}
            disabled={paying}
            whileHover={{ scale: 1.02, boxShadow: '0 0 60px rgba(0,229,191,0.4), 0 20px 60px rgba(0,0,0,0.5)' }}
            whileTap={{ scale: 0.98 }}
            style={{ width: '100%', background: paying ? '#2a2a2a' : 'linear-gradient(135deg, #00e5bf 0%, #00b8a0 100%)', border: 'none', borderRadius: 14, padding: '22px 32px', fontSize: 18, fontWeight: 800, color: '#040404', cursor: paying ? 'default' : 'pointer', fontFamily: 'inherit', letterSpacing: '-0.2px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, transition: 'background 0.3s' }}
          >
            {paying ? (
              <>
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                  <Shield size={20} />
                </motion.div>
                Redirecting to Stripe…
              </>
            ) : (
              <>
                <Lock size={18} />
                Pay {fmt(totalNow)} Now
                <ChevronRight size={18} />
              </>
            )}
          </motion.button>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginTop: 14 }}>
            {[
              { icon: Lock, text: '256-bit SSL' },
              { icon: BadgeCheck, text: 'Stripe Secured' },
              { icon: Shield, text: 'PCI Compliant' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <Icon size={12} color="#3e3e3e" />
                <span style={{ fontSize: 11, color: '#3e3e3e', fontWeight: 600 }}>{text}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── ESCALATION WARNING ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          style={{ background: 'rgba(229,71,71,0.06)', border: '1px solid rgba(229,71,71,0.15)', borderRadius: 12, padding: '18px 24px', marginBottom: 20, display: 'flex', gap: 14, alignItems: 'flex-start' }}
        >
          <AlertTriangle size={18} color="#e54747" style={{ flexShrink: 0, marginTop: 1 }} />
          <div>
            <p style={{ margin: '0 0 4px', fontSize: 13, fontWeight: 700, color: '#e54747' }}>Interest continues to accrue until payment is received</p>
            <p style={{ margin: 0, fontSize: 12, color: '#5e5e5e', lineHeight: 1.7 }}>
              Every day this invoice remains unpaid adds <strong style={{ color: '#e2b742' }}>{fmt(perDay)}</strong> in statutory interest to the total. Non-payment may result in referral to a debt collection agency or small claims court proceedings, at additional cost to you.
            </p>
          </div>
        </motion.div>

        {/* ── LEGAL BASIS ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 12, padding: '24px 28px', marginBottom: 20 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <Landmark size={16} color="#5e5e5e" />
            <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: '#4e4e4e', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Legal Basis</p>
          </div>
          <p style={{ margin: '0 0 12px', fontSize: 13, color: '#5e5e5e', lineHeight: 1.8 }}>
            Under the <strong style={{ color: '#9e9e9e' }}>Late Payment of Commercial Debts (Interest) Act 1998</strong>, the creditor is legally entitled to charge:
          </p>
          <ul style={{ margin: 0, padding: '0 0 0 0', listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              'Statutory interest at 8% above the Bank of England base rate (currently 13% p.a.)',
              `Fixed compensation of £${compensation} per invoice`,
              'Reasonable costs of recovering the debt',
            ].map((item) => (
              <li key={item} style={{ display: 'flex', gap: 10, fontSize: 12, color: '#4e4e4e', lineHeight: 1.7 }}>
                <ChevronRight size={14} color="#3e3e3e" style={{ flexShrink: 0, marginTop: 2 }} />
                {item}
              </li>
            ))}
          </ul>
        </motion.div>

        {/* ── WHAT HAPPENS AFTER ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
          style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 12, padding: '24px 28px', marginBottom: 40 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <TrendingUp size={16} color="#5e5e5e" />
            <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: '#4e4e4e', textTransform: 'uppercase', letterSpacing: '0.8px' }}>What Happens After You Pay</p>
          </div>
          {[
            { step: '01', title: 'Instant confirmation', desc: 'You\'ll receive an email receipt from Stripe and the creditor immediately.' },
            { step: '02', title: 'Invoice marked settled', desc: 'The invoice is automatically marked as paid in Irvo.' },
            { step: '03', title: 'No further action needed', desc: 'All reminder sequences and interest accrual stop immediately.' },
          ].map(({ step, title, desc }) => (
            <div key={step} style={{ display: 'flex', gap: 16, marginBottom: 16, alignItems: 'flex-start' }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(0,229,191,0.1)', border: '1px solid rgba(0,229,191,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: 10, fontWeight: 800, color: '#00e5bf' }}>{step}</span>
              </div>
              <div>
                <p style={{ margin: '0 0 2px', fontSize: 13, fontWeight: 700, color: '#9e9e9e' }}>{title}</p>
                <p style={{ margin: 0, fontSize: 12, color: '#4e4e4e', lineHeight: 1.6 }}>{desc}</p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Footer */}
        <div style={{ textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 10 }}>
            <Shield size={16} color="#47c9e5" />
            <span style={{ fontSize: 13, fontWeight: 700, color: '#3e3e3e' }}>Powered by Irvo</span>
          </div>
          <p style={{ fontSize: 12, color: '#2e2e2e', margin: '0 0 6px' }}>
            This payment portal is managed by Irvo on behalf of {org_name}
          </p>
          <p style={{ fontSize: 11, color: '#2a2a2a', margin: 0 }}>
            Questions? Contact {org_name} directly · {client?.email ?? ''}
          </p>
        </div>
      </div>
    </div>
  )
}

export default function PaymentPortalPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: '#080808', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}>
          <Shield size={32} color="#00e5bf" />
        </motion.div>
      </div>
    }>
      <Portal />
    </Suspense>
  )
}
