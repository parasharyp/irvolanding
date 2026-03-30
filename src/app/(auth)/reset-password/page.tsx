'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react'

const schema = z.object({ email: z.string().email() })
type FormData = z.infer<typeof schema>

const gridBg: React.CSSProperties = {
  backgroundImage: `
    linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px)
  `,
  backgroundSize: '80px 80px',
}

export default function ResetPasswordPage() {
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [focused, setFocused] = useState(false)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setError(null)
    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${window.location.origin}/api/auth/confirm`,
    })
    if (error) { setError(error.message); return }
    setSent(true)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#040404', fontFamily: 'var(--font-raleway), Raleway, Helvetica, Arial, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
      {/* Grid background */}
      <div style={{ ...gridBg, position: 'absolute', inset: 0, pointerEvents: 'none' }} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        style={{ width: '100%', maxWidth: 400, padding: '0 24px', position: 'relative', zIndex: 1 }}
      >
        {/* Logo */}
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 9, userSelect: 'none', marginBottom: 48, textDecoration: 'none' }}>
          <div style={{ width: 2, height: 20, background: '#00e5bf', flexShrink: 0 }} />
          <span style={{ fontSize: 22, fontWeight: 900, letterSpacing: '2px', color: '#e8e8e8', fontFamily: 'var(--font-raleway), Raleway, Helvetica, Arial, sans-serif', lineHeight: 1 }}>
            IRVO
          </span>
        </Link>

        <AnimatePresence mode="wait">
          {sent ? (
            <motion.div
              key="sent"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              style={{ textAlign: 'center' }}
            >
              <div style={{ width: 56, height: 56, background: 'rgba(0,229,191,0.08)', border: '1px solid rgba(0,229,191,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                <CheckCircle size={26} color="#00e5bf" strokeWidth={1.5} />
              </div>
              <h1 style={{ fontSize: 24, fontWeight: 800, color: '#e8e8e8', margin: '0 0 12px', letterSpacing: '-0.02em' }}>
                Check your inbox
              </h1>
              <p style={{ fontSize: 14, color: '#555', lineHeight: 1.7, margin: '0 0 32px' }}>
                A password reset link has been sent to your email address. It may take a minute to arrive.
              </p>
              <Link
                href="/login"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#555', textDecoration: 'none', fontWeight: 600 }}
              >
                <ArrowLeft size={13} /> Back to sign in
              </Link>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4 }}
            >
              <p style={{ fontSize: 10, color: '#555', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 16 }}>
                Password reset
              </p>
              <h1 style={{ fontSize: 28, fontWeight: 800, color: '#e8e8e8', letterSpacing: '-0.02em', margin: '0 0 10px' }}>
                Forgot your password?
              </h1>
              <p style={{ fontSize: 14, color: '#555', lineHeight: 1.7, margin: '0 0 32px' }}>
                Enter your email and we&apos;ll send you a secure reset link.
              </p>

              <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label htmlFor="email" style={{ display: 'block', fontSize: 11, color: '#555', marginBottom: 6, letterSpacing: '0.04em' }}>
                    Email address
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={13} color="#333" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      {...register('email')}
                      onFocus={() => setFocused(true)}
                      onBlur={() => setFocused(false)}
                      style={{
                        width: '100%',
                        background: '#0c0c0c',
                        border: `1px solid ${focused ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.1)'}`,
                        padding: '12px 14px 12px 36px',
                        color: '#e8e8e8',
                        fontSize: '14px',
                        outline: 'none',
                        fontFamily: 'inherit',
                        boxSizing: 'border-box',
                        transition: 'border-color 0.15s ease',
                      }}
                      placeholder="you@company.com"
                    />
                  </div>
                  {errors.email && (
                    <p style={{ marginTop: 4, fontSize: 12, color: '#e54747' }}>{errors.email.message}</p>
                  )}
                </div>

                {error && (
                  <div style={{ color: '#e54747', background: 'rgba(229,71,71,0.06)', border: '1px solid rgba(229,71,71,0.12)', padding: '10px 14px', fontSize: 13 }}>
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{ width: '100%', background: '#00e5bf', color: '#040404', padding: '13px', fontWeight: 800, fontSize: '13px', border: 'none', cursor: isSubmitting ? 'not-allowed' : 'pointer', fontFamily: 'inherit', letterSpacing: '0.02em', opacity: isSubmitting ? 0.7 : 1, transition: 'opacity 0.15s ease', touchAction: 'manipulation' }}
                >
                  {isSubmitting ? 'Sending…' : 'Send reset link'}
                </button>
              </form>

              <div style={{ marginTop: 24 }}>
                <Link href="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#555', textDecoration: 'none', fontWeight: 500 }}>
                  <ArrowLeft size={13} /> Back to sign in
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
