'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Plus, Upload, Search, X, Send, ExternalLink, AlertTriangle,
  TrendingUp, CheckCircle, Clock, Filter,
} from 'lucide-react'
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

const STATUSES = ['all', 'pending', 'overdue', 'escalated', 'paid'] as const

function daysOverdue(dueDate: string): number {
  return Math.max(0, Math.floor((Date.now() - new Date(dueDate).getTime()) / 86400000))
}

function daysDue(dueDate: string): number {
  return Math.ceil((new Date(dueDate).getTime() - Date.now()) / 86400000)
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: '#0c0c0c',
  border: '1px solid rgba(255,255,255,0.09)',
  padding: '11px 14px',
  fontSize: 13,
  color: '#e3e3e3',
  fontFamily: "'Raleway', Helvetica, Arial, sans-serif",
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.15s',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 9,
  fontWeight: 700,
  color: '#3a3a3a',
  marginBottom: 8,
  textTransform: 'uppercase',
  letterSpacing: '0.7px',
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [addError, setAddError] = useState<string | null>(null)
  const [hoveredRow, setHoveredRow] = useState<string | null>(null)
  const [sendingReminder, setSendingReminder] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const { register, handleSubmit, setValue, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { currency: 'GBP' },
  })

  const load = useCallback(() => {
    const params = statusFilter !== 'all' ? `?status=${statusFilter}` : ''
    Promise.all([
      fetch(`/api/invoices${params}`).then((r) => r.json()),
      fetch('/api/clients').then((r) => r.json()),
    ]).then(([inv, cli]) => {
      setInvoices(Array.isArray(inv) ? inv : [])
      setClients(Array.isArray(cli) ? cli : [])
    }).finally(() => setLoading(false))
  }, [statusFilter])

  useEffect(() => { load() }, [load])

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

  const sendReminder = async (id: string, e: React.MouseEvent) => {
    e.preventDefault()
    setSendingReminder(id)
    await fetch(`/api/invoices/${id}/remind`, { method: 'POST' })
    setSendingReminder(null)
  }

  const filtered = invoices.filter((inv) => {
    const q = search.toLowerCase()
    return inv.invoice_number.toLowerCase().includes(q) || (inv.client as unknown as Client)?.name?.toLowerCase().includes(q)
  })

  // Summary stats
  const stats = {
    outstanding: invoices.filter((i) => i.status !== 'paid').reduce((s, i) => s + Number(i.amount), 0),
    overdueCount: invoices.filter((i) => i.status === 'overdue' || i.status === 'escalated').length,
    overdueAmt: invoices.filter((i) => i.status === 'overdue' || i.status === 'escalated').reduce((s, i) => s + Number(i.amount), 0),
    paidAmt: invoices.filter((i) => i.status === 'paid').reduce((s, i) => s + Number(i.amount), 0),
  }

  return (
    <motion.div variants={pageVariants} initial="hidden" animate="visible" exit="exit" style={{ fontFamily: "'Raleway', Helvetica, Arial, sans-serif" }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, paddingBottom: 22, borderBottom: '1px solid rgba(255,255,255,0.06)', flexWrap: 'wrap', gap: 12 }}>
        <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: '#ffffff', margin: 0, letterSpacing: '-0.5px' }}>Invoices</h1>
          <p style={{ color: '#2e2e2e', fontSize: 11, marginTop: 4, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{invoices.length} total</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.1 }} style={{ display: 'flex', gap: 8 }}>
          <input ref={fileRef} type="file" accept=".csv" style={{ display: 'none' }} onChange={handleImport} />
          <motion.button
            whileHover={{ color: '#e3e3e3', borderColor: 'rgba(255,255,255,0.18)' }}
            whileTap={btnTap}
            onClick={() => fileRef.current?.click()}
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'transparent', border: '1px solid rgba(255,255,255,0.09)', padding: '8px 16px', fontSize: 11, fontWeight: 700, color: '#555', cursor: 'pointer', fontFamily: 'inherit', textTransform: 'uppercase', letterSpacing: '0.05em', transition: 'all 0.15s' }}
          >
            <Upload size={12} strokeWidth={1.5} /> Import CSV
          </motion.button>
          <motion.button
            whileHover={btnHover}
            whileTap={btnTap}
            onClick={() => setShowAdd(true)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#00e5bf', border: 'none', padding: '8px 18px', fontSize: 11, fontWeight: 800, color: '#080808', cursor: 'pointer', fontFamily: 'inherit', textTransform: 'uppercase', letterSpacing: '0.05em' }}
          >
            <Plus size={12} strokeWidth={2.5} /> Add Invoice
          </motion.button>
        </motion.div>
      </div>

      {/* ── Stats bar ── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="r-grid-4 wall-grid"
        style={{ marginBottom: 20 }}
      >
        {[
          { label: 'Outstanding', value: formatCurrency(stats.outstanding), icon: Clock, accent: '#00e5bf', sub: `${invoices.filter(i => i.status !== 'paid').length} invoices` },
          { label: 'Overdue', value: formatCurrency(stats.overdueAmt), icon: AlertTriangle, accent: '#e54747', sub: `${stats.overdueCount} invoices`, red: true },
          { label: 'Total Collected', value: formatCurrency(stats.paidAmt), icon: CheckCircle, accent: '#36bd5f', sub: `${invoices.filter(i => i.status === 'paid').length} paid` },
          { label: 'Interest Accruing', value: formatCurrency(invoices.filter(i => i.status === 'overdue' || i.status === 'escalated').reduce((s, i) => s + Number(i.amount) * 0.13 / 365 * daysOverdue(i.due_date), 0)), icon: TrendingUp, accent: '#a78bfa', sub: 'per day on overdue' },
        ].map((stat) => (
          <div key={stat.label} style={{ padding: '18px 22px', borderRight: '1px solid rgba(255,255,255,0.07)', borderTop: `2px solid ${stat.accent}` }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontSize: 9, fontWeight: 700, color: '#2e2e2e', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{stat.label}</span>
              <stat.icon size={12} color={stat.accent} strokeWidth={1.5} />
            </div>
            <p style={{ margin: 0, fontSize: 20, fontWeight: 900, color: stat.red ? '#e54747' : '#ffffff', letterSpacing: '-0.5px' }}>{stat.value}</p>
            <p style={{ margin: '3px 0 0', fontSize: 10, color: '#2e2e2e', fontWeight: 600 }}>{stat.sub}</p>
          </div>
        ))}
      </motion.div>

      {/* ── Filters ── */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'center', flexWrap: 'wrap' }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: 1, maxWidth: 280 }}>
          <Search size={12} color="#333" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          <input
            placeholder="Search invoices or clients…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ ...inputStyle, paddingLeft: 34, fontSize: 12 }}
          />
        </div>

        {/* Status pill tabs */}
        <div style={{ display: 'flex', gap: 0, border: '1px solid rgba(255,255,255,0.07)', overflowX: 'auto' }}>
          {STATUSES.map((s, i) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              style={{
                padding: '8px 14px',
                fontSize: 10,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                border: 'none',
                borderRight: i < STATUSES.length - 1 ? '1px solid rgba(255,255,255,0.07)' : 'none',
                cursor: 'pointer',
                fontFamily: 'inherit',
                background: statusFilter === s ? '#00e5bf' : 'transparent',
                color: statusFilter === s ? '#080808' : '#444',
                transition: 'all 0.15s',
              }}
            >
              {s === 'all' ? 'All' : s}
              {s !== 'all' && (
                <span style={{ marginLeft: 6, opacity: 0.6 }}>
                  {invoices.filter(i => i.status === s).length}
                </span>
              )}
            </button>
          ))}
        </div>

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, color: '#2e2e2e', fontSize: 11, fontWeight: 600 }}>
          <Filter size={11} strokeWidth={1.5} />
          {filtered.length} shown
        </div>
      </motion.div>

      {/* ── Table ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="table-scroll"
        style={{ border: '1px solid rgba(255,255,255,0.07)' }}
      >
        {loading ? (
          <div>
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                animate={{ opacity: [0.2, 0.5, 0.2] }}
                transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.1 }}
                style={{ height: 58, borderBottom: '1px solid rgba(255,255,255,0.04)', background: '#0c0c0c' }}
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: '72px 0', textAlign: 'center' }}>
            <div style={{ width: 48, height: 48, border: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <Plus size={18} color="#2e2e2e" />
            </div>
            <p style={{ fontSize: 15, fontWeight: 700, color: '#555', margin: '0 0 8px' }}>No invoices yet</p>
            <p style={{ fontSize: 12, color: '#2e2e2e', margin: '0 0 24px' }}>Add your first invoice or import from CSV to get started.</p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button onClick={() => setShowAdd(true)} style={{ background: '#00e5bf', border: 'none', padding: '10px 22px', fontSize: 12, fontWeight: 800, color: '#080808', cursor: 'pointer', fontFamily: 'inherit', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Add Invoice
              </button>
              <button onClick={() => fileRef.current?.click()} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.09)', padding: '10px 22px', fontSize: 12, fontWeight: 700, color: '#555', cursor: 'pointer', fontFamily: 'inherit', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Import CSV
              </button>
            </div>
          </motion.div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', background: '#0a0a0a' }}>
                {['Invoice #', 'Client', 'Amount', 'Due Date', 'Days', 'Status', ''].map((h, i) => (
                  <th key={i} style={{ padding: '11px 16px', textAlign: 'left', fontSize: 9, fontWeight: 700, color: '#2e2e2e', textTransform: 'uppercase', letterSpacing: '0.07em', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <motion.tbody variants={staggerContainer} initial="hidden" animate="visible">
              {filtered.map((inv, i) => {
                const client = (inv.client as unknown as Client)
                const overdue = inv.status === 'overdue' || inv.status === 'escalated'
                const dOverdue = daysOverdue(inv.due_date)
                const dLeft = daysDue(inv.due_date)
                const isHovered = hoveredRow === inv.id
                return (
                  <motion.tr
                    key={inv.id}
                    variants={fadeInUp}
                    onMouseEnter={() => setHoveredRow(inv.id)}
                    onMouseLeave={() => setHoveredRow(null)}
                    style={{
                      borderBottom: i < filtered.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                      background: isHovered ? 'rgba(255,255,255,0.02)' : 'transparent',
                      transition: 'background 0.12s',
                      borderLeft: overdue ? '2px solid #e54747' : '2px solid transparent',
                    }}
                  >
                    <td style={{ padding: '14px 16px' }}>
                      <Link href={`/invoices/${inv.id}`} style={{ fontWeight: 800, color: '#00e5bf', textDecoration: 'none', fontSize: 12, letterSpacing: '-0.2px' }}>
                        {inv.invoice_number}
                      </Link>
                    </td>
                    <td style={{ padding: '14px 16px', color: '#888', fontWeight: 600 }}>{client?.name ?? '—'}</td>
                    <td style={{ padding: '14px 16px', fontWeight: 800, color: '#e3e3e3', letterSpacing: '-0.3px' }}>{formatCurrency(inv.amount, inv.currency)}</td>
                    <td style={{ padding: '14px 16px', color: '#555', fontWeight: 600 }}>{formatDate(inv.due_date)}</td>
                    <td style={{ padding: '14px 16px' }}>
                      {overdue ? (
                        <span style={{ fontSize: 11, fontWeight: 700, color: '#e54747' }}>{dOverdue}d overdue</span>
                      ) : inv.status === 'paid' ? (
                        <span style={{ fontSize: 11, color: '#2e2e2e', fontWeight: 600 }}>—</span>
                      ) : (
                        <span style={{ fontSize: 11, fontWeight: 700, color: dLeft <= 3 ? '#e54747' : dLeft <= 7 ? '#d4a017' : '#555' }}>
                          {dLeft <= 0 ? 'due today' : `${dLeft}d left`}
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '14px 16px' }}><InvoiceStatusBadge status={inv.status} /></td>
                    <td style={{ padding: '14px 16px' }}>
                      <AnimatePresence>
                        {isHovered && (
                          <motion.div
                            initial={{ opacity: 0, x: 8 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 8 }}
                            transition={{ duration: 0.15 }}
                            style={{ display: 'flex', gap: 6, alignItems: 'center' }}
                          >
                            {(inv.status === 'overdue' || inv.status === 'escalated' || inv.status === 'pending') && (
                              <motion.button
                                onClick={(e) => sendReminder(inv.id, e)}
                                whileHover={{ background: 'rgba(0,229,191,0.12)', color: '#00e5bf' }}
                                style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', background: 'transparent', border: '1px solid rgba(255,255,255,0.09)', color: '#555', fontSize: 10, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', textTransform: 'uppercase', letterSpacing: '0.05em', transition: 'all 0.15s' }}
                              >
                                <Send size={9} strokeWidth={2} />
                                {sendingReminder === inv.id ? '…' : 'Remind'}
                              </motion.button>
                            )}
                            <Link href={`/invoices/${inv.id}`}>
                              <motion.div
                                whileHover={{ background: 'rgba(255,255,255,0.06)', color: '#e3e3e3' }}
                                style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', border: '1px solid rgba(255,255,255,0.09)', color: '#555', fontSize: 10, fontWeight: 700, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.05em', textDecoration: 'none', transition: 'all 0.15s' }}
                              >
                                <ExternalLink size={9} strokeWidth={2} /> View
                              </motion.div>
                            </Link>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </td>
                  </motion.tr>
                )
              })}
            </motion.tbody>
          </table>
        )}
      </motion.div>

      {/* ── Add Invoice Modal ── */}
      <AnimatePresence>
        {showAdd && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, backdropFilter: 'blur(12px)' }}
            onClick={(e) => { if (e.target === e.currentTarget) setShowAdd(false) }}
          >
            <motion.div
              variants={scaleIn}
              initial="hidden"
              animate="visible"
              exit="exit"
              style={{ background: '#0c0c0c', border: '1px solid rgba(255,255,255,0.09)', padding: 40, width: 520, maxWidth: '92vw', fontFamily: "'Raleway', Helvetica, Arial, sans-serif", position: 'relative' }}
            >
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, #00e5bf, transparent)' }} />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 30 }}>
                <div>
                  <p style={{ fontSize: 10, fontWeight: 700, color: '#333', textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 6px' }}>New Invoice</p>
                  <h2 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: '#ffffff', letterSpacing: '-0.5px' }}>Add invoice</h2>
                </div>
                <motion.button whileHover={{ color: '#e3e3e3' }} whileTap={{ scale: 0.95 }} onClick={() => setShowAdd(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#333', padding: 6, display: 'flex' }}>
                  <X size={16} />
                </motion.button>
              </div>
              <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div>
                  <label style={labelStyle}>Client</label>
                  <Select onValueChange={(v) => setValue('client_id', v)}>
                    <SelectTrigger style={{ width: '100%', background: '#0c0c0c', border: '1px solid rgba(255,255,255,0.09)', color: '#e3e3e3', fontFamily: 'inherit', borderRadius: 0, height: 42 }}>
                      <SelectValue placeholder="Select a client" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.name} {c.company ? `(${c.company})` : ''}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.client_id && <p style={{ fontSize: 11, color: '#e54747', marginTop: 4 }}>{errors.client_id.message}</p>}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <label style={labelStyle}>Invoice number</label>
                    <input placeholder="INV-001" {...register('invoice_number')} style={inputStyle} />
                    {errors.invoice_number && <p style={{ fontSize: 11, color: '#e54747', marginTop: 4 }}>{errors.invoice_number.message}</p>}
                  </div>
                  <div>
                    <label style={labelStyle}>Amount (£)</label>
                    <input type="number" step="0.01" min="0" {...register('amount')} style={inputStyle} />
                    {errors.amount && <p style={{ fontSize: 11, color: '#e54747', marginTop: 4 }}>{errors.amount.message}</p>}
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
                    <motion.p initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ fontSize: 12, color: '#e54747', background: 'rgba(229,71,71,0.06)', padding: '10px 14px', margin: 0, border: '1px solid rgba(229,71,71,0.15)' }}>
                      {addError}
                    </motion.p>
                  )}
                </AnimatePresence>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 4 }}>
                  <motion.button type="button" whileHover={{ color: '#e3e3e3' }} whileTap={btnTap} onClick={() => setShowAdd(false)} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.09)', padding: '10px 20px', fontSize: 11, fontWeight: 700, color: '#555', cursor: 'pointer', fontFamily: 'inherit', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Cancel
                  </motion.button>
                  <motion.button type="submit" whileHover={btnHover} whileTap={btnTap} disabled={isSubmitting} style={{ background: '#00e5bf', border: 'none', padding: '10px 22px', fontSize: 11, fontWeight: 800, color: '#080808', cursor: 'pointer', fontFamily: 'inherit', opacity: isSubmitting ? 0.7 : 1, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
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
