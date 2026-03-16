import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-02-25.acacia' as any }) // eslint-disable-line

function calcInterest(principal: number, dueDate: string) {
  const days = Math.max(0, Math.floor((Date.now() - new Date(dueDate).getTime()) / 86400000))
  const rate = 0.13
  const interest_amount = Math.round(principal * rate / 365 * days * 100) / 100
  const compensation_fee = principal < 1000 ? 40 : principal < 10000 ? 70 : 100
  return { days_overdue: days, interest_rate: rate, interest_amount, compensation_fee, total: interest_amount + compensation_fee }
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Invalid request' }, { status: 400 })

  const { creditorName, creditorEmail, clientName, clientEmail, clientCompany, invoiceNumber, invoiceAmount, invoiceDate, dueDate } = body
  if (!creditorName || !creditorEmail || !clientName || !clientEmail || !invoiceNumber || !invoiceAmount || !invoiceDate || !dueDate) {
    return NextResponse.json({ error: 'All required fields must be provided' }, { status: 400 })
  }

  const principal = Number(invoiceAmount)
  if (isNaN(principal) || principal <= 0) return NextResponse.json({ error: 'Invalid invoice amount' }, { status: 400 })

  const interest = calcInterest(principal, dueDate)
  const base = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [{
      price_data: {
        currency: 'gbp',
        product_data: {
          name: 'Legal Demand Letter',
          description: `Formal statutory demand letter for Invoice ${invoiceNumber} — sent to ${clientEmail} as PDF`,
        },
        unit_amount: 999,
      },
      quantity: 1,
    }],
    metadata: {
      type: 'public_legal_demand',
      creditor_name: creditorName,
      creditor_email: creditorEmail,
      client_name: clientName,
      client_email: clientEmail,
      client_company: clientCompany ?? '',
      invoice_number: invoiceNumber,
      invoice_amount: String(principal),
      invoice_date: invoiceDate,
      due_date: dueDate,
      interest_amount: String(interest.interest_amount),
      compensation_fee: String(interest.compensation_fee),
      days_overdue: String(interest.days_overdue),
    },
    customer_email: creditorEmail,
    success_url: `${base}/?legal_sent=1&inv=${encodeURIComponent(invoiceNumber)}`,
    cancel_url: `${base}/`,
  })

  return NextResponse.json({ url: session.url })
}
