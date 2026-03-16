import React from 'react'
import { Document, Page, Text, View, StyleSheet, renderToBuffer } from '@react-pdf/renderer'
import { formatCurrency, formatDate } from '@/lib/utils'

export interface CcjPackProps {
  creditorName: string
  clientName: string
  clientCompany?: string
  invoiceNumber: string
  invoiceAmount: number
  invoiceDate: string
  dueDate: string
  currency?: string
  description?: string
  interest: {
    days_overdue: number
    interest_rate: number
    interest_amount: number
    compensation_fee: number
  }
}

const S = StyleSheet.create({
  page: { fontFamily: 'Helvetica', fontSize: 10, padding: '50 55', color: '#111', lineHeight: 1.55 },
  cover: { fontFamily: 'Helvetica', fontSize: 10, padding: '60 55', color: '#111', lineHeight: 1.55, backgroundColor: '#fafafa' },
  h1: { fontFamily: 'Helvetica-Bold', fontSize: 22, marginBottom: 8 },
  h2: { fontFamily: 'Helvetica-Bold', fontSize: 13, marginBottom: 10, marginTop: 20, textTransform: 'uppercase', letterSpacing: 0.8, color: '#222' },
  h3: { fontFamily: 'Helvetica-Bold', fontSize: 10, marginBottom: 6 },
  para: { marginBottom: 10, lineHeight: 1.65 },
  bold: { fontFamily: 'Helvetica-Bold' },
  divider: { borderBottomWidth: 1, borderBottomColor: '#ddd', marginVertical: 12 },
  row: { flexDirection: 'row', marginBottom: 5 },
  label: { width: 200, color: '#666' },
  value: { flex: 1, fontFamily: 'Helvetica-Bold' },
  tableHeader: { flexDirection: 'row', backgroundColor: '#1a1a1a', padding: '7 10', marginBottom: 2 },
  tableHeaderText: { fontFamily: 'Helvetica-Bold', fontSize: 9, color: '#fff', textTransform: 'uppercase', letterSpacing: 0.5 },
  tableRow: { flexDirection: 'row', padding: '7 10', borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  tableRowAlt: { flexDirection: 'row', padding: '7 10', borderBottomWidth: 1, borderBottomColor: '#f0f0f0', backgroundColor: '#f9f9f9' },
  col2: { flex: 1 },
  col2r: { flex: 1, textAlign: 'right' },
  totalRow: { flexDirection: 'row', padding: '9 10', backgroundColor: '#1a1a1a' },
  totalLabel: { flex: 1, fontFamily: 'Helvetica-Bold', color: '#fff', fontSize: 11 },
  totalVal: { fontFamily: 'Helvetica-Bold', color: '#fff', fontSize: 12 },
  accentBox: { borderLeftWidth: 3, borderLeftColor: '#1a1a1a', padding: '10 14', backgroundColor: '#f5f5f5', marginVertical: 10 },
  warningBox: { borderWidth: 1, borderColor: '#cc0000', backgroundColor: '#fff8f8', padding: 12, marginVertical: 12, borderRadius: 3 },
  warningText: { color: '#990000', fontSize: 9, lineHeight: 1.65 },
  checkItem: { flexDirection: 'row', gap: 8, marginBottom: 7 },
  checkBox: { width: 12, height: 12, borderWidth: 1, borderColor: '#555', borderRadius: 2, marginTop: 1 },
  stepNum: { fontFamily: 'Helvetica-Bold', fontSize: 20, color: '#ccc', width: 32 },
  stepContent: { flex: 1 },
  feeRow: { flexDirection: 'row', padding: '5 10', borderBottomWidth: 1, borderBottomColor: '#eee' },
  feeRange: { flex: 2, color: '#444' },
  feeCost: { flex: 1, fontFamily: 'Helvetica-Bold', textAlign: 'right' },
  footer: { position: 'absolute', bottom: 28, left: 55, right: 55, textAlign: 'center', fontSize: 7.5, color: '#bbb', borderTopWidth: 1, borderTopColor: '#e5e5e5', paddingTop: 7 },
  section: { marginBottom: 18 },
  badge: { backgroundColor: '#1a1a1a', padding: '3 8', borderRadius: 3 },
  badgeText: { color: '#fff', fontSize: 8, fontFamily: 'Helvetica-Bold', letterSpacing: 0.5 },
  numberCircle: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#1a1a1a', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  numberText: { color: '#fff', fontFamily: 'Helvetica-Bold', fontSize: 10 },
})

const R = (l: string, v: string) =>
  React.createElement(View, { style: S.row },
    React.createElement(Text, { style: S.label }, l),
    React.createElement(Text, { style: S.value }, v)
  )

function CcjPackDocument(props: CcjPackProps) {
  const { creditorName, clientName, clientCompany, invoiceNumber, invoiceAmount, invoiceDate, dueDate, currency, description, interest } = props
  const total = invoiceAmount + interest.interest_amount + interest.compensation_fee
  const dailyRate = invoiceAmount * interest.interest_rate / 365
  const todayStr = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
  const cur = currency ?? 'GBP'

  return React.createElement(Document, null,

    // ── PAGE 1: COVER ────────────────────────────────────────────
    React.createElement(Page, { size: 'A4', style: S.cover },
      React.createElement(View, { style: { marginBottom: 40 } },
        React.createElement(Text, { style: { ...S.bold, fontSize: 10, color: '#666', marginBottom: 8, letterSpacing: 0.8 } }, 'COUNTY COURT CLAIM PREPARATION PACK'),
        React.createElement(Text, { style: { ...S.h1, fontSize: 28 } }, 'Money Claim\nFiling Pack'),
        React.createElement(View, { style: { height: 3, width: 60, backgroundColor: '#1a1a1a', marginTop: 12, marginBottom: 20 } }),
        React.createElement(Text, { style: { fontSize: 13, color: '#555', lineHeight: 1.6 } },
          'This pack contains everything you need to file a money claim\nthrough Money Claim Online (MCOL) or at your local county court.'
        ),
      ),
      React.createElement(View, { style: { backgroundColor: '#f5f5f5', padding: 20, borderRadius: 4, marginBottom: 20 } },
        React.createElement(Text, { style: { ...S.bold, fontSize: 9, color: '#999', letterSpacing: 0.8, marginBottom: 12, textTransform: 'uppercase' } }, 'Case Summary'),
        R('Claimant (You):', creditorName),
        R('Defendant:', `${clientName}${clientCompany ? ` (${clientCompany})` : ''}`),
        R('Invoice Reference:', invoiceNumber),
        R('Invoice Date:', formatDate(invoiceDate)),
        R('Payment Due:', formatDate(dueDate)),
        R('Days Overdue:', `${interest.days_overdue} days`),
        React.createElement(View, { style: S.divider }),
        R('Principal Amount:', formatCurrency(invoiceAmount, cur)),
        R('Statutory Interest:', formatCurrency(interest.interest_amount)),
        R('Fixed Compensation:', formatCurrency(interest.compensation_fee)),
        React.createElement(View, { style: { ...S.totalRow, borderRadius: 4, marginTop: 4 } },
          React.createElement(Text, { style: S.totalLabel }, 'TOTAL CLAIM VALUE:'),
          React.createElement(Text, { style: S.totalVal }, formatCurrency(total)),
        ),
      ),
      React.createElement(Text, { style: { fontSize: 9, color: '#999', marginBottom: 4 } }, `Pack generated: ${todayStr}`),
      React.createElement(Text, { style: { fontSize: 9, color: '#999' } }, 'Prepared by Irvo — UK Statutory Debt Recovery'),
      React.createElement(Text, { style: S.footer }, `Irvo CCJ Preparation Pack | ${creditorName} v ${clientName} | Invoice ${invoiceNumber} | CONFIDENTIAL`)
    ),

    // ── PAGE 2: PARTICULARS OF CLAIM ─────────────────────────────
    React.createElement(Page, { size: 'A4', style: S.page },
      React.createElement(Text, { style: S.h2 }, 'Section 1 — Particulars of Claim'),
      React.createElement(Text, { style: { fontSize: 9, color: '#888', marginBottom: 14 } },
        'Copy this text exactly into the "Particulars of Claim" field when filing your claim on MCOL.'
      ),
      React.createElement(View, { style: S.accentBox },
        React.createElement(Text, { style: { ...S.bold, fontSize: 9, color: '#555', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 } }, 'PARTICULARS OF CLAIM'),
        React.createElement(Text, { style: S.para },
          `1. The Claimant, ${creditorName}, provides ${description ? description.toLowerCase() : 'professional services'} and at all material times carried on business as such.`
        ),
        React.createElement(Text, { style: S.para },
          `2. By invoice number ${invoiceNumber} dated ${formatDate(invoiceDate)}, the Claimant invoiced the Defendant in the sum of ${formatCurrency(invoiceAmount)} for services rendered. Payment was due on ${formatDate(dueDate)}.`
        ),
        React.createElement(Text, { style: S.para },
          `3. Despite the sum falling due and notwithstanding repeated requests for payment, the Defendant has failed and/or refused to pay the sum due or any part thereof.`
        ),
        React.createElement(Text, { style: S.para }, '4. AND the Claimant claims:'),
        React.createElement(Text, { style: { ...S.para, marginLeft: 16 } },
          `(a) The principal sum of ${formatCurrency(invoiceAmount)};`
        ),
        React.createElement(Text, { style: { ...S.para, marginLeft: 16 } },
          `(b) Statutory interest pursuant to the Late Payment of Commercial Debts (Interest) Act 1998 at ${(interest.interest_rate * 100).toFixed(0)}% per annum from ${formatDate(dueDate)} to the date hereof in the sum of ${formatCurrency(interest.interest_amount)}, continuing at the daily rate of ${formatCurrency(dailyRate)} per day;`
        ),
        React.createElement(Text, { style: { ...S.para, marginLeft: 16 } },
          `(c) Fixed compensation of ${formatCurrency(interest.compensation_fee)} pursuant to Section 5A of the Late Payment of Commercial Debts (Interest) Act 1998;`
        ),
        React.createElement(Text, { style: { ...S.para, marginLeft: 16 } },
          `(d) Further interest pursuant to Section 69 of the County Courts Act 1984 from the date hereof until judgment or sooner payment.`
        ),
        React.createElement(View, { style: { ...S.divider, marginTop: 6 } }),
        React.createElement(View, { style: { flexDirection: 'row', justifyContent: 'space-between' } },
          React.createElement(Text, { style: { fontFamily: 'Helvetica-Bold', fontSize: 11 } }, 'Total Claim:'),
          React.createElement(Text, { style: { fontFamily: 'Helvetica-Bold', fontSize: 12 } }, formatCurrency(total)),
        ),
        React.createElement(View, { style: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 } },
          React.createElement(Text, { style: { color: '#666', fontSize: 9 } }, 'Daily interest rate:'),
          React.createElement(Text, { style: { color: '#666', fontSize: 9 } }, `${formatCurrency(dailyRate)} per day`),
        ),
      ),
      React.createElement(Text, { style: S.footer },
        `Irvo CCJ Pack | ${creditorName} v ${clientName} | Section 1 of 4`
      )
    ),

    // ── PAGE 3: FINANCIAL BREAKDOWN + EVIDENCE ───────────────────
    React.createElement(Page, { size: 'A4', style: S.page },
      React.createElement(Text, { style: S.h2 }, 'Section 2 — Financial Breakdown'),
      React.createElement(View, { style: { ...S.tableHeader, borderRadius: '3 3 0 0' } },
        React.createElement(Text, { style: { ...S.tableHeaderText, flex: 2 } }, 'Description'),
        React.createElement(Text, { style: { ...S.tableHeaderText, flex: 1, textAlign: 'right' } }, 'Amount'),
      ),
      ...[
        [`Invoice ${invoiceNumber} — Principal`, formatCurrency(invoiceAmount, cur)],
        [`Statutory Interest @ ${(interest.interest_rate * 100).toFixed(0)}% p.a. × ${interest.days_overdue} days`, formatCurrency(interest.interest_amount)],
        [`Fixed Compensation (s.5A of the Act)`, formatCurrency(interest.compensation_fee)],
      ].map(([desc, amt], i) =>
        React.createElement(View, { style: i % 2 === 0 ? S.tableRow : S.tableRowAlt, key: desc as string },
          React.createElement(Text, { style: { flex: 2, fontSize: 9 } }, desc as string),
          React.createElement(Text, { style: { flex: 1, textAlign: 'right', fontSize: 9 } }, amt as string),
        )
      ),
      React.createElement(View, { style: { ...S.totalRow, borderRadius: '0 0 3 3' } },
        React.createElement(Text, { style: S.totalLabel }, 'TOTAL TO CLAIM:'),
        React.createElement(Text, { style: S.totalVal }, formatCurrency(total)),
      ),
      React.createElement(Text, { style: { fontSize: 9, color: '#888', marginTop: 8 } },
        `Daily interest rate: ${formatCurrency(dailyRate)} — interest continues to accrue until judgment date.`
      ),

      React.createElement(Text, { style: S.h2 }, 'Section 3 — Evidence Checklist'),
      React.createElement(Text, { style: { fontSize: 9, color: '#888', marginBottom: 12 } },
        'Attach copies of these documents to your claim. Tick each one as you prepare it.'
      ),
      ...[
        ['Original invoice or invoices showing amount, date, and payment terms', true],
        ['Copies of any purchase orders, contracts, or written agreements', true],
        ['Email chain or written communications showing services were delivered', true],
        ['Copies of reminder emails or letters you sent requesting payment', false],
        ['Proof of delivery or completion of work (if applicable)', false],
        ['Bank statements showing payment was not received', false],
        ['This statutory interest calculation schedule (Section 2 above)', true],
      ].map(([item, required]) =>
        React.createElement(View, { style: S.checkItem, key: item as string },
          React.createElement(View, { style: S.checkBox }),
          React.createElement(Text, { style: { flex: 1, fontSize: 9, lineHeight: 1.5 } },
            `${item}${required ? ' [REQUIRED]' : ' [recommended]'}`
          ),
        )
      ),
      React.createElement(Text, { style: S.footer },
        `Irvo CCJ Pack | ${creditorName} v ${clientName} | Section 2–3 of 4`
      )
    ),

    // ── PAGE 4: HOW TO FILE + COURT FEES ─────────────────────────
    React.createElement(Page, { size: 'A4', style: S.page },
      React.createElement(Text, { style: S.h2 }, 'Section 4 — How to File on Money Claim Online (MCOL)'),
      React.createElement(Text, { style: { fontSize: 9, color: '#888', marginBottom: 14 } },
        'MCOL is the UK government\'s online portal for filing money claims up to £100,000. Follow these steps exactly.'
      ),
      ...[
        ['Go to MCOL', 'Visit www.moneyclaims.service.gov.uk and sign in or create an account.'],
        ['Start a new claim', 'Click "Make a claim" and select "A claim for a fixed amount of money".'],
        ['Enter defendant details', `Use the defendant name and address: "${clientName}${clientCompany ? ` (${clientCompany})` : ''}". If you don't know their registered address, use their last known business address.`],
        ['Particulars of Claim', 'Copy the text from Section 1 of this pack exactly as written. Do not paraphrase — use the exact statutory language.'],
        ['Claim amount', `Enter the total: ${formatCurrency(total)}. Also enter the daily rate of ${formatCurrency(dailyRate)} in the interest fields.`],
        ['Pay the court fee', 'See the fee table below. Pay by debit or credit card online. The fee is added to your claim and recovered from the defendant if you win.'],
        ['Submit and await', 'After submission you\'ll receive a claim number. The defendant has 14 days to respond. If they don\'t, you can apply for a default judgment.'],
      ].map(([step, desc], i) =>
        React.createElement(View, { style: { flexDirection: 'row', marginBottom: 12 }, key: step as string },
          React.createElement(View, { style: S.numberCircle },
            React.createElement(Text, { style: S.numberText }, String(i + 1)),
          ),
          React.createElement(View, { style: S.stepContent },
            React.createElement(Text, { style: S.h3 }, step as string),
            React.createElement(Text, { style: { fontSize: 9, color: '#555', lineHeight: 1.6 } }, desc as string),
          ),
        )
      ),

      React.createElement(Text, { style: S.h2 }, 'Court Fee Table (England & Wales 2024)'),
      React.createElement(View, { style: { ...S.tableHeader, borderRadius: '3 3 0 0' } },
        React.createElement(Text, { style: { ...S.tableHeaderText, flex: 2 } }, 'Claim Value'),
        React.createElement(Text, { style: { ...S.tableHeaderText, flex: 1, textAlign: 'right' } }, 'Court Fee'),
      ),
      ...[
        ['Up to £300', '£35'],
        ['£300.01 – £500', '£50'],
        ['£500.01 – £1,000', '£70'],
        ['£1,000.01 – £1,500', '£80'],
        ['£1,500.01 – £3,000', '£115'],
        ['£3,000.01 – £5,000', '£185'],
        ['£5,000.01 – £10,000', '£410'],
        ['Over £10,000', '5% of claim value'],
      ].map(([range, fee], i) =>
        React.createElement(View, { style: i % 2 === 0 ? S.feeRow : { ...S.feeRow, backgroundColor: '#f9f9f9' }, key: range as string },
          React.createElement(Text, { style: { ...S.feeRange, fontSize: 9 } }, range as string),
          React.createElement(Text, { style: { ...S.feeCost, fontSize: 9 } }, fee as string),
        )
      ),
      React.createElement(Text, { style: { fontSize: 8.5, color: '#888', marginTop: 8 } },
        `Your estimated court fee: ${formatCurrency(total <= 300 ? 35 : total <= 500 ? 50 : total <= 1000 ? 70 : total <= 1500 ? 80 : total <= 3000 ? 115 : total <= 5000 ? 185 : total <= 10000 ? 410 : total * 0.05)} (recoverable from defendant on judgment)`
      ),

      React.createElement(View, { style: { ...S.warningBox, marginTop: 16 } },
        React.createElement(Text, { style: { fontFamily: 'Helvetica-Bold', color: '#cc0000', fontSize: 9, marginBottom: 5 } }, 'IMPORTANT — READ BEFORE FILING'),
        React.createElement(Text, { style: S.warningText },
          'This pack provides guidance only and does not constitute legal advice. For claims above £10,000 or complex disputes, consider instructing a solicitor. Ensure all information is accurate before submitting — you cannot easily amend a claim once filed.'
        ),
      ),
      React.createElement(Text, { style: S.footer },
        `Irvo CCJ Pack | ${creditorName} v ${clientName} | Invoice ${invoiceNumber} | Section 4 of 4 | ${todayStr}`
      )
    )
  )
}

export async function generateCcjPack(props: CcjPackProps): Promise<Buffer> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const element = React.createElement(CcjPackDocument, props) as any
  return renderToBuffer(element)
}
