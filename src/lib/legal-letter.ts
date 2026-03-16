import React from 'react'
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  renderToBuffer,
} from '@react-pdf/renderer'
import { formatCurrency, formatDate } from '@/lib/utils'

export interface LegalLetterProps {
  invoice: {
    invoice_number: string
    amount: number | string
    issue_date: string
    due_date: string
    currency?: string
  }
  interest: {
    days_overdue: number
    interest_amount: number
    compensation_fee: number
    total: number
    interest_rate: number
  }
  orgName: string
  clientName: string
  clientCompany?: string
  paymentUrl?: string
}

const S = StyleSheet.create({
  page: { fontFamily: 'Helvetica', fontSize: 10, padding: 55, color: '#111', lineHeight: 1.5 },
  right: { textAlign: 'right', marginBottom: 28 },
  bold: { fontFamily: 'Helvetica-Bold' },
  subheading: { fontFamily: 'Helvetica-Bold', fontSize: 10, marginTop: 18, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.8 },
  para: { marginBottom: 10, lineHeight: 1.65 },
  row: { flexDirection: 'row', marginBottom: 5 },
  label: { width: 220, color: '#555' },
  value: { flex: 1, fontFamily: 'Helvetica-Bold' },
  divider: { borderBottomWidth: 1, borderBottomColor: '#ccc', marginVertical: 10 },
  totalRow: { flexDirection: 'row', padding: '8 10', backgroundColor: '#f3f3f3', marginTop: 4 },
  redBorder: { borderLeftWidth: 3, borderLeftColor: '#cc0000', paddingLeft: 10, marginBottom: 20 },
  warning: { backgroundColor: '#fff8f8', borderWidth: 1, borderColor: '#cc0000', padding: 12, marginVertical: 16, borderRadius: 3 },
  warningTitle: { fontFamily: 'Helvetica-Bold', color: '#cc0000', fontSize: 10, marginBottom: 6 },
  warningText: { color: '#990000', fontSize: 9, lineHeight: 1.65 },
  bullet: { marginLeft: 10, marginBottom: 3 },
  footer: { position: 'absolute', bottom: 28, left: 55, right: 55, textAlign: 'center', fontSize: 7.5, color: '#aaa', borderTopWidth: 1, borderTopColor: '#e5e5e5', paddingTop: 7 },
  url: { color: '#0044cc' },
})

function LegalLetterDocument({ invoice, interest, orgName, clientName, clientCompany, paymentUrl }: LegalLetterProps) {
  const principal = Number(invoice.amount)
  const total = principal + interest.interest_amount + interest.compensation_fee
  const deadline = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  const deadlineStr = deadline.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
  const todayStr = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
  const ratePct = `${(interest.interest_rate * 100).toFixed(0)}%`

  const R = (l: string, v: string) =>
    React.createElement(View, { style: S.row },
      React.createElement(Text, { style: S.label }, l),
      React.createElement(Text, { style: S.value }, v)
    )

  return React.createElement(
    Document,
    null,
    React.createElement(
      Page,
      { size: 'A4', style: S.page },

      // Creditor block (right)
      React.createElement(View, { style: S.right },
        React.createElement(Text, { style: S.bold }, orgName),
        React.createElement(Text, { style: { color: '#555', fontSize: 9 } }, `Date: ${todayStr}`),
        React.createElement(Text, { style: { color: '#555', fontSize: 9 } }, 'Statutory Recovery — Irvo'),
      ),

      // Recipient block
      React.createElement(View, { style: { marginBottom: 22 } },
        React.createElement(Text, { style: S.bold }, clientName),
        clientCompany ? React.createElement(Text, { style: { color: '#555' } }, clientCompany) : null,
      ),

      // Reference banner
      React.createElement(View, { style: S.redBorder },
        React.createElement(Text, { style: { fontFamily: 'Helvetica-Bold', fontSize: 12 } },
          `FORMAL DEMAND — INVOICE ${invoice.invoice_number}`
        ),
        React.createElement(Text, { style: { fontSize: 9, color: '#555', marginTop: 3 } },
          'Late Payment of Commercial Debts (Interest) Act 1998 — Immediate Action Required'
        ),
      ),

      // Salutation + intro
      React.createElement(Text, { style: S.para }, `Dear ${clientName},`),
      React.createElement(Text, { style: S.para },
        `We write on behalf of ${orgName} regarding the above invoice which remains outstanding and unpaid. This letter constitutes a formal statutory demand for immediate payment under the Late Payment of Commercial Debts (Interest) Act 1998. Please read it carefully.`
      ),

      // Invoice details
      React.createElement(Text, { style: S.subheading }, 'Invoice Details'),
      R('Invoice Number:', invoice.invoice_number),
      R('Invoice Date:', formatDate(invoice.issue_date)),
      R('Payment Due:', formatDate(invoice.due_date)),
      R('Days Overdue:', `${interest.days_overdue} days`),
      R('Original Invoice Amount:', formatCurrency(principal, invoice.currency)),
      React.createElement(View, { style: S.divider }),

      // Amounts due
      React.createElement(Text, { style: S.subheading }, 'Total Amount Now Due'),
      R('Original Invoice Amount:', formatCurrency(principal, invoice.currency)),
      R(`Statutory Interest (${ratePct} p.a. × ${interest.days_overdue} days):`, formatCurrency(interest.interest_amount)),
      R('Fixed Compensation (s.5A of the Act):', formatCurrency(interest.compensation_fee)),
      React.createElement(View, { style: S.divider }),
      React.createElement(View, { style: S.totalRow },
        React.createElement(Text, { style: { ...S.label, fontFamily: 'Helvetica-Bold', fontSize: 11 } }, 'TOTAL NOW DUE:'),
        React.createElement(Text, { style: { flex: 1, fontFamily: 'Helvetica-Bold', fontSize: 12, color: '#cc0000' } }, formatCurrency(total)),
      ),

      // Legal basis
      React.createElement(Text, { style: S.subheading }, 'Statutory Basis'),
      React.createElement(Text, { style: S.para },
        `Pursuant to Section 1 of the Late Payment of Commercial Debts (Interest) Act 1998, statutory interest accrues at 8% above the Bank of England base rate (currently ${ratePct} per annum) from the date payment became due. Fixed compensation of ${formatCurrency(interest.compensation_fee)} is immediately due under Section 5A of the Act.`
      ),

      // Demand / warning
      React.createElement(View, { style: S.warning },
        React.createElement(Text, { style: S.warningTitle }, `PAYMENT REQUIRED BY: ${deadlineStr}`),
        React.createElement(Text, { style: S.warningText },
          'Unless full settlement is received by the date above, we reserve the right to commence County Court proceedings without further notice. This may result in:'
        ),
        React.createElement(Text, { style: { ...S.warningText, ...S.bullet } }, '\u2022  A County Court Judgment (CCJ) being registered against you'),
        React.createElement(Text, { style: { ...S.warningText, ...S.bullet } }, '\u2022  Court fees and legal costs added to the total claim'),
        React.createElement(Text, { style: { ...S.warningText, ...S.bullet } }, '\u2022  Enforcement action including attachment of earnings or charging orders'),
        React.createElement(Text, { style: { ...S.warningText, ...S.bullet } }, '\u2022  Adverse impact on your credit history and business reputation'),
      ),

      // Payment
      React.createElement(Text, { style: S.subheading }, 'How to Pay'),
      React.createElement(Text, { style: S.para },
        'To avoid further action, please make payment in full immediately via the secure online payment portal below. Statutory interest continues to accrue daily until full payment is received.'
      ),
      paymentUrl
        ? React.createElement(Text, { style: { ...S.url, marginBottom: 20, fontSize: 9 } }, paymentUrl)
        : React.createElement(Text, { style: { color: '#555', marginBottom: 20, fontSize: 9 } }, 'Please contact your creditor for payment instructions.'),

      // Sign-off
      React.createElement(Text, { style: { marginBottom: 4 } }, 'Yours faithfully,'),
      React.createElement(Text, { style: S.bold }, orgName),
      React.createElement(Text, { style: { color: '#888', fontSize: 8.5, marginTop: 4 } }, 'Represented by Irvo Statutory Recovery System'),

      // Footer
      React.createElement(Text, { style: S.footer },
        `Irvo \u2014 Formal Demand Notice | Invoice ${invoice.invoice_number} | ${todayStr} | Issued pursuant to the Late Payment of Commercial Debts (Interest) Act 1998 | For legal queries contact ${orgName}`
      ),
    )
  )
}

export async function generateLegalDemandLetter(props: LegalLetterProps): Promise<Buffer> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const element = React.createElement(LegalLetterDocument, props) as any
  return renderToBuffer(element)
}
