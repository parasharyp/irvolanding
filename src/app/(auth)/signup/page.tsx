'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { motion, AnimatePresence } from 'framer-motion'

const schema = z.object({
  name: z.string().min(2),
  org_name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})
type FormData = z.infer<typeof schema>

const gridBg: React.CSSProperties = {
  backgroundImage: `
    linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px)
  `,
  backgroundSize: '80px 80px',
}

const steps = [
  { num: '01', title: 'Describe your AI system' },
  { num: '02', title: 'Answer 12 risk questions' },
  { num: '03', title: 'Export your evidence pack' },
]

export default function SignupPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [focusedField, setFocusedField] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setError(null)
    const supabase = createClient()

    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: { data: { name: data.name, org_name: data.org_name } },
    })

    if (signUpError) { setError(signUpError.message); return }
    if (!authData.user) { setError('Signup failed. Please try again.'); return }

    // Create org + user record via service-role API
    const res = await fetch('/api/auth/setup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: authData.user.id, email: data.email, name: data.name, org_name: data.org_name }),
    })

    if (!res.ok) {
      const err = await res.json()
      setError(err.error ?? 'Setup failed')
      return
    }

    setSuccess(true)
    setTimeout(() => router.push('/dashboard'), 2000)
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

  const rightPanelContent = success ? (
    <motion.div
      key="success"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{ textAlign: 'center', width: '100%', maxWidth: '360px', margin: 'auto' }}
    >
      <p style={{ fontSize: '32px', fontWeight: 800, color: '#e8e8e8', letterSpacing: '-0.02em', marginBottom: '12px' }}>
        Account created.
      </p>
      <p style={{ fontSize: '14px', color: '#555' }}>Taking you to your dashboard…</p>
      <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'center' }}>
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [1, 0.6, 1] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
          style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#00e5bf' }}
        />
      </div>
    </motion.div>
  ) : (
    <motion.div
      key="form"
      initial={{ x: 30, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      style={{ width: '100%', maxWidth: '360px', margin: 'auto' }}
    >
      <p style={{ fontSize: '10px', color: '#555', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '20px' }}>
        Create account
      </p>
      <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#e8e8e8', letterSpacing: '-0.02em', marginBottom: '32px' }}>
        Start documenting.
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label htmlFor="name" style={labelStyle}>Your name</label>
          <input
            id="name"
            style={inputStyle('name')}
            {...register('name')}
            onFocus={() => setFocusedField('name')}
            onBlur={() => setFocusedField(null)}
          />
          {errors.name && (
            <p style={{ marginTop: '4px', fontSize: '12px', color: '#e54747' }}>{errors.name.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="org_name" style={labelStyle}>Organisation name</label>
          <input
            id="org_name"
            placeholder="Acme Design Studio"
            style={inputStyle('org_name')}
            {...register('org_name')}
            onFocus={() => setFocusedField('org_name')}
            onBlur={() => setFocusedField(null)}
          />
          {errors.org_name && (
            <p style={{ marginTop: '4px', fontSize: '12px', color: '#e54747' }}>{errors.org_name.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="email" style={labelStyle}>Email</label>
          <input
            id="email"
            type="email"
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
          {isSubmitting ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <div style={{ marginTop: '24px' }}>
        <Link href="/login" style={{ fontSize: '13px', color: '#555', textDecoration: 'none' }}>
          Already have an account? Sign in
        </Link>
      </div>
    </motion.div>
  )

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#040404', fontFamily: 'var(--font-raleway), sans-serif' }}>
      {/* Left panel */}
      <div
        className="auth-left-panel"
        style={{
          width: '55%',
          background: '#040404',
          display: 'flex',
          flexDirection: 'column',
          padding: '40px 56px',
          position: 'relative',
          overflow: 'hidden',
        }}
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
            Compliance<br />made simple.
          </h1>
          <p style={{ fontSize: '15px', color: '#888', marginBottom: '56px', lineHeight: 1.6, maxWidth: '360px' }}>
            Document your AI systems. Generate evidence packs. Be ready before August 2, 2026.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            {steps.map((step) => (
              <div key={step.num} style={{ display: 'flex', alignItems: 'baseline', gap: '16px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#00e5bf', letterSpacing: '0.04em', minWidth: '20px' }}>
                  {step.num}
                </span>
                <span style={{ fontSize: '15px', fontWeight: 600, color: '#e8e8e8' }}>{step.title}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div
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
        <AnimatePresence mode="wait">
          {rightPanelContent}
        </AnimatePresence>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .auth-left-panel { display: none !important; }
        }
      `}</style>
    </div>
  )
}
