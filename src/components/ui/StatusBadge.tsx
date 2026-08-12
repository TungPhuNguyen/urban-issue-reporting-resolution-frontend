import { Badge, type BadgeProps } from './Badge'
import { getStatusLabel } from './report-labels'

type BadgeVariant = NonNullable<BadgeProps['variant']>

export interface StatusBadgeProps {
  status?: string | null
}

const statusVariants: Record<string, BadgeVariant> = {
  New: 'info',
  Assigned: 'info',
  Accepted: 'info',
  InProgress: 'warning',
  Resolved: 'success',
  Closed: 'default',
  Rejected: 'danger',
  Reopened: 'warning',
  Cancelled: 'default',
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const variant = status ? statusVariants[status] : undefined

  return (
    <Badge variant={variant ?? 'default'}>
      <span aria-hidden="true" className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current" />
      {getStatusLabel(status)}
    </Badge>
  )
}
