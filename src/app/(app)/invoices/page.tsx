'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Upload, Search, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import InvoiceStatusBadge from '@/components/invoices/InvoiceStatusBadge'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Invoice, Client } from '@/types'
import { fadeInUp, staggerContainer, pageVariants, scaleIn, btnHover, btnTap } from '@/lib/motion'

const schema = z.object({
  client_id: z.string().uuid('Select a client'),
  invoice_number: z.string().min(1),
  amount: z.string().min(1, 'Required'),
  currency: z.string(),
  issue_date: z.string(),
  due_date: z.string(),
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
  transition: 'border-color 0.2s',
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

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [addError, setAddError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const { register, handleSubmit, setValue, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { currency: 'GBP' },
  })

  const load = () => {
    const params = statusFilter !== 'all' ? `?status=${statusFilter}` : ''
    Promise.all([
      fetch(`/api/invoices${params}`).then((r) => r.json()),
      fetch('/api/clients').then((r) => r.json()),
    ]).then(([inv, cli]) => {
      setInvoices(Array.isArray(inv) ? inv : [])
      setClients(Array.isArray(cli) ? cli : [])
    }).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [statusFilter])

  const onSubmit = async (data: FormData) => {
    setAddError(null)
    const res = await fetch('/api/invoices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, amount: parseFloat(data.amount) }),
    })
    if (!res.ok) {
      const err = await res.json()
      setAddError(err.error ?? 'Failed to create invoice')
      return
    }
    setShowAdd(false)
    reset()
    load()
  }

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch('/api/invoices/import', { method: 'POST', body: fd })
    const result = await res.json()
    alert(`Imported: ${result.imported}, Skipped: ${result.skipped}`)
    load()
  }

  const filtered = invoices.filter((inv) => {
    const q = search.toLowerCase()
    return inv.invoice_number.toLowerCase().includes(q) || (inv.client as unknown as Client)?.name?.toLowerCase().includes(q)
  })

  return (
    <motion.div variants={pageVariants} initial="hidden" animate="visible" exit="exit" style={{ fontFamily: "'Raleway', Helvetica, Arial, sans-serif" }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
        <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#ffffff', margin: 0, letterSpacing: '-0.5px' }}>Invoices</h1>
          <p style={{ color: '#5e5e5e', fontSize: 13, marginTop: 4 }}>{invoices.length} invoices total</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.1 }} style={{ display: 'flex', gap: 10 }}>
          <input ref={fileRef} type="file" accept=".csv" style={{ display: 'none' }} onChange={handleImport} />
          <motion.button
            whileHover={{ backgroundColor: 'rgba(255,255,255,0.08)', color: '#e3e3e3' }}
            whileTap={btnTap}
            onClick={() => fileRef.current?.click()}
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 100, padding: '9px 18px', fontSize: 13, fontWeight: 700, color: '#7e7e7e', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s' }}
          >
            <Upload size={13} /> Import CSV
          </motion.button>
          <motion.button
            whileHover={btnHover}
            whileTap={btnTap}
            onClick={() => setShowAdd(true)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#47c9e5', border: 'none', borderRadius: 100, padding: '9px 20px', fontSize: 13, fontWeight: 700, color: '#fff', cursor: 'pointer', fontFamily: 'inherit' }}
          >
            <Plus size={13} /> Add Invoice
          </motion.button>
        </motion.div>
      </div>

      {/* Filters */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.35 }} style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 300 }}>
          <Search size={14} color="#5e5e5e" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          <input
            placeholder="Search invoices…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ ...inputStyle, paddingLeft: 36 }}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger style={{ width: 160, background: '#171717', border: '1px solid rgba(255,255,255,0.09)', color: '#e3e3e3', borderRadius: 7, fontFamily: 'inherit' }}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {['all', 'pending', 'overdue', 'escalated', 'paid'].map((s) => (
              <SelectItem key={s} value={s}>{s === 'all' ? 'All statuses' : s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </motion.div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        style={{ background: '#1e1e1e', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, overflow: 'hidden' }}
      >
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
                style={{ height: 56, borderBottom: '1px solid rgba(255,255,255,0.04)', background: '#1e1e1e' }}
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: 56, textAlign: 'center', color: '#5e5e5e', fontSize: 14 }}>
            No invoices found.
          </motion.div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: '#1a1a1a' }}>
                {['Invoice #', 'Client', 'Amount', 'Issue Date', 'Due Date', 'Status'].map((h) => (
                  <th key={h} style={{ padding: '13px 18px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#4e4e4e', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <motion.tbody variants={staggerContainer} initial="hidden" animate="visible">
              {filtered.map((inv, i) => (
                <motion.tr
                  key={inv.id}
                  variants={fadeInUp}
                  whileHover={{ backgroundColor: 'rgba(71,201,229,0.04)' }}
                  style={{ borderBottom: i < filtered.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none', transition: 'background 0.15s' }}
                >
                  <td style={{ padding: '15px 18px' }}>
                    <Link href={`/invoices/${inv.id}`} style={{ fontWeight: 700, color: '#47c9e5', textDecoration: 'none', fontSize: 14 }}>
                      {inv.invoice_number}
                    </Link>
                  </td>
                  <td style={{ padding: '15px 18px', color: '#9e9e9e' }}>{(inv.client as unknown as Client)?.name ?? '—'}</td>
                  <td style={{ padding: '15px 18px', fontWeight: 700, color: '#e3e3e3' }}>{formatCurrency(inv.amount, inv.currency)}</td>
                  <td style={{ padding: '15px 18px', color: '#6e6e6e' }}>{formatDate(inv.issue_date)}</td>
                  <td style={{ padding: '15px 18px', color: '#6e6e6e' }}>{formatDate(inv.due_date)}</td>
                  <td style={{ padding: '15px 18px' }}><InvoiceStatusBadge status={inv.status} /></td>
                </motion.tr>
              ))}
            </motion.tbody>
          </table>
        )}
      </motion.div>

      {/* Add Invoice Modal */}
      <AnimatePresence>
        {showAdd && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, backdropFilter: 'blur(4px)' }}
            onClick={(e) => { if (e.target === e.currentTarget) setShowAdd(false) }}
          >
            <motion.div
              variants={scaleIn}
              initial="hidden"
              animate="visible"
              exit="exit"
              style={{ background: '#1e1e1e', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 14, padding: 36, width: 500, maxWidth: '92vw', fontFamily: "'Raleway', Helvetica, Arial, sans-serif", boxShadow: '0 24px 80px rgba(0,0,0,0.6)' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
                <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#ffffff', letterSpacing: '-0.3px' }}>New Invoice</h2>
                <motion.button whileHover={{ rotate: 90, color: '#e3e3e3' }} onClick={() => setShowAdd(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#5e5e5e', padding: 4, display: 'flex', transition: 'color 0.2s' }}><X size={18} /></motion.button>
              </div>
              <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <div>
                  <label style={labelStyle}>Client</label>
                  <Select onValueChange={(v) => setValue('client_id', v)}>
                    <SelectTrigger style={{ width: '100%', background: '#171717', border: '1px solid rgba(255,255,255,0.09)', color: '#e3e3e3', borderRadius: 7, fontFamily: 'inherit' }}>
                      <SelectValue placeholder="Select a client" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.name} {c.company ? `(${c.company})` : ''}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.client_id && <p style={{ fontSize: 12, color: '#e54747', marginTop: 4 }}>{errors.client_id.message}</p>}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <label style={labelStyle}>Invoice number</label>
                    <input placeholder="INV-001" {...register('invoice_number')} style={inputStyle} />
                    {errors.invoice_number && <p style={{ fontSize: 12, color: '#e54747', marginTop: 4 }}>{errors.invoice_number.message}</p>}
                  </div>
                  <div>
                    <label style={labelStyle}>Amount (£)</label>
                    <input type="number" step="0.01" min="0" {...register('amount')} style={inputStyle} />
                    {errors.amount && <p style={{ fontSize: 12, color: '#e54747', marginTop: 4 }}>{errors.amount.message}</p>}
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <label style={labelStyle}>Issue date</label>
                    <input type="date" {...register('issue_date')} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Due date</label>
                    <input type="date" {...register('due_date')} style={inputStyle} />
                  </div>
                </div>
                <AnimatePresence>
                  {addError && (
                    <motion.p initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ fontSize: 13, color: '#e54747', background: 'rgba(229,71,71,0.1)', padding: '10px 14px', borderRadius: 8, margin: 0, border: '1px solid rgba(229,71,71,0.15)' }}>
                      {addError}
                    </motion.p>
                  )}
                </AnimatePresence>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 4 }}>
                  <motion.button type="button" whileHover={{ color: '#e3e3e3' }} whileTap={btnTap} onClick={() => setShowAdd(false)} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 100, padding: '10px 22px', fontSize: 13, fontWeight: 700, color: '#7e7e7e', cursor: 'pointer', fontFamily: 'inherit' }}>
                    Cancel
                  </motion.button>
                  <motion.button type="submit" whileHover={btnHover} whileTap={btnTap} disabled={isSubmitting} style={{ background: '#47c9e5', border: 'none', borderRadius: 100, padding: '10px 22px', fontSize: 13, fontWeight: 700, color: '#fff', cursor: 'pointer', fontFamily: 'inherit', opacity: isSubmitting ? 0.7 : 1 }}>
                    {isSubmitting ? 'Creating…' : 'Create invoice'}
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
