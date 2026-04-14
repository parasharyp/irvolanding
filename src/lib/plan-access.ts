import { NextResponse } from 'next/server'
import type { SupabaseClient } from '@supabase/supabase-js'
import { hasModuleAccess, MODULE_MIN_PLAN, type ComplianceModule, type OrgPlan } from '@/types'

interface GateResult {
  ok: true
  plan: OrgPlan
}
interface GateBlock {
  ok: false
  response: NextResponse
}

// Fetch org plan and return 403 with upgrade hint if module isn't unlocked.
export async function requireModule(
  supabase: SupabaseClient,
  orgId: string,
  module: ComplianceModule,
): Promise<GateResult | GateBlock> {
  const { data: org } = await supabase
    .from('organizations')
    .select('plan')
    .eq('id', orgId)
    .single()

  const plan = (org?.plan ?? 'starter') as OrgPlan
  if (!hasModuleAccess(plan, module)) {
    return {
      ok: false,
      response: NextResponse.json(
        {
          error: `This module requires the ${MODULE_MIN_PLAN[module]} plan or higher.`,
          requiredPlan: MODULE_MIN_PLAN[module],
          currentPlan: plan,
          module,
        },
        { status: 403 },
      ),
    }
  }
  return { ok: true, plan }
}
