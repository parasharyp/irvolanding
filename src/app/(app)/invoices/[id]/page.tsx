'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Send, FileText, CheckCircle, AlertTriangle, ExternalLink, Link2, Copy, Check, Gavel, ShieldAlert, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import InvoiceStatusBadge from '@/components/invoices/InvoiceStatusBadge'
import { formatCurrency, formatDate, daysBetween } from '@/lib/utils'
import { Invoice, InterestCalculation, EvidencePack } from '@/types'

function SectionCard({ title, children, accentColor }: { title: string; children: React.ReactNode; accentColor?: string }) {
  return (
    <div style={{
      background: '#0c0c0c',
      border: '1px solid rgba(255,255,255,0.07)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {accentColor && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: accentColor }} />}
      <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <p style={{ fontSize: 10, fontWeight: 700, color: accentColor ?? '#444', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>{title}</p>
      </div>
      <div style={{ padding: '20px 24px' }}>
        {children}
      </div>
    </div>
  )
}

function MetaRow({ label, value, highlight }: { label: string; value: React.ReactNode; highlight?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <span style={{ fontSize: 13, color: '#555' }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 700, color: highlight ? '#e54747' : '#e8e8e8' }}>{value}</span>
    </div>
  )
}

function ActionBtn({ onClick, disabled, icon: Icon, label, accent = false, danger = false }: {
  onClick: () => void; disabled: boolean; icon: React.ElementType; label: string;
  accent?: boolean; danger?: boolean
}) {
  const bg = accent ? '#00e5bf' : danger ? 'rgba(229,71,71,0.1)' : 'transparent'
  const color = accent ? '#040404' : danger ? '#e54747' : '#888'
  const border = accent ? 'none' : danger ? '1px solid rgba(229,71,71,0.2)' : '1px solid rgba(255,255,255,0.1)'
  return (
    <button
      onClick={onClick} disabled={disabled}
      style={{ display: 'flex', alignItems: 'center', gap: 8, background: bg, border, padding: '9px 18px', fontSize: 13, fontWeight: accent ? 800 : 600, color, cursor: disabled ? 'default' : 'pointer', fontFamily: 'var(--font-raleway), Raleway, Helvetica, Arial, sans-serif', opacity: disabled ? 0.5 : 1, transition: 'opacity 0.15s', letterSpacing: accent ? '0.02em' : 'normal' }}
    >
      <Icon size={13} />{label}
    </button>
  )
}

export default function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [interest, setInterest] = useState<InterestCalculation | null>(null)
  const [evidencePacks, setEvidencePacks] = useState<EvidencePack[]>([])
  const [prediction, setPrediction] = useState<{ predicted_payment_date: string; confidence: number; predicted_delay_days: number } | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [paymentLink, setPaymentLink] = useState<string | null>(null)
  const [linkCopied, setLinkCopied] = useState(false)
  const [generatingLink, setGeneratingLink] = useState(false)
  const [showLegalModal, setShowLegalModal] = useState(false)
  const [legalDemandSent, setLegalDemandSent] = useState(false)
  const [sendingLegal, setSendingLegal] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search).get('legal_demand')
      if (p === 'sent') setLegalDemandSent(true)
    }
  }, [])

  useEffect(() => {
    if (!id) return
    Promise.all([
      fetch(`/api/invoices/${id}`).then((r) => r.json()),
      fetch(`/api/invoices/${id}/interest`).then((r) => r.json()),
      fetch(`/api/invoices/${id}/evidence`).then((r) => r.json()),
      fetch(`/api/invoices/${id}/prediction`).then((r) => r.json()).catch(() => null),
    ]).then(([inv, int, packs, pred]) => {
      setInvoice(inv); setInterest(int)
      setEvidencePacks(Array.isArray(packs) ? packs : [])
      if (pred && !pred.error) setPrediction(pred)
    }).finally(() => setLoading(false))
  }, [id])

  const action = async (type: string) => {
    setActionLoading(type); setMessage(null)
    try {
      let res: Response
      if (type === 'mark_paid') res = await fetch(`/api/invoices/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'paid' }) })
      else if (type === 'remind') res = await fetch(`/api/invoices/${id}/remind`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) })
      else if (type === 'interest') res = await fetch(`/api/invoices/${id}/interest`, { method: 'POST' })
      else if (type === 'evidence') res = await fetch(`/api/invoices/${id}/evidence`, { method: 'POST' })
      else return

      const data = await res.json()
      if (!res.ok) {
        setMessage({ type: 'error', text: data.error ?? 'Action failed' })
      } else {
        setMessage({ type: 'success', text: type === 'remind' ? `Reminder sent to ${data.to}` : type === 'evidence' ? 'Evidence pack generated' : 'Done' })
        const [inv, int, packs] = await Promise.all([
          fetch(`/api/invoices/${id}`).then((r) => r.json()),
          fetch(`/api/invoices/${id}/interest`).then((r) => r.json()),
          fetch(`/api/invoices/${id}/evidence`).then((r) => r.json()),
        ])
        setInvoice(inv); setInterest(int)
        setEvidencePacks(Array.isArray(packs) ? packs : [])
      }
    } finally { setActionLoading(null) }
  }

  const generatePaymentLink = async () => {
    setGeneratingLink(true)
    const res = await fetch(`/api/invoices/${id}/payment-link`, { method: 'POST' }).then((r) => r.json())
    if (res.url) setPaymentLink(res.url)
    else setMessage({ type: 'error', text: res.error ?? 'Could not generate link' })
    setGeneratingLink(false)
  }

  const sendLegalDemand = async () => {
    setSendingLegal(true)
    const res = await fetch(`/api/invoices/${id}/legal-demand`, { method: 'POST' }).then((r) => r.json())
    setSendingLegal(false)
    setShowLegalModal(false)
    if (res.url) window.location.href = res.url
    else setMessage({ type: 'error', text: res.error ?? 'Failed to initiate payment' })
  }

  const copyLink = async () => {
    if (!paymentLink) return
    await navigator.clipboard.writeText(paymentLink)
    setLinkCopied(true)
    setTimeout(() => setLinkCopied(false), 2500)
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 900 }}>
        {[72, 180, 140, 120].map((h, i) => (
          <motion.div key={i} animate={{ opacity: [0.3, 0.5, 0.3] }} transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.12 }}
            style={{ height: h, background: '#0c0c0c', border: '1px solid rgba(255,255,255,0.07)' }} />
        ))}
      </div>
    )
  }

  if (!invoice || (invoice as { error?: string }).error) {
    return <p style={{ color: '#e54747', fontSize: 14 }}>Invoice not found.</p>
  }

  const client = invoice.client as { name: string; email: string; company?: string } | undefined
  const daysOverdue = daysBetween(invoice.due_date)

  return (
    <div style={{ fontFamily: 'var(--font-raleway), Raleway, Helvetica, Arial, sans-serif', maxWidth: 900 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
        <button
          onClick={() => router.back()}
          style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', padding: '8px 14px', fontSize: 13, fontWeight: 600, color: '#666', cursor: 'pointer', fontFamily: 'inherit', transition: 'border-color 0.15s' }}
        >
          <ArrowLeft size={13} /> Back
        </button>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#e8e8e8', margin: 0, letterSpacing: '-0.03em' }}>Invoice {invoice.invoice_number}</h1>
        <InvoiceStatusBadge status={invoice.status} />
      </div>

      {/* Toast */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -8, height: 0 }} animate={{ opacity: 1, y: 0, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            style={{
              padding: '10px 16px', fontSize: 13, marginBottom: 20, overflow: 'hidden',
              background: message.type === 'success' ? 'rgba(54,189,95,0.08)' : 'rgba(229,71,71,0.08)',
              color: message.type === 'success' ? '#36bd5f' : '#e54747',
              border: `1px solid ${message.type === 'success' ? 'rgba(54,189,95,0.15)' : 'rgba(229,71,71,0.15)'}`,
            }}
          >
            {message.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Legal demand banner */}
      <AnimatePresence>
        {legalDemandSent && (
          <motion.div
            initial={{ opacity: 0, y: -8, height: 0 }} animate={{ opacity: 1, y: 0, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            style={{ padding: '14px 18px', fontSize: 13, marginBottom: 16, overflow: 'hidden', background: 'rgba(229,71,71,0.06)', color: '#e54747', border: '1px solid rgba(229,71,71,0.15)', display: 'flex', alignItems: 'center', gap: 10 }}
          >
            <Gavel size={15} />
            <div>
              <strong>Legal demand letter sent.</strong> The formal statutory notice has been delivered to your client. County Court proceedings can commence if payment is not received within 7 days.
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Summary + Client */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <SectionCard title="Invoice Summary">
            <div style={{ marginBottom: 16 }}>
              <p style={{ fontSize: 10, color: '#444', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Amount</p>
              <p style={{ fontSize: 32, fontWeight: 800, color: '#00e5bf', margin: 0, letterSpacing: '-0.03em' }}>{formatCurrency(invoice.amount, invoice.currency)}</p>
            </div>
            <MetaRow label="Issue Date" value={formatDate(invoice.issue_date)} />
            <MetaRow label="Due Date" value={formatDate(invoice.due_date)} />
            {invoice.status !== 'paid' && daysOverdue > 0 && (
              <MetaRow label="Days Overdue" value={`${daysOverdue} days`} highlight />
            )}
          </SectionCard>

          <SectionCard title="Client">
            {client ? (
              <>
                <MetaRow label="Name" value={client.name} />
                <MetaRow label="Email" value={client.email} />
                {client.company && <MetaRow label="Company" value={client.company} />}
              </>
            ) : <p style={{ color: '#444', fontSize: 13 }}>No client data</p>}
          </SectionCard>
        </div>

        {/* Payment Prediction */}
        <AnimatePresence>
          {prediction && invoice.status !== 'paid' && (
            <SectionCard title="Payment Prediction" accentColor="#00e5bf">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24 }}>
                <div>
                  <p style={{ fontSize: 11, color: '#444', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Predicted Date</p>
                  <p style={{ fontSize: 18, fontWeight: 800, color: '#e8e8e8', margin: 0 }}>{formatDate(prediction.predicted_payment_date)}</p>
                </div>
                <div>
                  <p style={{ fontSize: 11, color: '#444', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Expected Delay</p>
                  <p style={{ fontSize: 18, fontWeight: 800, margin: 0, color: prediction.predicted_delay_days > 0 ? '#e54747' : '#36bd5f' }}>
                    {prediction.predicted_delay_days > 0 ? `+${prediction.predicted_delay_days} days late` : prediction.predicted_delay_days < 0 ? `${Math.abs(prediction.predicted_delay_days)} days early` : 'On time'}
                  </p>
                </div>
                <div>
                  <p style={{ fontSize: 11, color: '#444', margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Confidence</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ flex: 1, height: 3, background: 'rgba(255,255,255,0.07)', overflow: 'hidden' }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.round(prediction.confidence * 100)}%` }}
                        transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
                        style={{ height: '100%', background: '#00e5bf' }}
                      />
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 800, color: '#e8e8e8' }}>{Math.round(prediction.confidence * 100)}%</span>
                  </div>
                </div>
              </div>
            </SectionCard>
          )}
        </AnimatePresence>

        {/* Interest */}
        {interest && (
          <SectionCard title="Statutory Interest" accentColor="#e2b742">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 0, borderLeft: '1px solid rgba(255,255,255,0.07)' }}>
              {[
                { label: 'Days Overdue', value: String(interest.days_overdue) },
                { label: 'Interest Rate', value: `${(interest.interest_rate * 100).toFixed(1)}% p.a.` },
                { label: 'Interest Amount', value: formatCurrency(interest.interest_amount) },
                { label: 'Compensation', value: formatCurrency(interest.compensation_fee) },
              ].map(({ label, value }) => (
                <div key={label} style={{ padding: '16px 20px', borderRight: '1px solid rgba(255,255,255,0.07)' }}>
                  <p style={{ fontSize: 10, color: '#666', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</p>
                  <p style={{ fontSize: 20, fontWeight: 800, color: '#e2b742', margin: 0 }}>{value}</p>
                </div>
              ))}
            </div>
          </SectionCard>
        )}

        {/* Actions */}
        {invoice.status !== 'paid' && (
          <SectionCard title="Actions">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              <ActionBtn onClick={() => action('remind')} disabled={actionLoading === 'remind'} icon={Send}
                label={actionLoading === 'remind' ? 'Sending…' : 'Send Reminder'} accent />
              <ActionBtn onClick={() => action('interest')} disabled={actionLoading === 'interest'} icon={AlertTriangle}
                label={actionLoading === 'interest' ? 'Calculating…' : 'Calculate Interest'} />
              <ActionBtn onClick={() => action('evidence')} disabled={actionLoading === 'evidence'} icon={FileText}
                label={actionLoading === 'evidence' ? 'Generating…' : 'Generate Evidence Pack'} />
              <ActionBtn onClick={() => action('mark_paid')} disabled={actionLoading === 'mark_paid'} icon={CheckCircle}
                label={actionLoading === 'mark_paid' ? 'Marking…' : 'Mark as Paid'} />
            </div>
          </SectionCard>
        )}

        {/* Payment Link */}
        {invoice.status !== 'paid' && (
          <SectionCard title="Client Payment Portal" accentColor="#00e5bf">
            <p style={{ fontSize: 13, color: '#666', margin: '0 0 16px', lineHeight: 1.7 }}>
              Generate a payment link to send your client. They&apos;ll see a live interest counter, full breakdown, and a pay button — no login required.
            </p>
            <AnimatePresence mode="wait">
              {!paymentLink ? (
                <motion.button
                  key="generate"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  onClick={generatePaymentLink}
                  disabled={generatingLink}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#00e5bf', border: 'none', padding: '10px 20px', fontSize: 13, fontWeight: 800, color: '#040404', cursor: generatingLink ? 'default' : 'pointer', fontFamily: 'inherit', opacity: generatingLink ? 0.6 : 1, letterSpacing: '0.02em' }}
                >
                  <Link2 size={13} />
                  {generatingLink ? 'Generating…' : 'Generate Payment Link'}
                </motion.button>
              ) : (
                <motion.div key="link" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(0,229,191,0.04)', border: '1px solid rgba(0,229,191,0.15)', padding: '10px 14px' }}>
                    <span style={{ flex: 1, fontSize: 12, color: '#666', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'monospace' }}>{paymentLink}</span>
                    <button onClick={copyLink} style={{ display: 'flex', alignItems: 'center', gap: 5, background: linkCopied ? 'rgba(54,189,95,0.1)' : 'rgba(0,229,191,0.1)', border: 'none', padding: '5px 12px', fontSize: 12, fontWeight: 700, color: linkCopied ? '#36bd5f' : '#00e5bf', cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0 }}>
                      {linkCopied ? <><Check size={12} /> Copied!</> : <><Copy size={12} /> Copy</>}
                    </button>
                    <a href={paymentLink} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(255,255,255,0.04)', border: 'none', padding: '5px 10px', color: '#666', textDecoration: 'none' }}>
                      <ExternalLink size={12} />
                    </a>
                  </div>
                  <p style={{ fontSize: 11, color: '#444', margin: 0 }}>Send directly to your client. Valid 90 days. Interest updates in real time.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </SectionCard>
        )}

        {/* Legal Demand Letter */}
        {invoice.status !== 'paid' && (
          <SectionCard title="Legal Demand Letter" accentColor="#e54747">
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20 }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13, color: '#666', margin: '0 0 6px', lineHeight: 1.7 }}>
                  Send a <strong style={{ color: '#e8e8e8' }}>solicitor-style formal demand letter</strong> directly to your client&apos;s inbox as a PDF. Issued under the Late Payment of Commercial Debts (Interest) Act 1998.
                </p>
                <p style={{ fontSize: 12, color: '#444', margin: '0 0 16px' }}>
                  Includes principal + statutory interest + compensation. 7-day payment ultimatum. CCJ warning. One-time charge of <strong style={{ color: '#e8e8e8' }}>£9.99</strong>.
                </p>
                <button
                  onClick={() => setShowLegalModal(true)}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(229,71,71,0.1)', border: '1px solid rgba(229,71,71,0.2)', padding: '10px 20px', fontSize: 13, fontWeight: 700, color: '#e54747', cursor: 'pointer', fontFamily: 'inherit' }}
                >
                  <Gavel size={13} /> Preview & Send Legal Demand — £9.99
                </button>
              </div>
              <div style={{ width: 48, height: 48, background: 'rgba(229,71,71,0.08)', border: '1px solid rgba(229,71,71,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <ShieldAlert size={22} color="#e54747" />
              </div>
            </div>
          </SectionCard>
        )}

        {/* Evidence Packs */}
        <AnimatePresence>
          {evidencePacks.length > 0 && (
            <SectionCard title="Evidence Packs">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {evidencePacks.map((pack, i) => (
                  <div
                    key={pack.id}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
                  >
                    <span style={{ fontSize: 13, color: '#555' }}>{new Date(pack.generated_at).toLocaleString('en-GB')}</span>
                    <a href={pack.file_url} target="_blank" rel="noopener noreferrer"
                      style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: '#00e5bf', textDecoration: 'none', fontWeight: 700 }}
                    >
                      Download PDF <ExternalLink size={11} />
                    </a>
                  </div>
                ))}
              </div>
            </SectionCard>
          )}
        </AnimatePresence>
      </div>

      {/* Legal Demand Modal */}
      <AnimatePresence>
        {showLegalModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowLegalModal(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
          >
            <motion.div
              initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 8, opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              style={{ background: '#0c0c0c', border: '1px solid rgba(229,71,71,0.2)', borderTop: '2px solid #e54747', padding: 32, maxWidth: 540, width: '100%', fontFamily: 'var(--font-raleway), Raleway, Helvetica, Arial, sans-serif', position: 'relative' }}
            >
              <button
                onClick={() => setShowLegalModal(false)}
                style={{ position: 'absolute', top: 16, right: 16, background: 'transparent', border: 'none', cursor: 'pointer', color: '#555', display: 'flex' }}
              >
                <X size={16} />
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                <div style={{ width: 40, height: 40, background: 'rgba(229,71,71,0.1)', border: '1px solid rgba(229,71,71,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Gavel size={20} color="#e54747" />
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: '#e8e8e8', letterSpacing: '-0.02em' }}>Legal Demand Letter</h2>
                  <p style={{ margin: '3px 0 0', fontSize: 12, color: '#555' }}>Preview what your client will receive</p>
                </div>
              </div>

              <div style={{ background: '#080808', border: '1px solid rgba(255,255,255,0.07)', padding: '18px 20px', marginBottom: 16, fontSize: 12, lineHeight: 1.8 }}>
                <div style={{ borderLeft: '2px solid #e54747', paddingLeft: 12, marginBottom: 14 }}>
                  <p style={{ margin: 0, fontWeight: 800, color: '#e8e8e8', fontSize: 12, letterSpacing: '0.04em' }}>FORMAL DEMAND — INVOICE {invoice.invoice_number}</p>
                  <p style={{ margin: '2px 0 0', color: '#444', fontSize: 11 }}>Late Payment of Commercial Debts (Interest) Act 1998</p>
                </div>
                <p style={{ color: '#666', margin: '0 0 10px' }}>Dear {client?.name ?? 'Client'},</p>
                <p style={{ color: '#666', margin: '0 0 14px' }}>
                  We write on behalf of your creditor regarding Invoice {invoice.invoice_number} which remains outstanding and unpaid. This constitutes a formal statutory demand for immediate payment.
                </p>
                {[
                  ['Original Amount', formatCurrency(Number(invoice.amount), invoice.currency)],
                  ['Statutory Interest', interest ? formatCurrency(interest.interest_amount) : 'Calculated on send'],
                  ['Fixed Compensation', interest ? formatCurrency(interest.compensation_fee) : '£40 – £100'],
                ].map(([l, v]) => (
                  <div key={l as string} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <span style={{ color: '#555' }}>{l}</span>
                    <span style={{ color: '#e8e8e8', fontWeight: 700 }}>{v}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'rgba(229,71,71,0.08)', marginTop: 8, border: '1px solid rgba(229,71,71,0.15)' }}>
                  <span style={{ color: '#e54747', fontWeight: 800 }}>TOTAL NOW DUE</span>
                  <span style={{ color: '#e54747', fontWeight: 800 }}>
                    {interest ? formatCurrency(Number(invoice.amount) + interest.interest_amount + interest.compensation_fee) : 'Calculated on send'}
                  </span>
                </div>
                <div style={{ marginTop: 12, padding: '10px 12px', background: 'rgba(229,71,71,0.05)', border: '1px solid rgba(229,71,71,0.12)' }}>
                  <p style={{ margin: 0, fontSize: 11, color: '#e54747', fontWeight: 700 }}>⚠ Payment required within 7 days or County Court proceedings will commence without further notice.</p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', marginBottom: 20 }}>
                <AlertTriangle size={12} color="#e2b742" />
                <span style={{ fontSize: 12, color: '#666' }}>
                  Will be sent to <strong style={{ color: '#e8e8e8' }}>{client?.email ?? 'no email on record'}</strong> as a PDF attachment
                </span>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => setShowLegalModal(false)}
                  style={{ flex: 1, background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', padding: '11px 0', fontSize: 13, fontWeight: 600, color: '#666', cursor: 'pointer', fontFamily: 'inherit' }}
                >
                  Cancel
                </button>
                <button
                  onClick={sendLegalDemand}
                  disabled={sendingLegal || !client?.email}
                  style={{ flex: 2, background: sendingLegal ? 'rgba(229,71,71,0.5)' : '#e54747', border: 'none', padding: '11px 0', fontSize: 13, fontWeight: 800, color: '#fff', cursor: sendingLegal || !client?.email ? 'default' : 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                >
                  <Gavel size={13} />
                  {sendingLegal ? 'Redirecting to payment…' : 'Confirm & Pay £9.99'}
                </button>
              </div>
              {!client?.email && (
                <p style={{ fontSize: 11, color: '#e54747', textAlign: 'center', marginTop: 10 }}>Add an email address to this client before sending a legal demand.</p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
