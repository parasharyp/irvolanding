'use client'

import { useEffect, useState, type ReactNode } from 'react'
import Link from 'next/link'
import { Lock } from 'lucide-react'
import { hasModuleAccess, MODULE_MIN_PLAN, type ComplianceModule, type OrgPlan } from '@/types'

const FONT = "var(--font-raleway), Raleway, Helvetica, Arial, sans-serif"
const PLAN_LABEL: Record<OrgPlan, string> = { starter: 'Starter', growth: 'Growth', plus: 'Plus' }

interface Props {
  module: ComplianceModule
  children: ReactNode
}

export default function ModuleGate({ module, children }: Props) {
  const [plan, setPlan] = useState<OrgPlan | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/me')
      .then((r) => r.json())
      .then((d) => setPlan((d.plan ?? 'starter') as OrgPlan))
      .catch(() => setPlan('starter'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div style={{ padding: 32, fontFamily: FONT, color: '#666' }}>Checking access…</div>
    )
  }

  if (plan && hasModuleAccess(plan, module)) {
    return <>{children}</>
  }

  const required = MODULE_MIN_PLAN[module]

  return (
    <div style={{ padding: 32, fontFamily: FONT, maxWidth: 640 }}>
      <div style={{
        background: '#0c0c0c',
        border: '1px solid rgba(255,255,255,0.07)',
        padding: 32,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
          <Lock size={18} strokeWidth={2} style={{ color: '#f59e0b' }} />
          <span style={{ fontSize: 11, fontWeight: 800, color: '#f59e0b', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            {PLAN_LABEL[required]} plan required
          </span>
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#e8e8e8', margin: '0 0 10px' }}>
          This module is part of the {PLAN_LABEL[required]} plan
        </h1>
        <p style={{ color: '#888', fontSize: 13, lineHeight: 1.5, margin: '0 0 24px' }}>
          Your current plan is <strong style={{ color: '#e8e8e8' }}>{plan ? PLAN_LABEL[plan] : 'Starter'}</strong>.
          Upgrade to <strong style={{ color: '#00e5bf' }}>{PLAN_LABEL[required]}</strong> to unlock this compliance module and its signable PDF generator.
        </p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Link href="/settings" style={{
            background: '#00e5bf', color: '#040404', textDecoration: 'none',
            padding: '12px 24px', fontSize: 13, fontWeight: 800, borderRadius: 100,
          }}>
            View plans & upgrade
          </Link>
          <Link href="/dashboard" style={{
            background: 'transparent', color: '#888', textDecoration: 'none',
            padding: '12px 24px', fontSize: 13, fontWeight: 600,
            border: '1px solid rgba(255,255,255,0.12)',
          }}>
            Back to dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
