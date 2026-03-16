'use client'

import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, X } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import { Client, RiskTier } from '@/types'
import { TIER_COLOURS } from '@/lib/intelligence/recommendations'
import { fadeInUp, staggerContainer, pageVariants, scaleIn, btnHover, btnTap } from '@/lib/motion'

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  company: z.string().optional(),
})
type FormData = z.infer<typeof schema>

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: '#171717',
  border: '1px solid rgba(255,255,255,0.09)',
  borderRadius: 7,
  padding: '10px 13px',
  fontSize: 14,
  color: '#e3e3e3',
  fontFamily: "'Raleway', Helvetica, Arial, sans-serif",
  outline: 'none',
  boxSizing: 'border-box',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 11,
  fontWeight: 700,
  color: '#5e5e5e',
  marginBottom: 6,
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
}

function RiskBar({ score }: { score: number }) {
  const color = score >= 75 ? '#e54747' : score >= 50 ? '#e2a242' : score >= 20 ? '#e2b742' : '#36bd5f'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ width: 60, height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 100, overflow: 'hidden' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
          style={{ height: '100%', background: color, borderRadius: 100 }}
        />
      </div>
      <span style={{ fontSize: 13, fontWeight: 700, color: '#e3e3e3', minWidth: 20 }}>{score}</span>
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
    <motion.div variants={pageVariants} initial="hidden" animate="visible" exit="exit" style={{ fontFamily: "'Raleway', Helvetica, Arial, sans-serif" }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
        <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#ffffff', margin: 0, letterSpacing: '-0.5px' }}>Clients</h1>
          <p style={{ color: '#5e5e5e', fontSize: 13, marginTop: 4 }}>{clients.length} clients</p>
        </motion.div>
        <motion.button
          initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.1 }}
          whileHover={btnHover} whileTap={btnTap}
          onClick={openAdd}
          style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#47c9e5', border: 'none', borderRadius: 100, padding: '10px 20px', fontSize: 13, fontWeight: 700, color: '#fff', cursor: 'pointer', fontFamily: 'inherit' }}
        >
          <Plus size={13} /> Add Client
        </motion.button>
      </div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.4 }}
        style={{ background: '#1e1e1e', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, overflow: 'hidden' }}
      >
        {loading ? (
          <div>
            {[...Array(4)].map((_, i) => (
              <motion.div key={i} animate={{ opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.12 }}
                style={{ height: 60, borderBottom: '1px solid rgba(255,255,255,0.04)' }} />
            ))}
          </div>
        ) : clients.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: 56, textAlign: 'center', color: '#5e5e5e', fontSize: 14 }}>
            No clients yet. Add your first client.
          </motion.div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: '#1a1a1a' }}>
                {['Name', 'Company', 'Email', 'Risk Score', 'Added', ''].map((h, i) => (
                  <th key={i} style={{ padding: '13px 18px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#4e4e4e', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <motion.tbody variants={staggerContainer} initial="hidden" animate="visible">
              {clients.map((c, i) => {
                const tier = TIER_COLOURS[(c.risk_tier ?? 'low') as RiskTier]
                return (
                  <motion.tr
                    key={c.id}
                    variants={fadeInUp}
                    whileHover={{ backgroundColor: 'rgba(71,201,229,0.03)' }}
                    style={{ borderBottom: i < clients.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}
                  >
                    <td style={{ padding: '16px 18px', fontWeight: 700, color: '#e3e3e3' }}>{c.name}</td>
                    <td style={{ padding: '16px 18px', color: '#7e7e7e' }}>{c.company ?? '—'}</td>
                    <td style={{ padding: '16px 18px', color: '#7e7e7e' }}>{c.email}</td>
                    <td style={{ padding: '16px 18px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ background: tier.bg, color: tier.text, fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 100, whiteSpace: 'nowrap' }}>{tier.label}</span>
                        <RiskBar score={c.risk_score ?? 0} />
                      </div>
                    </td>
                    <td style={{ padding: '16px 18px', color: '#5e5e5e', fontSize: 13 }}>{new Date(c.created_at).toLocaleDateString('en-GB')}</td>
                    <td style={{ padding: '16px 18px' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
                        <motion.button whileHover={{ backgroundColor: 'rgba(255,255,255,0.1)' }} whileTap={{ scale: 0.93 }} onClick={() => openEdit(c)}
                          style={{ background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: 7, padding: '7px 10px', cursor: 'pointer', color: '#9e9e9e', display: 'flex', alignItems: 'center' }}>
                          <Pencil size={13} />
                        </motion.button>
                        <motion.button whileHover={{ backgroundColor: 'rgba(229,71,71,0.2)' }} whileTap={{ scale: 0.93 }} onClick={() => deleteClient(c.id)}
                          style={{ background: 'rgba(229,71,71,0.08)', border: 'none', borderRadius: 7, padding: '7px 10px', cursor: 'pointer', color: '#e54747', display: 'flex', alignItems: 'center' }}>
                          <Trash2 size={13} />
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                )
              })}
            </motion.tbody>
          </table>
        )}
      </motion.div>

      {/* Dialog */}
      <AnimatePresence>
        {showDialog && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, backdropFilter: 'blur(4px)' }}
            onClick={(e) => { if (e.target === e.currentTarget) setShowDialog(false) }}
          >
            <motion.div
              variants={scaleIn} initial="hidden" animate="visible" exit="exit"
              style={{ background: '#1e1e1e', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 14, padding: 36, width: 440, maxWidth: '92vw', boxShadow: '0 24px 80px rgba(0,0,0,0.6)', fontFamily: "'Raleway', Helvetica, Arial, sans-serif" }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
                <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#ffffff', letterSpacing: '-0.3px' }}>{editingClient ? 'Edit Client' : 'New Client'}</h2>
                <motion.button whileHover={{ rotate: 90, color: '#e3e3e3' }} onClick={() => setShowDialog(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#5e5e5e', padding: 4, display: 'flex', transition: 'color 0.2s' }}><X size={18} /></motion.button>
              </div>
              <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
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
                      style={{ fontSize: 13, color: '#e54747', background: 'rgba(229,71,71,0.1)', padding: '10px 14px', borderRadius: 8, margin: 0, border: '1px solid rgba(229,71,71,0.15)' }}>
                      {error}
                    </motion.p>
                  )}
                </AnimatePresence>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 4 }}>
                  <motion.button type="button" whileHover={{ color: '#e3e3e3' }} whileTap={btnTap} onClick={() => setShowDialog(false)} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 100, padding: '10px 22px', fontSize: 13, fontWeight: 700, color: '#7e7e7e', cursor: 'pointer', fontFamily: 'inherit' }}>
                    Cancel
                  </motion.button>
                  <motion.button type="submit" whileHover={btnHover} whileTap={btnTap} disabled={isSubmitting} style={{ background: '#47c9e5', border: 'none', borderRadius: 100, padding: '10px 22px', fontSize: 13, fontWeight: 700, color: '#fff', cursor: 'pointer', fontFamily: 'inherit', opacity: isSubmitting ? 0.7 : 1 }}>
                    {isSubmitting ? 'Saving…' : 'Save client'}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
