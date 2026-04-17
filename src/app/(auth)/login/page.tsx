'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { motion } from 'framer-motion'
import { Check, Shield } from 'lucide-react'

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(12, 'Password must be at least 12 characters'),
})
type FormData = z.infer<typeof schema>

const gridBg: React.CSSProperties = {
  backgroundImage: `
    linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px)
  `,
  backgroundSize: '80px 80px',
}

const benefits = [
  'AI-powered risk classification in seconds',
  '12-question wizard maps your obligations',
  'Evidence drafting with AI assistance',
  'Regulator-ready PDF evidence packs',
]

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const rawRedirect = searchParams.get('redirect') ?? ''
  const redirect = rawRedirect.startsWith('/')
    && !rawRedirect.startsWith('//')
    && !rawRedirect.includes('\\')
    && !rawRedirect.toLowerCase().includes('%2f')
    && !rawRedirect.toLowerCase().includes('%5c')
    ? rawRedirect
    : '/dashboard'
  const [error, setError] = useState<string | null>(null)
  const [focusedField, setFocusedField] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const supabase = createClient()

  const onSubmit = async (data: FormData) => {
    setError(null)
    const { error } = await supabase.auth.signInWithPassword(data)
    if (error) { setError(error.message); return }
    router.push(redirect)
    router.refresh()
  }

  const handleGoogleLogin = async () => {
    setError(null)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback?redirect=${encodeURIComponent(redirect)}`,
      },
    })
    if (error) setError(error.message)
  }

  const inputStyle = (field: string): React.CSSProperties => ({
    width: '100%',
    background: '#0c0c0c',
    border: `1px solid ${focusedField === field ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.1)'}`,
    padding: '12px 14px',
    color: '#e8e8e8',
    fontSize: '14px',
    outline: 'none',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
    transition: 'border-color 0.15s ease',
  })

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '11px',
    color: '#888',
    marginBottom: '6px',
    letterSpacing: '0.04em',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Google OAuth */}
      <motion.button
        type="button"
        onClick={handleGoogleLogin}
        whileHover={{ borderColor: 'rgba(255,255,255,0.2)' }}
        whileTap={{ scale: 0.98 }}
        style={{
          width: '100%',
          background: '#0c0c0c',
          border: '1px solid rgba(255,255,255,0.1)',
          padding: '13px',
          color: '#e8e8e8',
          fontSize: '13px',
          fontWeight: 600,
          cursor: 'pointer',
          fontFamily: 'inherit',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          transition: 'border-color 0.15s',
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A11.96 11.96 0 001 12c0 1.94.46 3.77 1.18 5.07l3.66-2.84z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        Continue with Google
      </motion.button>

      {/* Divider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
        <span style={{ fontSize: 11, color: '#999', fontWeight: 500 }}>or</span>
        <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
      </div>

      {/* Email/password form */}
      <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label htmlFor="email" style={labelStyle}>Email</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            aria-describedby={errors.email ? 'email-error' : undefined}
            style={inputStyle('email')}
            {...register('email')}
            onFocus={() => setFocusedField('email')}
            onBlur={() => setFocusedField(null)}
          />
          {errors.email && (
            <p id="email-error" role="alert" style={{ marginTop: '4px', fontSize: '12px', color: '#e54747' }}>{errors.email.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="password" style={labelStyle}>Password</label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            aria-describedby={errors.password ? 'password-error' : undefined}
            style={inputStyle('password')}
            {...register('password')}
            onFocus={() => setFocusedField('password')}
            onBlur={() => setFocusedField(null)}
          />
          {errors.password && (
            <p id="password-error" role="alert" style={{ marginTop: '4px', fontSize: '12px', color: '#e54747' }}>{errors.password.message}</p>
          )}
        </div>

        {error && (
          <div role="alert" style={{
            color: '#e54747',
            background: 'rgba(229,71,71,0.06)',
            border: '1px solid rgba(229,71,71,0.12)',
            padding: '10px 14px',
            fontSize: '13px',
          }}>
            {error}
          </div>
        )}

        <motion.button
          type="submit"
          disabled={isSubmitting}
          whileHover={{ boxShadow: '0 0 24px rgba(0,229,191,0.15)' }}
          whileTap={{ scale: 0.98 }}
          style={{
            width: '100%',
            background: '#00e5bf',
            color: '#040404',
            padding: '13px',
            fontWeight: 800,
            fontSize: '13px',
            border: 'none',
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit',
            letterSpacing: '0.02em',
            opacity: isSubmitting ? 0.7 : 1,
            transition: 'opacity 0.15s ease',
          }}
        >
          {isSubmitting ? 'Signing in\u2026' : 'Sign in'}
        </motion.button>
      </form>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#040404', fontFamily: 'var(--font-raleway), sans-serif' }}>
      {/* Left panel */}
      <div
        style={{
          width: '55%',
          background: '#040404',
          display: 'flex',
          flexDirection: 'column',
          padding: '40px 56px',
          position: 'relative',
          overflow: 'hidden',
        }}
        className="auth-left-panel"
      >
        <div style={{ ...gridBg, position: 'absolute', inset: 0, pointerEvents: 'none' }} />

        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, userSelect: 'none', textDecoration: 'none' }}>
          <div style={{ width: 2, height: 22, background: '#00e5bf', flexShrink: 0 }} />
          <span style={{ fontSize: 24, fontWeight: 900, letterSpacing: '2px', color: '#e8e8e8', fontFamily: 'var(--font-raleway), Raleway, Helvetica, Arial, sans-serif', lineHeight: 1, whiteSpace: 'nowrap' }}>IRVO</span>
        </Link>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', zIndex: 1 }}>
          <h1 style={{
            fontSize: '44px',
            fontWeight: 800,
            color: '#e8e8e8',
            letterSpacing: '-0.03em',
            lineHeight: 1.1,
            marginBottom: '16px',
          }}>
            Compliance<br />made simple.
          </h1>
          <p style={{ fontSize: '15px', color: '#888', marginBottom: '40px', lineHeight: 1.6, maxWidth: '380px' }}>
            Document your AI systems. Generate evidence packs. Be ready before August 2, 2026.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {benefits.map((benefit) => (
              <div key={benefit} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
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
                  <Check size={10} color="#00e5bf" strokeWidth={2.5} />
                </div>
                <span style={{ fontSize: '14px', color: '#999', lineHeight: 1.5 }}>{benefit}</span>
              </div>
            ))}
          </div>

          <div style={{
            marginTop: '56px',
            padding: '20px 24px',
            background: 'rgba(0,229,191,0.04)',
            border: '1px solid rgba(0,229,191,0.1)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <Shield size={14} color="#00e5bf" />
              <span style={{ fontSize: 11, fontWeight: 700, color: '#00e5bf', letterSpacing: '0.06em', textTransform: 'uppercase' }}>EU AI Act</span>
            </div>
            <p style={{ fontSize: '13px', color: '#888', lineHeight: 1.6, margin: 0 }}>
              20 minutes per system. Not 40 hours. Not &pound;15,000 in consulting fees.
            </p>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <motion.div
        initial={{ x: 30, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="auth-right-panel"
        style={{
          width: '45%',
          background: '#0c0c0c',
          borderLeft: '1px solid rgba(255,255,255,0.07)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px',
        }}
      >
        <div style={{ width: '100%', maxWidth: '360px', margin: 'auto' }}>
          <p style={{ fontSize: '10px', color: '#999', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '20px' }}>
            Sign in
          </p>
          <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#e8e8e8', letterSpacing: '-0.02em', marginBottom: '32px' }}>
            Welcome back.
          </h2>

          <Suspense fallback={<div style={{ height: '200px', background: 'rgba(255,255,255,0.03)' }} />}>
            <LoginForm />
          </Suspense>

          <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <Link href="/reset-password" style={{ fontSize: '13px', color: '#999', textDecoration: 'none' }}>
              Forgot password?
            </Link>
            <Link href="/signup" style={{ fontSize: '13px', color: '#999', textDecoration: 'none' }}>
              No account? Get started &rarr;
            </Link>
          </div>
        </div>
      </motion.div>

      <style>{`
        @media (max-width: 900px) {
          .auth-left-panel { display: none !important; }
        }
      `}</style>
    </div>
  )
}
