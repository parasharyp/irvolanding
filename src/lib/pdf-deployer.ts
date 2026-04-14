import React from 'react'
import { Document, Page, Text, View, StyleSheet, renderToBuffer } from '@react-pdf/renderer'
import type { DeployerPack } from '@/lib/ai/deployer'

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
  meta: { fontSize: 9, color: MUTED, marginTop: 4 },
  tableHeader: { flexDirection: 'row', backgroundColor: '#f3f4f6', paddingVertical: 6, paddingHorizontal: 4, fontWeight: 700 },
  tableRow: { flexDirection: 'row', borderTop: `1px solid ${BORDER}`, paddingVertical: 6 },
  col1: { width: '18%', paddingHorizontal: 4 },
  col2: { width: '24%', paddingHorizontal: 4 },
  col3: { width: '34%', paddingHorizontal: 4 },
  col4: { width: '24%', paddingHorizontal: 4 },
  sysHeader: { flexDirection: 'row', backgroundColor: '#f3f4f6', paddingVertical: 6, paddingHorizontal: 4, fontWeight: 700 },
  sysRow: { flexDirection: 'row', borderTop: `1px solid ${BORDER}`, paddingVertical: 6 },
  sysCol1: { width: '40%', paddingHorizontal: 4 },
  sysCol2: { width: '20%', paddingHorizontal: 4 },
  sysCol3: { width: '40%', paddingHorizontal: 4 },
  footer: { position: 'absolute', bottom: 26, left: 44, right: 44, fontSize: 8, color: MUTED, textAlign: 'center' },
})

interface DeployerPdfProps {
  pack: DeployerPack
  exportedAt: string
}

function DeployerDocument({ pack, exportedAt }: DeployerPdfProps) {
  return h(Document, {},
    h(Page, { size: 'A4', style: s.page },
      h(View, { style: s.cover },
        h(Text, { style: s.coverTitle }, 'Deployer Obligations Pack'),
        h(Text, { style: s.coverSubtitle }, 'EU AI Act Article 26 — operational compliance'),
        h(Text, { style: s.coverOrg }, pack.organisationName),
        h(Text, { style: s.coverMeta }, `Generated ${exportedAt}`),
        h(Text, { style: s.coverMeta }, 'Prepared via Irvo — irvo.co.uk'),
      ),
      h(View, { style: s.footer, fixed: true },
        h(Text, {}, 'This pack supports Article 26 compliance. It is not legal advice.'),
      ),
    ),
    h(Page, { size: 'A4', style: s.page },
      h(Text, { style: s.h1 }, '1. Systems covered'),
      pack.systemsCovered.length > 0
        ? h(View, {},
            h(View, { style: s.sysHeader },
              h(Text, { style: s.sysCol1 }, 'System'),
              h(Text, { style: s.sysCol2 }, 'Risk tier'),
              h(Text, { style: s.sysCol3 }, 'Annex III category'),
            ),
            ...pack.systemsCovered.map((sys, i) =>
              h(View, { key: i, style: s.sysRow, wrap: false },
                h(Text, { style: s.sysCol1 }, sys.systemName),
                h(Text, { style: s.sysCol2 }, sys.riskTier),
                h(Text, { style: s.sysCol3 }, sys.annexCategory ?? '—'),
              )
            ),
          )
        : h(Text, { style: s.body }, 'No classified systems on record.'),

      h(Text, { style: s.h1 }, '2. Human oversight (Art. 26(2))'),
      h(Text, { style: s.h2 }, 'Designated role'),
      h(Text, { style: s.body }, pack.humanOversight.designatedRole),
      h(Text, { style: s.h2 }, 'Required competencies'),
      h(Text, { style: s.body }, pack.humanOversight.competencies),
      h(Text, { style: s.h2 }, 'Review cadence'),
      h(Text, { style: s.body }, pack.humanOversight.reviewCadence),
      h(Text, { style: s.h2 }, 'Escalation procedure'),
      h(Text, { style: s.body }, pack.humanOversight.escalationProcedure),

      h(Text, { style: s.h1 }, '3. Input data controls (Art. 26(3))'),
      h(Text, { style: s.body }, pack.inputDataControls),

      h(Text, { style: s.h1 }, '4. Monitoring & logging (Art. 26(4)–(5))'),
      h(Text, { style: s.h2 }, 'Procedure'),
      h(Text, { style: s.body }, pack.monitoringAndLogging.procedure),
      h(Text, { style: s.h2 }, 'Log retention'),
      h(Text, { style: s.body }, pack.monitoringAndLogging.logRetention),
      h(Text, { style: s.h2 }, 'Incident triggers'),
      h(Text, { style: s.body }, pack.monitoringAndLogging.incidentTriggers),

      h(Text, { style: s.h1 }, '5. Serious incident procedure (Art. 73)'),
      h(View, { style: s.callout }, h(Text, {}, pack.seriousIncidentProcedure)),
    ),
    h(Page, { size: 'A4', style: s.page },
      h(Text, { style: s.h1 }, '6. Worker notification (Art. 26(7))'),
      h(Text, { style: s.body }, pack.workerNotification),

      h(Text, { style: s.h1 }, '7. Affected persons notification (Art. 26(11))'),
      h(Text, { style: s.body }, pack.affectedPersonsNotification),

      h(Text, { style: s.h1 }, '8. DPIA triggers (Art. 26(9) + GDPR Art. 35)'),
      h(Text, { style: s.body }, pack.dpiaTriggers),

      h(Text, { style: s.h1 }, '9. Provider IFU compliance (Art. 26(1))'),
      h(Text, { style: s.body }, pack.providerIfuCompliance),

      h(Text, { style: s.h1 }, '10. Cooperation with authorities (Art. 26(12))'),
      h(Text, { style: s.body }, pack.cooperationWithAuthorities),

      h(Text, { style: s.h1 }, '11. Obligations appendix'),
      h(View, { style: s.tableHeader },
        h(Text, { style: s.col1 }, 'Article'),
        h(Text, { style: s.col2 }, 'Obligation'),
        h(Text, { style: s.col3 }, 'Summary'),
        h(Text, { style: s.col4 }, 'Evidence required'),
      ),
      ...pack.obligationsAppendix.map((o, i) =>
        h(View, { key: i, style: s.tableRow, wrap: false },
          h(Text, { style: s.col1 }, o.article),
          h(Text, { style: s.col2 }, o.title),
          h(Text, { style: s.col3 }, o.summary),
          h(Text, { style: s.col4 }, o.evidenceRequired),
        )
      ),

      h(View, { style: s.footer, fixed: true },
        h(Text, {}, `${pack.organisationName} — Deployer Obligations Pack — ${exportedAt}`),
      ),
    ),
  )
}

export async function renderDeployerPdf(pack: DeployerPack, exportedAt: string): Promise<Buffer> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const element = h(DeployerDocument, { pack, exportedAt }) as any
  return renderToBuffer(element) as unknown as Promise<Buffer>
}
