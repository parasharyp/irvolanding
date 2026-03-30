import type { RiskLevel } from '@/types'

export function riskColor(level: RiskLevel | null): string {
  switch (level) {
    case 'unacceptable': return '#e54747'
    case 'high': return '#e54747'
    case 'limited': return '#f59e0b'
    case 'none': return '#36bd5f'
    default: return '#555'
  }
}

export function riskLabel(level: RiskLevel | null): string {
  switch (level) {
    case 'unacceptable': return 'Unacceptable'
    case 'high': return 'High Risk'
    case 'limited': return 'Limited Risk'
    case 'none': return 'Minimal Risk'
    default: return 'Pending'
  }
}
