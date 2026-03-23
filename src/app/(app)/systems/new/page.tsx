'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { QuestionnaireAnswer, RiskLevel, AnnexIIICategory } from '@/types'

interface SystemFormData {
  name: string
  owner: string
  business_process: string
  data_sources: string
  model_type: string
  description: string
}

interface ClassificationResult {
  risk_level: RiskLevel
  annex_iii_category: AnnexIIICategory | null
  articles_applicable: string[]
  obligations: Array<{ id: string; article: string; title: string; description: string }>
}

const QUESTIONS = [
  {
    id: 'q1',
    question: 'What domain does this system operate in?',
    type: 'select',
    options: ['HR/Recruitment', 'Finance/Credit', 'Safety/Critical', 'Law Enforcement', 'Education', 'Healthcare', 'General Automation', 'Other'],
  },
  {
    id: 'q2',
    question: 'What level of automation does this system apply?',
    type: 'radio',
    options: ['Fully automated', 'Human reviews AI output', 'AI assists human decision', 'Minimal automation'],
  },
  { id: 'q3', question: 'Who is directly affected by this system\'s outputs?', type: 'text' },
  { id: 'q4', question: 'Does this system process personal data?', type: 'yesno' },
  { id: 'q5', question: 'Does this system influence employment, recruitment, or performance evaluation?', type: 'yesno' },
  { id: 'q6', question: 'Does this system affect access to essential services (credit, insurance, housing)?', type: 'yesno' },
  { id: 'q7', question: 'Does this system process biometric data?', type: 'yesno' },
  {
    id: 'q8',
    question: 'What is the potential severity of harm if the system produces a wrong output?',
    type: 'radio',
    options: ['Critical/life-impacting', 'Significant/financial harm', 'Moderate', 'Low'],
  },
  { id: 'q9', question: 'Is there human oversight before decisions are acted upon?', type: 'yesno' },
  { id: 'q10', question: 'Are users informed that they are interacting with an AI system?', type: 'yesno' },
  { id: 'q11', question: 'Is this system used in a safety-critical environment?', type: 'yesno' },
  { id: 'q12', question: 'Does existing technical documentation or controls exist for this system?', type: 'yesno' },
]

function riskColor(level: RiskLevel): string {
  switch (level) {
    case 'unacceptable': return '#e54747'
    case 'high': return '#e54747'
    case 'limited': return '#f59e0b'
    case 'minimal': return '#36bd5f'
    default: return '#666'
  }
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: '#0c0c0c',
  border: '1px solid rgba(255,255,255,0.07)',
  color: '#e8e8e8',
  padding: '10px 12px',
  fontSize: 13,
  fontFamily: 'var(--font-raleway), Raleway, Helvetica, Arial, sans-serif',
  outline: 'none',
  boxSizing: 'border-box',
}

const labelStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  color: '#666',
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  marginBottom: 6,
  display: 'block',
}

export default function NewSystemPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState(false)
  const [classifying, setClassifying] = useState(false)

  const [formData, setFormData] = useState<SystemFormData>({
    name: '',
    owner: '',
    business_process: '',
    data_sources: '',
    model_type: '',
    description: '',
  })

  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [classification, setClassification] = useState<ClassificationResult | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  function setField(key: keyof SystemFormData, val: string) {
    setFormData((prev) => ({ ...prev, [key]: val }))
    if (errors[key]) setErrors((prev) => { const n = { ...prev }; delete n[key]; return n })
  }

  function setAnswer(id: string, val: string) {
    setAnswers((prev) => ({ ...prev, [id]: val }))
  }

  function validateStep1() {
    const e: Record<string, string> = {}
    if (!formData.name.trim()) e.name = 'System name is required'
    if (!formData.owner.trim()) e.owner = 'Owner is required'
    if (!formData.business_process.trim()) e.business_process = 'Business process is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function runClassification() {
    setClassifying(true)
    const qaAnswers: QuestionnaireAnswer[] = QUESTIONS.map((q) => ({
      question_id: q.id,
      question: q.question,
      answer: answers[q.id] ?? '',
    }))
    try {
      const res = await fetch('/api/systems/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: qaAnswers }),
      })
      const data = await res.json()
      setClassification(data)
      setStep(3)
    } catch {
      console.error('Classification failed')
    } finally {
      setClassifying(false)
    }
  }

  async function saveSystem() {
    if (!classification) return
    setSaving(true)
    try {
      const res = await fetch('/api/systems', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, ...classification, answers }),
      })
      const data = await res.json()
      router.push(`/systems/${data.system?.id ?? 'stub-id'}`)
    } catch {
      console.error('Save failed')
      setSaving(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#040404',
      fontFamily: 'var(--font-raleway), Raleway, Helvetica, Arial, sans-serif',
      color: '#e8e8e8',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '48px 16px',
    }}>
      <div style={{ width: '100%', maxWidth: 680 }}>
        {/* Back link */}
        <Link
          href="/systems"
          style={{ fontSize: 12, color: '#555', textDecoration: 'none', display: 'inline-block', marginBottom: 32 }}
        >
          ← Back to AI Systems
        </Link>

        {/* Step indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 36 }}>
          {[
            { n: 1, label: 'Describe' },
            { n: 2, label: 'Questionnaire' },
            { n: 3, label: 'Classification' },
          ].map(({ n, label }, i) => (
            <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {i > 0 && <div style={{ width: 24, height: 1, background: step > n - 1 ? '#00e5bf' : '#222' }} />}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 24, height: 24, borderRadius: '50%',
                  background: step >= n ? '#00e5bf' : '#131313',
                  border: `1px solid ${step >= n ? '#00e5bf' : '#333'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700, color: step >= n ? '#040404' : '#333',
                  flexShrink: 0,
                }}>
                  {n}
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, color: step >= n ? '#e8e8e8' : '#444' }}>{label}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Step 1: Describe the system */}
        {step === 1 && (
          <div style={{ background: '#0c0c0c', border: '1px solid rgba(255,255,255,0.07)', padding: 32 }}>
            <h2 style={{ fontSize: 18, fontWeight: 900, color: '#ffffff', margin: '0 0 6px' }}>Describe the system</h2>
            <p style={{ fontSize: 13, color: '#666', margin: '0 0 28px' }}>Provide basic information about the AI system you want to document.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <label style={labelStyle}>System name *</label>
                <input
                  value={formData.name}
                  onChange={(e) => setField('name', e.target.value)}
                  placeholder="e.g. Recruitment screening model"
                  style={{ ...inputStyle, borderColor: errors.name ? '#e54747' : 'rgba(255,255,255,0.07)' }}
                />
                {errors.name && <span style={{ fontSize: 11, color: '#e54747', marginTop: 4, display: 'block' }}>{errors.name}</span>}
              </div>

              <div>
                <label style={labelStyle}>Owner / Responsible person *</label>
                <input
                  value={formData.owner}
                  onChange={(e) => setField('owner', e.target.value)}
                  placeholder="e.g. Head of HR, CTO"
                  style={{ ...inputStyle, borderColor: errors.owner ? '#e54747' : 'rgba(255,255,255,0.07)' }}
                />
                {errors.owner && <span style={{ fontSize: 11, color: '#e54747', marginTop: 4, display: 'block' }}>{errors.owner}</span>}
              </div>

              <div>
                <label style={labelStyle}>Business process *</label>
                <input
                  value={formData.business_process}
                  onChange={(e) => setField('business_process', e.target.value)}
                  placeholder="e.g. Screening CVs for senior engineering roles"
                  style={{ ...inputStyle, borderColor: errors.business_process ? '#e54747' : 'rgba(255,255,255,0.07)' }}
                />
                {errors.business_process && <span style={{ fontSize: 11, color: '#e54747', marginTop: 4, display: 'block' }}>{errors.business_process}</span>}
              </div>

              <div>
                <label style={labelStyle}>Data sources</label>
                <input
                  value={formData.data_sources}
                  onChange={(e) => setField('data_sources', e.target.value)}
                  placeholder="e.g. LinkedIn profiles, internal ATS database"
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Model / tool type</label>
                <input
                  value={formData.model_type}
                  onChange={(e) => setField('model_type', e.target.value)}
                  placeholder="e.g. GPT-4, custom ML classifier, rules engine"
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Full description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setField('description', e.target.value)}
                  placeholder="Describe what the system does, how it works, and where it is deployed…"
                  rows={4}
                  style={{ ...inputStyle, resize: 'vertical' }}
                />
              </div>
            </div>

            <button
              onClick={() => { if (validateStep1()) setStep(2) }}
              style={{
                marginTop: 28,
                padding: '11px 28px',
                background: '#00e5bf',
                color: '#040404',
                border: 'none',
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 700,
                borderRadius: 100,
              }}
            >
              Continue to questionnaire →
            </button>
          </div>
        )}

        {/* Step 2: Questionnaire */}
        {step === 2 && (
          <div style={{ background: '#0c0c0c', border: '1px solid rgba(255,255,255,0.07)', padding: 32 }}>
            <h2 style={{ fontSize: 18, fontWeight: 900, color: '#ffffff', margin: '0 0 6px' }}>Risk questionnaire</h2>
            <p style={{ fontSize: 13, color: '#666', margin: '0 0 28px' }}>Answer 12 questions to classify your system under the EU AI Act.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {QUESTIONS.map((q, idx) => (
                <div key={q.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: 20 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#e8e8e8', marginBottom: 12, display: 'block' }}>
                    <span style={{ color: '#555', marginRight: 8, fontSize: 11 }}>{idx + 1}.</span>
                    {q.question}
                  </label>

                  {q.type === 'text' && (
                    <input
                      value={answers[q.id] ?? ''}
                      onChange={(e) => setAnswer(q.id, e.target.value)}
                      placeholder="Your answer…"
                      style={inputStyle}
                    />
                  )}

                  {q.type === 'select' && (
                    <select
                      value={answers[q.id] ?? ''}
                      onChange={(e) => setAnswer(q.id, e.target.value)}
                      style={{ ...inputStyle, cursor: 'pointer' }}
                    >
                      <option value="">— Select —</option>
                      {q.options?.map((o) => <option key={o} value={o}>{o}</option>)}
                    </select>
                  )}

                  {q.type === 'radio' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {q.options?.map((o) => (
                        <label key={o} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 13, color: answers[q.id] === o ? '#e8e8e8' : '#666' }}>
                          <div style={{
                            width: 14, height: 14, borderRadius: '50%', border: `1px solid ${answers[q.id] === o ? '#00e5bf' : '#333'}`,
                            background: answers[q.id] === o ? '#00e5bf' : 'transparent', flexShrink: 0,
                          }} onClick={() => setAnswer(q.id, o)} />
                          <span onClick={() => setAnswer(q.id, o)}>{o}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {q.type === 'yesno' && (
                    <div style={{ display: 'flex', gap: 12 }}>
                      {['yes', 'no'].map((v) => (
                        <button
                          key={v}
                          onClick={() => setAnswer(q.id, v)}
                          style={{
                            padding: '7px 24px',
                            background: answers[q.id] === v ? '#00e5bf' : '#131313',
                            color: answers[q.id] === v ? '#040404' : '#666',
                            border: `1px solid ${answers[q.id] === v ? '#00e5bf' : 'rgba(255,255,255,0.07)'}`,
                            cursor: 'pointer',
                            fontSize: 13,
                            fontWeight: 700,
                            textTransform: 'capitalize',
                          }}
                        >
                          {v}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 28 }}>
              <button
                onClick={() => setStep(1)}
                style={{
                  padding: '11px 24px',
                  background: 'transparent',
                  color: '#666',
                  border: '1px solid rgba(255,255,255,0.07)',
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                ← Back
              </button>
              <button
                onClick={runClassification}
                disabled={classifying}
                style={{
                  padding: '11px 28px',
                  background: classifying ? '#0a4a40' : '#00e5bf',
                  color: '#040404',
                  border: 'none',
                  cursor: classifying ? 'not-allowed' : 'pointer',
                  fontSize: 13,
                  fontWeight: 700,
                  borderRadius: 100,
                  opacity: classifying ? 0.7 : 1,
                }}
              >
                {classifying ? 'Classifying…' : 'Run classification →'}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Classification result */}
        {step === 3 && classification && (
          <div style={{ background: '#0c0c0c', border: '1px solid rgba(255,255,255,0.07)', padding: 32 }}>
            <h2 style={{ fontSize: 18, fontWeight: 900, color: '#ffffff', margin: '0 0 6px' }}>Classification result</h2>
            <p style={{ fontSize: 13, color: '#666', margin: '0 0 28px' }}>Based on your answers, here is how your system is classified.</p>

            {/* Risk level */}
            <div style={{ marginBottom: 24, padding: '20px 24px', background: '#131313', border: `1px solid ${riskColor(classification.risk_level)}44` }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#555', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>Risk Level</div>
              <div style={{ fontSize: 28, fontWeight: 900, color: riskColor(classification.risk_level), letterSpacing: '-0.01em' }}>
                {classification.risk_level.charAt(0).toUpperCase() + classification.risk_level.slice(1)} Risk
              </div>
            </div>

            {/* Annex III */}
            {classification.annex_iii_category && classification.annex_iii_category !== 'none' && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#555', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>Annex III Category</div>
                <span style={{
                  display: 'inline-block',
                  padding: '4px 12px',
                  border: '1px solid rgba(255,255,255,0.12)',
                  fontSize: 13,
                  color: '#e8e8e8',
                  fontWeight: 600,
                }}>
                  {classification.annex_iii_category.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                </span>
              </div>
            )}

            {/* Articles */}
            {classification.articles_applicable.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#555', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 10 }}>Articles That Apply</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {classification.articles_applicable.map((a) => (
                    <span key={a} style={{ padding: '4px 12px', background: '#131313', border: '1px solid rgba(255,255,255,0.07)', fontSize: 12, color: '#00e5bf', fontWeight: 700 }}>
                      {a}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Obligations */}
            <div style={{ marginBottom: 28 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#555', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 12 }}>
                Obligations Generated ({classification.obligations.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {classification.obligations.map((ob) => (
                  <div key={ob.id} style={{ padding: '12px 16px', background: '#131313', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#00e5bf', whiteSpace: 'nowrap', marginTop: 1 }}>{ob.article}</span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#e8e8e8', marginBottom: 2 }}>{ob.title}</div>
                      <div style={{ fontSize: 12, color: '#666' }}>{ob.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => setStep(2)}
                style={{
                  padding: '11px 24px',
                  background: 'transparent',
                  color: '#666',
                  border: '1px solid rgba(255,255,255,0.07)',
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                ← Revise answers
              </button>
              <button
                onClick={saveSystem}
                disabled={saving}
                style={{
                  padding: '11px 28px',
                  background: saving ? '#0a4a40' : '#00e5bf',
                  color: '#040404',
                  border: 'none',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  fontSize: 13,
                  fontWeight: 700,
                  borderRadius: 100,
                  opacity: saving ? 0.7 : 1,
                }}
              >
                {saving ? 'Saving…' : 'Save system and start documenting →'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
