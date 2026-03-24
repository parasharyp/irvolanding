import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { unauthorized, badRequest, serverError } from '@/lib/api-error'
import { QuestionnaireAnswer, RiskLevel, AnnexIIICategory } from '@/types'

interface ClassifyBody {
  answers: QuestionnaireAnswer[]
}

interface ClassificationObligation {
  id: string
  article: string
  title: string
  description: string
}

const HIGH_RISK_OBLIGATIONS_EMPLOYMENT: ClassificationObligation[] = [
  { id: '1', article: 'Art. 9', title: 'Risk management system', description: 'Establish and maintain a risk management system throughout the lifecycle.' },
  { id: '2', article: 'Art. 10', title: 'Data governance', description: 'Implement data governance and management practices for training and validation data.' },
  { id: '3', article: 'Art. 11', title: 'Technical documentation', description: 'Prepare technical documentation before placing the system on the market.' },
  { id: '4', article: 'Art. 13', title: 'Transparency and information', description: 'Ensure the system is sufficiently transparent for users to interpret outputs.' },
  { id: '5', article: 'Art. 14', title: 'Human oversight', description: 'Design with human oversight measures enabling supervisors to intervene or halt the system.' },
]

const HIGH_RISK_OBLIGATIONS_BIOMETRIC: ClassificationObligation[] = [
  { id: '1', article: 'Art. 9', title: 'Risk management system', description: 'Establish and maintain a risk management system throughout the lifecycle.' },
  { id: '2', article: 'Art. 10', title: 'Data governance', description: 'Biometric data requires strict governance; document all data sources, labeling, and quality measures.' },
  { id: '3', article: 'Art. 11', title: 'Technical documentation', description: 'Prepare technical documentation including performance metrics and accuracy thresholds.' },
  { id: '4', article: 'Art. 13', title: 'Transparency and information', description: 'Individuals must be informed when biometric identification is used.' },
  { id: '5', article: 'Art. 14', title: 'Human oversight', description: 'Human oversight is mandatory for biometric identification systems in law enforcement or public spaces.' },
]

const HIGH_RISK_OBLIGATIONS_GENERAL: ClassificationObligation[] = [
  { id: '1', article: 'Art. 9', title: 'Risk management system', description: 'Establish and maintain a risk management system throughout the lifecycle.' },
  { id: '2', article: 'Art. 11', title: 'Technical documentation', description: 'Prepare technical documentation before placing the system on the market.' },
  { id: '3', article: 'Art. 13', title: 'Transparency and information', description: 'Ensure the system is sufficiently transparent for users to interpret outputs.' },
  { id: '4', article: 'Art. 14', title: 'Human oversight', description: 'Design with human oversight measures enabling supervisors to intervene or halt the system.' },
]

const LIMITED_RISK_OBLIGATIONS: ClassificationObligation[] = [
  { id: '1', article: 'Art. 13', title: 'Transparency obligation', description: 'Users must be informed they are interacting with an AI system.' },
  { id: '2', article: 'Art. 52', title: 'Transparency for certain AI systems', description: 'AI systems intended to interact with natural persons must disclose their AI nature.' },
  { id: '3', article: 'Art. 28b', title: 'General-purpose AI obligations', description: 'Maintain technical documentation and comply with applicable copyright law.' },
]

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return unauthorized()

    const { data: userData } = await supabase.from('users').select('organization_id').eq('id', user.id).single()
    if (!userData?.organization_id) return NextResponse.json({ error: 'No organization' }, { status: 400 })

    const body = await req.json() as ClassifyBody
    if (!Array.isArray(body.answers)) return badRequest('answers array is required')

    const answers = body.answers
    const getAnswer = (id: string) => answers.find((a) => a.question_id === id)?.answer ?? ''

    const q5 = getAnswer('q5') // employment
    const q6 = getAnswer('q6') // essential services
    const q7 = getAnswer('q7') // biometric
    const q8 = getAnswer('q8') // harm severity
    const q11 = getAnswer('q11') // safety-critical

    let risk_level: RiskLevel = 'limited'
    let annex_iii_category: AnnexIIICategory = 'none'
    let articles_applicable: string[] = []
    let obligations: ClassificationObligation[] = LIMITED_RISK_OBLIGATIONS

    // Determine risk level and category using deterministic stub logic
    if (q7 === 'yes') {
      risk_level = 'high'
      annex_iii_category = 'biometric'
      articles_applicable = ['Art. 9', 'Art. 10', 'Art. 11', 'Art. 13', 'Art. 14', 'Art. 50']
      obligations = HIGH_RISK_OBLIGATIONS_BIOMETRIC
    } else if (q8 === 'Critical/life-impacting' || q11 === 'yes') {
      risk_level = 'high'
      annex_iii_category = 'critical_infrastructure'
      articles_applicable = ['Art. 9', 'Art. 11', 'Art. 13', 'Art. 14', 'Art. 17']
      obligations = HIGH_RISK_OBLIGATIONS_GENERAL
    } else if (q5 === 'yes') {
      risk_level = 'high'
      annex_iii_category = 'employment'
      articles_applicable = ['Art. 9', 'Art. 10', 'Art. 11', 'Art. 13', 'Art. 14']
      obligations = HIGH_RISK_OBLIGATIONS_EMPLOYMENT
    } else if (q6 === 'yes') {
      risk_level = 'high'
      annex_iii_category = 'essential_services'
      articles_applicable = ['Art. 9', 'Art. 10', 'Art. 11', 'Art. 13', 'Art. 14']
      obligations = HIGH_RISK_OBLIGATIONS_GENERAL
    } else {
      risk_level = 'limited'
      annex_iii_category = 'none'
      articles_applicable = ['Art. 13', 'Art. 52']
      obligations = LIMITED_RISK_OBLIGATIONS
    }

    return NextResponse.json({
      risk_level,
      annex_iii_category: annex_iii_category === 'none' ? null : annex_iii_category,
      articles_applicable,
      obligations,
    })
  } catch (err) {
    return serverError(err, 'POST /api/systems/classify')
  }
}
