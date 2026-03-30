'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { QUESTIONNAIRE } from '@/lib/ai/questionnaire'
import type { AISystem } from '@/types'
import { riskColor } from '@/lib/risk'

interface AnswerRow {
  question_id: string
  answer: string
}

export default function QuestionnaireReviewPage() {
  const params = useParams()
  const id = params.id as string
  const [system, setSystem] = useState<AISystem | null>(null)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        // Fetch system detail
        const sysRes = await fetch(`/api/systems/${id}`)
        if (!sysRes.ok) {
          setError('Failed to load system')
          setLoading(false)
          return
        }
        const sysData = await sysRes.json()
        setSystem(sysData.system ?? null)

        // Fetch questionnaire answers
        // The answers are stored in the questionnaire_answers table
        // We fetch them through the system detail — if the API doesn't return them,
        // we show a message. For now, try fetching from a dedicated endpoint.
        const ansRes = await fetch(`/api/systems/${id}/answers`)
        if (ansRes.ok) {
          const ansData = await ansRes.json()
          const map: Record<string, string> = {}
          for (const a of (ansData.answers ?? []) as AnswerRow[]) {
            map[a.question_id] = a.answer
          }
          setAnswers(map)
        }
        // If answers endpoint doesn't exist yet, we'll just show empty state
      } catch {
        setError('Failed to load data')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#040404', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666', fontFamily: 'var(--font-raleway), Raleway, Helvetica, Arial, sans-serif' }}>
        Loading...
      </div>
    )
  }

  if (error || !system) {
    return (
      <div style={{ minHeight: '100vh', background: '#040404', padding: 32, fontFamily: 'var(--font-raleway), Raleway, Helvetica, Arial, sans-serif', color: '#e8e8e8' }}>
        <Link href="/systems" style={{ fontSize: 12, color: '#555', textDecoration: 'none', display: 'inline-block', marginBottom: 24 }}>
          ← Back to AI Systems
        </Link>
        <div style={{ color: '#e54747', fontSize: 15, fontWeight: 700 }}>{error ?? 'System not found'}</div>
      </div>
    )
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
      <div style={{ width: '100%', maxWidth: 720 }}>
        {/* Back link */}
        <Link
          href={`/systems/${id}`}
          style={{ fontSize: 12, color: '#555', textDecoration: 'none', display: 'inline-block', marginBottom: 32 }}
        >
          ← Back to {system.name}
        </Link>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: '#ffffff', margin: '0 0 8px', letterSpacing: '-0.01em' }}>
            Questionnaire Answers
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 13, color: '#666' }}>{system.name}</span>
            {system.risk_level && (
              <span style={{
                padding: '2px 10px',
                border: `1px solid ${riskColor(system.risk_level)}`,
                color: riskColor(system.risk_level),
                fontSize: 11, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase',
              }}>
                {system.risk_level.charAt(0).toUpperCase() + system.risk_level.slice(1)} Risk
              </span>
            )}
            <span style={{ fontSize: 12, color: '#555' }}>
              {answeredCount} / {QUESTIONNAIRE.length} answered
            </span>
          </div>
        </div>

        {/* Classification rationale */}
        {system.classification_rationale && (
          <div style={{
            padding: '16px 20px',
            background: '#0c0c0c',
            border: '1px solid rgba(255,255,255,0.07)',
            marginBottom: 24,
          }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#555', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>
              Classification Rationale
            </div>
            <div style={{ fontSize: 13, color: '#888', lineHeight: 1.6 }}>
              {system.classification_rationale}
            </div>
          </div>
        )}

        {/* Questions and answers */}
        {answeredCount === 0 ? (
          <div style={{
            border: '1px solid rgba(255,255,255,0.07)',
            background: '#0c0c0c',
            padding: '48px 32px',
            textAlign: 'center',
          }}>
            <p style={{ fontSize: 15, fontWeight: 700, color: '#e8e8e8', margin: '0 0 8px' }}>No questionnaire answers found</p>
            <p style={{ fontSize: 13, color: '#666', margin: 0 }}>
              This system may not have been classified through the questionnaire yet.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {QUESTIONNAIRE.map((q, idx) => {
              const answer = answers[q.id]
              // Resolve answer label for single/multi select
              let displayAnswer = answer ?? ''
              if (q.options && answer) {
                if (q.type === 'multi') {
                  const values = answer.split(',')
                  displayAnswer = values
                    .map((v) => q.options?.find((o) => o.value === v)?.label ?? v)
                    .join(', ')
                } else {
                  displayAnswer = q.options.find((o) => o.value === answer)?.label ?? answer
                }
              }

              return (
                <div
                  key={q.id}
                  style={{
                    background: '#0c0c0c',
                    border: '1px solid rgba(255,255,255,0.07)',
                    padding: '16px 20px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <span style={{
                      fontSize: 11, fontWeight: 700, color: '#555',
                      width: 24, textAlign: 'right', flexShrink: 0, marginTop: 2,
                    }}>
                      {idx + 1}.
                    </span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#e8e8e8', marginBottom: 4 }}>
                        {q.text}
                        {q.triggersHighRisk && (
                          <span style={{ marginLeft: 8, fontSize: 10, color: '#e54747', fontWeight: 700 }}>HIGH RISK FACTOR</span>
                        )}
                      </div>
                      {q.hint && (
                        <div style={{ fontSize: 11, color: '#444', marginBottom: 6 }}>{q.hint}</div>
                      )}
                      {displayAnswer ? (
                        <div style={{
                          fontSize: 13,
                          color: '#00e5bf',
                          fontWeight: 600,
                          padding: '6px 12px',
                          background: '#00e5bf08',
                          border: '1px solid #00e5bf22',
                          marginTop: 4,
                        }}>
                          {displayAnswer}
                        </div>
                      ) : (
                        <div style={{ fontSize: 12, color: '#333', fontStyle: 'italic', marginTop: 4 }}>
                          Not answered
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
