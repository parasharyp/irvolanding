'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import { ReminderTemplate, Organization } from '@/types'
import { pageVariants, tabContent, btnHover, btnTap, scaleIn } from '@/lib/motion'

const orgSchema = z.object({ name: z.string().min(1) })

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: '#171717',
  border: '1px solid rgba(255,255,255,0.09)',
  borderRadius: 7,
  padding: '10px 13px',
  fontSize: 14,
  color: '#e3e3e3',
  fontFamily: "'Raleway', Helvetica, Arial, sans-serif",
  outline: 'none',
  boxSizing: 'border-box',
}

const textareaStyle: React.CSSProperties = {
  ...inputStyle,
  resize: 'vertical' as const,
  minHeight: 130,
  lineHeight: 1.6,
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 11,
  fontWeight: 700,
  color: '#5e5e5e',
  marginBottom: 6,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
}

const TABS = [
  { key: 'org', label: 'Organisation' },
  { key: 'templates', label: 'Reminder Templates' },
  { key: 'billing', label: 'Billing' },
] as const

type Tab = typeof TABS[number]['key']

function SettingsContent() {
  const searchParams = useSearchParams()
  const billingMsg = searchParams.get('billing')

  const [org, setOrg] = useState<Organization | null>(null)
  const [templates, setTemplates] = useState<ReminderTemplate[]>([])
  const [saving, setSaving] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<Tab>('org')

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<{ name: string }>({ resolver: zodResolver(orgSchema) })

  useEffect(() => {
    Promise.all([
      fetch('/api/settings/org').then((r) => r.json()),
      fetch('/api/settings/templates').then((r) => r.json()),
    ]).then(([o, t]) => {
      setOrg(o); reset({ name: o.name })
      setTemplates(Array.isArray(t) ? t : [])
    })
    if (billingMsg === 'success') setMessage('Subscription updated successfully!')
  }, [])

  const saveOrg = async (data: { name: string }) => {
    const res = await fetch('/api/settings/org', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
    if (res.ok) setMessage('Organisation updated.')
  }

  const saveTemplate = async (template: ReminderTemplate) => {
    setSaving(template.id)
    await fetch(`/api/settings/templates/${template.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject: template.subject, body: template.body }),
    })
    setSaving(null); setMessage('Template saved.')
  }

  const openBillingPortal = async () => {
    const res = await fetch('/api/billing/portal').then((r) => r.json())
    if (res.url) window.location.href = res.url
  }

  const checkout = async (plan: string) => {
    const res = await fetch('/api/billing/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ plan }) }).then((r) => r.json())
    if (res.url) window.location.href = res.url
  }

  const PLANS = [
    { key: 'starter', name: 'Starter', price: '£19', period: '/mo', desc: 'Perfect for freelancers', color: '#47c9e5' },
    { key: 'studio', name: 'Studio', price: '£69', period: '/mo', desc: 'For small teams', color: '#309bee' },
    { key: 'firm', name: 'Firm', price: '£149', period: '/mo', desc: 'For accountants & agencies', color: '#937fd5' },
  ]

  return (
    <motion.div variants={pageVariants} initial="hidden" animate="visible" exit="exit" style={{ fontFamily: "'Raleway', Helvetica, Arial, sans-serif", maxWidth: 780 }}>
      <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#ffffff', margin: '0 0 28px', letterSpacing: '-0.5px' }}>Settings</h1>
      </motion.div>

      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -8, height: 0 }} animate={{ opacity: 1, y: 0, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            style={{ background: 'rgba(54,189,95,0.1)', border: '1px solid rgba(54,189,95,0.2)', borderRadius: 8, padding: '10px 16px', fontSize: 13, color: '#36bd5f', marginBottom: 24, overflow: 'hidden' }}
          >
            {message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid rgba(255,255,255,0.07)', marginBottom: 32, position: 'relative' }}>
        {TABS.map(({ key, label }) => (
          <motion.button
            key={key}
            onClick={() => setActiveTab(key)}
            whileTap={{ scale: 0.97 }}
            style={{
              background: 'none', border: 'none', padding: '11px 22px', fontSize: 13, fontWeight: 700,
              color: activeTab === key ? '#47c9e5' : '#5e5e5e', cursor: 'pointer', fontFamily: 'inherit',
              position: 'relative', marginBottom: -1, transition: 'color 0.2s',
            }}
          >
            {label}
            {activeTab === key && (
              <motion.div
                layoutId="tabUnderline"
                style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, background: '#47c9e5', borderRadius: 2 }}
                transition={{ type: 'spring', stiffness: 500, damping: 40 }}
              />
            )}
          </motion.button>
        ))}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        {activeTab === 'org' && (
          <motion.div key="org" variants={tabContent} initial="hidden" animate="visible" exit="exit">
            <div style={{ background: '#1e1e1e', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: 32 }}>
              <h2 style={{ fontSize: 12, fontWeight: 800, color: '#e3e3e3', margin: '0 0 24px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Organisation Details</h2>
              <form onSubmit={handleSubmit(saveOrg)} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div>
                  <label style={labelStyle}>Organisation name</label>
                  <input {...register('name')} style={inputStyle} />
                </div>
                <motion.button type="submit" whileHover={btnHover} whileTap={btnTap} disabled={isSubmitting} style={{ background: '#47c9e5', border: 'none', borderRadius: 100, padding: '10px 24px', fontSize: 13, fontWeight: 700, color: '#fff', cursor: 'pointer', fontFamily: 'inherit', alignSelf: 'flex-start', opacity: isSubmitting ? 0.7 : 1 }}>
                  {isSubmitting ? 'Saving…' : 'Save changes'}
                </motion.button>
              </form>
            </div>
          </motion.div>
        )}

        {activeTab === 'templates' && (
          <motion.div key="templates" variants={tabContent} initial="hidden" animate="visible" exit="exit" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {[1, 2, 3, 4].map((stage, idx) => {
              const tpl = templates.find((t) => t.stage === stage)
              if (!tpl) return null
              const stageDescs = ['3 days before due date', '3 days overdue', '14 days overdue — includes interest', '30 days overdue — final escalation']
              return (
                <motion.div
                  key={stage}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.07 }}
                  style={{ background: '#1e1e1e', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: 28 }}
                >
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 20 }}>
                    <span style={{ background: 'rgba(71,201,229,0.1)', color: '#47c9e5', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 100, letterSpacing: '0.3px' }}>STAGE {stage}</span>
                    <p style={{ fontSize: 12, color: '#5e5e5e', margin: 0 }}>{stageDescs[stage - 1]}</p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div>
                      <label style={labelStyle}>Subject</label>
                      <input value={tpl.subject} onChange={(e) => setTemplates((prev) => prev.map((t) => t.id === tpl.id ? { ...t, subject: e.target.value } : t))} style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>Body</label>
                      <textarea rows={6} value={tpl.body} onChange={(e) => setTemplates((prev) => prev.map((t) => t.id === tpl.id ? { ...t, body: e.target.value } : t))} style={textareaStyle} />
                      <p style={{ fontSize: 11, color: '#4e4e4e', marginTop: 6 }}>
                        {'{{invoice_number}} {{client_name}} {{amount}} {{due_date}} {{days_overdue}} {{interest_amount}} {{compensation_fee}} {{total_due}} {{org_name}}'}
                      </p>
                    </div>
                    <motion.button whileHover={btnHover} whileTap={btnTap} onClick={() => saveTemplate(tpl)} disabled={saving === tpl.id} style={{ background: '#47c9e5', border: 'none', borderRadius: 100, padding: '9px 20px', fontSize: 13, fontWeight: 700, color: '#fff', cursor: 'pointer', fontFamily: 'inherit', alignSelf: 'flex-start', opacity: saving === tpl.id ? 0.7 : 1 }}>
                      {saving === tpl.id ? 'Saving…' : 'Save template'}
                    </motion.button>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        )}

        {activeTab === 'billing' && (
          <motion.div key="billing" variants={tabContent} initial="hidden" animate="visible" exit="exit" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ background: '#1e1e1e', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: 28 }}>
              <h2 style={{ fontSize: 12, fontWeight: 700, color: '#5e5e5e', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 8px' }}>Current Plan</h2>
              <p style={{ color: '#9e9e9e', fontSize: 14, margin: '0 0 20px' }}>
                Active plan: <strong style={{ color: '#47c9e5', textTransform: 'capitalize' }}>{org?.plan ?? 'Starter'}</strong>
              </p>
              {org?.stripe_customer_id && (
                <motion.button whileHover={{ backgroundColor: 'rgba(255,255,255,0.08)' }} whileTap={btnTap} onClick={openBillingPortal} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 100, padding: '9px 20px', fontSize: 13, fontWeight: 700, color: '#aaaaaa', cursor: 'pointer', fontFamily: 'inherit' }}>
                  Manage Billing & Invoices
                </motion.button>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
              {PLANS.map(({ key, name, price, period, desc, color }, i) => {
                const isCurrent = org?.plan === key
                return (
                  <motion.div
                    key={key}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    whileHover={!isCurrent ? { y: -4, boxShadow: `0 12px 40px rgba(0,0,0,0.4), 0 0 0 1px ${color}33` } : {}}
                    style={{ background: '#1e1e1e', border: isCurrent ? `1px solid ${color}66` : '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: 24, position: 'relative', overflow: 'hidden', transition: 'border-color 0.2s' }}
                  >
                    {isCurrent && (
                      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${color}, transparent)` }} />
                    )}
                    <p style={{ fontSize: 16, fontWeight: 800, color: '#ffffff', margin: '0 0 6px' }}>{name}</p>
                    <p style={{ margin: '0 0 6px' }}>
                      <span style={{ fontSize: 24, fontWeight: 800, color }}>{price}</span>
                      <span style={{ fontSize: 13, color: '#5e5e5e' }}>{period}</span>
                    </p>
                    <p style={{ fontSize: 12, color: '#5e5e5e', margin: '0 0 20px' }}>{desc}</p>
                    {isCurrent ? (
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#36bd5f', background: 'rgba(54,189,95,0.1)', padding: '4px 12px', borderRadius: 100, border: '1px solid rgba(54,189,95,0.15)' }}>Current plan</span>
                    ) : (
                      <motion.button whileHover={{ boxShadow: `0 0 20px ${color}50` }} whileTap={btnTap} onClick={() => checkout(key)} style={{ width: '100%', background: color, border: 'none', borderRadius: 100, padding: '9px 0', fontSize: 13, fontWeight: 700, color: '#fff', cursor: 'pointer', fontFamily: 'inherit' }}>
                        Upgrade
                      </motion.button>
                    )}
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function SettingsPage() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {[120, 80, 200].map((h, i) => (
          <motion.div key={i} animate={{ opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.15 }}
            style={{ height: h, background: '#1e1e1e', borderRadius: 10 }} />
        ))}
      </div>
    }>
      <SettingsContent />
    </Suspense>
  )
}
