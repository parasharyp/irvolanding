import React from 'react'
import { Document, Page, Text, View, StyleSheet, renderToBuffer } from '@react-pdf/renderer'
import type { TransparencyPack } from '@/lib/ai/transparency'

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
  snippet: { fontFamily: 'Courier', fontSize: 9, backgroundColor: '#f6f6f6', padding: 10, marginTop: 4, marginBottom: 8, border: `1px solid ${BORDER}` },
  callout: { backgroundColor: '#f3f4f6', padding: 10, borderLeft: `3px solid ${ACCENT}`, marginTop: 6, marginBottom: 8 },
  meta: { fontSize: 9, color: MUTED, marginTop: 4 },
  footer: { position: 'absolute', bottom: 26, left: 44, right: 44, fontSize: 8, color: MUTED, textAlign: 'center' },
})

interface TransparencyPdfProps {
  pack: TransparencyPack
  exportedAt: string
}

function TransparencyDocument({ pack, exportedAt }: TransparencyPdfProps) {
  return h(Document, {},
    h(Page, { size: 'A4', style: s.page },
      h(View, { style: s.cover },
        h(Text, { style: s.coverTitle }, 'Transparency Disclosure Pack'),
        h(Text, { style: s.coverSubtitle }, 'EU AI Act Article 50 — ready-to-paste copy'),
        h(Text, { style: s.coverOrg }, pack.organisationName),
        h(Text, { style: s.coverMeta }, `Generated ${exportedAt}`),
        h(Text, { style: s.coverMeta }, 'Prepared via Irvo — irvo.co.uk'),
      ),
      h(View, { style: s.footer, fixed: true },
        h(Text, {}, 'This pack supports Article 50 compliance. It is not legal advice.'),
      ),
    ),
    h(Page, { size: 'A4', style: s.page },
      h(Text, { style: s.h1 }, '1. Chat widget disclosures'),
      h(Text, { style: s.h2 }, 'Short variant (widget header / launcher)'),
      h(View, { style: s.callout }, h(Text, {}, pack.chatWidgetDisclosures.shortVariant)),
      h(Text, { style: s.h2 }, 'Warm variant (first message / greeting)'),
      h(View, { style: s.callout }, h(Text, {}, pack.chatWidgetDisclosures.warmVariant)),

      h(Text, { style: s.h1 }, '2. Voice agent opening line'),
      h(View, { style: s.callout }, h(Text, {}, pack.voiceAgentOpening)),

      h(Text, { style: s.h1 }, '3. Generative output watermark (C2PA)'),
      h(Text, { style: s.body }, pack.generativeWatermark.description),
      h(Text, { style: s.h2 }, 'Illustrative C2PA manifest snippet'),
      h(Text, { style: s.snippet }, pack.generativeWatermark.c2paSnippetExample),

      h(Text, { style: s.h1 }, '4. Terms of Service clause'),
      h(Text, { style: s.body }, pack.termsOfServiceClause),

      h(Text, { style: s.h1 }, '5. Privacy notice paragraph'),
      h(Text, { style: s.body }, pack.privacyNoticeParagraph),

      h(Text, { style: s.h1 }, '6. Emotion-recognition / biometric notice'),
      h(Text, { style: s.body }, pack.emotionOrBiometricNotice),

      h(Text, { style: s.h1 }, '7. Deployer notes'),
      h(Text, { style: s.body }, pack.deployerNotes),

      h(View, { style: s.footer, fixed: true },
        h(Text, {}, `${pack.organisationName} — Transparency Pack — ${exportedAt}`),
      ),
    ),
  )
}

export async function renderTransparencyPdf(pack: TransparencyPack, exportedAt: string): Promise<Buffer> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const element = h(TransparencyDocument, { pack, exportedAt }) as any
  return renderToBuffer(element) as unknown as Promise<Buffer>
}
