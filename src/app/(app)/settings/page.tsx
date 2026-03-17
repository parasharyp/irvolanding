'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import { ReminderTemplate, Organization } from '@/types'

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

const textareaStyle: React.CSSProperties = {
  ...inputStyle,
  resize: 'vertical' as const,
  minHeight: 130,
  lineHeight: 1.6,
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 11,
  color: '#555',
  marginBottom: 6,
  letterSpacing: '0.04em',
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
    { key: 'starter', name: 'Starter', price: '£19', period: '/mo', desc: 'Perfect for freelancers', accent: '#00e5bf' },
    { key: 'studio', name: 'Studio', price: '£69', period: '/mo', desc: 'For small teams', accent: '#47c9e5' },
    { key: 'firm', name: 'Firm', price: '£149', period: '/mo', desc: 'For accountants & agencies', accent: '#937fd5' },
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

      {/* Tab bar */}
      <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.07)', marginBottom: 32 }}>
        {TABS.map(({ key, label }, i) => (
          <button
            key={key}
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
      <AnimatePresence mode="wait">
        {activeTab === 'org' && (
          <motion.div key="org" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.2 }}>
            <div style={{ background: '#0c0c0c', border: '1px solid rgba(255,255,255,0.07)', borderTop: '2px solid #00e5bf', padding: 28 }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: '#444', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 24px' }}>Organisation Details</p>
              <form onSubmit={handleSubmit(saveOrg)} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div>
                  <label style={labelStyle}>Organisation name</label>
                  <input {...register('name')} style={inputStyle} />
                </div>
                <button type="submit" disabled={isSubmitting} style={{ background: '#00e5bf', border: 'none', padding: '10px 24px', fontSize: 13, fontWeight: 800, color: '#040404', cursor: 'pointer', fontFamily: 'inherit', alignSelf: 'flex-start', opacity: isSubmitting ? 0.7 : 1, letterSpacing: '0.02em' }}>
                  {isSubmitting ? 'Saving…' : 'Save changes'}
                </button>
              </form>
            </div>
          </motion.div>
        )}

        {activeTab === 'templates' && (
          <motion.div key="templates" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.2 }} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[1, 2, 3, 4].map((stage, idx) => {
              const tpl = templates.find((t) => t.stage === stage)
              if (!tpl) return null
              const stageDescs = ['3 days before due date', '3 days overdue', '14 days overdue — includes interest', '30 days overdue — final escalation']
              const stageColors = ['#00e5bf', '#e2b742', '#e2a242', '#e54747']
              const color = stageColors[stage - 1]
              return (
                <div
                  key={stage}
                  style={{ background: '#0c0c0c', border: '1px solid rgba(255,255,255,0.07)', borderTop: `2px solid ${color}` }}
                >
                  <div style={{ padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Stage {stage}</span>
                    <span style={{ fontSize: 12, color: '#444' }}>{stageDescs[stage - 1]}</span>
                  </div>
                  <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div>
                      <label style={labelStyle}>Subject</label>
                      <input value={tpl.subject} onChange={(e) => setTemplates((prev) => prev.map((t) => t.id === tpl.id ? { ...t, subject: e.target.value } : t))} style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>Body</label>
                      <textarea rows={6} value={tpl.body} onChange={(e) => setTemplates((prev) => prev.map((t) => t.id === tpl.id ? { ...t, body: e.target.value } : t))} style={textareaStyle} />
                      <p style={{ fontSize: 11, color: '#333', marginTop: 6 }}>
                        {'{{invoice_number}} {{client_name}} {{amount}} {{due_date}} {{days_overdue}} {{interest_amount}} {{compensation_fee}} {{total_due}} {{org_name}}'}
                      </p>
                    </div>
                    <button onClick={() => saveTemplate(tpl)} disabled={saving === tpl.id} style={{ background: color === '#00e5bf' ? '#00e5bf' : 'transparent', border: color === '#00e5bf' ? 'none' : `1px solid ${color}40`, padding: '9px 20px', fontSize: 13, fontWeight: 800, color: color === '#00e5bf' ? '#040404' : color, cursor: 'pointer', fontFamily: 'inherit', alignSelf: 'flex-start', opacity: saving === tpl.id ? 0.7 : 1 }}>
                      {saving === tpl.id ? 'Saving…' : 'Save template'}
                    </button>
                  </div>
                </div>
              )
            })}
          </motion.div>
        )}

        {activeTab === 'billing' && (
          <motion.div key="billing" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.2 }} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ background: '#0c0c0c', border: '1px solid rgba(255,255,255,0.07)', padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: 10, fontWeight: 700, color: '#444', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 6px' }}>Current Plan</p>
                <p style={{ color: '#e8e8e8', fontSize: 15, fontWeight: 700, margin: 0 }}>
                  <span style={{ color: '#00e5bf', textTransform: 'capitalize' }}>{org?.plan ?? 'Starter'}</span>
                </p>
              </div>
              {org?.stripe_customer_id && (
                <button onClick={openBillingPortal} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', padding: '9px 18px', fontSize: 13, fontWeight: 600, color: '#888', cursor: 'pointer', fontFamily: 'inherit', transition: 'border-color 0.15s' }}>
                  Manage Billing & Invoices
                </button>
              )}
            </div>

            <div className="r-grid-3 wall-grid" style={{ gap: 0 }}>
              {PLANS.map(({ key, name, price, period, desc, accent }, i) => {
                const isCurrent = org?.plan === key
                return (
                  <div
                    key={key}
                    style={{ borderRight: '1px solid rgba(255,255,255,0.07)', borderTop: `2px solid ${isCurrent ? accent : 'transparent'}`, padding: 24, background: isCurrent ? 'rgba(255,255,255,0.02)' : 'transparent', position: 'relative', transition: 'background 0.2s' }}
                  >
                    <p style={{ fontSize: 15, fontWeight: 800, color: '#e8e8e8', margin: '0 0 4px' }}>{name}</p>
                    <p style={{ margin: '0 0 4px' }}>
                      <span style={{ fontSize: 22, fontWeight: 800, color: accent }}>{price}</span>
                      <span style={{ fontSize: 12, color: '#444' }}>{period}</span>
                    </p>
                    <p style={{ fontSize: 12, color: '#444', margin: '0 0 20px' }}>{desc}</p>
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
