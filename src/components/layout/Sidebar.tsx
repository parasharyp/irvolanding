'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Settings, LogOut, X, Shield } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { OrgPlan } from '@/types'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/systems', label: 'AI Systems', icon: Shield },
  { href: '/settings', label: 'Settings', icon: Settings },
]

const PLAN_LABEL: Record<OrgPlan, string> = {
  starter: 'Starter',
  growth: 'Growth',
  plus: 'Plus',
}

interface SidebarProps {
  plan?: OrgPlan
  orgName?: string
  mobileOpen?: boolean
  onMobileClose?: () => void
}

export default function Sidebar({
  plan = 'starter',
  orgName,
  mobileOpen = false,
  onMobileClose,
}: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside
      className={`sidebar-root${mobileOpen ? ' sidebar-open' : ''}`}
      style={{
        width: 220,
        flexShrink: 0,
        height: '100vh',
        background: '#080808',
        borderRight: '1px solid rgba(255,255,255,0.07)',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: "'Raleway', Helvetica, Arial, sans-serif",
        overflowY: 'auto',
      }}
    >
      {/* Mobile close button */}
      <button
        className="sidebar-close-btn"
        onClick={onMobileClose}
        style={{
          display: 'none',
          alignItems: 'center',
          justifyContent: 'flex-end',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          color: '#555',
          padding: '14px 16px 0',
          touchAction: 'manipulation',
        }}
      >
        <X size={18} />
      </button>

      {/* Logo */}
      <div style={{ padding: '24px 22px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 9, userSelect: 'none', marginBottom: 6 }}>
            <div style={{ width: 2, height: 20, background: '#00e5bf', flexShrink: 0 }} />
            <span style={{
              fontSize: 22,
              fontWeight: 900,
              letterSpacing: '2px',
              color: '#ffffff',
              fontFamily: 'var(--font-raleway), Raleway, Helvetica, Arial, sans-serif',
              lineHeight: 1,
              whiteSpace: 'nowrap',
            }}>
              IRVO
            </span>
          </div>
        </motion.div>
        <p style={{ margin: '2px 0 0', fontSize: 9, color: '#2e2e2e', letterSpacing: '0.08em', fontWeight: 700, textTransform: 'uppercase' }}>AI Compliance</p>
      </div>

      {/* Org + plan */}
      <AnimatePresence>
        {orgName && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.35 }}
            style={{ padding: '14px 22px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
          >
            <p style={{ fontSize: 11, color: '#555', margin: '0 0 6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 600 }}>{orgName}</p>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, border: '1px solid rgba(255,255,255,0.1)', borderRadius: 3, padding: '2px 8px' }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#00e5bf' }} />
              <span style={{ fontSize: 10, fontWeight: 700, color: '#888', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                {PLAN_LABEL[plan]}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '16px 10px' }}>
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.05, delayChildren: 0.3 } } }}
        >
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
            return (
              <motion.div
                key={href}
                variants={{ hidden: { opacity: 0, x: -8 }, visible: { opacity: 1, x: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } } }}
                style={{ position: 'relative', marginBottom: 1 }}
              >
                {active && (
                  <motion.div
                    layoutId="activeNav"
                    style={{
                      position: 'absolute',
                      inset: 0,
                      borderRadius: 4,
                      background: 'rgba(255,255,255,0.04)',
                      borderLeft: '2px solid #00e5bf',
                    }}
                    transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                  />
                )}
                <Link
                  href={href}
                  onClick={onMobileClose}
                  style={{
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '10px 14px',
                    borderRadius: 4,
                    textDecoration: 'none',
                    fontSize: 13,
                    fontWeight: active ? 700 : 500,
                    color: active ? '#ffffff' : '#404040',
                    zIndex: 1,
                    transition: 'color 0.15s',
                    minHeight: 44,
                  }}
                >
                  <Icon size={14} strokeWidth={active ? 2.5 : 1.5} />
                  {label}
                </Link>
              </motion.div>
            )
          })}
        </motion.div>
      </nav>

      {/* Status indicator */}
      <div style={{ padding: '10px 22px', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <motion.div
            animate={{ opacity: [1, 0.4, 1] }}
            transition={{ duration: 2.2, repeat: Infinity }}
            style={{ width: 5, height: 5, borderRadius: '50%', background: '#00e5bf' }}
          />
          <span style={{ fontSize: 10, color: '#2e2e2e', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Systems online</span>
        </div>
      </div>

      {/* Sign out */}
      <div style={{ padding: '10px 10px' }}>
        <motion.button
          onClick={handleSignOut}
          whileHover={{ color: '#ffffff', backgroundColor: 'rgba(255,255,255,0.04)' }}
          whileTap={{ scale: 0.97 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            width: '100%',
            padding: '10px 14px',
            borderRadius: 4,
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            fontSize: 13,
            fontWeight: 500,
            color: '#2e2e2e',
            fontFamily: 'var(--font-raleway), Raleway, Helvetica, Arial, sans-serif',
            transition: 'color 0.15s',
            minHeight: 44,
          }}
        >
          <LogOut size={14} strokeWidth={1.5} />
          Sign out
        </motion.button>
      </div>
    </aside>
  )
}
