import { NextResponse } from 'next/server'
import { serverError, rateLimited } from '@/lib/api-error'
import { getAuthContext } from '@/lib/auth'
import { checkAuthenticatedRateLimit } from '@/lib/ratelimit'
import type { RiskLevel, DashboardMetrics, DashboardSystemSummary, DashboardInsight } from '@/types'

// Risk weights for compliance score calculation
const RISK_WEIGHTS: Record<RiskLevel, number> = {
  none: 0.1,
  limited: 0.3,
  high: 0.8,
  unacceptable: 1.0,
}

function generateInsights(
  systems: DashboardSystemSummary[],
  daysUntilDeadline: number,
  totalObligations: number,
  obligationsComplete: number,
): DashboardInsight[] {
  const insights: DashboardInsight[] = []

  // High-risk systems with low completion
  for (const s of systems) {
    if ((s.risk_level === 'high' || s.risk_level === 'unacceptable') && s.pct_complete < 50) {
      insights.push({
        type: 'warning',
        title: `${s.name} needs urgent attention`,
        description: `${s.risk_level === 'unacceptable' ? 'Unacceptable' : 'High'}-risk system is only ${s.pct_complete}% complete. Prioritise evidence capture for remaining ${s.obligation_count - s.obligations_complete} obligations.`,
        system_id: s.id,
        system_name: s.name,
      })
    }
  }

  // Systems with no evidence at all
  for (const s of systems) {
    if (s.evidence_count === 0 && s.obligation_count > 0) {
      insights.push({
        type: 'action',
        title: `Start evidence capture for ${s.name}`,
        description: `This system has ${s.obligation_count} obligations but no evidence documented yet. Use AI drafting to accelerate compliance.`,
        system_id: s.id,
        system_name: s.name,
      })
    }
  }

  // Deadline pressure
  if (daysUntilDeadline < 180 && totalObligations > 0) {
    const pctDone = Math.round((obligationsComplete / totalObligations) * 100)
    if (pctDone < 80) {
      insights.push({
        type: 'warning',
        title: `${daysUntilDeadline} days until enforcement — ${pctDone}% obligations complete`,
        description: `You have ${totalObligations - obligationsComplete} outstanding obligations. At current pace, consider using AI-assisted drafting to accelerate.`,
      })
    }
  }

  // Systems stuck in draft
  const draftSystems = systems.filter(s => s.status === 'draft' && s.risk_level)
  if (draftSystems.length > 0) {
    const names = draftSystems.slice(0, 3).map(s => s.name).join(', ')
    insights.push({
      type: 'action',
      title: `${draftSystems.length} classified system${draftSystems.length > 1 ? 's' : ''} still in draft`,
      description: `${names}${draftSystems.length > 3 ? ` and ${draftSystems.length - 3} more` : ''} — classified but no evidence work started.`,
      system_id: draftSystems[0].id,
      system_name: draftSystems[0].name,
    })
  }

  // Fully compliant systems — celebrate
  const readySystems = systems.filter(s => s.status === 'ready' || s.pct_complete === 100)
  if (readySystems.length > 0) {
    insights.push({
      type: 'success',
      title: `${readySystems.length} system${readySystems.length > 1 ? 's' : ''} fully compliant`,
      description: `${readySystems.map(s => s.name).join(', ')} — ready for export and regulator review.`,
    })
  }

  // AI usage opportunity
  const lowAiUsage = systems.filter(s => s.evidence_count > 0 && s.evidence_ai_drafted === 0)
  if (lowAiUsage.length > 0) {
    insights.push({
      type: 'info',
      title: 'AI drafting available',
      description: `${lowAiUsage.length} system${lowAiUsage.length > 1 ? 's have' : ' has'} manually-written evidence. Try AI-assisted drafting to save time on remaining obligations.`,
    })
  }

  // Cap at 5 most relevant
  return insights.slice(0, 5)
}

// GET /api/dashboard — rich metrics for the user's org
export async function GET() {
  try {
    const auth = await getAuthContext()
    if ('error' in auth) return auth.error
    const { supabase, user, orgId } = auth

    const rateCheck = await checkAuthenticatedRateLimit(user.id)
    if (!rateCheck.allowed) {
      return rateLimited(rateCheck.resetAt)
    }

    // Fetch systems with full detail
    const { data: systems, error: sysError } = await supabase
      .from('systems')
      .select('id, name, risk_level, status, pct_complete, updated_at')
      .eq('organization_id', orgId)
      .order('updated_at', { ascending: false })

    if (sysError) return serverError(sysError, 'GET /api/dashboard')
    const allSystems = systems ?? []
    const systemIds = allSystems.map(s => s.id)

    // Fetch obligations and evidence in parallel
    const [obligationsRes, evidenceRes] = await Promise.all([
      systemIds.length > 0
        ? supabase
            .from('obligations')
            .select('id, system_id, is_complete')
            .in('system_id', systemIds)
        : Promise.resolve({ data: [], error: null }),
      systemIds.length > 0
        ? supabase
            .from('evidence_items')
            .select('id, system_id, ai_drafted')
            .in('system_id', systemIds)
        : Promise.resolve({ data: [], error: null }),
    ])

    if (obligationsRes.error) return serverError(obligationsRes.error, 'GET /api/dashboard obligations')
    if (evidenceRes.error) return serverError(evidenceRes.error, 'GET /api/dashboard evidence')

    const obligations = obligationsRes.data ?? []
    const evidence = evidenceRes.data ?? []

    // Group by system
    const oblBySystem: Record<string, { total: number; complete: number }> = {}
    for (const o of obligations) {
      if (!oblBySystem[o.system_id]) oblBySystem[o.system_id] = { total: 0, complete: 0 }
      oblBySystem[o.system_id].total++
      if (o.is_complete) oblBySystem[o.system_id].complete++
    }

    const evidBySystem: Record<string, { total: number; ai: number }> = {}
    for (const e of evidence) {
      if (!evidBySystem[e.system_id]) evidBySystem[e.system_id] = { total: 0, ai: 0 }
      evidBySystem[e.system_id].total++
      if (e.ai_drafted) evidBySystem[e.system_id].ai++
    }

    // Build system summaries
    const systemSummaries: DashboardSystemSummary[] = allSystems.map(s => ({
      id: s.id,
      name: s.name,
      risk_level: s.risk_level as RiskLevel | null,
      status: s.status,
      pct_complete: s.pct_complete ?? 0,
      obligation_count: oblBySystem[s.id]?.total ?? 0,
      obligations_complete: oblBySystem[s.id]?.complete ?? 0,
      evidence_count: evidBySystem[s.id]?.total ?? 0,
      evidence_ai_drafted: evidBySystem[s.id]?.ai ?? 0,
      updated_at: s.updated_at,
    }))

    // Aggregate metrics
    const systemsByRisk: Record<RiskLevel, number> = { none: 0, limited: 0, high: 0, unacceptable: 0 }
    let totalCompletion = 0
    let systemsReady = 0
    let systemsDraft = 0
    let systemsInProgress = 0
    let systemsExported = 0

    for (const s of allSystems) {
      if (s.risk_level && s.risk_level in systemsByRisk) {
        systemsByRisk[s.risk_level as RiskLevel]++
      }
      totalCompletion += s.pct_complete ?? 0
      if (s.status === 'ready') systemsReady++
      if (s.status === 'draft') systemsDraft++
      if (s.status === 'in-progress') systemsInProgress++
      if (s.status === 'exported') systemsExported++
    }

    const avgCompletion = allSystems.length > 0
      ? Math.round(totalCompletion / allSystems.length)
      : 0

    const totalObligations = obligations.length
    const obligationsComplete = obligations.filter(o => o.is_complete).length
    const totalEvidence = evidence.length
    const evidenceAiDrafted = evidence.filter(e => e.ai_drafted).length

    // Compliance score: weighted by risk level and completion
    let complianceScore = 0
    if (allSystems.length > 0) {
      let weightedSum = 0
      let weightTotal = 0
      for (const s of systemSummaries) {
        const riskWeight = s.risk_level ? RISK_WEIGHTS[s.risk_level] : 0.2
        weightedSum += s.pct_complete * riskWeight
        weightTotal += 100 * riskWeight
      }
      complianceScore = weightTotal > 0 ? Math.round((weightedSum / weightTotal) * 100) : 0
    }

    // EU AI Act deadline
    const deadline = new Date('2026-08-02T00:00:00Z')
    const daysUntilDeadline = Math.max(
      0,
      Math.ceil((deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    )

    // Generate AI insights
    const insights = generateInsights(systemSummaries, daysUntilDeadline, totalObligations, obligationsComplete)

    const metrics: DashboardMetrics = {
      total_systems: allSystems.length,
      systems_by_risk: systemsByRisk,
      avg_completion: avgCompletion,
      systems_ready: systemsReady,
      systems_draft: systemsDraft,
      systems_in_progress: systemsInProgress,
      systems_exported: systemsExported,
      days_until_deadline: daysUntilDeadline,
      compliance_score: complianceScore,
      total_obligations: totalObligations,
      obligations_complete: obligationsComplete,
      total_evidence: totalEvidence,
      evidence_ai_drafted: evidenceAiDrafted,
      systems: systemSummaries,
      insights,
    }

    return NextResponse.json({ metrics })
  } catch (err) {
    return serverError(err, 'GET /api/dashboard')
  }
}
