'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
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
  const menuBtnRef = useRef<HTMLButtonElement>(null)
  const sidebarRef = useRef<HTMLElement>(null)

  const closeSidebar = useCallback(() => {
    setOpen(false)
    // Return focus to the menu button when sidebar closes
    setTimeout(() => menuBtnRef.current?.focus(), 0)
  }, [])

  // Close sidebar on Escape
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeSidebar() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, closeSidebar])

  // Move focus into sidebar when it opens
  useEffect(() => {
    if (open) {
      const el = sidebarRef.current
      if (el) {
        const firstFocusable = el.querySelector<HTMLElement>('a, button')
        firstFocusable?.focus()
      }
    }
  }, [open])

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#080808' }}>
      {/* Skip navigation link */}
      <a
        href="#main-content"
        style={{
          position: 'absolute', left: -9999, top: 'auto', width: 1, height: 1, overflow: 'hidden',
          zIndex: 200, background: '#00e5bf', color: '#040404', padding: '12px 24px',
          fontSize: 14, fontWeight: 700, textDecoration: 'none',
        }}
        onFocus={(e) => { e.currentTarget.style.left = '16px'; e.currentTarget.style.top = '16px'; e.currentTarget.style.width = 'auto'; e.currentTarget.style.height = 'auto' }}
        onBlur={(e) => { e.currentTarget.style.left = '-9999px'; e.currentTarget.style.width = '1px'; e.currentTarget.style.height = '1px' }}
      >
        Skip to main content
      </a>

      {/* Mobile top bar */}
      <div
        className="app-mobile-header"
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 60,
          background: '#080808', borderBottom: '1px solid rgba(255,255,255,0.07)',
          height: 52, display: 'none', alignItems: 'center',
          justifyContent: 'space-between', padding: '0 16px',
        }}
      >
        <button
          ref={menuBtnRef}
          onClick={() => setOpen(true)}
          aria-label="Open navigation menu"
          aria-expanded={open}
          style={{
            background: 'transparent', border: 'none', cursor: 'pointer',
            color: '#888', display: 'flex', padding: 8, touchAction: 'manipulation',
          }}
        >
          <Menu size={20} />
        </button>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 2, height: 18, background: '#00e5bf' }} />
          <span style={{
            fontSize: 18, fontWeight: 900, letterSpacing: '2px', color: '#ffffff',
            fontFamily: 'var(--font-raleway), Raleway, Helvetica, Arial, sans-serif', lineHeight: 1,
          }}>
            IRVO
          </span>
        </div>
        <div style={{ width: 36 }} />
      </div>

      {/* Backdrop */}
      {open && (
        <div
          onClick={closeSidebar}
          role="presentation"
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 49 }}
        />
      )}

      {/* Sidebar */}
      <Sidebar ref={sidebarRef} plan={plan} orgName={orgName} mobileOpen={open} onMobileClose={closeSidebar} />

      {/* Main content */}
      <main
        id="main-content"
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
