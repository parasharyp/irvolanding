import React from 'react'
import { Document, Page, Text, View, StyleSheet, renderToBuffer } from '@react-pdf/renderer'
import type { RegistrationDossier } from '@/lib/ai/registration'

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
  cCol1: { width: '50%', paddingHorizontal: 4 },
  cCol2: { width: '15%', paddingHorizontal: 4 },
  cCol3: { width: '35%', paddingHorizontal: 4 },
  field: { marginBottom: 10 },
  fieldLabel: { fontSize: 10, color: MUTED, marginBottom: 2, textTransform: 'uppercase', letterSpacing: 1 },
  footer: { position: 'absolute', bottom: 26, left: 44, right: 44, fontSize: 8, color: MUTED, textAlign: 'center' },
})

interface RegistrationPdfProps { dossier: RegistrationDossier; exportedAt: string }

function Field({ label, value }: { label: string; value: string }) {
  return h(View, { style: s.field },
    h(Text, { style: s.fieldLabel }, label),
    h(Text, {}, value),
  )
}

function RegistrationDocument({ dossier, exportedAt }: RegistrationPdfProps) {
  return h(Document, {},
    h(Page, { size: 'A4', style: s.page },
      h(View, { style: s.cover },
        h(Text, { style: s.coverTitle }, 'EU AI Database Registration Dossier'),
        h(Text, { style: s.coverSubtitle }, 'EU AI Act Article 49 · Annex VIII'),
        h(Text, { style: s.coverOrg }, dossier.organisationName),
        h(Text, { style: s.coverSystem }, dossier.systemName),
        h(Text, { style: s.coverMeta }, `Role: ${dossier.role}`),
        h(Text, { style: s.coverMeta }, `Risk tier: ${dossier.riskTier}${dossier.annexCategory ? ` · ${dossier.annexCategory}` : ''}`),
        h(Text, { style: s.coverMeta }, `Generated ${exportedAt}`),
        h(Text, { style: s.coverMeta }, 'Prepared via Irvo — irvo.co.uk'),
      ),
      h(View, { style: s.footer, fixed: true },
        h(Text, {}, 'Preparatory dossier for EU database registration. Not a legal filing.'),
      ),
    ),
    h(Page, { size: 'A4', style: s.page },
      h(Text, { style: s.h1 }, '1. Provider identification (Annex VIII §1)'),
      h(Field, { label: 'Provider legal name', value: dossier.providerName }),
      h(Field, { label: 'Authorised representative (where applicable)', value: dossier.authorisedRepresentative }),
      h(Field, { label: 'Trade name(s) of the AI system', value: dossier.tradeName }),

      h(Text, { style: s.h1 }, '2. AI system description'),
      h(Field, { label: 'Intended purpose', value: dossier.systemIntendedPurpose }),
      h(Field, { label: 'Description of the system and main components', value: dossier.systemDescription }),
      h(Field, { label: 'Annex III reference (point / sub-point)', value: dossier.annexIIIReference }),
      h(Field, { label: 'Status of the system', value: dossier.statusOfSystem }),
      h(Field, { label: 'Member States where on the market or in service', value: dossier.memberStatesWhereAvailable }),

      h(Text, { style: s.h1 }, '3. Conformity and instructions for use'),
      h(Field, { label: 'EU declaration of conformity (Art. 47)', value: dossier.euDeclarationOfConformity }),
      h(Field, { label: 'Summary of instructions for use (Art. 13)', value: dossier.instructionsForUseSummary }),
      h(Field, { label: 'Additional information', value: dossier.additionalInformation }),
    ),
    h(Page, { size: 'A4', style: s.page },
      h(Text, { style: s.h1 }, '4. Deployer information (where applicable)'),
      h(Field, { label: 'Deployer contact', value: dossier.deployerContact }),
      h(Field, { label: 'Deployer-specific intended use', value: dossier.deployerIntendedUse }),
      h(Field, { label: 'FRIA reference (Art. 27)', value: dossier.deployerFriaReference }),

      h(Text, { style: s.h1 }, '5. Submission readiness checklist'),
      h(View, { style: s.tableHeader },
        h(Text, { style: s.cCol1 }, 'Item'),
        h(Text, { style: s.cCol2 }, 'Ready'),
        h(Text, { style: s.cCol3 }, 'Evidence'),
      ),
      ...dossier.submissionChecklist.map((c, i) =>
        h(View, { key: i, style: s.tableRow, wrap: false },
          h(Text, { style: s.cCol1 }, c.item),
          h(Text, { style: s.cCol2 }, c.ready),
          h(Text, { style: s.cCol3 }, c.evidence),
        )
      ),

      h(Text, { style: s.h1 }, '6. Notes'),
      h(View, { style: s.callout }, h(Text, {}, dossier.notes)),

      h(View, { style: s.footer, fixed: true },
        h(Text, {}, `${dossier.organisationName} — Art. 49 Registration Dossier — ${dossier.systemName} — ${exportedAt}`),
      ),
    ),
  )
}

export async function renderRegistrationPdf(dossier: RegistrationDossier, exportedAt: string): Promise<Buffer> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const element = h(RegistrationDocument, { dossier, exportedAt }) as any
  return renderToBuffer(element) as unknown as Promise<Buffer>
}
