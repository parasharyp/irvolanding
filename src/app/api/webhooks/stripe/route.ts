import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { Resend } from 'resend'
import { createAdminClient } from '@/lib/supabase/server'
import { calculateInterest } from '@/lib/interest'
import { generateLegalDemandLetter } from '@/lib/legal-letter'
import { generateCcjPack } from '@/lib/ccj-pack'
import { isWebhookAlreadyProcessed } from '@/lib/ratelimit'
import { Invoice } from '@/types'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-02-25.clover' })

function escapeHtml(s: string): string {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

const PLAN_MAP: Record<string, string> = {
  [process.env.STRIPE_PRICE_STARTER ?? '']: 'starter',
  [process.env.STRIPE_PRICE_STUDIO ?? '']: 'studio',
  [process.env.STRIPE_PRICE_FIRM ?? '']: 'firm',
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')
  if (!sig) return NextResponse.json({ error: 'Missing signature' }, { status: 400 })

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    // invalid signature
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  // Idempotency guard — Stripe may retry webhooks; skip if already processed
  if (await isWebhookAlreadyProcessed(event.id)) {
    return NextResponse.json({ received: true })
  }

  const admin = await createAdminClient()

  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription
      const customerId = sub.customer as string
      const priceId = sub.items.data[0]?.price.id
      const plan = PLAN_MAP[priceId] ?? 'starter'

      await admin
        .from('organizations')
        .update({ plan, stripe_subscription_id: sub.id })
        .eq('stripe_customer_id', customerId)
      break
    }
    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription
      await admin
        .from('organizations')
        .update({ plan: 'starter', stripe_subscription_id: null })
        .eq('stripe_customer_id', sub.customer as string)
      break
    }
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const invoiceId = session.metadata?.invoice_id

      if (session.metadata?.type === 'payment_portal' && invoiceId) {
        await admin
          .from('invoices')
          .update({ status: 'paid', paid_at: new Date().toISOString() })
          .eq('id', invoiceId)
        await admin.from('invoice_events').insert({
          invoice_id: invoiceId,
          event_type: 'payment_received',
          metadata: {
            source: 'payment_portal',
            amount_paid: session.amount_total ? session.amount_total / 100 : null,
            stripe_session_id: session.id,
          },
        })
      } else if (session.metadata?.type === 'legal_demand' && invoiceId) {
        // Fetch invoice + client + org
        const { data: invoice } = await admin
          .from('invoices')
          .select('*, client:clients(name, email, company)')
          .eq('id', invoiceId)
          .single()

        if (invoice) {
          const { data: org } = await admin
            .from('organizations')
            .select('name')
            .eq('id', invoice.organization_id)
            .single()

          // Get payment token (for pay link in letter)
          const { data: pt } = await admin
            .from('payment_tokens')
            .select('token')
            .eq('invoice_id', invoiceId)
            .single()

          const base = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
          const paymentUrl = pt ? `${base}/pay/${pt.token}` : undefined

          const interest = calculateInterest(invoice as Invoice)
          const client = invoice.client as { name: string; email: string; company?: string } | null

          const pdfBuffer = await generateLegalDemandLetter({
            invoice: {
              invoice_number: invoice.invoice_number,
              amount: invoice.amount,
              issue_date: invoice.issue_date,
              due_date: invoice.due_date,
              currency: invoice.currency,
            },
            interest,
            orgName: org?.name ?? 'Your Creditor',
            clientName: client?.name ?? 'Client',
            clientCompany: client?.company,
            paymentUrl,
          })

          // Upload to storage
          const fileName = `legal-letters/${invoice.organization_id}/demand-${invoice.invoice_number}-${Date.now()}.pdf`
          await admin.storage
            .from('evidence-packs')
            .upload(fileName, pdfBuffer, { contentType: 'application/pdf', upsert: true })

          const { data: { publicUrl } } = admin.storage.from('evidence-packs').getPublicUrl(fileName)

          // Send email to client (CC to user who ordered it)
          if (client?.email) {
            await resend.emails.send({
              from: `${org?.name ?? 'Irvo'} <noreply@${process.env.RESEND_DOMAIN ?? 'irvo.co.uk'}>`,
              to: client.email,
              cc: session.metadata.user_email ? [session.metadata.user_email] : [],
              subject: `FORMAL DEMAND — Invoice ${invoice.invoice_number} — Payment Required Within 7 Days`,
              html: `
                <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;padding:40px 20px;color:#111">
                  <div style="border-left:4px solid #cc0000;padding-left:16px;margin-bottom:28px">
                    <h2 style="margin:0 0 4px;font-size:18px">FORMAL DEMAND NOTICE</h2>
                    <p style="margin:0;color:#555;font-size:13px">Invoice ${escapeHtml(invoice.invoice_number)} — Late Payment of Commercial Debts (Interest) Act 1998</p>
                  </div>
                  <p>Dear ${escapeHtml(client.name)},</p>
                  <p>Please find attached a formal statutory demand issued on behalf of <strong>${escapeHtml(org?.name ?? 'your creditor')}</strong> for the above-referenced invoice which remains outstanding.</p>
                  <table style="width:100%;border-collapse:collapse;margin:20px 0">
                    <tr style="background:#f8f8f8"><td style="padding:8px 12px;color:#555">Original Amount</td><td style="padding:8px 12px;font-weight:bold">£${Number(invoice.amount).toFixed(2)}</td></tr>
                    <tr><td style="padding:8px 12px;color:#555">Statutory Interest</td><td style="padding:8px 12px;font-weight:bold">£${interest.interest_amount.toFixed(2)}</td></tr>
                    <tr style="background:#f8f8f8"><td style="padding:8px 12px;color:#555">Fixed Compensation</td><td style="padding:8px 12px;font-weight:bold">£${interest.compensation_fee.toFixed(2)}</td></tr>
                    <tr style="background:#cc0000;color:#fff"><td style="padding:10px 12px;font-weight:bold;font-size:15px">TOTAL NOW DUE</td><td style="padding:10px 12px;font-weight:bold;font-size:15px">£${(Number(invoice.amount) + interest.interest_amount + interest.compensation_fee).toFixed(2)}</td></tr>
                  </table>
                  <div style="background:#fff8f8;border:1px solid #cc0000;padding:16px;margin:24px 0;border-radius:4px">
                    <strong style="color:#cc0000">Payment required within 7 days.</strong>
                    <p style="margin:8px 0 0;color:#990000;font-size:13px">Failure to settle will result in commencement of County Court proceedings without further notice, which may result in a CCJ being registered against you.</p>
                  </div>
                  ${paymentUrl ? `<p style="text-align:center;margin:28px 0"><a href="${paymentUrl}" style="background:#cc0000;color:#fff;padding:14px 32px;border-radius:4px;text-decoration:none;font-weight:bold;font-size:15px">Pay Now — Settle Immediately</a></p>` : ''}
                  <p style="color:#555;font-size:12px;margin-top:32px;border-top:1px solid #eee;padding-top:16px">This is a formal legal notice. The attached PDF constitutes the statutory demand document. Interest continues to accrue daily until payment is received in full.</p>
                </div>
              `,
              attachments: [
                { filename: `Formal-Demand-${invoice.invoice_number}.pdf`, content: pdfBuffer },
              ],
            })
          }

          // Log event
          await admin.from('invoice_events').insert({
            invoice_id: invoiceId,
            event_type: 'legal_demand_sent',
            metadata: {
              sent_to: client?.email,
              pdf_url: publicUrl,
              stripe_session_id: session.id,
              total_demanded: Number(invoice.amount) + interest.interest_amount + interest.compensation_fee,
            },
          })
        }
      } else if (session.metadata?.type === 'public_legal_demand') {
        const m = session.metadata
        const principal = Number(m.invoice_amount)
        const interest = {
          days_overdue: Number(m.days_overdue),
          interest_rate: 0.13,
          interest_amount: Number(m.interest_amount),
          compensation_fee: Number(m.compensation_fee),
          total: Number(m.interest_amount) + Number(m.compensation_fee),
        }

        const pdfBuffer = await generateLegalDemandLetter({
          invoice: { invoice_number: m.invoice_number, amount: principal, issue_date: m.invoice_date, due_date: m.due_date },
          interest,
          orgName: m.creditor_name,
          clientName: m.client_name,
          clientCompany: m.client_company || undefined,
        })

        const fileName = `public-legal/${Date.now()}-${m.invoice_number}.pdf`
        await admin.storage.from('evidence-packs').upload(fileName, pdfBuffer, { contentType: 'application/pdf', upsert: true })

        const total = principal + interest.interest_amount + interest.compensation_fee
        await resend.emails.send({
          from: `Irvo <noreply@${process.env.RESEND_DOMAIN ?? 'irvo.co.uk'}>`,
          to: m.client_email,
          cc: [m.creditor_email],
          subject: `FORMAL DEMAND — Invoice ${m.invoice_number} — Payment Required Within 7 Days`,
          html: `
            <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;padding:40px 20px;color:#111">
              <div style="border-left:4px solid #cc0000;padding-left:16px;margin-bottom:28px">
                <h2 style="margin:0 0 4px;font-size:18px">FORMAL DEMAND NOTICE</h2>
                <p style="margin:0;color:#555;font-size:13px">Invoice ${escapeHtml(m.invoice_number)} — Late Payment of Commercial Debts (Interest) Act 1998</p>
              </div>
              <p>Dear ${escapeHtml(m.client_name)},</p>
              <p>Please find attached a formal statutory demand issued on behalf of <strong>${escapeHtml(m.creditor_name)}</strong> regarding the above invoice which remains unpaid.</p>
              <table style="width:100%;border-collapse:collapse;margin:20px 0">
                <tr style="background:#f8f8f8"><td style="padding:8px 12px;color:#555">Original Amount</td><td style="padding:8px 12px;font-weight:bold">£${principal.toFixed(2)}</td></tr>
                <tr><td style="padding:8px 12px;color:#555">Statutory Interest</td><td style="padding:8px 12px;font-weight:bold">£${interest.interest_amount.toFixed(2)}</td></tr>
                <tr style="background:#f8f8f8"><td style="padding:8px 12px;color:#555">Fixed Compensation</td><td style="padding:8px 12px;font-weight:bold">£${interest.compensation_fee.toFixed(2)}</td></tr>
                <tr style="background:#cc0000;color:#fff"><td style="padding:10px 12px;font-weight:bold;font-size:15px">TOTAL NOW DUE</td><td style="padding:10px 12px;font-weight:bold;font-size:15px">£${total.toFixed(2)}</td></tr>
              </table>
              <div style="background:#fff8f8;border:1px solid #cc0000;padding:16px;margin:24px 0;border-radius:4px">
                <strong style="color:#cc0000">Payment required within 7 days.</strong>
                <p style="margin:8px 0 0;color:#990000;font-size:13px">Failure to settle will result in commencement of County Court proceedings without further notice.</p>
              </div>
              <p style="color:#555;font-size:12px;border-top:1px solid #eee;padding-top:16px;margin-top:32px">The attached PDF is your formal statutory demand document. Interest continues to accrue at £${(principal * 0.13 / 365).toFixed(2)} per day until payment.</p>
            </div>
          `,
          attachments: [{ filename: `Formal-Demand-${m.invoice_number}.pdf`, content: pdfBuffer }],
        })

      } else if (session.metadata?.type === 'public_ccj_pack') {
        const m = session.metadata
        const principal = Number(m.invoice_amount)
        const interest = {
          days_overdue: Number(m.days_overdue),
          interest_rate: 0.13,
          interest_amount: Number(m.interest_amount),
          compensation_fee: Number(m.compensation_fee),
        }

        const pdfBuffer = await generateCcjPack({
          creditorName: m.creditor_name,
          clientName: m.client_name,
          clientCompany: m.client_company || undefined,
          invoiceNumber: m.invoice_number,
          invoiceAmount: principal,
          invoiceDate: m.invoice_date,
          dueDate: m.due_date,
          description: m.description || undefined,
          interest,
        })

        const fileName = `public-ccj/${Date.now()}-${m.invoice_number}.pdf`
        await admin.storage.from('evidence-packs').upload(fileName, pdfBuffer, { contentType: 'application/pdf', upsert: true })

        const total = principal + interest.interest_amount + interest.compensation_fee
        await resend.emails.send({
          from: `Irvo <noreply@${process.env.RESEND_DOMAIN ?? 'irvo.co.uk'}>`,
          to: m.creditor_email,
          subject: `Your CCJ Preparation Pack — Invoice ${m.invoice_number}`,
          html: `
            <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;padding:40px 20px;color:#111">
              <h2 style="margin:0 0 8px;font-size:20px">Your CCJ Filing Pack is Ready</h2>
              <p style="color:#555;margin-bottom:24px">Invoice ${escapeHtml(m.invoice_number)} — ${escapeHtml(m.client_name)}</p>
              <p>Your 4-section County Court filing pack is attached as a PDF. It includes:</p>
              <ul style="line-height:2;color:#333">
                <li>Pre-written Particulars of Claim (ready to paste into MCOL)</li>
                <li>Statutory interest calculation (£${interest.interest_amount.toFixed(2)})</li>
                <li>Evidence checklist</li>
                <li>Step-by-step MCOL filing guide + court fee table</li>
              </ul>
              <table style="width:100%;border-collapse:collapse;margin:24px 0">
                <tr style="background:#f8f8f8"><td style="padding:8px 12px;color:#555">Principal</td><td style="padding:8px 12px;font-weight:bold">£${principal.toFixed(2)}</td></tr>
                <tr><td style="padding:8px 12px;color:#555">Statutory Interest</td><td style="padding:8px 12px;font-weight:bold">£${interest.interest_amount.toFixed(2)}</td></tr>
                <tr style="background:#f8f8f8"><td style="padding:8px 12px;color:#555">Fixed Compensation</td><td style="padding:8px 12px;font-weight:bold">£${interest.compensation_fee.toFixed(2)}</td></tr>
                <tr style="background:#1a1a1a;color:#fff"><td style="padding:10px 12px;font-weight:bold;font-size:15px">Total Claim Value</td><td style="padding:10px 12px;font-weight:bold;font-size:15px">£${total.toFixed(2)}</td></tr>
              </table>
              <p style="color:#555;font-size:12px;border-top:1px solid #eee;padding-top:16px">This pack provides guidance only and does not constitute legal advice. For complex claims, consider instructing a solicitor.</p>
            </div>
          `,
          attachments: [{ filename: `CCJ-Pack-${m.invoice_number}.pdf`, content: pdfBuffer }],
        })
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}
