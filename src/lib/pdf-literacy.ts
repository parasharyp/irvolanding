import React from 'react'
import { Document, Page, Text, View, StyleSheet, renderToBuffer } from '@react-pdf/renderer'
import type { LiteracyBriefing } from '@/lib/ai/literacy'

const h = React.createElement

const DARK = '#1a1a1a'
const MUTED = '#555'
const BORDER = '#e0e0e0'
const ACCENT = '#00857a'

const s = StyleSheet.create({
  page: { fontFamily: 'Helvetica', fontSize: 10.5, padding: 44, color: DARK, lineHeight: 1.45 },
  cover: { paddingTop: 120, textAlign: 'center' },
  coverTitle: { fontSize: 26, fontWeight: 700, marginBottom: 12 },
  coverSubtitle: { fontSize: 14, color: MUTED, marginBottom: 80 },
  coverOrg: { fontSize: 18, fontWeight: 700, color: ACCENT },
  coverMeta: { fontSize: 10, color: MUTED, marginTop: 6 },
  h1: { fontSize: 16, fontWeight: 700, marginTop: 22, marginBottom: 8, color: ACCENT },
  h2: { fontSize: 12, fontWeight: 700, marginTop: 14, marginBottom: 6 },
  body: { marginBottom: 8 },
  meta: { fontSize: 9, color: MUTED, marginTop: 4 },
  callout: { backgroundColor: '#f3f4f6', padding: 10, borderLeft: `3px solid ${ACCENT}`, marginTop: 6, marginBottom: 8 },
  tableRow: { flexDirection: 'row', borderTop: `1px solid ${BORDER}`, paddingVertical: 6 },
  tableHeader: { flexDirection: 'row', backgroundColor: '#f3f4f6', paddingVertical: 6, paddingHorizontal: 4, fontWeight: 700 },
  col1: { width: '30%', paddingHorizontal: 4 },
  col2: { width: '15%', paddingHorizontal: 4 },
  col3: { width: '55%', paddingHorizontal: 4 },
  roleRow: { borderTop: `1px solid ${BORDER}`, paddingVertical: 8 },
  roleName: { fontWeight: 700, marginBottom: 4 },
  ack: { marginTop: 30, padding: 18, border: `1px solid ${BORDER}` },
  ackTitle: { fontWeight: 700, marginBottom: 8 },
  ackField: { borderBottom: `1px solid ${DARK}`, height: 14, marginBottom: 14, marginTop: 14 },
  footer: { position: 'absolute', bottom: 26, left: 44, right: 44, fontSize: 8, color: MUTED, textAlign: 'center' },
})

interface LiteracyPdfProps {
  briefing: LiteracyBriefing
  exportedAt: string
}

function LiteracyDocument({ briefing, exportedAt }: LiteracyPdfProps) {
  return h(Document, {},
    // Cover
    h(Page, { size: 'A4', style: s.page },
      h(View, { style: s.cover },
        h(Text, { style: s.coverTitle }, 'AI Literacy Briefing'),
        h(Text, { style: s.coverSubtitle }, 'EU AI Act Article 4 — required minimum understanding'),
        h(Text, { style: s.coverOrg }, briefing.organisationName),
        h(Text, { style: s.coverMeta }, `Generated ${exportedAt}`),
        h(Text, { style: s.coverMeta }, 'Prepared via Irvo — irvo.co.uk'),
      ),
      h(View, { style: s.footer, fixed: true },
        h(Text, {}, 'This document supports Article 4 compliance. It is not legal advice.'),
      ),
    ),
    // Body
    h(Page, { size: 'A4', style: s.page },
      h(Text, { style: s.h1 }, '1. Introduction'),
      h(Text, { style: s.body }, briefing.introduction),

      h(Text, { style: s.h1 }, '2. What AI is (and what it is not)'),
      h(Text, { style: s.body }, briefing.whatIsAi),

      h(Text, { style: s.h1 }, '3. Your organisation\'s AI systems'),
      briefing.systemsOverview.length > 0
        ? h(View, {},
            h(View, { style: s.tableHeader },
              h(Text, { style: s.col1 }, 'System'),
              h(Text, { style: s.col2 }, 'Risk tier'),
              h(Text, { style: s.col3 }, 'Capabilities & limitations'),
            ),
            ...briefing.systemsOverview.map((sys, i) =>
              h(View, { key: i, style: s.tableRow, wrap: false },
                h(Text, { style: s.col1 }, sys.systemName),
                h(Text, { style: s.col2 }, sys.riskTier),
                h(Text, { style: s.col3 }, `${sys.capabilities}\n${sys.limitations}`),
              )
            ),
          )
        : h(Text, { style: s.body }, 'No classified AI systems on record. Classify your systems in Irvo to populate this section.'),

      h(Text, { style: s.h1 }, '4. Risks staff must recognise'),
      h(View, { style: s.callout },
        h(Text, { style: s.body }, briefing.riskAwareness),
      ),

      h(Text, { style: s.h1 }, '5. Role-specific responsibilities'),
      ...briefing.rolesGuidance.map((r, i) =>
        h(View, { key: i, style: s.roleRow, wrap: false },
          h(Text, { style: s.roleName }, r.role),
          h(Text, {}, r.responsibilities),
        )
      ),

      h(Text, { style: s.h1 }, '6. Escalation path'),
      h(Text, { style: s.body }, briefing.escalationPath),

      h(Text, { style: s.h1 }, '7. Legal context'),
      h(Text, { style: s.body }, briefing.legalContext),

      h(View, { style: s.ack },
        h(Text, { style: s.ackTitle }, 'Acknowledgement'),
        h(Text, {}, briefing.acknowledgementStatement),
        h(Text, { style: s.ackField }, ''),
        h(Text, { style: s.meta }, 'Full name'),
        h(Text, { style: s.ackField }, ''),
        h(Text, { style: s.meta }, 'Role'),
        h(Text, { style: s.ackField }, ''),
        h(Text, { style: s.meta }, 'Date'),
        h(Text, { style: s.ackField }, ''),
        h(Text, { style: s.meta }, 'Signature'),
      ),

      h(View, { style: s.footer, fixed: true },
        h(Text, {}, `${briefing.organisationName} — AI Literacy Briefing — Page \u2022 ${exportedAt}`),
      ),
    ),
  )
}

export async function renderLiteracyPdf(briefing: LiteracyBriefing, exportedAt: string): Promise<Buffer> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const element = h(LiteracyDocument, { briefing, exportedAt }) as any
  return renderToBuffer(element) as unknown as Promise<Buffer>
}
