import { cn } from '@/lib/utils'
import { InvoiceStatus } from '@/types'

const STATUS_STYLES: Record<InvoiceStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-green-100 text-green-800',
  overdue: 'bg-red-100 text-red-800',
  escalated: 'bg-purple-100 text-purple-800',
}

const STATUS_LABELS: Record<InvoiceStatus, string> = {
  pending: 'Pending',
  paid: 'Paid',
  overdue: 'Overdue',
  escalated: 'Escalated',
}

export default function InvoiceStatusBadge({ status }: { status: InvoiceStatus }) {
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', STATUS_STYLES[status])}>
      {STATUS_LABELS[status]}
    </span>
  )
}
