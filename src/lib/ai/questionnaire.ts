import type { QuestionnaireQuestion } from '@/types'

export const QUESTIONNAIRE: QuestionnaireQuestion[] = [
  {
    id: 'q-business-domain',
    text: 'What business domain does this AI system operate in?',
    hint: 'Select the primary domain. If multiple apply, choose the one with the highest regulatory exposure.',
    type: 'single',
    triggersHighRisk: true,
    options: [
      { value: 'hr-recruitment', label: 'HR / Recruitment' },
      { value: 'credit-finance', label: 'Credit scoring / Finance' },
      { value: 'safety-critical', label: 'Safety-critical infrastructure' },
      { value: 'law-enforcement', label: 'Law enforcement' },
      { value: 'education', label: 'Education / Vocational training' },
      { value: 'healthcare', label: 'Healthcare' },
      { value: 'general-operations', label: 'General operations' },
    ],
  },
  {
    id: 'q-automation-level',
    text: 'What is the level of automation in decision-making?',
    hint: 'How much does the AI system influence or determine outcomes without human intervention?',
    type: 'single',
    triggersHighRisk: true,
    options: [
      { value: 'fully-automated', label: 'Fully automated — no human review before action' },
      { value: 'human-reviews', label: 'Human reviews AI output before acting' },
      { value: 'ai-is-tool', label: 'AI is a supporting tool — human makes all decisions' },
      { value: 'minimal', label: 'Minimal AI involvement' },
    ],
  },
  {
    id: 'q-impact-severity',
    text: 'What is the potential impact severity on affected individuals?',
    hint: 'Consider the worst-case outcome if the system makes an incorrect decision.',
    type: 'single',
    triggersHighRisk: true,
    options: [
      { value: 'significant', label: 'Significant — affects rights, safety, or livelihood' },
      { value: 'moderate', label: 'Moderate — causes inconvenience or minor financial impact' },
      { value: 'low', label: 'Low — negligible impact on individuals' },
    ],
  },
  {
    id: 'q-personal-data',
    text: 'What type of personal data does the system process?',
    hint: 'Special category data includes biometrics, health, ethnicity, political opinions, etc.',
    type: 'single',
    options: [
      { value: 'special-category', label: 'Special category data (biometric, health, ethnicity, etc.)' },
      { value: 'standard-personal', label: 'Standard personal data (name, email, behaviour, etc.)' },
      { value: 'no-personal-data', label: 'No personal data' },
    ],
  },
  {
    id: 'q-transparency',
    text: 'Are individuals informed that they are interacting with or subject to an AI system?',
    type: 'single',
    options: [
      { value: 'not-disclosed', label: 'Not disclosed' },
      { value: 'partial', label: 'Partially disclosed (e.g. in terms of service)' },
      { value: 'full-disclosure', label: 'Fully disclosed at point of interaction' },
    ],
  },
  {
    id: 'q-biometric-data',
    text: 'Does the system use biometric data?',
    hint: 'Biometric data includes facial recognition, fingerprints, voice patterns, gait analysis, etc.',
    type: 'single',
    triggersHighRisk: true,
    options: [
      { value: 'yes-realtime', label: 'Yes — real-time biometric identification' },
      { value: 'yes-non-realtime', label: 'Yes — non-real-time biometric processing' },
      { value: 'no', label: 'No biometric data used' },
    ],
  },
  {
    id: 'q-operational-logs',
    text: 'What level of operational logging does the system currently have?',
    type: 'single',
    options: [
      { value: 'comprehensive', label: 'Comprehensive — full audit trail of inputs, outputs, and decisions' },
      { value: 'basic', label: 'Basic — some logs but incomplete' },
      { value: 'none', label: 'None' },
    ],
  },
  {
    id: 'q-technical-docs',
    text: 'What is the current state of technical documentation?',
    type: 'single',
    options: [
      { value: 'comprehensive', label: 'Comprehensive — architecture, data flows, model cards' },
      { value: 'partial', label: 'Partial — some documentation exists' },
      { value: 'none', label: 'None' },
    ],
  },
  {
    id: 'q-testing',
    text: 'Has the system been tested for accuracy and bias?',
    type: 'single',
    options: [
      { value: 'formal', label: 'Formal testing programme with documented results' },
      { value: 'informal', label: 'Informal or ad-hoc testing' },
      { value: 'none', label: 'No testing performed' },
    ],
  },
  {
    id: 'q-provider-type',
    text: 'How is the AI system developed and deployed?',
    hint: 'This affects whether you are classified as a provider, deployer, or both.',
    type: 'single',
    options: [
      { value: 'in-house', label: 'Built in-house' },
      { value: 'third-party-configured', label: 'Third-party system configured for our use' },
      { value: 'off-the-shelf', label: 'Off-the-shelf SaaS (used as-is)' },
    ],
  },
  {
    id: 'q-deployment-timeline',
    text: 'When was (or will) the system be deployed?',
    hint: 'EU AI Act obligations phase in over time. Earlier deployments may have different transition rules.',
    type: 'single',
    options: [
      { value: 'before-aug-2024', label: 'Before August 2024' },
      { value: 'aug-2024-aug-2026', label: 'August 2024 – August 2026' },
      { value: 'after-aug-2026', label: 'After August 2026' },
    ],
  },
  {
    id: 'q-affected-individuals',
    text: 'How many individuals does this system affect per month?',
    hint: 'Include anyone whose data is processed or who receives an AI-influenced decision.',
    type: 'single',
    triggersHighRisk: true,
    options: [
      { value: 'under-50', label: 'Under 50' },
      { value: '50-500', label: '50 – 500' },
      { value: 'over-500', label: 'Over 500' },
    ],
  },
]
