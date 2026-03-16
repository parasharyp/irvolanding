import React from 'react'
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  renderToBuffer,
} from '@react-pdf/renderer'
import { Invoice, InvoiceEvent, ReminderLog, InterestCalculation } from '@/types'
import { formatCurrency, formatDate } from '@/lib/utils'

const styles = StyleSheet.create({
  page: { fontFamily: 'Helvetica', fontSize: 10, padding: 40, color: '#1a1a1a' },
  header: { marginBottom: 24 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 4 },
  subtitle: { fontSize: 12, color: '#555' },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 13, fontWeight: 'bold', marginBottom: 8, borderBottomWidth: 1, borderBottomColor: '#ddd', paddingBottom: 4 },
  row: { flexDirection: 'row', marginBottom: 4 },
  label: { width: 160, color: '#555' },
  value: { flex: 1 },
  tableHeader: { flexDirection: 'row', backgroundColor: '#f3f4f6', padding: 6, marginBottom: 2, fontWeight: 'bold' },
  tableRow: { flexDirection: 'row', padding: 6, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  col1: { flex: 2 },
  col2: { flex: 1 },
  col3: { flex: 1, textAlign: 'right' },
  legalBox: { backgroundColor: '#fef9c3', padding: 12, borderRadius: 4, marginTop: 8 },
  legalText: { fontSize: 9, color: '#713f12', lineHeight: 1.5 },
  footer: { position: 'absolute', bottom: 30, left: 40, right: 40, textAlign: 'center', fontSize: 8, color: '#999' },
})

interface EvidencePackProps {
  invoice: Invoice
  events: InvoiceEvent[]
  reminderLogs: ReminderLog[]
  interestCalc: InterestCalculation | null
  orgName: string
  clientName: string
}

function EvidencePackDocument({
  invoice,
  events,
  reminderLogs,
  interestCalc,
  orgName,
  clientName,
}: EvidencePackProps) {
  return React.createElement(
    Document,
    null,
    // Cover page
    React.createElement(
      Page,
      { size: 'A4', style: styles.page },
      React.createElement(
        View,
        { style: styles.header },
        React.createElement(Text, { style: styles.title }, 'Late Payment Evidence Pack'),
        React.createElement(Text, { style: styles.subtitle }, `Generated: ${formatDate(new Date().toISOString())}`)
      ),
      React.createElement(
        View,
        { style: styles.section },
        React.createElement(Text, { style: styles.sectionTitle }, 'Invoice Details'),
        React.createElement(View, { style: styles.row },
          React.createElement(Text, { style: styles.label }, 'Invoice Number:'),
          React.createElement(Text, { style: styles.value }, invoice.invoice_number)
        ),
        React.createElement(View, { style: styles.row },
          React.createElement(Text, { style: styles.label }, 'Creditor (You):'),
          React.createElement(Text, { style: styles.value }, orgName)
        ),
        React.createElement(View, { style: styles.row },
          React.createElement(Text, { style: styles.label }, 'Debtor (Client):'),
          React.createElement(Text, { style: styles.value }, clientName)
        ),
        React.createElement(View, { style: styles.row },
          React.createElement(Text, { style: styles.label }, 'Invoice Amount:'),
          React.createElement(Text, { style: styles.value }, formatCurrency(invoice.amount, invoice.currency))
        ),
        React.createElement(View, { style: styles.row },
          React.createElement(Text, { style: styles.label }, 'Issue Date:'),
          React.createElement(Text, { style: styles.value }, formatDate(invoice.issue_date))
        ),
        React.createElement(View, { style: styles.row },
          React.createElement(Text, { style: styles.label }, 'Due Date:'),
          React.createElement(Text, { style: styles.value }, formatDate(invoice.due_date))
        ),
        React.createElement(View, { style: styles.row },
          React.createElement(Text, { style: styles.label }, 'Status:'),
          React.createElement(Text, { style: styles.value }, invoice.status.toUpperCase())
        )
      ),
      // Reminder timeline
      React.createElement(
        View,
        { style: styles.section },
        React.createElement(Text, { style: styles.sectionTitle }, 'Reminder Timeline'),
        React.createElement(
          View,
          { style: styles.tableHeader },
          React.createElement(Text, { style: styles.col1 }, 'Date'),
          React.createElement(Text, { style: styles.col2 }, 'Stage'),
          React.createElement(Text, { style: styles.col3 }, 'Subject')
        ),
        ...reminderLogs.map((log, i) =>
          React.createElement(
            View,
            { style: styles.tableRow, key: i },
            React.createElement(Text, { style: styles.col1 }, formatDate(log.sent_at)),
            React.createElement(Text, { style: styles.col2 }, `Stage ${log.stage}`),
            React.createElement(Text, { style: styles.col3 }, log.email_subject.slice(0, 40))
          )
        )
      ),
      // Interest calculation
      interestCalc && React.createElement(
        View,
        { style: styles.section },
        React.createElement(Text, { style: styles.sectionTitle }, 'Statutory Interest Calculation'),
        React.createElement(View, { style: styles.row },
          React.createElement(Text, { style: styles.label }, 'Principal:'),
          React.createElement(Text, { style: styles.value }, formatCurrency(interestCalc.principal))
        ),
        React.createElement(View, { style: styles.row },
          React.createElement(Text, { style: styles.label }, 'Days Overdue:'),
          React.createElement(Text, { style: styles.value }, String(interestCalc.days_overdue))
        ),
        React.createElement(View, { style: styles.row },
          React.createElement(Text, { style: styles.label }, 'Interest Rate:'),
          React.createElement(Text, { style: styles.value }, `${(interestCalc.interest_rate * 100).toFixed(1)}% per annum`)
        ),
        React.createElement(View, { style: styles.row },
          React.createElement(Text, { style: styles.label }, 'Interest Amount:'),
          React.createElement(Text, { style: styles.value }, formatCurrency(interestCalc.interest_amount))
        ),
        React.createElement(View, { style: styles.row },
          React.createElement(Text, { style: styles.label }, 'Compensation Fee:'),
          React.createElement(Text, { style: styles.value }, formatCurrency(interestCalc.compensation_fee))
        ),
        React.createElement(View, { style: styles.row },
          React.createElement(Text, { style: { ...styles.label, fontWeight: 'bold' } }, 'Total Now Due:'),
          React.createElement(Text, { style: { ...styles.value, fontWeight: 'bold' } },
            formatCurrency(interestCalc.interest_amount + interestCalc.compensation_fee + interestCalc.principal)
          )
        )
      ),
      // Legal summary
      React.createElement(
        View,
        { style: styles.section },
        React.createElement(Text, { style: styles.sectionTitle }, 'Legal Basis'),
        React.createElement(
          View,
          { style: styles.legalBox },
          React.createElement(Text, { style: styles.legalText },
            'This evidence pack has been prepared pursuant to the Late Payment of Commercial Debts (Interest) Act 1998 (as amended). The creditor is entitled to claim statutory interest at 8% above the Bank of England base rate on the outstanding amount from the date payment became due. Fixed compensation is also claimable under Section 5A of the Act. This document constitutes formal notice of the creditor\'s intention to exercise statutory rights.'
          )
        )
      ),
      React.createElement(Text, { style: styles.footer },
        `Irvo — Evidence Pack for Invoice ${invoice.invoice_number} — Confidential`
      )
    )
  )
}

export async function generateEvidencePack(props: EvidencePackProps): Promise<Buffer> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const element = React.createElement(EvidencePackDocument, props) as any
  return renderToBuffer(element)
}
