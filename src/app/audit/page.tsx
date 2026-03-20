'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

/* ─── Types ──────────────────────────────────────────────────────── */
interface Step1Data {
  clients: number
  avgValue: number
  latePct: number
  daysLate: number
}

interface Step2Data {
  chasing: string
  interest: string
  impact: string
}

/* ─── Helpers ────────────────────────────────────────────────────── */
function fmtGBP(n: number, decimals = 0): string {
  return '£' + Math.round(n).toLocaleString('en-GB', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

function fmtNum(n: number): string {
  return Math.round(n).toLocaleString('en-GB')
}

/* ─── Animated counter hook ──────────────────────────────────────── */
function useAnimatedCounter(target: number, duration = 1500): number {
  const [value, setValue] = useState(0)
  const rafRef = useRef<number>(0)
  const startRef = useRef<number>(0)
  const startValueRef = useRef<number>(0)

  useEffect(() => {
    startRef.current = performance.now()
    startValueRef.current = 0
    cancelAnimationFrame(rafRef.current)

    const tick = (now: number) => {
      const elapsed = now - startRef.current
      const progress = Math.min(elapsed / duration, 1)
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(startValueRef.current + (target - startValueRef.current) * eased))
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick)
      }
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [target, duration])

  return value
}

/* ─── Slider component ───────────────────────────────────────────── */
interface SliderProps {
  label: string
  value: number
  min: number
  max: number
  step?: number
  format: (v: number) => string
  onChange: (v: number) => void
}

function AuditSlider({ label, value, min, max, step = 1, format, onChange }: SliderProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span style={{ fontSize: '12px', color: '#666', letterSpacing: '0.04em', textTransform: 'uppercase', fontWeight: 600 }}>
          {label}
        </span>
        <span style={{ fontSize: '28px', fontWeight: 800, color: '#e8e8e8', letterSpacing: '-0.03em', lineHeight: 1 }}>
          {format(value)}
        </span>
      </div>
      <input
        type="range"
        className="audit-slider"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(Number(e.target.value))}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '11px', color: '#444' }}>{format(min)}</span>
        <span style={{ fontSize: '11px', color: '#444' }}>{format(max)}</span>
      </div>
    </div>
  )
}

/* ─── Progress bar ───────────────────────────────────────────────── */
function ProgressBar({ step, total }: { step: number; total: number }) {
  return (
    <div style={{ marginBottom: '32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <span style={{ fontSize: '11px', color: '#555', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 700 }}>
          Step {step} of {total}
        </span>
        <span style={{ fontSize: '11px', color: '#00e5bf', fontWeight: 700 }}>
          {Math.round((step / total) * 100)}% complete
        </span>
      </div>
      <div style={{ height: '2px', background: 'rgba(255,255,255,0.07)', width: '100%' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${(step / total) * 100}%` }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          style={{ height: '100%', background: '#00e5bf' }}
        />
      </div>
    </div>
  )
}

/* ─── Option card ────────────────────────────────────────────────── */
interface OptionCardProps {
  label: string
  selected: boolean
  onClick: () => void
}

function OptionCard({ label, selected, onClick }: OptionCardProps) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%',
        padding: '14px 18px',
        background: selected ? 'rgba(0,229,191,0.06)' : '#0c0c0c',
        border: selected ? '1px solid #00e5bf' : '1px solid rgba(255,255,255,0.07)',
        color: selected ? '#e8e8e8' : '#888',
        fontSize: '14px',
        fontWeight: selected ? 700 : 500,
        fontFamily: 'var(--font-raleway), Raleway, Helvetica, Arial, sans-serif',
        cursor: 'pointer',
        textAlign: 'left',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        transition: 'all 0.15s ease',
      }}
    >
      <div style={{
        width: '16px',
        height: '16px',
        borderRadius: '50%',
        border: selected ? '2px solid #00e5bf' : '2px solid rgba(255,255,255,0.15)',
        background: selected ? '#00e5bf' : 'transparent',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {selected && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#040404' }} />}
      </div>
      {label}
    </button>
  )
}

/* ─── Sticky nav ─────────────────────────────────────────────────── */
function Nav() {
  return (
    <div style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      background: 'rgba(4,4,4,0.92)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(255,255,255,0.07)',
    }}>
      <div style={{
        maxWidth: '720px',
        margin: '0 auto',
        padding: '0 24px',
        height: '56px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none', userSelect: 'none' }}>
          <div style={{ width: '2px', height: '18px', background: '#00e5bf', flexShrink: 0 }} />
          <span style={{ fontSize: '16px', fontWeight: 900, letterSpacing: '2px', color: '#e8e8e8', fontFamily: 'var(--font-raleway), Raleway, Helvetica, Arial, sans-serif', lineHeight: 1 }}>IRVO</span>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Link
            href="/login"
            style={{ fontSize: '13px', color: '#666', textDecoration: 'none', padding: '7px 14px', fontWeight: 600 }}
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            style={{
              fontSize: '13px',
              color: '#040404',
              background: '#00e5bf',
              textDecoration: 'none',
              padding: '7px 16px',
              fontWeight: 800,
              letterSpacing: '0.02em',
            }}
          >
            Get started
          </Link>
        </div>
      </div>
    </div>
  )
}

/* ─── Bar chart ──────────────────────────────────────────────────── */
interface BarChartProps {
  interest: number
  compensation: number
  timeCost: number
}

function BarChart({ interest, compensation, timeCost }: BarChartProps) {
  const total = interest + compensation + timeCost
  const bars = [
    { label: 'Statutory interest', value: interest, color: '#00e5bf', pct: total > 0 ? (interest / total) * 100 : 0 },
    { label: 'Compensation fees', value: compensation, color: '#e2b742', pct: total > 0 ? (compensation / total) * 100 : 0 },
    { label: 'Time cost (billable hrs)', value: timeCost, color: '#e54747', pct: total > 0 ? (timeCost / total) * 100 : 0 },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {bars.map((bar) => (
        <div key={bar.label}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontSize: '12px', color: '#888', fontWeight: 600 }}>{bar.label}</span>
            <span style={{ fontSize: '12px', color: bar.color, fontWeight: 700 }}>{fmtGBP(bar.value)}</span>
          </div>
          <div style={{ height: '6px', background: 'rgba(255,255,255,0.06)', width: '100%' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${bar.pct}%` }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
              style={{ height: '100%', background: bar.color, minWidth: bar.pct > 0 ? '2px' : '0' }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

/* ─── Main page ──────────────────────────────────────────────────── */
export default function AuditPage() {
  const [step, setStep] = useState<1 | 2 | 3>(1)

  // Step 1 state
  const [s1, setS1] = useState<Step1Data>({
    clients: 8,
    avgValue: 3500,
    latePct: 35,
    daysLate: 47,
  })

  // Step 2 state
  const [s2, setS2] = useState<Step2Data>({
    chasing: '',
    interest: '',
    impact: '',
  })

  // Computed results
  const annualInvoices = s1.clients * (12 / 2)
  const lateInvoices = annualInvoices * (s1.latePct / 100)
  const interestPerInvoice = s1.avgValue * (0.13 / 365) * s1.daysLate
  const totalInterestYear = lateInvoices * interestPerInvoice
  const compensationPerInvoice = s1.avgValue < 1000 ? 40 : s1.avgValue < 10000 ? 70 : 100
  const totalCompensationYear = lateInvoices * compensationPerInvoice
  const totalLostYear = totalInterestYear + totalCompensationYear
  const timeWasted = lateInvoices * 2.5
  const timeCost = timeWasted * 50

  const animatedTotal = useAnimatedCounter(step === 3 ? Math.round(totalLostYear) : 0, 1500)

  const step2Complete = s2.chasing !== '' && s2.interest !== '' && s2.impact !== ''

  const [copied, setCopied] = useState(false)

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      const url = window.location.href.split('?')[0] + '?result=' + encodeURIComponent(String(Math.round(totalLostYear)))
      navigator.clipboard.writeText(url).then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      })
    }
  }

  const stepVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#040404',
      color: '#e8e8e8',
      fontFamily: 'var(--font-raleway), Raleway, Helvetica, Arial, sans-serif',
    }}>
      <style>{`
        input[type=range].audit-slider {
          -webkit-appearance: none;
          width: 100%;
          height: 4px;
          background: rgba(255,255,255,0.1);
          outline: none;
          border-radius: 2px;
          cursor: pointer;
        }
        input[type=range].audit-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #00e5bf;
          cursor: pointer;
          border: 2px solid #040404;
          box-shadow: 0 0 0 3px rgba(0,229,191,0.2);
        }
        input[type=range].audit-slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #00e5bf;
          cursor: pointer;
          border: 2px solid #040404;
        }
        @media (max-width: 768px) {
          .audit-main { padding: 24px 20px !important; }
          .audit-hero-num { font-size: clamp(48px, 14vw, 72px) !important; }
        }
      `}</style>

      <Nav />

      <div
        className="audit-main"
        style={{ maxWidth: '640px', margin: '0 auto', padding: '48px 24px 80px' }}
      >
        <AnimatePresence mode="wait">

          {/* ── STEP 1 ─────────────────────────────────────────── */}
          {step === 1 && (
            <motion.div
              key="step1"
              variants={stepVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              <ProgressBar step={1} total={3} />

              <div style={{ marginBottom: '32px' }}>
                <div style={{ fontSize: '11px', color: '#00e5bf', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '10px' }}>
                  Free audit — no signup required
                </div>
                <h1 style={{ fontSize: 'clamp(26px, 5vw, 36px)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.15, margin: '0 0 12px', color: '#e8e8e8' }}>
                  Quick audit: tell us about your invoices
                </h1>
                <p style={{ fontSize: '15px', color: '#666', lineHeight: 1.6, margin: 0 }}>
                  Takes 60 seconds. We&apos;ll calculate exactly how much late payment is costing you each year.
                </p>
              </div>

              <div style={{
                background: '#0c0c0c',
                border: '1px solid rgba(255,255,255,0.07)',
                padding: '32px',
                display: 'flex',
                flexDirection: 'column',
                gap: '36px',
                marginBottom: '24px',
              }}>
                <AuditSlider
                  label="Active clients"
                  value={s1.clients}
                  min={1}
                  max={50}
                  format={(v) => `${v} client${v === 1 ? '' : 's'}`}
                  onChange={(v) => setS1((p) => ({ ...p, clients: v }))}
                />
                <AuditSlider
                  label="Average invoice value"
                  value={s1.avgValue}
                  min={100}
                  max={20000}
                  step={100}
                  format={(v) => '£' + v.toLocaleString('en-GB')}
                  onChange={(v) => setS1((p) => ({ ...p, avgValue: v }))}
                />
                <AuditSlider
                  label="% of invoices that are late"
                  value={s1.latePct}
                  min={0}
                  max={100}
                  format={(v) => `${v}%`}
                  onChange={(v) => setS1((p) => ({ ...p, latePct: v }))}
                />
                <AuditSlider
                  label="Average days late"
                  value={s1.daysLate}
                  min={1}
                  max={120}
                  format={(v) => `${v} day${v === 1 ? '' : 's'}`}
                  onChange={(v) => setS1((p) => ({ ...p, daysLate: v }))}
                />
              </div>

              <button
                onClick={() => setStep(2)}
                style={{
                  width: '100%',
                  background: '#00e5bf',
                  color: '#040404',
                  border: 'none',
                  padding: '16px 24px',
                  fontSize: '15px',
                  fontWeight: 800,
                  fontFamily: 'inherit',
                  cursor: 'pointer',
                  letterSpacing: '0.01em',
                  borderRadius: '3px',
                }}
              >
                Calculate my losses →
              </button>

              <p style={{ textAlign: 'center', fontSize: '12px', color: '#444', marginTop: '14px' }}>
                No data stored. 100% anonymous.
              </p>
            </motion.div>
          )}

          {/* ── STEP 2 ─────────────────────────────────────────── */}
          {step === 2 && (
            <motion.div
              key="step2"
              variants={stepVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              <ProgressBar step={2} total={3} />

              <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: 'clamp(24px, 5vw, 32px)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.2, margin: '0 0 10px', color: '#e8e8e8' }}>
                  What&apos;s your situation?
                </h1>
                <p style={{ fontSize: '14px', color: '#666', margin: 0, lineHeight: 1.6 }}>
                  Three quick questions to personalise your report.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', marginBottom: '28px' }}>

                {/* Q1 */}
                <div>
                  <p style={{ fontSize: '14px', fontWeight: 700, color: '#e8e8e8', margin: '0 0 10px' }}>
                    Do you currently chase late invoices?
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {['Manually (emails/calls)', 'Sometimes', 'Rarely or never'].map((opt) => (
                      <OptionCard
                        key={opt}
                        label={opt}
                        selected={s2.chasing === opt}
                        onClick={() => setS2((p) => ({ ...p, chasing: opt }))}
                      />
                    ))}
                  </div>
                </div>

                {/* Q2 */}
                <div>
                  <p style={{ fontSize: '14px', fontWeight: 700, color: '#e8e8e8', margin: '0 0 10px' }}>
                    Have you ever claimed statutory interest?
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {["Yes, regularly", "Once or twice", "Never — didn't know I could"].map((opt) => (
                      <OptionCard
                        key={opt}
                        label={opt}
                        selected={s2.interest === opt}
                        onClick={() => setS2((p) => ({ ...p, interest: opt }))}
                      />
                    ))}
                  </div>
                </div>

                {/* Q3 */}
                <div>
                  <p style={{ fontSize: '14px', fontWeight: 700, color: '#e8e8e8', margin: '0 0 10px' }}>
                    How does late payment affect you?
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {['Significant cashflow stress', 'Minor inconvenience', 'It\'s a real business risk'].map((opt) => (
                      <OptionCard
                        key={opt}
                        label={opt}
                        selected={s2.impact === opt}
                        onClick={() => setS2((p) => ({ ...p, impact: opt }))}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={() => { if (step2Complete) setStep(3) }}
                disabled={!step2Complete}
                style={{
                  width: '100%',
                  background: step2Complete ? '#00e5bf' : 'rgba(255,255,255,0.06)',
                  color: step2Complete ? '#040404' : '#555',
                  border: 'none',
                  padding: '16px 24px',
                  fontSize: '15px',
                  fontWeight: 800,
                  fontFamily: 'inherit',
                  cursor: step2Complete ? 'pointer' : 'not-allowed',
                  letterSpacing: '0.01em',
                  borderRadius: '3px',
                  transition: 'all 0.2s ease',
                }}
              >
                {step2Complete ? 'See my full report →' : 'Answer all 3 questions to continue'}
              </button>

              <button
                onClick={() => setStep(1)}
                style={{
                  width: '100%',
                  background: 'transparent',
                  color: '#555',
                  border: 'none',
                  padding: '12px',
                  fontSize: '13px',
                  fontFamily: 'inherit',
                  cursor: 'pointer',
                  marginTop: '8px',
                }}
              >
                ← Back
              </button>
            </motion.div>
          )}

          {/* ── STEP 3 — RESULTS ──────────────────────────────── */}
          {step === 3 && (
            <motion.div
              key="step3"
              variants={stepVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Hero number */}
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                style={{ textAlign: 'center', marginBottom: '48px', padding: '48px 0 40px' }}
              >
                <p style={{ fontSize: '13px', color: '#666', fontWeight: 600, margin: '0 0 16px', letterSpacing: '0.04em' }}>
                  You&apos;re losing an estimated
                </p>
                <div
                  className="audit-hero-num"
                  style={{
                    fontSize: 'clamp(48px, 10vw, 80px)',
                    fontWeight: 900,
                    color: '#00e5bf',
                    letterSpacing: '-0.04em',
                    lineHeight: 1,
                    fontVariantNumeric: 'tabular-nums',
                    margin: '0 0 16px',
                  }}
                >
                  £{animatedTotal.toLocaleString('en-GB')}
                </div>
                <p style={{ fontSize: '16px', color: '#888', margin: 0, fontWeight: 500 }}>
                  per year to late payments
                </p>
                <div style={{
                  display: 'inline-block',
                  background: 'rgba(229,71,71,0.08)',
                  border: '1px solid rgba(229,71,71,0.15)',
                  padding: '6px 16px',
                  marginTop: '20px',
                  fontSize: '12px',
                  color: '#e54747',
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                }}>
                  ⚠ Based on UK statutory law
                </div>
              </motion.div>

              {/* 4-stat grid */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                style={{ marginBottom: '32px' }}
              >
                <div className="r-grid-4 wall-grid" style={{ marginBottom: '0' }}>
                  {[
                    { value: fmtGBP(totalInterestYear), label: 'In unclaimed statutory interest' },
                    { value: fmtGBP(totalCompensationYear), label: 'In unpaid compensation fees' },
                    { value: `${fmtNum(timeWasted)} hrs`, label: 'Wasted chasing late clients' },
                    { value: fmtNum(lateInvoices), label: 'Invoices left unpaid this year' },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      style={{ padding: '24px 20px' }}
                    >
                      <div style={{ fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 800, color: '#e8e8e8', letterSpacing: '-0.02em', marginBottom: '6px', lineHeight: 1 }}>
                        {stat.value}
                      </div>
                      <div style={{ fontSize: '12px', color: '#555', lineHeight: 1.4 }}>
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Audit findings */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                style={{
                  background: '#0c0c0c',
                  border: '1px solid rgba(255,255,255,0.07)',
                  marginBottom: '24px',
                }}
              >
                <div style={{ padding: '18px 24px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#555', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    Your audit findings
                  </span>
                </div>

                {/* Row 1 — Interest claiming */}
                <div style={{ padding: '18px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '13px', color: '#888', fontWeight: 600 }}>Interest claiming</span>
                  {s2.interest === "Never — didn't know I could" ? (
                    <span style={{ fontSize: '13px', color: '#e2b742', fontWeight: 700, textAlign: 'right', maxWidth: '340px', lineHeight: 1.5 }}>
                      ⚠ You&apos;ve never claimed interest — you&apos;re leaving money on the table
                    </span>
                  ) : (
                    <span style={{ fontSize: '13px', color: '#666', fontWeight: 600, textAlign: 'right', maxWidth: '340px', lineHeight: 1.5 }}>
                      You&apos;ve claimed interest before — but are you getting every penny?
                    </span>
                  )}
                </div>

                {/* Row 2 — Manual chasing */}
                <div style={{ padding: '18px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '13px', color: '#888', fontWeight: 600 }}>Manual chasing cost</span>
                  <span style={{ fontSize: '13px', color: '#e54747', fontWeight: 600, textAlign: 'right', maxWidth: '340px', lineHeight: 1.5 }}>
                    Chasing manually costs ~{Math.round(timeWasted)} hrs/year. At £50+/hr, that&apos;s{' '}
                    <strong style={{ color: '#e54747' }}>{fmtGBP(timeCost)}</strong> in lost billable time.
                  </span>
                </div>

                {/* Row 3 — Late payment risk */}
                <div style={{ padding: '18px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '13px', color: '#888', fontWeight: 600 }}>Late payment risk</span>
                  <span style={{
                    fontSize: '13px',
                    fontWeight: 700,
                    textAlign: 'right',
                    maxWidth: '340px',
                    lineHeight: 1.5,
                    color: s2.impact === 'Significant cashflow stress' ? '#e54747' : s2.impact === 'It\'s a real business risk' ? '#e2b742' : '#00e5bf',
                  }}>
                    {s2.impact === 'Significant cashflow stress'
                      ? '⚠ Critical — cashflow risk is threatening your business viability'
                      : s2.impact === "It's a real business risk"
                      ? '▲ High — late payments are a recognised threat to growth'
                      : '✓ Low — but even minor issues compound over time'}
                  </span>
                </div>
              </motion.div>

              {/* Bar chart */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.35 }}
                style={{
                  background: '#0c0c0c',
                  border: '1px solid rgba(255,255,255,0.07)',
                  padding: '24px',
                  marginBottom: '24px',
                }}
              >
                <p style={{ fontSize: '11px', fontWeight: 700, color: '#555', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 20px' }}>
                  Your annual late payment damage
                </p>
                <BarChart
                  interest={totalInterestYear}
                  compensation={totalCompensationYear}
                  timeCost={timeCost}
                />
                <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '12px', color: '#555', fontWeight: 600 }}>Total annual damage</span>
                  <span style={{ fontSize: '13px', color: '#e8e8e8', fontWeight: 800 }}>{fmtGBP(totalLostYear + timeCost)}</span>
                </div>
              </motion.div>

              {/* CTA box */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                style={{
                  background: '#0c0c0c',
                  border: '1px solid rgba(0,229,191,0.2)',
                  boxShadow: '0 0 40px rgba(0,229,191,0.04)',
                  padding: '36px 32px',
                  marginBottom: '20px',
                }}
              >
                <h2 style={{ fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 800, color: '#e8e8e8', letterSpacing: '-0.02em', margin: '0 0 20px', lineHeight: 1.2 }}>
                  Irvo recovers this for you — automatically.
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '28px' }}>
                  {[
                    'Automated 4-stage reminder pipeline',
                    'Statutory interest calculated daily, to the penny',
                    'Evidence packs for debt collection or court',
                  ].map((item) => (
                    <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                      <div style={{
                        width: '18px',
                        height: '18px',
                        background: 'rgba(0,229,191,0.1)',
                        border: '1px solid rgba(0,229,191,0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        marginTop: '1px',
                      }}>
                        <span style={{ fontSize: '10px', color: '#00e5bf', fontWeight: 900 }}>✓</span>
                      </div>
                      <span style={{ fontSize: '14px', color: '#999', lineHeight: 1.5 }}>{item}</span>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <Link
                    href="/signup"
                    style={{
                      display: 'block',
                      background: '#00e5bf',
                      color: '#040404',
                      textDecoration: 'none',
                      padding: '16px 24px',
                      fontSize: '15px',
                      fontWeight: 900,
                      fontFamily: 'inherit',
                      textAlign: 'center',
                      letterSpacing: '0.01em',
                      borderRadius: '3px',
                      transition: 'opacity 0.15s ease',
                    }}
                  >
                    Start recovering — free trial
                  </Link>
                  <Link
                    href="/#features"
                    style={{
                      display: 'block',
                      background: 'transparent',
                      color: '#888',
                      textDecoration: 'none',
                      padding: '14px 24px',
                      fontSize: '14px',
                      fontWeight: 700,
                      fontFamily: 'inherit',
                      textAlign: 'center',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '3px',
                    }}
                  >
                    See how it works
                  </Link>
                </div>

                <p style={{ textAlign: 'center', fontSize: '12px', color: '#444', margin: '16px 0 0' }}>
                  No credit card. 3 minutes to set up. Cancel anytime.
                </p>
              </motion.div>

              {/* Share card */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                style={{
                  background: '#0c0c0c',
                  border: '1px solid rgba(255,255,255,0.07)',
                  padding: '24px',
                }}
              >
                <p style={{ fontSize: '11px', fontWeight: 700, color: '#555', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 16px' }}>
                  Your audit result
                </p>
                <p style={{ fontSize: '18px', fontWeight: 800, color: '#e8e8e8', margin: '0 0 6px', letterSpacing: '-0.02em' }}>
                  &ldquo;I&apos;m losing {fmtGBP(totalLostYear)}/year to late payments&rdquo;
                </p>
                <p style={{ fontSize: '13px', color: '#555', margin: '0 0 18px' }}>
                  Calculated with Irvo — irvo.co.uk
                </p>
                <button
                  onClick={handleCopyLink}
                  style={{
                    background: copied ? 'rgba(0,229,191,0.1)' : 'rgba(255,255,255,0.04)',
                    border: copied ? '1px solid rgba(0,229,191,0.3)' : '1px solid rgba(255,255,255,0.1)',
                    color: copied ? '#00e5bf' : '#888',
                    padding: '10px 20px',
                    fontSize: '13px',
                    fontWeight: 700,
                    fontFamily: 'inherit',
                    cursor: 'pointer',
                    borderRadius: '3px',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {copied ? '✓ Link copied!' : 'Copy link'}
                </button>
              </motion.div>

              <button
                onClick={() => setStep(2)}
                style={{
                  width: '100%',
                  background: 'transparent',
                  color: '#444',
                  border: 'none',
                  padding: '16px',
                  fontSize: '13px',
                  fontFamily: 'inherit',
                  cursor: 'pointer',
                  marginTop: '12px',
                }}
              >
                ← Adjust answers
              </button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  )
}
