import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { unauthorized, serverError } from '@/lib/api-error'
import { checkAuthenticatedRateLimit } from '@/lib/ratelimit'
import type { RiskLevel, DashboardMetrics } from '@/types'

// GET /api/dashboard — aggregate metrics for the user's org
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return unauthorized()

    const { data: profile } = await supabase
      .from('users')
      .select('organization_id')
      .eq('id', user.id)
      .single()
    if (!profile) return unauthorized()

    const rateCheck = await checkAuthenticatedRateLimit(user.id)
    if (!rateCheck.allowed) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
    }

    const { data: systems, error } = await supabase
      .from('systems')
      .select('risk_level, pct_complete, status')
      .eq('organization_id', profile.organization_id)

    if (error) return serverError(error, 'GET /api/dashboard')

    const allSystems = systems ?? []

    const systemsByRisk: Record<RiskLevel, number> = {
      none: 0,
      limited: 0,
      high: 0,
      unacceptable: 0,
    }

    let totalCompletion = 0
    let systemsReady = 0
    let systemsDraft = 0

    for (const s of allSystems) {
      if (s.risk_level && s.risk_level in systemsByRisk) {
        systemsByRisk[s.risk_level as RiskLevel]++
      }
      totalCompletion += s.pct_complete ?? 0
      if (s.status === 'ready') systemsReady++
      if (s.status === 'draft') systemsDraft++
    }

    const avgCompletion = allSystems.length > 0
      ? Math.round(totalCompletion / allSystems.length)
      : 0

    // EU AI Act deadline: August 2, 2026
    const deadline = new Date('2026-08-02T00:00:00Z')
    const now = new Date()
    const daysUntilDeadline = Math.max(
      0,
      Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    )

    const metrics: DashboardMetrics = {
      total_systems: allSystems.length,
      systems_by_risk: systemsByRisk,
      avg_completion: avgCompletion,
      systems_ready: systemsReady,
      systems_draft: systemsDraft,
      days_until_deadline: daysUntilDeadline,
    }

    return NextResponse.json({ metrics })
  } catch (err) {
    return serverError(err, 'GET /api/dashboard')
  }
}
