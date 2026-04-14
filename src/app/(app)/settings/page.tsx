'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import { Organization, OrgPlan, PLAN_SYSTEM_LIMITS } from '@/types'

const orgSchema = z.object({ name: z.string().min(1) })

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: '#080808',
  border: '1px solid rgba(255,255,255,0.1)',
  padding: '11px 13px',
  fontSize: 14,
  color: '#e8e8e8',
  fontFamily: 'var(--font-raleway), Raleway, Helvetica, Arial, sans-serif',
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.15s',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 11,
  color: '#999',
  marginBottom: 6,
  letterSpacing: '0.04em',
}

const PLAN_LABEL: Record<OrgPlan, string> = {
  starter: 'Starter',
  growth: 'Growth',
  plus: 'Plus',
}

const PLAN_ACCENT: Record<OrgPlan, string> = {
  starter: '#00e5bf',
  growth: '#47c9e5',
  plus: '#937fd5',
}

const TABS = [
  { key: 'org', label: 'Organisation' },
  { key: 'billing', label: 'Billing' },
] as const

type Tab = typeof TABS[number]['key']

function SettingsContent() {
  const searchParams = useSearchParams()
  const billingMsg = searchParams.get('billing')
  const initialTab = (searchParams.get('tab') === 'billing' ? 'billing' : 'org') as Tab
  const highlightPlan = searchParams.get('highlight') as OrgPlan | null

  const [org, setOrg] = useState<Organization | null>(null)
  const [orgError, setOrgError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(
    billingMsg === 'success' ? 'Subscription updated successfully!' : null
  )
  const [activeTab, setActiveTab] = useState<Tab>(initialTab)

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<{ name: string }>({ resolver: zodResolver(orgSchema) })

  useEffect(() => {
    fetch('/api/settings/org')
      .then((r) => { if (!r.ok) throw new Error('Failed to load'); return r.json() })
      .then((o) => { setOrg(o); reset({ name: o.name }) })
      .catch(() => setOrgError('Failed to load organisation settings.'))
  }, [])

  const saveOrg = async (data: { name: string }) => {
    const res = await fetch('/api/settings/org', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
    if (res.ok) setMessage('Organisation updated.')
  }

  const openBillingPortal = async () => {
    const res = await fetch('/api/billing/portal').then((r) => r.json())
    if (res.url) { window.location.assign(res.url as string) }
  }

  const checkout = async (plan: string) => {
    const res = await fetch('/api/billing/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ plan }) }).then((r) => r.json())
    if (res.url) { window.location.assign(res.url as string) }
  }

  const currentPlan = org?.plan ?? 'starter'
  const systemLimit = PLAN_SYSTEM_LIMITS[currentPlan]

  const PLANS = [
    { key: 'starter' as OrgPlan, name: 'Starter', price: '\u00a3149', period: '/mo', desc: '1 user \u00B7 3 systems', systems: PLAN_SYSTEM_LIMITS.starter, modules: 'Literacy + Transparency' },
    { key: 'growth' as OrgPlan, name: 'Growth', price: '\u00a3399', period: '/mo', desc: '5 users \u00B7 10 systems', systems: PLAN_SYSTEM_LIMITS.growth, modules: '+ Deployer + Governance' },
    { key: 'plus' as OrgPlan, name: 'Plus', price: '\u00a3799', period: '/mo', desc: 'Unlimited users \u00B7 25+ systems', systems: PLAN_SYSTEM_LIMITS.plus, modules: '+ FRIA + Risk Review + Registration' },
  ]

  return (
    <div style={{ fontFamily: 'var(--font-raleway), Raleway, Helvetica, Arial, sans-serif', maxWidth: 780 }}>
      <h1 style={{ fontSize: 26, fontWeight: 800, color: '#e8e8e8', margin: '0 0 28px', letterSpacing: '-0.03em' }}>Settings</h1>

      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -8, height: 0 }} animate={{ opacity: 1, y: 0, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            style={{ background: 'rgba(54,189,95,0.06)', border: '1px solid rgba(54,189,95,0.15)', padding: '10px 16px', fontSize: 13, color: '#36bd5f', marginBottom: 24, overflow: 'hidden' }}
          >
            {message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error state */}
      {orgError && (
        <div role="alert" style={{ color: '#e54747', background: 'rgba(229,71,71,0.06)', border: '1px solid rgba(229,71,71,0.12)', padding: '12px 16px', fontSize: 13, marginBottom: 24 }}>
          {orgError}
        </div>
      )}

      {/* Tab bar */}
      <div role="tablist" className="settings-tabs" style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.07)', marginBottom: 32 }}>
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            role="tab"
            className="settings-tab"
            aria-selected={activeTab === key}
            onClick={() => setActiveTab(key)}
            style={{
              background: 'none', border: 'none',
              borderBottom: activeTab === key ? '2px solid #00e5bf' : '2px solid transparent',
              padding: '10px 22px', fontSize: 13, fontWeight: 700,
              color: activeTab === key ? '#e8e8e8' : '#444',
              cursor: 'pointer', fontFamily: 'inherit',
              marginBottom: -1, transition: 'color 0.15s, border-color 0.15s',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {!org && !orgError && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ background: '#0c0c0c', border: '1px solid rgba(255,255,255,0.07)', padding: '20px 28px' }}>
            <div className="skeleton-pulse" style={{ height: 10, width: 80, background: '#131313', marginBottom: 10 }} />
            <div className="skeleton-pulse" style={{ height: 16, width: 120, background: '#131313' }} />
          </div>
          <div style={{ background: '#0c0c0c', border: '1px solid rgba(255,255,255,0.07)', padding: 28 }}>
            <div className="skeleton-pulse" style={{ height: 10, width: 140, background: '#131313', marginBottom: 20 }} />
            <div className="skeleton-pulse" style={{ height: 36, width: '100%', background: '#131313', marginBottom: 16 }} />
            <div className="skeleton-pulse" style={{ height: 36, width: 120, background: '#131313' }} />
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">
        {activeTab === 'org' && org && (
          <motion.div key="org" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.2 }}>
            {/* Plan display card */}
            <div style={{
              background: '#0c0c0c',
              border: '1px solid rgba(255,255,255,0.07)',
              borderTop: `2px solid ${PLAN_ACCENT[currentPlan]}`,
              padding: '20px 28px',
              marginBottom: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div>
                <p style={{ fontSize: 10, fontWeight: 700, color: '#444', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 6px' }}>Current Plan</p>
                <p style={{ color: '#e8e8e8', fontSize: 15, fontWeight: 700, margin: 0 }}>
                  <span style={{ color: PLAN_ACCENT[currentPlan] }}>{PLAN_LABEL[currentPlan]}</span>
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: '#444', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 6px' }}>System Limit</p>
                <p style={{ color: '#e8e8e8', fontSize: 15, fontWeight: 700, margin: 0 }}>
                  {systemLimit} systems
                </p>
              </div>
            </div>

            {/* Org name form */}
            <div style={{ background: '#0c0c0c', border: '1px solid rgba(255,255,255,0.07)', borderTop: '2px solid #00e5bf', padding: 28 }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: '#444', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 24px' }}>Organisation Details</p>
              <form onSubmit={handleSubmit(saveOrg)} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div>
                  <label style={labelStyle}>Organisation name</label>
                  <input {...register('name')} style={inputStyle} />
                </div>
                <button type="submit" disabled={isSubmitting} style={{ background: '#00e5bf', border: 'none', padding: '10px 24px', fontSize: 13, fontWeight: 800, color: '#040404', cursor: 'pointer', fontFamily: 'inherit', alignSelf: 'flex-start', opacity: isSubmitting ? 0.7 : 1, letterSpacing: '0.02em' }}>
                  {isSubmitting ? 'Saving...' : 'Save changes'}
                </button>
              </form>
            </div>
          </motion.div>
        )}

        {activeTab === 'billing' && (
          <motion.div key="billing" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.2 }} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ background: '#0c0c0c', border: '1px solid rgba(255,255,255,0.07)', padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: 10, fontWeight: 700, color: '#444', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 6px' }}>Current Plan</p>
                <p style={{ color: '#e8e8e8', fontSize: 15, fontWeight: 700, margin: 0 }}>
                  <span style={{ color: PLAN_ACCENT[currentPlan], textTransform: 'capitalize' }}>{PLAN_LABEL[currentPlan]}</span>
                  <span style={{ fontSize: 12, color: '#444', marginLeft: 8 }}>{systemLimit} systems</span>
                </p>
              </div>
              {org?.stripe_customer_id && (
                <button onClick={openBillingPortal} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', padding: '9px 18px', fontSize: 13, fontWeight: 600, color: '#888', cursor: 'pointer', fontFamily: 'inherit', transition: 'border-color 0.15s' }}>
                  Manage Billing
                </button>
              )}
            </div>

            <div className="r-grid-3 wall-grid" style={{ gap: 0 }}>
              {PLANS.map(({ key, name, price, period, desc, systems, modules }) => {
                const isCurrent = currentPlan === key
                const isHighlight = highlightPlan === key
                const accent = PLAN_ACCENT[key]
                const borderColor = isHighlight ? '#f59e0b' : (isCurrent ? accent : 'transparent')
                return (
                  <div
                    key={key}
                    className="plan-card"
                    style={{ borderRight: '1px solid rgba(255,255,255,0.07)', borderTop: `2px solid ${borderColor}`, padding: 24, background: isCurrent ? 'rgba(255,255,255,0.02)' : (isHighlight ? 'rgba(245,158,11,0.04)' : 'transparent'), position: 'relative' }}
                  >
                    {isHighlight && !isCurrent && (
                      <div style={{ position: 'absolute', top: -10, right: 12, background: '#f59e0b', color: '#040404', fontSize: 9, fontWeight: 800, letterSpacing: '0.08em', padding: '3px 8px', textTransform: 'uppercase' }}>
                        Recommended
                      </div>
                    )}
                    <p style={{ fontSize: 15, fontWeight: 800, color: '#e8e8e8', margin: '0 0 4px' }}>{name}</p>
                    <p style={{ margin: '0 0 4px' }}>
                      <span style={{ fontSize: 22, fontWeight: 800, color: accent }}>{price}</span>
                      <span style={{ fontSize: 12, color: '#444' }}>{period}</span>
                    </p>
                    <p style={{ fontSize: 12, color: '#444', margin: '0 0 4px' }}>{desc}</p>
                    <p style={{ fontSize: 11, color: '#999', margin: '0 0 6px' }}>Up to {systems} AI systems</p>
                    <p style={{ fontSize: 11, color: accent, fontWeight: 700, margin: '0 0 20px', lineHeight: 1.4 }}>{modules}</p>
                    {isCurrent ? (
                      <span style={{ fontSize: 10, fontWeight: 700, color: '#36bd5f', background: 'rgba(54,189,95,0.08)', padding: '3px 10px', border: '1px solid rgba(54,189,95,0.15)', letterSpacing: '0.04em' }}>Current plan</span>
                    ) : (
                      <button onClick={() => checkout(key)} style={{ width: '100%', background: accent, border: 'none', padding: '9px 0', fontSize: 13, fontWeight: 800, color: accent === '#00e5bf' ? '#040404' : '#fff', cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '0.02em' }}>
                        Upgrade
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function SettingsPage() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {[100, 72, 180].map((h, i) => (
          <motion.div key={i} animate={{ opacity: [0.3, 0.5, 0.3] }} transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.15 }}
            style={{ height: h, background: '#0c0c0c', border: '1px solid rgba(255,255,255,0.07)' }} />
        ))}
      </div>
    }>
      <SettingsContent />
    </Suspense>
  )
}
