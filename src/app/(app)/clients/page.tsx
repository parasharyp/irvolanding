'use client'

import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, X } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import { Client, RiskTier } from '@/types'
import { TIER_COLOURS } from '@/lib/intelligence/recommendations'

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  company: z.string().optional(),
})
type FormData = z.infer<typeof schema>

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: '#080808',
  border: '1px solid rgba(255,255,255,0.1)',
  padding: '11px 13px',
  fontSize: 14,
  color: '#e8e8e8',
  fontFamily: 'var(--font-raleway), Raleway, Helvetica, Arial, sans-serif',
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.15s',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 11,
  color: '#555',
  marginBottom: 6,
  letterSpacing: '0.04em',
}

function RiskBar({ score }: { score: number }) {
  const color = score >= 75 ? '#e54747' : score >= 50 ? '#e2a242' : score >= 20 ? '#e2b742' : '#36bd5f'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ width: 60, height: 3, background: 'rgba(255,255,255,0.07)', overflow: 'hidden' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
          style={{ height: '100%', background: color }}
        />
      </div>
      <span style={{ fontSize: 12, fontWeight: 700, color: '#888', minWidth: 20 }}>{score}</span>
    </div>
  )
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [showDialog, setShowDialog] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [error, setError] = useState<string | null>(null)

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const load = () => {
    fetch('/api/clients').then((r) => r.json()).then((d) => {
      setClients(Array.isArray(d) ? d : [])
    }).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const openAdd = () => { setEditingClient(null); reset({}); setShowDialog(true) }
  const openEdit = (client: Client) => {
    setEditingClient(client)
    reset({ name: client.name, email: client.email, company: client.company ?? '' })
    setShowDialog(true)
  }

  const onSubmit = async (data: FormData) => {
    setError(null)
    const url = editingClient ? `/api/clients/${editingClient.id}` : '/api/clients'
    const method = editingClient ? 'PATCH' : 'POST'
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
    if (!res.ok) { const err = await res.json(); setError(err.error ?? 'Failed to save'); return }
    setShowDialog(false); reset(); load()
  }

  const deleteClient = async (id: string) => {
    if (!confirm('Delete this client? All their invoices will also be deleted.')) return
    await fetch(`/api/clients/${id}`, { method: 'DELETE' })
    load()
  }

  return (
    <div style={{ fontFamily: 'var(--font-raleway), Raleway, Helvetica, Arial, sans-serif' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#e8e8e8', margin: 0, letterSpacing: '-0.03em' }}>Clients</h1>
          <p style={{ color: '#444', fontSize: 13, marginTop: 4 }}>{clients.length} clients on record</p>
        </div>
        <button
          onClick={openAdd}
          style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#00e5bf', border: 'none', padding: '10px 20px', fontSize: 13, fontWeight: 800, color: '#040404', cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '0.02em' }}
        >
          <Plus size={13} strokeWidth={2.5} /> Add Client
        </button>
      </div>

      {/* Table */}
      <div style={{ border: '1px solid rgba(255,255,255,0.07)', overflow: 'hidden' }}>
        {loading ? (
          <div>
            {[...Array(4)].map((_, i) => (
              <motion.div key={i} animate={{ opacity: [0.3, 0.5, 0.3] }} transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.12 }}
                style={{ height: 56, borderBottom: '1px solid rgba(255,255,255,0.05)' }} />
            ))}
          </div>
        ) : clients.length === 0 ? (
          <div style={{ padding: '64px 32px', textAlign: 'center' }}>
            <p style={{ color: '#444', fontSize: 14, marginBottom: 20 }}>No clients yet. Add your first client to get started.</p>
            <button
              onClick={openAdd}
              style={{ background: '#00e5bf', border: 'none', padding: '10px 24px', fontSize: 13, fontWeight: 800, color: '#040404', cursor: 'pointer', fontFamily: 'inherit' }}
            >
              Add first client
            </button>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)' }}>
                {['Name', 'Company', 'Email', 'Risk', 'Added', ''].map((h, i) => (
                  <th key={i} style={{ padding: '11px 16px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: '#444', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {clients.map((c, i) => {
                const tier = TIER_COLOURS[(c.risk_tier ?? 'low') as RiskTier]
                return (
                  <motion.tr
                    key={c.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.04 }}
                    style={{ borderBottom: i < clients.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none', transition: 'background 0.15s' }}
                    whileHover={{ backgroundColor: 'rgba(255,255,255,0.02)' } as never}
                  >
                    <td style={{ padding: '14px 16px', fontWeight: 700, color: '#e8e8e8' }}>{c.name}</td>
                    <td style={{ padding: '14px 16px', color: '#666' }}>{c.company ?? '—'}</td>
                    <td style={{ padding: '14px 16px', color: '#666' }}>{c.email}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ background: tier.bg, color: tier.text, fontSize: 10, fontWeight: 700, padding: '2px 8px', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>{tier.label}</span>
                        <RiskBar score={c.risk_score ?? 0} />
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px', color: '#444', fontSize: 12 }}>{new Date(c.created_at).toLocaleDateString('en-GB')}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 4 }}>
                        <button onClick={() => openEdit(c)}
                          style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.08)', padding: '6px 10px', cursor: 'pointer', color: '#666', display: 'flex', alignItems: 'center', transition: 'border-color 0.15s, color 0.15s' }}>
                          <Pencil size={12} />
                        </button>
                        <button onClick={() => deleteClient(c.id)}
                          style={{ background: 'transparent', border: '1px solid rgba(229,71,71,0.15)', padding: '6px 10px', cursor: 'pointer', color: '#e54747', display: 'flex', alignItems: 'center' }}>
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Dialog */}
      <AnimatePresence>
        {showDialog && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}
            onClick={(e) => { if (e.target === e.currentTarget) setShowDialog(false) }}
          >
            <motion.div
              initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 8, opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{ background: '#0c0c0c', border: '1px solid rgba(255,255,255,0.1)', padding: '32px 36px', width: 420, maxWidth: '92vw', fontFamily: 'var(--font-raleway), Raleway, Helvetica, Arial, sans-serif', position: 'relative' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#e8e8e8', letterSpacing: '-0.02em' }}>{editingClient ? 'Edit Client' : 'New Client'}</h2>
                <button onClick={() => setShowDialog(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#555', padding: 4, display: 'flex' }}><X size={18} /></button>
              </div>
              <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={labelStyle}>Name</label>
                  <input {...register('name')} style={inputStyle} />
                  {errors.name && <p style={{ fontSize: 12, color: '#e54747', marginTop: 4 }}>{errors.name.message}</p>}
                </div>
                <div>
                  <label style={labelStyle}>Email</label>
                  <input type="email" {...register('email')} style={inputStyle} />
                  {errors.email && <p style={{ fontSize: 12, color: '#e54747', marginTop: 4 }}>{errors.email.message}</p>}
                </div>
                <div>
                  <label style={labelStyle}>Company (optional)</label>
                  <input {...register('company')} style={inputStyle} />
                </div>
                <AnimatePresence>
                  {error && (
                    <motion.p initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      style={{ fontSize: 13, color: '#e54747', background: 'rgba(229,71,71,0.06)', padding: '10px 14px', margin: 0, border: '1px solid rgba(229,71,71,0.12)' }}>
                      {error}
                    </motion.p>
                  )}
                </AnimatePresence>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
                  <button type="button" onClick={() => setShowDialog(false)} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', padding: '10px 20px', fontSize: 13, fontWeight: 600, color: '#666', cursor: 'pointer', fontFamily: 'inherit' }}>
                    Cancel
                  </button>
                  <button type="submit" disabled={isSubmitting} style={{ background: '#00e5bf', border: 'none', padding: '10px 24px', fontSize: 13, fontWeight: 800, color: '#040404', cursor: 'pointer', fontFamily: 'inherit', opacity: isSubmitting ? 0.7 : 1 }}>
                    {isSubmitting ? 'Saving…' : 'Save client'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
