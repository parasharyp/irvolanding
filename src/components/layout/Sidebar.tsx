'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, FileText, Users, Settings, LogOut, Shield } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { OrgPlan } from '@/types'
import { slideInRight } from '@/lib/motion'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/invoices', label: 'Invoices', icon: FileText },
  { href: '/clients', label: 'Clients', icon: Users },
  { href: '/settings', label: 'Settings', icon: Settings },
]

const PLAN_STYLES: Record<OrgPlan, { bg: string; color: string }> = {
  starter: { bg: 'rgba(71,201,229,0.12)', color: '#47c9e5' },
  studio:  { bg: 'rgba(48,155,238,0.12)', color: '#309bee' },
  firm:    { bg: 'rgba(147,127,213,0.15)', color: '#937fd5' },
}

interface SidebarProps {
  plan?: OrgPlan
  orgName?: string
}

export default function Sidebar({ plan = 'starter', orgName }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const planStyle = PLAN_STYLES[plan]

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <motion.aside
      initial={{ x: -240, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
      style={{
        width: 240,
        flexShrink: 0,
        height: '100vh',
        background: '#1e1e1e',
        borderRight: '1px solid rgba(255,255,255,0.05)',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: "'Raleway', Helvetica, Arial, sans-serif",
      }}
    >
      {/* Logo */}
      <div style={{ padding: '28px 24px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          style={{ display: 'flex', alignItems: 'center', gap: 10 }}
        >
          <motion.div
            animate={{ rotate: [0, 10, -6, 0] }}
            transition={{ delay: 0.6, duration: 0.6, ease: 'easeInOut' }}
          >
            <Shield size={22} color="#47c9e5" />
          </motion.div>
          <span style={{ fontWeight: 800, fontSize: 17, color: '#ffffff', letterSpacing: '-0.2px' }}>Irvo</span>
        </motion.div>
      </div>

      {/* Org + plan */}
      <AnimatePresence>
        {orgName && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ delay: 0.3, duration: 0.35 }}
            style={{ padding: '14px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}
          >
            <p style={{ fontSize: 12, color: '#5e5e5e', margin: '0 0 6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{orgName}</p>
            <motion.span
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.45, duration: 0.3 }}
              style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 100, background: planStyle.bg, color: planStyle.color, letterSpacing: '0.3px', display: 'inline-block' }}
            >
              {plan.toUpperCase()}
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 12px' }}>
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.06, delayChildren: 0.25 } } }}
        >
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href)
            return (
              <motion.div
                key={href}
                variants={slideInRight}
                style={{ position: 'relative', marginBottom: 2 }}
              >
                {/* Active background pill */}
                {active && (
                  <motion.div
                    layoutId="activeNav"
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'rgba(71,201,229,0.08)',
                      borderRadius: 6,
                      borderLeft: '2px solid #47c9e5',
                    }}
                    transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                  />
                )}
                <Link
                  href={href}
                  style={{
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '11px 14px',
                    borderRadius: 6,
                    textDecoration: 'none',
                    fontSize: 14,
                    fontWeight: active ? 700 : 600,
                    color: active ? '#47c9e5' : '#6e6e6e',
                    transition: 'color 0.2s',
                    zIndex: 1,
                  }}
                >
                  <motion.span
                    animate={{ color: active ? '#47c9e5' : '#6e6e6e' }}
                    transition={{ duration: 0.2 }}
                    style={{ display: 'flex' }}
                  >
                    <Icon size={16} />
                  </motion.span>
                  {label}
                </Link>
              </motion.div>
            )
          })}
        </motion.div>
      </nav>

      {/* Sign out */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.3 }}
        style={{ padding: '12px 12px', borderTop: '1px solid rgba(255,255,255,0.05)' }}
      >
        <motion.button
          onClick={handleSignOut}
          whileHover={{ backgroundColor: 'rgba(229,71,71,0.06)', color: '#e54747' }}
          whileTap={{ scale: 0.97 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            width: '100%',
            padding: '11px 14px',
            borderRadius: 6,
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 600,
            color: '#5e5e5e',
            fontFamily: 'inherit',
            transition: 'color 0.2s',
          }}
        >
          <LogOut size={16} />
          Sign out
        </motion.button>
      </motion.div>
    </motion.aside>
  )
}
