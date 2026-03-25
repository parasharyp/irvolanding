'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { QUESTIONNAIRE } from '@/lib/ai/questionnaire'
import type { RiskLevel, ClassificationResult } from '@/types'

interface SystemFormData {
  name: string
  description: string
  owner_name: string
  owner_email: string
  business_process: string
  data_sources: string
  model_type: string
}

function riskColor(level: RiskLevel): string {
  switch (level) {
    case 'unacceptable': return '#e54747'
    case 'high': return '#e54747'
    case 'limited': return '#f59e0b'
    case 'none': return '#36bd5f'
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
  const [creatingSystem, setCreatingSystem] = useState(false)
  const [classifying, setClassifying] = useState(false)
  const [systemId, setSystemId] = useState<string | null>(null)
  const [apiError, setApiError] = useState<string | null>(null)

  const [formData, setFormData] = useState<SystemFormData>({
    name: '',
    description: '',
    owner_name: '',
    owner_email: '',
    business_process: '',
    data_sources: '',
    model_type: '',
  })

  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [classification, setClassification] = useState<ClassificationResult | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  function setField(key: keyof SystemFormData, val: string) {
    setFormData((prev) => ({ ...prev, [key]: val }))
    if (errors[key]) setErrors((prev) => { const n = { ...prev }; delete n[key]; return n })
  }

  function setAnswer(id: string, val: string) {
    setAnswers((prev) => {
      const q = QUESTIONNAIRE.find((q) => q.id === id)
      if (q?.type === 'multi') {
        const current = prev[id] ? prev[id].split(',') : []
        const idx = current.indexOf(val)
        if (idx >= 0) current.splice(idx, 1)
        else current.push(val)
        return { ...prev, [id]: current.filter(Boolean).join(',') }
      }
      return { ...prev, [id]: val }
    })
  }

  function validateStep1() {
    const e: Record<string, string> = {}
    if (!formData.name.trim()) e.name = 'System name is required'
    if (!formData.owner_name.trim()) e.owner_name = 'Owner is required'
    if (!formData.business_process.trim()) e.business_process = 'Business process is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function createSystemAndContinue() {
    if (!validateStep1()) return
    setCreatingSystem(true)
    setApiError(null)
    try {
      // Create the system
      const res = await fetch('/api/systems', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setApiError(data.error ?? 'Failed to create system')
        setCreatingSystem(false)
        return
      }
      const newId = data.system?.id
      if (!newId) {
        setApiError('No system ID returned')
        setCreatingSystem(false)
        return
      }
      setSystemId(newId)

      // Update system with additional fields via PATCH
      const patchBody: Record<string, unknown> = {}
      if (formData.owner_name.trim()) patchBody.owner_name = formData.owner_name.trim()
      if (formData.owner_email.trim()) patchBody.owner_email = formData.owner_email.trim()
      if (formData.business_process.trim()) patchBody.business_process = formData.business_process.trim()
      if (formData.data_sources.trim()) patchBody.data_sources = formData.data_sources.split(',').map((s) => s.trim()).filter(Boolean)
      if (formData.model_type.trim()) patchBody.model_type = formData.model_type.trim()

      if (Object.keys(patchBody).length > 0) {
        await fetch(`/api/systems/${newId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(patchBody),
        })
      }

      setStep(2)
    } catch {
      setApiError('Network error — could not create system')
    } finally {
      setCreatingSystem(false)
    }
  }

  async function runClassification() {
    if (!systemId) return
    setClassifying(true)
    setApiError(null)
    try {
      const formattedAnswers = QUESTIONNAIRE.map((q) => ({
        questionId: q.id,
        answer: answers[q.id] ?? '',
      })).filter((a) => a.answer.length > 0)

      const res = await fetch('/api/systems/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ systemId, answers: formattedAnswers }),
      })
      const data = await res.json()
      if (!res.ok) {
        setApiError(data.error ?? 'Classification failed')
        setClassifying(false)
        return
      }
      setClassification(data.result)
      setStep(3)
    } catch {
      setApiError('Network error — classification failed')
    } finally {
      setClassifying(false)
    }
  }

  const answeredCount = QUESTIONNAIRE.filter((q) => answers[q.id]?.length > 0).length

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
                  {step > n ? '✓' : n}
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, color: step >= n ? '#e8e8e8' : '#444' }}>{label}</span>
              </div>
            </div>
          ))}
        </div>

        {/* API error banner */}
        {apiError && (
          <div style={{
            background: '#e5474712',
            border: '1px solid #e5474744',
            padding: '10px 16px',
            marginBottom: 20,
            fontSize: 13,
            color: '#e54747',
            fontWeight: 600,
          }}>
            {apiError}
          </div>
        )}

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

              <div style={{ display: 'flex', gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Owner / Responsible person *</label>
                  <input
                    value={formData.owner_name}
                    onChange={(e) => setField('owner_name', e.target.value)}
                    placeholder="e.g. Head of HR, CTO"
                    style={{ ...inputStyle, borderColor: errors.owner_name ? '#e54747' : 'rgba(255,255,255,0.07)' }}
                  />
                  {errors.owner_name && <span style={{ fontSize: 11, color: '#e54747', marginTop: 4, display: 'block' }}>{errors.owner_name}</span>}
                </div>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Owner email</label>
                  <input
                    value={formData.owner_email}
                    onChange={(e) => setField('owner_email', e.target.value)}
                    placeholder="e.g. cto@company.com"
                    style={inputStyle}
                  />
                </div>
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
                  placeholder="e.g. LinkedIn profiles, internal ATS database (comma separated)"
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
                  placeholder="Describe what the system does, how it works, and where it is deployed..."
                  rows={4}
                  style={{ ...inputStyle, resize: 'vertical' }}
                />
              </div>
            </div>

            <button
              onClick={createSystemAndContinue}
              disabled={creatingSystem}
              style={{
                marginTop: 28,
                padding: '11px 28px',
                background: creatingSystem ? '#0a4a40' : '#00e5bf',
                color: '#040404',
                border: 'none',
                cursor: creatingSystem ? 'not-allowed' : 'pointer',
                fontSize: 13,
                fontWeight: 700,
                borderRadius: 100,
                opacity: creatingSystem ? 0.7 : 1,
              }}
            >
              {creatingSystem ? 'Creating system...' : 'Continue to questionnaire →'}
            </button>
          </div>
        )}

        {/* Step 2: Questionnaire */}
        {step === 2 && (
          <div style={{ background: '#0c0c0c', border: '1px solid rgba(255,255,255,0.07)', padding: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <h2 style={{ fontSize: 18, fontWeight: 900, color: '#ffffff', margin: 0 }}>Risk questionnaire</h2>
              <span style={{ fontSize: 12, color: '#555', fontWeight: 600 }}>
                {answeredCount} / {QUESTIONNAIRE.length} answered
              </span>
            </div>
            <p style={{ fontSize: 13, color: '#666', margin: '0 0 28px' }}>
              Answer these questions to classify your system under the EU AI Act.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {QUESTIONNAIRE.map((q, idx) => (
                <div key={q.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: 20 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#e8e8e8', marginBottom: 4, display: 'block' }}>
                    <span style={{ color: '#555', marginRight: 8, fontSize: 11 }}>{idx + 1}.</span>
                    {q.text}
                    {q.triggersHighRisk && (
                      <span style={{ marginLeft: 8, fontSize: 10, color: '#e54747', fontWeight: 700, letterSpacing: '0.04em' }}>
                        HIGH RISK FACTOR
                      </span>
                    )}
                  </label>
                  {q.hint && (
                    <div style={{ fontSize: 11, color: '#555', marginBottom: 10 }}>{q.hint}</div>
                  )}

                  {q.type === 'text' && (
                    <input
                      value={answers[q.id] ?? ''}
                      onChange={(e) => setAnswer(q.id, e.target.value)}
                      placeholder="Your answer..."
                      style={inputStyle}
                    />
                  )}

                  {q.type === 'single' && q.options && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {q.options.map((o) => {
                        const selected = answers[q.id] === o.value
                        return (
                          <label
                            key={o.value}
                            onClick={() => setAnswer(q.id, o.value)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 10,
                              cursor: 'pointer',
                              fontSize: 13,
                              color: selected ? '#e8e8e8' : '#666',
                              padding: '8px 12px',
                              background: selected ? '#131313' : 'transparent',
                              border: `1px solid ${selected ? '#00e5bf44' : 'rgba(255,255,255,0.04)'}`,
                              transition: 'all 0.15s ease',
                            }}
                          >
                            <div style={{
                              width: 14, height: 14, borderRadius: '50%',
                              border: `1px solid ${selected ? '#00e5bf' : '#333'}`,
                              background: selected ? '#00e5bf' : 'transparent',
                              flexShrink: 0,
                            }} />
                            <span>{o.label}</span>
                          </label>
                        )
                      })}
                    </div>
                  )}

                  {q.type === 'multi' && q.options && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {q.options.map((o) => {
                        const selectedValues = answers[q.id] ? answers[q.id].split(',') : []
                        const checked = selectedValues.includes(o.value)
                        return (
                          <label
                            key={o.value}
                            onClick={() => setAnswer(q.id, o.value)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 10,
                              cursor: 'pointer',
                              fontSize: 13,
                              color: checked ? '#e8e8e8' : '#666',
                              padding: '8px 12px',
                              background: checked ? '#131313' : 'transparent',
                              border: `1px solid ${checked ? '#00e5bf44' : 'rgba(255,255,255,0.04)'}`,
                              transition: 'all 0.15s ease',
                            }}
                          >
                            <div style={{
                              width: 14, height: 14,
                              border: `1px solid ${checked ? '#00e5bf' : '#333'}`,
                              background: checked ? '#00e5bf' : 'transparent',
                              flexShrink: 0,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                              {checked && <span style={{ fontSize: 10, color: '#040404', fontWeight: 900 }}>✓</span>}
                            </div>
                            <span>{o.label}</span>
                          </label>
                        )
                      })}
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
                disabled={classifying || answeredCount === 0}
                style={{
                  padding: '11px 28px',
                  background: classifying ? '#0a4a40' : answeredCount === 0 ? '#131313' : '#00e5bf',
                  color: answeredCount === 0 ? '#555' : '#040404',
                  border: 'none',
                  cursor: classifying || answeredCount === 0 ? 'not-allowed' : 'pointer',
                  fontSize: 13,
                  fontWeight: 700,
                  borderRadius: 100,
                  opacity: classifying ? 0.7 : 1,
                }}
              >
                {classifying ? 'Classifying...' : 'Run classification →'}
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
            <div style={{ marginBottom: 24, padding: '20px 24px', background: '#131313', border: `1px solid ${riskColor(classification.riskLevel)}44` }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#555', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>Risk Level</div>
              <div style={{ fontSize: 28, fontWeight: 900, color: riskColor(classification.riskLevel), letterSpacing: '-0.01em' }}>
                {classification.riskLevel.charAt(0).toUpperCase() + classification.riskLevel.slice(1)} Risk
              </div>
            </div>

            {/* Annex category */}
            {classification.annexCategory && classification.annexCategory !== 'none' && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#555', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>Annex Category</div>
                <span style={{
                  display: 'inline-block',
                  padding: '4px 12px',
                  border: '1px solid rgba(255,255,255,0.12)',
                  fontSize: 13,
                  color: '#e8e8e8',
                  fontWeight: 600,
                }}>
                  {classification.annexCategory.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                </span>
              </div>
            )}

            {/* Rationale */}
            {classification.rationale && (
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#555', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>Classification Rationale</div>
                <div style={{ fontSize: 13, color: '#888', lineHeight: 1.6, padding: '12px 16px', background: '#0c0c0c', border: '1px solid rgba(255,255,255,0.05)' }}>
                  {classification.rationale}
                </div>
              </div>
            )}

            {/* Immediate actions */}
            {classification.immediateActions && classification.immediateActions.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#f59e0b', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 10 }}>Immediate Actions Required</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {classification.immediateActions.map((action, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '8px 12px', background: '#f59e0b08', border: '1px solid #f59e0b22' }}>
                      <span style={{ color: '#f59e0b', fontSize: 12, fontWeight: 700, marginTop: 1 }}>!</span>
                      <span style={{ fontSize: 13, color: '#e8e8e8' }}>{action}</span>
                    </div>
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
                {classification.obligations.map((ob, i) => (
                  <div key={i} style={{ padding: '12px 16px', background: '#131313', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#00e5bf', whiteSpace: 'nowrap', marginTop: 1 }}>{ob.article}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#e8e8e8', marginBottom: 2 }}>{ob.title}</div>
                      <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>{ob.description}</div>
                      {ob.evidenceRequired && (
                        <div style={{ fontSize: 11, color: '#555', fontStyle: 'italic' }}>
                          Evidence: {ob.evidenceRequired}
                        </div>
                      )}
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
                onClick={() => router.push(`/systems/${systemId}`)}
                style={{
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
                Continue to evidence →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
