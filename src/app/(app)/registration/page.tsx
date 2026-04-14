'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { REGISTRATION_ROLES } from '@/lib/ai/registration'
import { createClient } from '@/lib/supabase/client'
import ModuleGate from '@/components/ModuleGate'

const FONT = "var(--font-raleway), Raleway, Helvetica, Arial, sans-serif"

const ROLE_LABELS: Record<string, string> = {
  'deployer-public-body': 'Deployer (public body)',
  'deployer-annex-iii': 'Deployer (Annex III)',
  'provider': 'Provider',
}

interface SystemRow { id: string; name: string; risk_level: string | null; annex_category: string | null }

function RegistrationPageInner() {
  const [systems, setSystems] = useState<SystemRow[]>([])
  const [systemId, setSystemId] = useState<string>('')
  const [role, setRole] = useState<string>('deployer-annex-iii')
  const [providerName, setProviderName] = useState<string>('')
  const [memberStates, setMemberStates] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('systems')
        .select('id, name, risk_level, annex_category')
        .in('status', ['in-progress', 'ready', 'exported'])
        .order('created_at', { ascending: false })
      setSystems(data ?? [])
      if (data && data.length > 0) setSystemId(data[0].id)
      setFetching(false)
    }
    load()
  }, [])

  const generate = async () => {
    if (!systemId) { toast.error('Select a system'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemId,
          role,
          providerName: providerName.trim() || undefined,
          memberStates: memberStates.trim() || undefined,
        }),
      })
      if (!res.ok) throw new Error((await res.text()) || `Failed (${res.status})`)
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const cd = res.headers.get('Content-Disposition') || ''
      const match = cd.match(/filename="([^"]+)"/)
      a.download = match ? match[1] : 'registration-dossier.pdf'
      document.body.appendChild(a); a.click(); a.remove()
      URL.revokeObjectURL(url)
      toast.success('Registration dossier downloaded')
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
          EU AI Act · Article 49 · Annex VIII
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: '#e8e8e8', margin: 0 }}>EU Database Registration Dossier</h1>
        <p style={{ color: '#666', marginTop: 10, lineHeight: 1.5 }}>
          Providers of high-risk AI systems must register in the EU database before placing on the market; public-body
          deployers and Annex III deployers also register. Irvo generates your Annex VIII-mapped dossier plus a
          submission-readiness checklist so your filing is ready to paste into the EU system.
        </p>
      </div>

      {fetching ? (
        <div style={{ color: '#666' }}>Loading your systems…</div>
      ) : systems.length === 0 ? (
        <div style={{ padding: 24, border: '1px solid rgba(255,255,255,0.07)', background: '#0c0c0c', color: '#666' }}>
          No classified systems yet. Classify a system first.
        </div>
      ) : (
        <>
          <div style={{ border: '1px solid rgba(255,255,255,0.07)', background: '#0c0c0c', padding: 24, marginBottom: 18 }}>
            <label htmlFor="system" style={{ display: 'block', fontSize: 12, color: '#e8e8e8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>
              System
            </label>
            <select id="system" value={systemId} onChange={(e) => setSystemId(e.target.value)}
              style={{ width: '100%', background: '#040404', border: '1px solid rgba(255,255,255,0.12)', color: '#e8e8e8', padding: 10, fontFamily: FONT, fontSize: 13, outline: 'none' }}
            >
              {systems.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} · {s.risk_level ?? 'unclassified'}{s.annex_category ? ` · ${s.annex_category}` : ''}
                </option>
              ))}
            </select>
          </div>

          <div style={{ border: '1px solid rgba(255,255,255,0.07)', background: '#0c0c0c', padding: 24, marginBottom: 18 }}>
            <div style={{ fontSize: 12, color: '#e8e8e8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 14 }}>
              Your role
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {REGISTRATION_ROLES.map((r) => {
                const active = role === r
                return (
                  <button key={r} onClick={() => setRole(r)} type="button"
                    style={{
                      padding: '10px 16px',
                      border: `1px solid ${active ? '#00e5bf' : 'rgba(255,255,255,0.12)'}`,
                      background: active ? '#00e5bf' : 'transparent',
                      color: active ? '#040404' : '#e8e8e8',
                      fontFamily: FONT, fontSize: 12, fontWeight: active ? 700 : 500, cursor: 'pointer',
                    }}
                  >
                    {ROLE_LABELS[r] ?? r}
                  </button>
                )
              })}
            </div>
          </div>

          <div style={{ border: '1px solid rgba(255,255,255,0.07)', background: '#0c0c0c', padding: 24, marginBottom: 18 }}>
            <label htmlFor="provider" style={{ display: 'block', fontSize: 12, color: '#e8e8e8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>
              Provider legal name (optional)
            </label>
            <input id="provider" value={providerName} onChange={(e) => setProviderName(e.target.value.slice(0, 200))}
              placeholder="Leave blank if you are the provider"
              style={{ width: '100%', background: '#040404', border: '1px solid rgba(255,255,255,0.12)', color: '#e8e8e8', padding: 10, fontFamily: FONT, fontSize: 13, outline: 'none' }}
            />
          </div>

          <div style={{ border: '1px solid rgba(255,255,255,0.07)', background: '#0c0c0c', padding: 24, marginBottom: 24 }}>
            <label htmlFor="states" style={{ display: 'block', fontSize: 12, color: '#e8e8e8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>
              Member States where the system is placed / in service (optional)
            </label>
            <input id="states" value={memberStates} onChange={(e) => setMemberStates(e.target.value.slice(0, 300))}
              placeholder="e.g. Ireland, Germany, France"
              style={{ width: '100%', background: '#040404', border: '1px solid rgba(255,255,255,0.12)', color: '#e8e8e8', padding: 10, fontFamily: FONT, fontSize: 13, outline: 'none' }}
            />
          </div>

          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <button onClick={generate} disabled={loading || !systemId}
              style={{ background: '#00e5bf', color: '#040404', border: 'none', padding: '14px 28px', fontFamily: FONT, fontSize: 14, fontWeight: 700, cursor: loading ? 'default' : 'pointer', opacity: loading || !systemId ? 0.5 : 1 }}
            >
              {loading ? 'Generating…' : 'Generate & download PDF'}
            </button>
            <span style={{ color: '#666', fontSize: 12 }}>Annex VIII-mapped dossier with submission-readiness checklist.</span>
          </div>
        </>
      )}
    </div>
  )
}

export default function RegistrationPage() {
  return <ModuleGate module="registration"><RegistrationPageInner /></ModuleGate>
}
