'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
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
  'Automated reminder pipeline — Stage 1 through 4',
  'UK statutory interest calculated daily to the penny',
  'Legal demand letters sent in minutes',
  'CCJ court pack generated instantly',
]

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') ?? '/dashboard'
  const [error, setError] = useState<string | null>(null)
  const [focusedField, setFocusedField] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setError(null)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword(data)
    if (error) { setError(error.message); return }
    router.push(redirect)
    router.refresh()
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
    color: '#666',
    marginBottom: '6px',
    letterSpacing: '0.04em',
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div>
        <label htmlFor="email" style={labelStyle}>Email</label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          style={inputStyle('email')}
          {...register('email')}
          onFocus={() => setFocusedField('email')}
          onBlur={() => setFocusedField(null)}
        />
        {errors.email && (
          <p style={{ marginTop: '4px', fontSize: '12px', color: '#e54747' }}>{errors.email.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="password" style={labelStyle}>Password</label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          style={inputStyle('password')}
          {...register('password')}
          onFocus={() => setFocusedField('password')}
          onBlur={() => setFocusedField(null)}
        />
        {errors.password && (
          <p style={{ marginTop: '4px', fontSize: '12px', color: '#e54747' }}>{errors.password.message}</p>
        )}
      </div>

      {error && (
        <div style={{
          color: '#e54747',
          background: 'rgba(229,71,71,0.06)',
          border: '1px solid rgba(229,71,71,0.12)',
          padding: '10px 14px',
          fontSize: '13px',
        }}>
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
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
        {isSubmitting ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
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
        {/* Grid background */}
        <div style={{ ...gridBg, position: 'absolute', inset: 0, pointerEvents: 'none' }} />

        {/* Wordmark */}
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, userSelect: 'none', textDecoration: 'none' }}>
          <div style={{ width: 2, height: 22, background: '#00e5bf', flexShrink: 0 }} />
          <span style={{ fontSize: 24, fontWeight: 900, letterSpacing: '2px', color: '#e8e8e8', fontFamily: 'var(--font-raleway), Raleway, Helvetica, Arial, sans-serif', lineHeight: 1, whiteSpace: 'nowrap' }}>IRVO</span>
        </Link>

        {/* Center content */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', zIndex: 1 }}>
          <h1 style={{
            fontSize: '44px',
            fontWeight: 800,
            color: '#e8e8e8',
            letterSpacing: '-0.03em',
            lineHeight: 1.1,
            marginBottom: '16px',
          }}>
            The law is on<br />your side.
          </h1>
          <p style={{ fontSize: '15px', color: '#666', marginBottom: '40px', lineHeight: 1.6, maxWidth: '380px' }}>
            13% statutory interest on every overdue invoice. Enforced automatically.
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

          {/* Quote block */}
          <div style={{
            marginTop: '56px',
            borderLeft: '2px solid rgba(0,229,191,0.3)',
            paddingLeft: '20px',
          }}>
            <p style={{ fontSize: '14px', color: '#777', fontStyle: 'italic', lineHeight: 1.6, marginBottom: '8px' }}>
              &ldquo;Recovered £3,800 in the first month without lifting a finger.&rdquo;
            </p>
            <p style={{ fontSize: '12px', color: '#555' }}>— Sarah K., Freelance Designer</p>
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
          <p style={{ fontSize: '10px', color: '#555', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '20px' }}>
            Sign in
          </p>
          <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#e8e8e8', letterSpacing: '-0.02em', marginBottom: '32px' }}>
            Welcome back.
          </h2>

          <Suspense fallback={<div style={{ height: '200px', background: 'rgba(255,255,255,0.03)' }} />}>
            <LoginForm />
          </Suspense>

          <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <Link href="/reset-password" style={{ fontSize: '13px', color: '#555', textDecoration: 'none' }}>
              Forgot password?
            </Link>
            <Link href="/signup" style={{ fontSize: '13px', color: '#555', textDecoration: 'none' }}>
              No account? Get started →
            </Link>
          </div>
        </div>
      </motion.div>

      <style>{`
        @media (max-width: 900px) {
          .auth-left-panel { display: none !important; }
          .auth-right-panel-login { width: 100% !important; border-left: none !important; }
        }
      `}</style>
    </div>
  )
}
