'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Send, FileText, CheckCircle, AlertTriangle, ExternalLink, Link2, Copy, Check, Gavel, ShieldAlert, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import InvoiceStatusBadge from '@/components/invoices/InvoiceStatusBadge'
import { formatCurrency, formatDate, daysBetween } from '@/lib/utils'
import { Invoice, InterestCalculation, EvidencePack } from '@/types'
import { fadeInUp, staggerContainer, pageVariants, btnHover, btnTap } from '@/lib/motion'

function DetailCard({ title, children, accent, delay = 0 }: { title: string; children: React.ReactNode; accent?: string; delay?: number }) {
  return (
    <motion.div
      variants={fadeInUp}
      whileHover={{ boxShadow: '0 8px 32px rgba(0,0,0,0.35)', transition: { duration: 0.2 } }}
      style={{
        background: '#1e1e1e',
        border: accent ? `1px solid ${accent}30` : '1px solid rgba(255,255,255,0.06)',
        borderRadius: 10, padding: 28, position: 'relative', overflow: 'hidden',
      }}
    >
      {accent && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${accent}99, transparent)` }} />}
      <p style={{ fontSize: 11, fontWeight: 700, color: accent ?? '#5e5e5e', textTransform: 'uppercase', letterSpacing: '0.6px', margin: '0 0 18px' }}>{title}</p>
      {children}
    </motion.div>
  )
}

function MetaRow({ label, value, highlight }: { label: string; value: React.ReactNode; highlight?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
      <span style={{ fontSize: 13, color: '#5e5e5e' }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 700, color: highlight ? '#e54747' : '#e3e3e3' }}>{value}</span>
    </div>
  )
}

function ActionButton({ onClick, disabled, icon: Icon, label, color = 'rgba(255,255,255,0.05)', textColor = '#e3e3e3', borderColor = 'rgba(255,255,255,0.1)' }: {
  onClick: () => void; disabled: boolean; icon: React.ElementType; label: string;
  color?: string; textColor?: string; borderColor?: string
}) {
  return (
    <motion.button
      onClick={onClick} disabled={disabled}
      whileHover={{ scale: 1.03, boxShadow: `0 0 18px ${color}` }}
      whileTap={{ scale: 0.96 }}
      style={{ display: 'flex', alignItems: 'center', gap: 8, background: color, border: `1px solid ${borderColor}`, borderRadius: 100, padding: '10px 20px', fontSize: 13, fontWeight: 700, color: textColor, cursor: disabled ? 'default' : 'pointer', fontFamily: "'Raleway', Helvetica, Arial, sans-serif", opacity: disabled ? 0.5 : 1, transition: 'opacity 0.2s' }}
    >
      <Icon size={14} />{label}
    </motion.button>
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

  // Check ?legal_demand=sent query param
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 920 }}>
        {[80, 200, 160, 140].map((h, i) => (
          <motion.div key={i} animate={{ opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.12 }}
            style={{ height: h, background: '#1e1e1e', borderRadius: 10 }} />
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
    <motion.div
      variants={pageVariants} initial="hidden" animate="visible" exit="exit"
      style={{ fontFamily: "'Raleway', Helvetica, Arial, sans-serif", maxWidth: 920 }}
    >
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
        <motion.button
          whileHover={{ backgroundColor: 'rgba(255,255,255,0.08)', x: -2 }} whileTap={{ scale: 0.95 }}
          onClick={() => router.back()}
          style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 100, padding: '8px 16px', fontSize: 13, fontWeight: 600, color: '#7e7e7e', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s' }}
        >
          <ArrowLeft size={14} /> Back
        </motion.button>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#ffffff', margin: 0, letterSpacing: '-0.3px' }}>Invoice {invoice.invoice_number}</h1>
        <InvoiceStatusBadge status={invoice.status} />
      </motion.div>

      {/* Toast message */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }} animate={{ opacity: 1, y: 0, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            style={{
              padding: '11px 16px', borderRadius: 8, fontSize: 13, marginBottom: 24, overflow: 'hidden',
              background: message.type === 'success' ? 'rgba(54,189,95,0.1)' : 'rgba(229,71,71,0.1)',
              color: message.type === 'success' ? '#36bd5f' : '#e54747',
              border: `1px solid ${message.type === 'success' ? 'rgba(54,189,95,0.2)' : 'rgba(229,71,71,0.2)'}`,
            }}
          >
            {message.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Legal demand success banner */}
      <AnimatePresence>
        {legalDemandSent && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }} animate={{ opacity: 1, y: 0, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            style={{ padding: '14px 18px', borderRadius: 8, fontSize: 13, marginBottom: 20, overflow: 'hidden', background: 'rgba(229,71,71,0.08)', color: '#e54747', border: '1px solid rgba(229,71,71,0.2)', display: 'flex', alignItems: 'center', gap: 10 }}
          >
            <Gavel size={16} />
            <div>
              <strong>Legal demand letter sent.</strong> The formal statutory notice has been delivered to your client by email with the PDF attached. County Court proceedings can be commenced if payment is not received within 7 days.
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div variants={staggerContainer} initial="hidden" animate="visible" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Summary + Client */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <DetailCard title="Invoice Summary">
            <div style={{ marginBottom: 12 }}>
              <p style={{ fontSize: 11, color: '#5e5e5e', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Amount</p>
              <p style={{ fontSize: 30, fontWeight: 800, color: '#47c9e5', margin: 0, letterSpacing: '-0.5px' }}>{formatCurrency(invoice.amount, invoice.currency)}</p>
            </div>
            <MetaRow label="Issue Date" value={formatDate(invoice.issue_date)} />
            <MetaRow label="Due Date" value={formatDate(invoice.due_date)} />
            {invoice.status !== 'paid' && daysOverdue > 0 && (
              <MetaRow label="Days Overdue" value={`${daysOverdue} days`} highlight />
            )}
          </DetailCard>

          <DetailCard title="Client">
            {client ? (
              <>
                <MetaRow label="Name" value={client.name} />
                <MetaRow label="Email" value={client.email} />
                {client.company && <MetaRow label="Company" value={client.company} />}
              </>
            ) : <p style={{ color: '#5e5e5e', fontSize: 13 }}>No client data</p>}
          </DetailCard>
        </div>

        {/* Payment Prediction */}
        <AnimatePresence>
          {prediction && invoice.status !== 'paid' && (
            <DetailCard title="Payment Prediction" accent="#47c9e5">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24 }}>
                <div>
                  <p style={{ fontSize: 12, color: '#5e5e5e', margin: '0 0 6px' }}>Predicted Date</p>
                  <p style={{ fontSize: 18, fontWeight: 800, color: '#e3e3e3', margin: 0 }}>{formatDate(prediction.predicted_payment_date)}</p>
                </div>
                <div>
                  <p style={{ fontSize: 12, color: '#5e5e5e', margin: '0 0 6px' }}>Expected Delay</p>
                  <p style={{ fontSize: 18, fontWeight: 800, margin: 0, color: prediction.predicted_delay_days > 0 ? '#e54747' : '#36bd5f' }}>
                    {prediction.predicted_delay_days > 0 ? `+${prediction.predicted_delay_days} days late` : prediction.predicted_delay_days < 0 ? `${Math.abs(prediction.predicted_delay_days)} days early` : 'On time'}
                  </p>
                </div>
                <div>
                  <p style={{ fontSize: 12, color: '#5e5e5e', margin: '0 0 10px' }}>Confidence</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ flex: 1, height: 5, background: 'rgba(255,255,255,0.08)', borderRadius: 100, overflow: 'hidden' }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.round(prediction.confidence * 100)}%` }}
                        transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
                        style={{ height: '100%', background: '#47c9e5', borderRadius: 100 }}
                      />
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 800, color: '#e3e3e3' }}>{Math.round(prediction.confidence * 100)}%</span>
                  </div>
                </div>
              </div>
            </DetailCard>
          )}
        </AnimatePresence>

        {/* Interest */}
        {interest && (
          <DetailCard title="Statutory Interest" accent="#e2b742">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20 }}>
              {[
                { label: 'Days Overdue', value: String(interest.days_overdue) },
                { label: 'Interest Rate', value: `${(interest.interest_rate * 100).toFixed(1)}% p.a.` },
                { label: 'Interest Amount', value: formatCurrency(interest.interest_amount) },
                { label: 'Compensation', value: formatCurrency(interest.compensation_fee) },
              ].map(({ label, value }) => (
                <motion.div key={label} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}>
                  <p style={{ fontSize: 11, color: '#e2b74288', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.4px', fontWeight: 700 }}>{label}</p>
                  <p style={{ fontSize: 18, fontWeight: 800, color: '#e2b742', margin: 0 }}>{value}</p>
                </motion.div>
              ))}
            </div>
          </DetailCard>
        )}

        {/* Actions */}
        {invoice.status !== 'paid' && (
          <DetailCard title="Actions">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              <ActionButton onClick={() => action('remind')} disabled={actionLoading === 'remind'} icon={Send}
                label={actionLoading === 'remind' ? 'Sending…' : 'Send Reminder'} color="rgba(71,201,229,0.08)" textColor="#47c9e5" borderColor="rgba(71,201,229,0.15)" />
              <ActionButton onClick={() => action('interest')} disabled={actionLoading === 'interest'} icon={AlertTriangle}
                label={actionLoading === 'interest' ? 'Calculating…' : 'Calculate Interest'} color="rgba(226,183,66,0.08)" textColor="#e2b742" borderColor="rgba(226,183,66,0.15)" />
              <ActionButton onClick={() => action('evidence')} disabled={actionLoading === 'evidence'} icon={FileText}
                label={actionLoading === 'evidence' ? 'Generating…' : 'Generate Evidence Pack'} />
              <ActionButton onClick={() => action('mark_paid')} disabled={actionLoading === 'mark_paid'} icon={CheckCircle}
                label={actionLoading === 'mark_paid' ? 'Marking…' : 'Mark as Paid'} color="rgba(54,189,95,0.1)" textColor="#36bd5f" borderColor="rgba(54,189,95,0.2)" />
            </div>
          </DetailCard>
        )}

        {/* Payment Link */}
        {invoice.status !== 'paid' && (
          <DetailCard title="Client Payment Portal" accent="#47c9e5">
            <p style={{ fontSize: 13, color: '#7e7e7e', margin: '0 0 18px', lineHeight: 1.7 }}>
              Generate a branded payment link to send your client. They'll see a live interest counter, full breakdown, and a Stripe pay button — no login required.
            </p>
            <AnimatePresence mode="wait">
              {!paymentLink ? (
                <motion.button
                  key="generate"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  onClick={generatePaymentLink}
                  disabled={generatingLink}
                  whileHover={{ scale: 1.02, boxShadow: '0 0 24px rgba(71,201,229,0.3)' }}
                  whileTap={{ scale: 0.97 }}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(71,201,229,0.1)', border: '1px solid rgba(71,201,229,0.2)', borderRadius: 100, padding: '10px 22px', fontSize: 13, fontWeight: 700, color: '#47c9e5', cursor: generatingLink ? 'default' : 'pointer', fontFamily: 'inherit', opacity: generatingLink ? 0.6 : 1 }}
                >
                  <Link2 size={14} />
                  {generatingLink ? 'Generating…' : 'Generate Payment Link'}
                </motion.button>
              ) : (
                <motion.div key="link" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(71,201,229,0.06)', border: '1px solid rgba(71,201,229,0.15)', borderRadius: 8, padding: '10px 14px' }}>
                    <span style={{ flex: 1, fontSize: 12, color: '#7e7e7e', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'monospace' }}>{paymentLink}</span>
                    <motion.button onClick={copyLink} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} style={{ display: 'flex', alignItems: 'center', gap: 5, background: linkCopied ? 'rgba(54,189,95,0.15)' : 'rgba(71,201,229,0.15)', border: 'none', borderRadius: 6, padding: '6px 12px', fontSize: 12, fontWeight: 700, color: linkCopied ? '#36bd5f' : '#47c9e5', cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0 }}>
                      {linkCopied ? <><Check size={13} /> Copied!</> : <><Copy size={13} /> Copy</>}
                    </motion.button>
                    <motion.a href={paymentLink} target="_blank" rel="noopener noreferrer" whileHover={{ scale: 1.05 }} style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: 6, padding: '6px 10px', color: '#7e7e7e', textDecoration: 'none' }}>
                      <ExternalLink size={13} />
                    </motion.a>
                  </div>
                  <p style={{ fontSize: 11, color: '#5e5e5e', margin: 0 }}>Send this link directly to your client. Valid for 90 days. Interest updates in real time.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </DetailCard>
        )}

        {/* Legal Demand Letter */}
        {invoice.status !== 'paid' && (
          <DetailCard title="Legal Demand Letter" accent="#e54747">
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20 }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13, color: '#7e7e7e', margin: '0 0 6px', lineHeight: 1.7 }}>
                  Send a <strong style={{ color: '#e3e3e3' }}>solicitor-style formal demand letter</strong> directly to your client's inbox as a PDF. Issued under the Late Payment of Commercial Debts (Interest) Act 1998 — debtors respond differently to a legal notice than a reminder email.
                </p>
                <p style={{ fontSize: 12, color: '#5e5e5e', margin: '0 0 18px' }}>
                  Includes: principal + statutory interest + compensation. 7-day payment ultimatum. CCJ warning. One-time charge of <strong style={{ color: '#e3e3e3' }}>£9.99</strong>.
                </p>
                <motion.button
                  onClick={() => setShowLegalModal(true)}
                  whileHover={{ scale: 1.02, boxShadow: '0 0 24px rgba(229,71,71,0.35)' }}
                  whileTap={{ scale: 0.97 }}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(229,71,71,0.12)', border: '1px solid rgba(229,71,71,0.25)', borderRadius: 100, padding: '10px 22px', fontSize: 13, fontWeight: 700, color: '#e54747', cursor: 'pointer', fontFamily: 'inherit' }}
                >
                  <Gavel size={14} /> Preview & Send Legal Demand — £9.99
                </motion.button>
              </div>
              <div style={{ width: 52, height: 52, borderRadius: 12, background: 'rgba(229,71,71,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <ShieldAlert size={24} color="#e54747" />
              </div>
            </div>
          </DetailCard>
        )}

        {/* Evidence Packs */}
        <AnimatePresence>
          {evidencePacks.length > 0 && (
            <DetailCard title="Evidence Packs">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {evidencePacks.map((pack, i) => (
                  <motion.div
                    key={pack.id}
                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                    whileHover={{ backgroundColor: 'rgba(71,201,229,0.04)', x: 2 }}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.06)', transition: 'all 0.15s' }}
                  >
                    <span style={{ fontSize: 13, color: '#7e7e7e' }}>{new Date(pack.generated_at).toLocaleString('en-GB')}</span>
                    <motion.a href={pack.file_url} target="_blank" rel="noopener noreferrer"
                      whileHover={{ color: '#47c9e5', x: 2 }}
                      style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: '#9e9e9e', textDecoration: 'none', fontWeight: 700, transition: 'color 0.2s' }}
                    >
                      Download PDF <ExternalLink size={12} />
                    </motion.a>
                  </motion.div>
                ))}
              </div>
            </DetailCard>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Legal Demand Preview Modal */}
      <AnimatePresence>
        {showLegalModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowLegalModal(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 16 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.94, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              onClick={(e) => e.stopPropagation()}
              style={{ background: '#161616', border: '1px solid rgba(229,71,71,0.2)', borderRadius: 14, padding: 32, maxWidth: 560, width: '100%', fontFamily: "'Raleway', Helvetica, Arial, sans-serif", position: 'relative' }}
            >
              {/* Close */}
              <motion.button
                onClick={() => setShowLegalModal(false)}
                whileHover={{ rotate: 90, background: 'rgba(255,255,255,0.1)' }}
                style={{ position: 'absolute', top: 16, right: 16, background: 'transparent', border: 'none', cursor: 'pointer', color: '#5e5e5e', borderRadius: '50%', padding: 4, display: 'flex' }}
              >
                <X size={16} />
              </motion.button>

              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(229,71,71,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Gavel size={22} color="#e54747" />
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#ffffff' }}>Legal Demand Letter</h2>
                  <p style={{ margin: '3px 0 0', fontSize: 12, color: '#5e5e5e' }}>Preview what your client will receive</p>
                </div>
              </div>

              {/* Letter preview */}
              <div style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: '20px 22px', marginBottom: 20, fontSize: 12, lineHeight: 1.8 }}>
                <div style={{ borderLeft: '3px solid #e54747', paddingLeft: 12, marginBottom: 14 }}>
                  <p style={{ margin: 0, fontWeight: 800, color: '#e3e3e3', fontSize: 13 }}>FORMAL DEMAND — INVOICE {invoice.invoice_number}</p>
                  <p style={{ margin: '2px 0 0', color: '#5e5e5e', fontSize: 11 }}>Late Payment of Commercial Debts (Interest) Act 1998</p>
                </div>
                <p style={{ color: '#9e9e9e', margin: '0 0 10px' }}>Dear {client?.name ?? 'Client'},</p>
                <p style={{ color: '#9e9e9e', margin: '0 0 14px' }}>
                  We write on behalf of your creditor regarding Invoice {invoice.invoice_number} which remains outstanding and unpaid. This constitutes a formal statutory demand for immediate payment.
                </p>
                {[
                  ['Original Amount', formatCurrency(Number(invoice.amount), invoice.currency)],
                  ['Statutory Interest', interest ? formatCurrency(interest.interest_amount) : 'Calculated on send'],
                  ['Fixed Compensation', interest ? formatCurrency(interest.compensation_fee) : '£40 – £100'],
                ].map(([l, v]) => (
                  <div key={l as string} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <span style={{ color: '#5e5e5e' }}>{l}</span>
                    <span style={{ color: '#e3e3e3', fontWeight: 700 }}>{v}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 10px', background: 'rgba(229,71,71,0.1)', borderRadius: 6, marginTop: 8 }}>
                  <span style={{ color: '#e54747', fontWeight: 800 }}>TOTAL NOW DUE</span>
                  <span style={{ color: '#e54747', fontWeight: 800 }}>
                    {interest ? formatCurrency(Number(invoice.amount) + interest.interest_amount + interest.compensation_fee) : 'Calculated on send'}
                  </span>
                </div>
                <div style={{ marginTop: 14, padding: '10px 12px', background: 'rgba(229,71,71,0.06)', border: '1px solid rgba(229,71,71,0.15)', borderRadius: 6 }}>
                  <p style={{ margin: 0, fontSize: 11, color: '#e54747', fontWeight: 700 }}>⚠ Payment required within 7 days or County Court proceedings will commence without further notice.</p>
                </div>
              </div>

              {/* Send to */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.06)', marginBottom: 20 }}>
                <AlertTriangle size={13} color="#e2b742" />
                <span style={{ fontSize: 12, color: '#7e7e7e' }}>
                  Will be sent to <strong style={{ color: '#e3e3e3' }}>{client?.email ?? 'no email on record'}</strong> as a PDF attachment
                </span>
              </div>

              {/* CTA */}
              <div style={{ display: 'flex', gap: 10 }}>
                <motion.button
                  onClick={() => setShowLegalModal(false)}
                  whileHover={{ background: 'rgba(255,255,255,0.08)' }}
                  style={{ flex: 1, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 100, padding: '11px 0', fontSize: 13, fontWeight: 600, color: '#7e7e7e', cursor: 'pointer', fontFamily: 'inherit' }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  onClick={sendLegalDemand}
                  disabled={sendingLegal || !client?.email}
                  whileHover={{ scale: 1.02, boxShadow: '0 0 28px rgba(229,71,71,0.4)' }}
                  whileTap={{ scale: 0.97 }}
                  style={{ flex: 2, background: sendingLegal ? 'rgba(229,71,71,0.5)' : '#e54747', border: 'none', borderRadius: 100, padding: '11px 0', fontSize: 13, fontWeight: 800, color: '#fff', cursor: sendingLegal || !client?.email ? 'default' : 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                >
                  <Gavel size={14} />
                  {sendingLegal ? 'Redirecting to payment…' : 'Confirm & Pay £9.99'}
                </motion.button>
              </div>
              {!client?.email && (
                <p style={{ fontSize: 11, color: '#e54747', textAlign: 'center', marginTop: 10 }}>Add an email address to this client before sending a legal demand.</p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
