import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { badRequest, notFound, serverError, rateLimited } from '@/lib/api-error'
import { getAuthContext } from '@/lib/auth'
import { checkAuthenticatedRateLimit, checkClassifyRateLimit } from '@/lib/ratelimit'
import { classifySystem } from '@/lib/ai/classify'
import { parseBody, requireJson } from '@/lib/validate-body'

const classifySchema = z.object({
  systemId: z.string().uuid(),
  answers: z.array(z.object({
    questionId: z.string(),
    answer: z.string(),
  })).min(1, 'At least one answer is required'),
})

// POST /api/systems/classify — classify a system and generate obligations
export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthContext()
    if ('error' in auth) return auth.error
    const { supabase, user, orgId } = auth

    const rateCheck = await checkAuthenticatedRateLimit(user.id)
    if (!rateCheck.allowed) {
      return rateLimited(rateCheck.resetAt)
    }

    // AI-specific rate limit — 10 classifications per hour per org
    const aiRateCheck = await checkClassifyRateLimit(orgId)
    if (!aiRateCheck.allowed) {
      return rateLimited(aiRateCheck.resetAt)
    }

    const ctErr = requireJson(req); if (ctErr) return ctErr
    const { data: body, error: bodyErr } = await parseBody(req); if (bodyErr) return bodyErr
    const parsed = classifySchema.safeParse(body)
    if (!parsed.success) {
      return badRequest(parsed.error.issues[0].message)
    }

    const { systemId, answers } = parsed.data

    // Fetch the system (RLS scopes to org)
    const { data: system, error: sysError } = await supabase
      .from('systems')
      .select('*')
      .eq('id', systemId)
      .eq('organization_id', orgId)
      .single()

    if (sysError || !system) return notFound('System')

    // Classify via AI
    const result = await classifySystem({
      systemName: system.name,
      systemDescription: system.description,
      answers,
    })

    // Upsert questionnaire answers
    const answerRows = answers.map((a) => ({
      system_id: systemId,
      question_id: a.questionId,
      answer: a.answer,
    }))

    const { error: answerError } = await supabase
      .from('questionnaire_answers')
      .upsert(answerRows, { onConflict: 'system_id,question_id' })

    if (answerError) return serverError(answerError, 'classify: upsert answers')

    // Update system with classification results
    const { error: updateError } = await supabase
      .from('systems')
      .update({
        risk_level: result.riskLevel,
        annex_category: result.annexCategory,
        classification_rationale: result.rationale,
        immediate_actions: result.immediateActions,
        status: 'in-progress',
        updated_at: new Date().toISOString(),
      })
      .eq('id', systemId)

    if (updateError) return serverError(updateError, 'classify: update system')

    // Delete existing obligations then insert new ones
    await supabase
      .from('obligations')
      .delete()
      .eq('system_id', systemId)

    if (result.obligations.length > 0) {
      const obligationRows = result.obligations.map((o, i) => ({
        system_id: systemId,
        obligation_key: o.key,
        article: o.article,
        title: o.title,
        description: o.description,
        evidence_required: o.evidenceRequired,
        is_complete: false,
        sort_order: i,
      }))

      const { error: oblError } = await supabase
        .from('obligations')
        .insert(obligationRows)

      if (oblError) return serverError(oblError, 'classify: insert obligations')
    }

    return NextResponse.json({ result })
  } catch (err) {
    return serverError(err, 'POST /api/systems/classify')
  }
}
