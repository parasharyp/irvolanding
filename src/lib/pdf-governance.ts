import React from 'react'
import { Document, Page, Text, View, StyleSheet, renderToBuffer } from '@react-pdf/renderer'
import type { GovernancePack } from '@/lib/ai/governance'

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
  coverMeta: { fontSize: 10, color: MUTED, marginTop: 6 },
  h1: { fontSize: 16, fontWeight: 700, marginTop: 22, marginBottom: 8, color: ACCENT },
  h2: { fontSize: 12, fontWeight: 700, marginTop: 14, marginBottom: 4 },
  body: { marginBottom: 8 },
  callout: { backgroundColor: '#f3f4f6', padding: 10, borderLeft: `3px solid ${ACCENT}`, marginTop: 6, marginBottom: 8 },
  tableHeader: { flexDirection: 'row', backgroundColor: '#f3f4f6', paddingVertical: 6, paddingHorizontal: 4, fontWeight: 700 },
  tableRow: { flexDirection: 'row', borderTop: `1px solid ${BORDER}`, paddingVertical: 6 },
  rCol1: { width: '30%', paddingHorizontal: 4 },
  rCol2: { width: '70%', paddingHorizontal: 4 },
  raciCol1: { width: '32%', paddingHorizontal: 4 },
  raciCol2: { width: '17%', paddingHorizontal: 4 },
  raciCol3: { width: '17%', paddingHorizontal: 4 },
  raciCol4: { width: '17%', paddingHorizontal: 4 },
  raciCol5: { width: '17%', paddingHorizontal: 4 },
  signBlock: { marginTop: 30, padding: 18, border: `1px solid ${BORDER}` },
  signField: { borderBottom: `1px solid ${DARK}`, height: 14, marginBottom: 14, marginTop: 14 },
  meta: { fontSize: 9, color: MUTED, marginTop: 4 },
  footer: { position: 'absolute', bottom: 26, left: 44, right: 44, fontSize: 8, color: MUTED, textAlign: 'center' },
})

interface GovernancePdfProps { pack: GovernancePack; exportedAt: string }

function GovernanceDocument({ pack, exportedAt }: GovernancePdfProps) {
  return h(Document, {},
    h(Page, { size: 'A4', style: s.page },
      h(View, { style: s.cover },
        h(Text, { style: s.coverTitle }, 'AI Governance Pack'),
        h(Text, { style: s.coverSubtitle }, 'Policy · Roles · RACI · Committee · Records'),
        h(Text, { style: s.coverOrg }, pack.organisationName),
        h(Text, { style: s.coverMeta }, `Scale: ${pack.organisationScale}`),
        h(Text, { style: s.coverMeta }, `Generated ${exportedAt}`),
        h(Text, { style: s.coverMeta }, 'Prepared via Irvo — irvo.co.uk'),
      ),
      h(View, { style: s.footer, fixed: true },
        h(Text, {}, 'This pack operationalises EU AI Act obligations. It is not legal advice.'),
      ),
    ),
    h(Page, { size: 'A4', style: s.page },
      h(Text, { style: s.h1 }, '1. AI Policy Statement'),
      h(View, { style: s.callout }, h(Text, {}, pack.aiPolicyStatement)),

      h(Text, { style: s.h1 }, '2. Scope'),
      h(Text, { style: s.body }, pack.scope),

      h(Text, { style: s.h1 }, '3. Principles'),
      h(Text, { style: s.body }, pack.principles),

      h(Text, { style: s.h1 }, '4. Roles & responsibilities'),
      h(View, { style: s.tableHeader },
        h(Text, { style: s.rCol1 }, 'Role'),
        h(Text, { style: s.rCol2 }, 'Responsibilities'),
      ),
      ...pack.rolesAndResponsibilities.map((r, i) =>
        h(View, { key: i, style: s.tableRow, wrap: false },
          h(Text, { style: s.rCol1 }, r.role),
          h(Text, { style: s.rCol2 }, r.responsibilities),
        )
      ),
    ),
    h(Page, { size: 'A4', style: s.page },
      h(Text, { style: s.h1 }, '5. RACI matrix'),
      h(View, { style: s.tableHeader },
        h(Text, { style: s.raciCol1 }, 'Activity'),
        h(Text, { style: s.raciCol2 }, 'Responsible'),
        h(Text, { style: s.raciCol3 }, 'Accountable'),
        h(Text, { style: s.raciCol4 }, 'Consulted'),
        h(Text, { style: s.raciCol5 }, 'Informed'),
      ),
      ...pack.raciMatrix.map((r, i) =>
        h(View, { key: i, style: s.tableRow, wrap: false },
          h(Text, { style: s.raciCol1 }, r.activity),
          h(Text, { style: s.raciCol2 }, r.responsible),
          h(Text, { style: s.raciCol3 }, r.accountable),
          h(Text, { style: s.raciCol4 }, r.consulted),
          h(Text, { style: s.raciCol5 }, r.informed),
        )
      ),

      h(Text, { style: s.h1 }, '6. AI committee charter'),
      h(Text, { style: s.h2 }, 'Purpose'), h(Text, { style: s.body }, pack.committeeCharter.purpose),
      h(Text, { style: s.h2 }, 'Membership'), h(Text, { style: s.body }, pack.committeeCharter.membership),
      h(Text, { style: s.h2 }, 'Meeting cadence'), h(Text, { style: s.body }, pack.committeeCharter.meetingCadence),
      h(Text, { style: s.h2 }, 'Decision rights'), h(Text, { style: s.body }, pack.committeeCharter.decisionRights),

      h(Text, { style: s.h1 }, '7. Record-keeping'),
      h(Text, { style: s.body }, pack.recordKeeping),
    ),
    h(Page, { size: 'A4', style: s.page },
      h(Text, { style: s.h1 }, '8. Approved uses'),
      h(Text, { style: s.body }, pack.approvedUseList),

      h(Text, { style: s.h1 }, '9. Prohibited uses'),
      h(Text, { style: s.body }, pack.prohibitedUses),

      h(Text, { style: s.h1 }, '10. Vendor assessment'),
      h(Text, { style: s.body }, pack.vendorAssessment),

      h(Text, { style: s.h1 }, '11. Training requirements'),
      h(Text, { style: s.body }, pack.trainingRequirements),

      h(Text, { style: s.h1 }, '12. Review cadence'),
      h(Text, { style: s.body }, pack.reviewCadence),

      h(View, { style: s.signBlock },
        h(Text, { style: { fontWeight: 700, marginBottom: 8 } }, 'Policy sign-off'),
        h(Text, {}, pack.signOffStatement),
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
        h(Text, {}, `${pack.organisationName} — AI Governance Pack — ${exportedAt}`),
      ),
    ),
  )
}

export async function renderGovernancePdf(pack: GovernancePack, exportedAt: string): Promise<Buffer> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const element = h(GovernanceDocument, { pack, exportedAt }) as any
  return renderToBuffer(element) as unknown as Promise<Buffer>
}
