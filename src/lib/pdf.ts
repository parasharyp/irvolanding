import React from 'react'
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  renderToBuffer,
} from '@react-pdf/renderer'
import { AISystem, Obligation, EvidenceItem, RiskLevel } from '@/types'
import { formatDate } from '@/lib/utils'

// ─── Colours ─────────────────────────────────────────────────────────────────
const GREEN = '#36bd5f'
const AMBER = '#f59e0b'
const RED = '#e54747'
const DARK = '#1a1a1a'
const MUTED = '#555'
const LIGHT_BG = '#f3f4f6'
const BORDER = '#e0e0e0'
const SURFACE = '#fafafa'

function riskColor(level: RiskLevel | null): string {
  switch (level) {
    case 'unacceptable': return RED
    case 'high': return RED
    case 'limited': return AMBER
    case 'none': return GREEN
    default: return MUTED
  }
}

function riskLabel(level: RiskLevel | null): string {
  if (!level) return 'Unclassified'
  return level.charAt(0).toUpperCase() + level.slice(1) + ' Risk'
}

function obligationStatus(obl: Obligation, evidenceItems: EvidenceItem[]): 'complete' | 'partial' | 'missing' {
  if (obl.is_complete) return 'complete'
  const count = evidenceItems.filter(e => e.obligation_id === obl.id).length
  return count > 0 ? 'partial' : 'missing'
}

function statusColor(status: 'complete' | 'partial' | 'missing'): string {
  switch (status) {
    case 'complete': return GREEN
    case 'partial': return AMBER
    case 'missing': return RED
  }
}

function statusLabel(status: 'complete' | 'partial' | 'missing'): string {
  switch (status) {
    case 'complete': return 'Complete'
    case 'partial': return 'Partial'
    case 'missing': return 'Missing'
  }
}

function daysUntilDeadline(): number {
  const deadline = new Date('2026-08-02T00:00:00Z')
  const now = new Date()
  return Math.max(0, Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 9,
    padding: 40,
    paddingBottom: 60,
    color: DARK,
  },
  // Page header
  pageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  pageHeaderText: {
    fontSize: 7,
    color: MUTED,
  },
  // Page footer
  pageFooter: {
    position: 'absolute',
    bottom: 24,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: BORDER,
    paddingTop: 6,
  },
  footerText: {
    fontSize: 7,
    color: MUTED,
  },
  // Watermark
  watermark: {
    position: 'absolute',
    top: 300,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 72,
    color: '#e0e0e0',
    opacity: 0.3,
    fontWeight: 'bold',
    transform: 'rotate(-35deg)',
  },
  // Cover page
  coverPage: {
    fontFamily: 'Helvetica',
    fontSize: 9,
    padding: 40,
    color: DARK,
    justifyContent: 'center',
    alignItems: 'center',
  },
  coverTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
    color: DARK,
  },
  coverSubtitle: {
    fontSize: 14,
    color: MUTED,
    marginBottom: 40,
    textAlign: 'center',
  },
  coverSystemName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 6,
    textAlign: 'center',
  },
  coverOrgName: {
    fontSize: 14,
    color: MUTED,
    marginBottom: 24,
    textAlign: 'center',
  },
  coverDate: {
    fontSize: 11,
    color: MUTED,
    marginTop: 40,
    textAlign: 'center',
  },
  riskBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 4,
    marginTop: 8,
  },
  riskBadgeText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
  },
  // Content sections
  section: {
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    paddingBottom: 4,
    borderBottomWidth: 2,
    borderBottomColor: DARK,
  },
  subsectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 6,
    marginTop: 10,
    color: DARK,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  label: {
    width: 140,
    color: MUTED,
    fontSize: 9,
  },
  value: {
    flex: 1,
    fontSize: 9,
  },
  bold: {
    fontWeight: 'bold',
  },
  paragraph: {
    fontSize: 9,
    lineHeight: 1.6,
    marginBottom: 6,
    color: DARK,
  },
  // Summary cards
  summaryRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: LIGHT_BG,
    padding: 10,
    marginRight: 6,
    borderRadius: 3,
  },
  summaryCardLast: {
    flex: 1,
    backgroundColor: LIGHT_BG,
    padding: 10,
    borderRadius: 3,
  },
  summaryCardLabel: {
    fontSize: 7,
    color: MUTED,
    marginBottom: 3,
    textTransform: 'uppercase',
  },
  summaryCardValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: DARK,
  },
  // Table
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: DARK,
    padding: 6,
    marginBottom: 1,
  },
  tableHeaderText: {
    color: '#ffffff',
    fontSize: 8,
    fontWeight: 'bold',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  tableRowAlt: {
    flexDirection: 'row',
    padding: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: SURFACE,
  },
  tCol1: { flex: 0.5, fontSize: 8 },
  tCol2: { flex: 2.5, fontSize: 8 },
  tCol3: { flex: 1, fontSize: 8 },
  tCol4: { flex: 1, fontSize: 8, textAlign: 'center' },
  tCol5: { flex: 1, fontSize: 8, textAlign: 'center' },
  // Status dot
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
    marginTop: 1,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  // Evidence appendix
  evidenceBlock: {
    marginBottom: 10,
    padding: 8,
    backgroundColor: SURFACE,
    borderLeftWidth: 3,
    borderLeftColor: BORDER,
  },
  evidenceTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    marginBottom: 3,
  },
  evidenceType: {
    fontSize: 7,
    color: MUTED,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  evidenceContent: {
    fontSize: 8,
    lineHeight: 1.5,
    color: DARK,
  },
  // Gaps
  gapItem: {
    marginBottom: 10,
    padding: 8,
    backgroundColor: '#fef2f2',
    borderLeftWidth: 3,
    borderLeftColor: RED,
  },
  gapTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    color: RED,
    marginBottom: 3,
  },
  // Action item
  actionItem: {
    fontSize: 8,
    marginBottom: 3,
    paddingLeft: 10,
    lineHeight: 1.5,
  },
  // Declaration
  legalBox: {
    backgroundColor: '#f9fafb',
    padding: 14,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 3,
    marginTop: 12,
  },
  legalText: {
    fontSize: 8,
    color: MUTED,
    lineHeight: 1.6,
    fontStyle: 'italic',
  },
  signatureLine: {
    borderBottomWidth: 1,
    borderBottomColor: DARK,
    width: 250,
    marginTop: 30,
    marginBottom: 4,
  },
  signatureLabel: {
    fontSize: 8,
    color: MUTED,
    marginBottom: 16,
  },
})

// ─── Helper: header + footer for content pages ──────────────────────────────
const h = React.createElement

function pageHeader(systemName: string, exportDate: string) {
  return h(View, { style: s.pageHeader, fixed: true } as any,
    h(Text, { style: s.pageHeaderText }, `${systemName} — AI Act Evidence Pack`),
    h(Text, { style: s.pageHeaderText }, exportDate)
  )
}

function pageFooter() {
  return h(View, { style: s.pageFooter, fixed: true } as any,
    h(Text, { style: s.footerText }, 'Irvo — AI Act Compliance Platform'),
    h(Text, { style: s.footerText, render: ({ pageNumber, totalPages }: { pageNumber: number; totalPages: number }) => `Page ${pageNumber} of ${totalPages}` } as any)
  )
}

function watermark() {
  return h(Text, { style: s.watermark, fixed: true } as any, 'DRAFT')
}

// ─── Document Component ─────────────────────────────────────────────────────

export interface EvidencePackProps {
  system: AISystem
  obligations: Obligation[]
  evidence: EvidenceItem[]
  orgName: string
}

function EvidencePackDocument({ system, obligations, evidence, orgName }: EvidencePackProps) {
  const exportDate = formatDate(new Date().toISOString())
  const sortedObligations = [...obligations].sort((a, b) => a.sort_order - b.sort_order)
  const completeCount = sortedObligations.filter(o => o.is_complete).length
  const totalCount = sortedObligations.length
  const completionPct = totalCount > 0 ? Math.round((completeCount / totalCount) * 100) : 0
  const allComplete = completeCount === totalCount && totalCount > 0
  const days = daysUntilDeadline()
  const incompleteObligations = sortedObligations.filter(o => !o.is_complete)

  // Evidence counts per obligation
  const evidenceByObligation = (oblId: string) => evidence.filter(e => e.obligation_id === oblId)

  return h(Document, null,
    // ─── 1. Cover Page ────────────────────────────────────────────────────
    h(Page, { size: 'A4', style: s.coverPage } as any,
      !allComplete ? watermark() : null,
      h(View, { style: { marginTop: 120 } },
        h(Text, { style: s.coverTitle }, 'AI Act Evidence Pack'),
        h(Text, { style: s.coverSubtitle }, 'EU Regulation 2024/1689 Compliance Documentation'),
        h(View, { style: { height: 30 } }),
        h(Text, { style: s.coverSystemName }, system.name),
        h(Text, { style: s.coverOrgName }, orgName),
        h(View, { style: { alignItems: 'center', marginTop: 16 } },
          h(View, { style: { ...s.riskBadge, backgroundColor: riskColor(system.risk_level) } },
            h(Text, { style: s.riskBadgeText }, riskLabel(system.risk_level))
          )
        ),
        h(Text, { style: s.coverDate }, `Exported: ${exportDate}`)
      )
    ),

    // ─── 2. Executive Summary ─────────────────────────────────────────────
    h(Page, { size: 'A4', style: s.page } as any,
      !allComplete ? watermark() : null,
      pageHeader(system.name, exportDate),
      h(View, { style: s.section },
        h(Text, { style: s.sectionTitle }, 'Executive Summary'),
        h(View, { style: s.summaryRow },
          h(View, { style: s.summaryCard },
            h(Text, { style: s.summaryCardLabel }, 'Risk Level'),
            h(Text, { style: { ...s.summaryCardValue, color: riskColor(system.risk_level) } }, riskLabel(system.risk_level))
          ),
          h(View, { style: s.summaryCard },
            h(Text, { style: s.summaryCardLabel }, 'Annex Category'),
            h(Text, { style: s.summaryCardValue }, system.annex_category || 'N/A')
          ),
          h(View, { style: s.summaryCardLast },
            h(Text, { style: s.summaryCardLabel }, 'Obligations'),
            h(Text, { style: s.summaryCardValue }, String(totalCount))
          )
        ),
        h(View, { style: s.summaryRow },
          h(View, { style: s.summaryCard },
            h(Text, { style: s.summaryCardLabel }, 'Completion'),
            h(Text, { style: { ...s.summaryCardValue, color: completionPct === 100 ? GREEN : completionPct >= 50 ? AMBER : RED } }, `${completionPct}%`)
          ),
          h(View, { style: s.summaryCard },
            h(Text, { style: s.summaryCardLabel }, 'Complete / Total'),
            h(Text, { style: s.summaryCardValue }, `${completeCount} / ${totalCount}`)
          ),
          h(View, { style: s.summaryCardLast },
            h(Text, { style: s.summaryCardLabel }, 'Days Until 2 Aug 2026'),
            h(Text, { style: { ...s.summaryCardValue, color: days <= 90 ? RED : days <= 180 ? AMBER : DARK } }, String(days))
          )
        ),
        !allComplete
          ? h(View, { style: { backgroundColor: '#fef2f2', padding: 8, borderRadius: 3, marginTop: 6 } },
              h(Text, { style: { fontSize: 8, color: RED, fontWeight: 'bold' } },
                `WARNING: ${totalCount - completeCount} obligation(s) remain incomplete. This evidence pack is marked DRAFT.`
              )
            )
          : h(View, { style: { backgroundColor: '#f0fdf4', padding: 8, borderRadius: 3, marginTop: 6 } },
              h(Text, { style: { fontSize: 8, color: GREEN, fontWeight: 'bold' } },
                'All obligations are complete. This evidence pack is ready for formal review.'
              )
            )
      ),
      pageFooter()
    ),

    // ─── 3. System Description ────────────────────────────────────────────
    h(Page, { size: 'A4', style: s.page } as any,
      !allComplete ? watermark() : null,
      pageHeader(system.name, exportDate),
      h(View, { style: s.section },
        h(Text, { style: s.sectionTitle }, 'System Description'),
        h(View, { style: s.row },
          h(Text, { style: s.label }, 'System Name:'),
          h(Text, { style: { ...s.value, ...s.bold } }, system.name)
        ),
        h(View, { style: s.row },
          h(Text, { style: s.label }, 'Description:'),
          h(Text, { style: s.value }, system.description || 'Not provided')
        ),
        h(View, { style: s.row },
          h(Text, { style: s.label }, 'System Owner:'),
          h(Text, { style: s.value }, `${system.owner_name} (${system.owner_email})`)
        ),
        h(View, { style: s.row },
          h(Text, { style: s.label }, 'Business Process:'),
          h(Text, { style: s.value }, system.business_process || 'Not provided')
        ),
        h(View, { style: s.row },
          h(Text, { style: s.label }, 'Data Sources:'),
          h(Text, { style: s.value }, system.data_sources.length > 0 ? system.data_sources.join(', ') : 'None specified')
        ),
        h(View, { style: s.row },
          h(Text, { style: s.label }, 'Model Type:'),
          h(Text, { style: s.value }, system.model_type || 'Not specified')
        ),
        h(View, { style: s.row },
          h(Text, { style: s.label }, 'Tags:'),
          h(Text, { style: s.value }, system.tags.length > 0 ? system.tags.join(', ') : 'None')
        ),
        h(View, { style: s.row },
          h(Text, { style: s.label }, 'Status:'),
          h(Text, { style: s.value }, system.status.toUpperCase())
        ),
        h(View, { style: s.row },
          h(Text, { style: s.label }, 'Created:'),
          h(Text, { style: s.value }, formatDate(system.created_at))
        ),
        h(View, { style: s.row },
          h(Text, { style: s.label }, 'Last Updated:'),
          h(Text, { style: s.value }, formatDate(system.updated_at))
        )
      ),
      pageFooter()
    ),

    // ─── 4. Risk Classification ───────────────────────────────────────────
    h(Page, { size: 'A4', style: s.page } as any,
      !allComplete ? watermark() : null,
      pageHeader(system.name, exportDate),
      h(View, { style: s.section },
        h(Text, { style: s.sectionTitle }, 'Risk Classification'),
        h(View, { style: s.row },
          h(Text, { style: s.label }, 'Risk Level:'),
          h(View, { style: s.statusRow },
            h(View, { style: { ...s.statusDot, backgroundColor: riskColor(system.risk_level) } }),
            h(Text, { style: { ...s.value, ...s.bold } }, riskLabel(system.risk_level))
          )
        ),
        h(View, { style: s.row },
          h(Text, { style: s.label }, 'Annex Category:'),
          h(Text, { style: s.value }, system.annex_category || 'Not applicable')
        ),
        h(View, { style: { marginTop: 10 } },
          h(Text, { style: s.subsectionTitle }, 'Classification Rationale'),
          h(Text, { style: s.paragraph }, system.classification_rationale || 'No rationale recorded. System has not been classified yet.')
        ),
        h(View, { style: { marginTop: 10 } },
          h(Text, { style: s.subsectionTitle }, 'Applicable Articles'),
          ...(sortedObligations.length > 0
            ? sortedObligations.map((obl, i) =>
                h(View, { style: s.row, key: i },
                  h(Text, { style: { ...s.label, width: 100 } }, obl.article),
                  h(Text, { style: s.value }, obl.title)
                )
              )
            : [h(Text, { style: s.paragraph, key: 'none' }, 'No obligations have been assigned to this system.')]
          )
        )
      ),
      pageFooter()
    ),

    // ─── 5. Obligations Checklist ─────────────────────────────────────────
    h(Page, { size: 'A4', style: s.page } as any,
      !allComplete ? watermark() : null,
      pageHeader(system.name, exportDate),
      h(View, { style: s.section },
        h(Text, { style: s.sectionTitle }, 'Obligations Checklist'),
        h(View, { style: s.tableHeader },
          h(Text, { style: { ...s.tCol1, ...s.tableHeaderText } }, '#'),
          h(Text, { style: { ...s.tCol2, ...s.tableHeaderText } }, 'Obligation'),
          h(Text, { style: { ...s.tCol3, ...s.tableHeaderText } }, 'Article'),
          h(Text, { style: { ...s.tCol4, ...s.tableHeaderText } }, 'Status'),
          h(Text, { style: { ...s.tCol5, ...s.tableHeaderText } }, 'Evidence')
        ),
        ...sortedObligations.map((obl, i) => {
          const status = obligationStatus(obl, evidence)
          const evCount = evidenceByObligation(obl.id).length
          const rowStyle = i % 2 === 0 ? s.tableRow : s.tableRowAlt
          return h(View, { style: rowStyle, key: i },
            h(Text, { style: s.tCol1 }, String(i + 1)),
            h(Text, { style: s.tCol2 }, obl.title),
            h(Text, { style: s.tCol3 }, obl.article),
            h(View, { style: { ...s.tCol4, ...s.statusRow, justifyContent: 'center' } },
              h(View, { style: { ...s.statusDot, backgroundColor: statusColor(status) } }),
              h(Text, { style: { fontSize: 8 } }, statusLabel(status))
            ),
            h(Text, { style: s.tCol5 }, String(evCount))
          )
        })
      ),
      pageFooter()
    ),

    // ─── 6. Evidence Appendix ─────────────────────────────────────────────
    h(Page, { size: 'A4', style: s.page, wrap: true } as any,
      !allComplete ? watermark() : null,
      pageHeader(system.name, exportDate),
      h(View, { style: s.section },
        h(Text, { style: s.sectionTitle }, 'Evidence Appendix'),
        ...sortedObligations.map((obl, oblIdx) => {
          const items = evidenceByObligation(obl.id)
          return h(View, { key: oblIdx, style: { marginBottom: 14 }, wrap: false } as any,
            h(Text, { style: s.subsectionTitle }, `${obl.article} — ${obl.title}`),
            h(Text, { style: { fontSize: 7, color: MUTED, marginBottom: 6 } }, `Required: ${obl.evidence_required}`),
            items.length > 0
              ? h(View, null,
                  ...items.map((item, itemIdx) =>
                    h(View, { style: { ...s.evidenceBlock, borderLeftColor: item.reviewed ? GREEN : AMBER }, key: itemIdx, wrap: false } as any,
                      h(View, { style: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 } },
                        h(Text, { style: s.evidenceTitle }, item.title),
                        h(Text, { style: { fontSize: 7, color: item.reviewed ? GREEN : AMBER } }, item.reviewed ? 'Reviewed' : 'Unreviewed')
                      ),
                      h(View, { style: { flexDirection: 'row', marginBottom: 4 } },
                        h(Text, { style: s.evidenceType }, item.item_type),
                        item.ai_drafted ? h(Text, { style: { fontSize: 7, color: AMBER, marginLeft: 8 } }, 'AI-DRAFTED') : null,
                        item.file_name ? h(Text, { style: { fontSize: 7, color: MUTED, marginLeft: 8 } }, `File: ${item.file_name}`) : null
                      ),
                      item.content
                        ? h(Text, { style: s.evidenceContent }, item.content.length > 800 ? item.content.slice(0, 800) + '...' : item.content)
                        : h(Text, { style: { ...s.evidenceContent, color: MUTED, fontStyle: 'italic' } }, 'No text content — see attached file.')
                    )
                  )
                )
              : h(View, { style: { ...s.evidenceBlock, borderLeftColor: RED } },
                  h(Text, { style: { fontSize: 8, color: RED, fontStyle: 'italic' } }, 'No evidence uploaded for this obligation.')
                )
          )
        })
      ),
      pageFooter()
    ),

    // ─── 7. Gaps & Recommended Actions ────────────────────────────────────
    h(Page, { size: 'A4', style: s.page } as any,
      !allComplete ? watermark() : null,
      pageHeader(system.name, exportDate),
      h(View, { style: s.section },
        h(Text, { style: s.sectionTitle }, 'Gaps & Recommended Actions'),
        incompleteObligations.length > 0
          ? h(View, null,
              h(Text, { style: s.paragraph },
                `${incompleteObligations.length} obligation(s) are incomplete. The following gaps must be addressed before the August 2, 2026 deadline.`
              ),
              ...incompleteObligations.map((obl, i) => {
                const evCount = evidenceByObligation(obl.id).length
                return h(View, { style: s.gapItem, key: i, wrap: false } as any,
                  h(Text, { style: s.gapTitle }, `${obl.article} — ${obl.title}`),
                  h(Text, { style: { fontSize: 8, marginBottom: 4, color: DARK } }, obl.description),
                  h(Text, { style: { fontSize: 7, color: MUTED, marginBottom: 4 } },
                    `Evidence required: ${obl.evidence_required} | Current evidence items: ${evCount}`
                  )
                )
              }),
              system.immediate_actions.length > 0
                ? h(View, { style: { marginTop: 12 } },
                    h(Text, { style: s.subsectionTitle }, 'Immediate Actions'),
                    ...system.immediate_actions.map((action, i) =>
                      h(Text, { style: s.actionItem, key: i }, `${i + 1}. ${action}`)
                    )
                  )
                : null
            )
          : h(View, { style: { backgroundColor: '#f0fdf4', padding: 10, borderRadius: 3 } },
              h(Text, { style: { fontSize: 9, color: GREEN, fontWeight: 'bold' } },
                'No gaps identified. All obligations have been marked as complete.'
              ),
              system.immediate_actions.length > 0
                ? h(View, { style: { marginTop: 10 } },
                    h(Text, { style: s.subsectionTitle }, 'Recommended Ongoing Actions'),
                    ...system.immediate_actions.map((action, i) =>
                      h(Text, { style: s.actionItem, key: i }, `${i + 1}. ${action}`)
                    )
                  )
                : null
            )
      ),
      pageFooter()
    ),

    // ─── 8. Declaration Page ──────────────────────────────────────────────
    h(Page, { size: 'A4', style: s.page } as any,
      !allComplete ? watermark() : null,
      pageHeader(system.name, exportDate),
      h(View, { style: s.section },
        h(Text, { style: s.sectionTitle }, 'Declaration'),
        h(Text, { style: s.paragraph },
          `I confirm that the information contained in this AI Act Evidence Pack for the system "${system.name}" is accurate and complete to the best of my knowledge. I understand that this documentation forms part of our organisation's compliance obligations under the EU AI Act (Regulation 2024/1689).`
        ),
        h(View, { style: { marginTop: 30 } },
          h(View, { style: s.signatureLine }),
          h(Text, { style: s.signatureLabel }, 'Authorised Signatory'),
          h(View, { style: s.signatureLine }),
          h(Text, { style: s.signatureLabel }, 'Name'),
          h(View, { style: s.signatureLine }),
          h(Text, { style: s.signatureLabel }, 'Title / Position'),
          h(View, { style: s.signatureLine }),
          h(Text, { style: s.signatureLabel }, 'Date')
        ),
        h(View, { style: s.legalBox },
          h(Text, { style: s.legalText },
            'DISCLAIMER: This document provides guidance only and does not constitute legal advice. It has been generated to support internal compliance efforts under the EU AI Act (Regulation 2024/1689). Organisations should seek independent legal counsel to verify their compliance posture. The contents of this pack reflect the state of the system and its evidence as recorded on the export date shown above. Irvo accepts no liability for decisions made based on this document.'
          )
        ),
        h(View, { style: { marginTop: 20, alignItems: 'center' } },
          h(Text, { style: { fontSize: 8, color: MUTED } }, `Generated by Irvo on ${exportDate}`),
          h(Text, { style: { fontSize: 7, color: MUTED, marginTop: 2 } }, `System ID: ${system.id}`)
        )
      ),
      pageFooter()
    )
  )
}

// ─── Export ──────────────────────────────────────────────────────────────────

export async function generateEvidencePack(props: EvidencePackProps): Promise<Buffer> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const element = React.createElement(EvidencePackDocument, props) as any
  return renderToBuffer(element)
}
