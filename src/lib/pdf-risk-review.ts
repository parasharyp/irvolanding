import React from 'react'
import { Document, Page, Text, View, StyleSheet, renderToBuffer } from '@react-pdf/renderer'
import type { RiskReviewReport } from '@/lib/ai/risk-review'

const h = React.createElement
const DARK = '#1a1a1a'
const MUTED = '#555'
const ACCENT = '#00857a'
const BORDER = '#e0e0e0'

const s = StyleSheet.create({
  page: { fontFamily: 'Helvetica', fontSize: 10.5, padding: 44, color: DARK, lineHeight: 1.45 },
  cover: { paddingTop: 120, textAlign: 'center' },
  coverTitle: { fontSize: 26, fontWeight: 700, marginBottom: 12 },
  coverSubtitle: { fontSize: 14, color: MUTED, marginBottom: 80 },
  coverOrg: { fontSize: 18, fontWeight: 700, color: ACCENT },
  coverSystem: { fontSize: 13, color: DARK, marginTop: 14 },
  coverMeta: { fontSize: 10, color: MUTED, marginTop: 6 },
  h1: { fontSize: 16, fontWeight: 700, marginTop: 22, marginBottom: 8, color: ACCENT },
  h2: { fontSize: 12, fontWeight: 700, marginTop: 14, marginBottom: 4 },
  body: { marginBottom: 8 },
  callout: { backgroundColor: '#f3f4f6', padding: 10, borderLeft: `3px solid ${ACCENT}`, marginTop: 6, marginBottom: 8 },
  tableHeader: { flexDirection: 'row', backgroundColor: '#f3f4f6', paddingVertical: 6, paddingHorizontal: 4, fontWeight: 700 },
  tableRow: { flexDirection: 'row', borderTop: `1px solid ${BORDER}`, paddingVertical: 6 },
  rCol1: { width: '34%', paddingHorizontal: 4 },
  rCol2: { width: '22%', paddingHorizontal: 4 },
  rCol3: { width: '14%', paddingHorizontal: 4 },
  rCol4: { width: '14%', paddingHorizontal: 4 },
  rCol5: { width: '16%', paddingHorizontal: 4 },
  aCol1: { width: '55%', paddingHorizontal: 4 },
  aCol2: { width: '25%', paddingHorizontal: 4 },
  aCol3: { width: '20%', paddingHorizontal: 4 },
  signBlock: { marginTop: 30, padding: 18, border: `1px solid ${BORDER}` },
  signField: { borderBottom: `1px solid ${DARK}`, height: 14, marginBottom: 14, marginTop: 14 },
  meta: { fontSize: 9, color: MUTED, marginTop: 4 },
  footer: { position: 'absolute', bottom: 26, left: 44, right: 44, fontSize: 8, color: MUTED, textAlign: 'center' },
})

interface RiskReviewPdfProps { report: RiskReviewReport; exportedAt: string }

function RiskReviewDocument({ report, exportedAt }: RiskReviewPdfProps) {
  return h(Document, {},
    h(Page, { size: 'A4', style: s.page },
      h(View, { style: s.cover },
        h(Text, { style: s.coverTitle }, 'Annual Risk-Management Review'),
        h(Text, { style: s.coverSubtitle }, 'EU AI Act Article 9'),
        h(Text, { style: s.coverOrg }, report.organisationName),
        h(Text, { style: s.coverSystem }, report.systemName),
        h(Text, { style: s.coverMeta }, `Period: ${report.reviewPeriod}`),
        h(Text, { style: s.coverMeta }, `Risk tier: ${report.riskTier}${report.annexCategory ? ` · ${report.annexCategory}` : ''}`),
        h(Text, { style: s.coverMeta }, `Generated ${exportedAt}`),
        h(Text, { style: s.coverMeta }, 'Prepared via Irvo — irvo.co.uk'),
      ),
      h(View, { style: s.footer, fixed: true },
        h(Text, {}, 'This review supports Article 9 compliance. It is not legal advice.'),
      ),
    ),
    h(Page, { size: 'A4', style: s.page },
      h(Text, { style: s.h1 }, '1. Executive summary'),
      h(View, { style: s.callout }, h(Text, {}, report.executiveSummary)),

      h(Text, { style: s.h1 }, '2. Identified risks'),
      h(View, { style: s.tableHeader },
        h(Text, { style: s.rCol1 }, 'Risk'),
        h(Text, { style: s.rCol2 }, 'Source'),
        h(Text, { style: s.rCol3 }, 'Severity'),
        h(Text, { style: s.rCol4 }, 'Likelihood'),
        h(Text, { style: s.rCol5 }, 'Status'),
      ),
      ...report.identifiedRisks.map((r, i) =>
        h(View, { key: i, style: s.tableRow, wrap: false },
          h(Text, { style: s.rCol1 }, r.risk),
          h(Text, { style: s.rCol2 }, r.source),
          h(Text, { style: s.rCol3 }, r.severity),
          h(Text, { style: s.rCol4 }, r.likelihood),
          h(Text, { style: s.rCol5 }, r.status),
        )
      ),

      h(Text, { style: s.h1 }, '3. Incidents reviewed'),
      h(Text, { style: s.body }, report.incidentsReviewed),

      h(Text, { style: s.h1 }, '4. Post-market monitoring'),
      h(Text, { style: s.body }, report.postMarketMonitoring),

      h(Text, { style: s.h1 }, '5. Testing & evaluation'),
      h(Text, { style: s.body }, report.testingAndEvaluation),
    ),
    h(Page, { size: 'A4', style: s.page },
      h(Text, { style: s.h1 }, '6. Risk-mitigation updates'),
      h(Text, { style: s.body }, report.riskMitigationUpdates),

      h(Text, { style: s.h1 }, '7. Residual risk acceptability'),
      h(Text, { style: s.body }, report.residualRiskAcceptability),

      h(Text, { style: s.h1 }, '8. Data & input changes'),
      h(Text, { style: s.body }, report.dataAndInputChanges),

      h(Text, { style: s.h1 }, '9. Human oversight review'),
      h(Text, { style: s.body }, report.humanOversightReview),

      h(Text, { style: s.h1 }, '10. Actions for next period'),
      h(View, { style: s.tableHeader },
        h(Text, { style: s.aCol1 }, 'Action'),
        h(Text, { style: s.aCol2 }, 'Owner'),
        h(Text, { style: s.aCol3 }, 'Due'),
      ),
      ...report.actionsForNextPeriod.map((a, i) =>
        h(View, { key: i, style: s.tableRow, wrap: false },
          h(Text, { style: s.aCol1 }, a.action),
          h(Text, { style: s.aCol2 }, a.owner),
          h(Text, { style: s.aCol3 }, a.due),
        )
      ),

      h(View, { style: s.signBlock },
        h(Text, { style: { fontWeight: 700, marginBottom: 8 } }, 'Sign-off'),
        h(Text, {}, report.signOffStatement),
        h(Text, { style: s.signField }, ''),
        h(Text, { style: s.meta }, 'Full name'),
        h(Text, { style: s.signField }, ''),
        h(Text, { style: s.meta }, 'Role'),
        h(Text, { style: s.signField }, ''),
        h(Text, { style: s.meta }, 'Date'),
        h(Text, { style: s.signField }, ''),
        h(Text, { style: s.meta }, 'Signature'),
      ),

      h(View, { style: s.footer, fixed: true },
        h(Text, {}, `${report.organisationName} — Art. 9 Review — ${report.systemName} — ${exportedAt}`),
      ),
    ),
  )
}

export async function renderRiskReviewPdf(report: RiskReviewReport, exportedAt: string): Promise<Buffer> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const element = h(RiskReviewDocument, { report, exportedAt }) as any
  return renderToBuffer(element) as unknown as Promise<Buffer>
}
