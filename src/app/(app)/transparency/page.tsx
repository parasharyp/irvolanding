'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { AI_SURFACES, BRAND_TONES } from '@/lib/ai/transparency'

const FONT = "var(--font-raleway), Raleway, Helvetica, Arial, sans-serif"

const SURFACE_LABELS: Record<string, string> = {
  'chat-widget': 'Chat widget',
  'voice-agent': 'Voice agent',
  'generative-content': 'Generative content',
  'emotion-recognition': 'Emotion recognition',
  'biometric-categorisation': 'Biometric categorisation',
  'deepfake-synthesis': 'Deepfake / synthetic media',
}

export default function TransparencyPage() {
  const [surfaces, setSurfaces] = useState<Set<string>>(new Set(['chat-widget']))
  const [tone, setTone] = useState<string>('warm-professional')
  const [productContext, setProductContext] = useState('')
  const [loading, setLoading] = useState(false)

  const toggleSurface = (s: string) => {
    setSurfaces((prev) => {
      const next = new Set(prev)
      if (next.has(s)) next.delete(s)
      else next.add(s)
      return next
    })
  }

  const generate = async () => {
    if (surfaces.size === 0) {
      toast.error('Select at least one AI surface')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/transparency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          surfaces: Array.from(surfaces),
          brandTone: tone,
          productContext: productContext.trim() || undefined,
        }),
      })
      if (!res.ok) {
        const msg = await res.text()
        throw new Error(msg || `Failed (${res.status})`)
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const cd = res.headers.get('Content-Disposition') || ''
      const match = cd.match(/filename="([^"]+)"/)
      a.download = match ? match[1] : 'transparency-pack.pdf'
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
      toast.success('Transparency pack downloaded')
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: 32, fontFamily: FONT, maxWidth: 860 }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 11, color: '#00e5bf', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 6 }}>
          EU AI Act · Article 50
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: '#e8e8e8', margin: 0 }}>Transparency Disclosure Pack</h1>
        <p style={{ color: '#666', marginTop: 10, lineHeight: 1.5 }}>
          Article 50 requires users to know when they interact with AI, and generative outputs to be machine-readable as
          AI-generated. Tell Irvo which AI surfaces you operate and your brand tone — we generate ready-to-paste copy for
          your chat widget, voice agent, ToS, privacy notice, plus a C2PA watermark snippet, as one branded PDF.
        </p>
      </div>

      <div style={{ border: '1px solid rgba(255,255,255,0.07)', background: '#0c0c0c', padding: 24, marginBottom: 18 }}>
        <div style={{ fontSize: 12, color: '#e8e8e8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 14 }}>
          AI surfaces you operate
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
          {AI_SURFACES.map((s) => {
            const active = surfaces.has(s)
            return (
              <button
                key={s}
                onClick={() => toggleSurface(s)}
                type="button"
                style={{
                  padding: '12px 14px',
                  textAlign: 'left',
                  border: `1px solid ${active ? '#00e5bf' : 'rgba(255,255,255,0.12)'}`,
                  background: active ? '#00e5bf' : 'transparent',
                  color: active ? '#040404' : '#e8e8e8',
                  fontFamily: FONT,
                  fontSize: 13,
                  fontWeight: active ? 700 : 500,
                  cursor: 'pointer',
                }}
              >
                {SURFACE_LABELS[s] ?? s}
              </button>
            )
          })}
        </div>
      </div>

      <div style={{ border: '1px solid rgba(255,255,255,0.07)', background: '#0c0c0c', padding: 24, marginBottom: 18 }}>
        <div style={{ fontSize: 12, color: '#e8e8e8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 14 }}>
          Brand tone
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {BRAND_TONES.map((t) => {
            const active = tone === t
            return (
              <button
                key={t}
                onClick={() => setTone(t)}
                type="button"
                style={{
                  padding: '10px 16px',
                  border: `1px solid ${active ? '#00e5bf' : 'rgba(255,255,255,0.12)'}`,
                  background: active ? '#00e5bf' : 'transparent',
                  color: active ? '#040404' : '#e8e8e8',
                  fontFamily: FONT,
                  fontSize: 12,
                  fontWeight: active ? 700 : 500,
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                }}
              >
                {t.replace('-', ' ')}
              </button>
            )
          })}
        </div>
      </div>

      <div style={{ border: '1px solid rgba(255,255,255,0.07)', background: '#0c0c0c', padding: 24, marginBottom: 24 }}>
        <label htmlFor="context" style={{ display: 'block', fontSize: 12, color: '#e8e8e8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>
          Optional — product context
        </label>
        <textarea
          id="context"
          value={productContext}
          onChange={(e) => setProductContext(e.target.value.slice(0, 1000))}
          placeholder="Brief product description, user base, sensitivity of interactions… Helps tailor copy."
          rows={3}
          style={{
            width: '100%',
            background: '#040404',
            border: '1px solid rgba(255,255,255,0.12)',
            color: '#e8e8e8',
            padding: 10,
            fontFamily: FONT,
            fontSize: 13,
            resize: 'vertical',
            outline: 'none',
          }}
        />
        <div style={{ color: '#666', fontSize: 11, marginTop: 6, textAlign: 'right' }}>{productContext.length}/1000</div>
      </div>

      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <button
          onClick={generate}
          disabled={loading || surfaces.size === 0}
          style={{
            background: '#00e5bf',
            color: '#040404',
            border: 'none',
            padding: '14px 28px',
            fontFamily: FONT,
            fontSize: 14,
            fontWeight: 700,
            cursor: loading ? 'default' : 'pointer',
            opacity: loading || surfaces.size === 0 ? 0.5 : 1,
          }}
        >
          {loading ? 'Generating…' : 'Generate & download PDF'}
        </button>
        <span style={{ color: '#666', fontSize: 12 }}>
          Copy is ready to paste; the pack is branded with your organisation name.
        </span>
      </div>

      <div style={{ marginTop: 32, padding: 16, border: '1px solid rgba(255,255,255,0.07)', background: '#080808', color: '#666', fontSize: 12, lineHeight: 1.5 }}>
        The pack includes two tonal variants of the chat widget disclosure, a voice-agent opening line, a C2PA watermark
        snippet, ready-to-paste ToS + privacy paragraphs, and a deployer-notes appendix covering where to place each piece.
        This is not legal advice — consult your counsel before publishing.
      </div>
    </div>
  )
}
