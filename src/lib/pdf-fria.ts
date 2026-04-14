import React from 'react'
import { Document, Page, Text, View, StyleSheet, renderToBuffer } from '@react-pdf/renderer'
import type { FriaReport } from '@/lib/ai/fria'

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
  rightCol1: { width: '28%', paddingHorizontal: 4 },
  rightCol2: { width: '44%', paddingHorizontal: 4 },
  rightCol3: { width: '14%', paddingHorizontal: 4 },
  rightCol4: { width: '14%', paddingHorizontal: 4 },
  grpCol1: { width: '35%', paddingHorizontal: 4 },
  grpCol2: { width: '65%', paddingHorizontal: 4 },
  signBlock: { marginTop: 30, padding: 18, border: `1px solid ${BORDER}` },
  signField: { borderBottom: `1px solid ${DARK}`, height: 14, marginBottom: 14, marginTop: 14 },
  meta: { fontSize: 9, color: MUTED, marginTop: 4 },
  footer: { position: 'absolute', bottom: 26, left: 44, right: 44, fontSize: 8, color: MUTED, textAlign: 'center' },
})

interface FriaPdfProps {
  report: FriaReport
  exportedAt: string
}

function FriaDocument({ report, exportedAt }: FriaPdfProps) {
  return h(Document, {},
    h(Page, { size: 'A4', style: s.page },
      h(View, { style: s.cover },
        h(Text, { style: s.coverTitle }, 'Fundamental Rights Impact Assessment'),
        h(Text, { style: s.coverSubtitle }, 'EU AI Act Article 27 — FRIA'),
        h(Text, { style: s.coverOrg }, report.organisationName),
        h(Text, { style: s.coverSystem }, report.systemName),
        h(Text, { style: s.coverMeta }, `Risk tier: ${report.riskTier}${report.annexCategory ? ` · ${report.annexCategory}` : ''}`),
        h(Text, { style: s.coverMeta }, `Generated ${exportedAt}`),
        h(Text, { style: s.coverMeta }, 'Prepared via Irvo — irvo.co.uk'),
      ),
      h(View, { style: s.footer, fixed: true },
        h(Text, {}, 'This assessment supports Article 27 compliance. It is not legal advice.'),
      ),
    ),
    h(Page, { size: 'A4', style: s.page },
      h(Text, { style: s.h1 }, '1. System purpose'),
      h(Text, { style: s.body }, report.systemPurpose),

      h(Text, { style: s.h1 }, '2. Deployment processes'),
      h(Text, { style: s.body }, report.deploymentProcesses),

      h(Text, { style: s.h1 }, '3. Period and frequency of use'),
      h(Text, { style: s.body }, report.periodAndFrequency),

      h(Text, { style: s.h1 }, '4. Affected groups'),
      h(View, { style: s.tableHeader },
        h(Text, { style: s.grpCol1 }, 'Group'),
        h(Text, { style: s.grpCol2 }, 'Likely impact'),
      ),
      ...report.affectedGroups.map((g, i) =>
        h(View, { key: i, style: s.tableRow, wrap: false },
          h(Text, { style: s.grpCol1 }, g.group),
          h(Text, { style: s.grpCol2 }, g.likelyImpact),
        )
      ),

      h(Text, { style: s.h1 }, '5. Fundamental rights at risk'),
      h(View, { style: s.tableHeader },
        h(Text, { style: s.rightCol1 }, 'Right'),
        h(Text, { style: s.rightCol2 }, 'Risk description'),
        h(Text, { style: s.rightCol3 }, 'Severity'),
        h(Text, { style: s.rightCol4 }, 'Likelihood'),
      ),
      ...report.fundamentalRightsAtRisk.map((r, i) =>
        h(View, { key: i, style: s.tableRow, wrap: false },
          h(Text, { style: s.rightCol1 }, r.right),
          h(Text, { style: s.rightCol2 }, r.riskDescription),
          h(Text, { style: s.rightCol3 }, r.severity),
          h(Text, { style: s.rightCol4 }, r.likelihood),
        )
      ),
    ),
    h(Page, { size: 'A4', style: s.page },
      h(Text, { style: s.h1 }, '6. Specific harms'),
      h(Text, { style: s.body }, report.specificHarms),

      h(Text, { style: s.h1 }, '7. Human oversight measures'),
      h(Text, { style: s.body }, report.humanOversightMeasures),

      h(Text, { style: s.h1 }, '8. Mitigation measures'),
      h(Text, { style: s.body }, report.mitigationMeasures),

      h(Text, { style: s.h1 }, '9. Complaint mechanism'),
      h(View, { style: s.callout }, h(Text, {}, report.complaintMechanism)),

      h(Text, { style: s.h1 }, '10. Residual risk assessment'),
      h(Text, { style: s.body }, report.residualRiskAssessment),

      h(Text, { style: s.h1 }, '11. Notification to market surveillance'),
      h(Text, { style: s.body }, report.notificationToMarketSurveillance),

      h(Text, { style: s.h1 }, '12. Review triggers'),
      h(Text, { style: s.body }, report.reviewTriggers),

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
        h(Text, {}, `${report.organisationName} — FRIA — ${report.systemName} — ${exportedAt}`),
      ),
    ),
  )
}

export async function renderFriaPdf(report: FriaReport, exportedAt: string): Promise<Buffer> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const element = h(FriaDocument, { report, exportedAt }) as any
  return renderToBuffer(element) as unknown as Promise<Buffer>
}
