'use client'

import { useState } from 'react'
import { Menu } from 'lucide-react'
import Sidebar from './Sidebar'
import { OrgPlan } from '@/types'

export default function AppNavigationWrapper({
  plan,
  orgName,
  children,
}: {
  plan: OrgPlan
  orgName?: string
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#080808' }}>
      {/* Mobile top bar - only shown on mobile via CSS class */}
      <div
        className="app-mobile-header"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 60,
          background: '#080808',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          height: 52,
          display: 'none',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px',
        }}
      >
        <button
          onClick={() => setOpen(true)}
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: '#888',
            display: 'flex',
            padding: 8,
            touchAction: 'manipulation',
          }}
        >
          <Menu size={20} />
        </button>
        {/* AIED logo */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 2, height: 18, background: '#00e5bf' }} />
          <span
            style={{
              fontSize: 18,
              fontWeight: 900,
              letterSpacing: '2px',
              color: '#ffffff',
              fontFamily: 'var(--font-raleway), Raleway, Helvetica, Arial, sans-serif',
              lineHeight: 1,
            }}
          >
            AIED
          </span>
        </div>
        <div style={{ width: 36 }} />
      </div>

      {/* Backdrop */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            zIndex: 49,
          }}
        />
      )}

      {/* Sidebar */}
      <Sidebar plan={plan} orgName={orgName} mobileOpen={open} onMobileClose={() => setOpen(false)} />

      {/* Main content */}
      <main
        className="app-main"
        style={{ flex: 1, overflowY: 'auto', background: '#080808' }}
      >
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '32px 36px' }}>
          {children}
        </div>
      </main>
    </div>
  )
}
