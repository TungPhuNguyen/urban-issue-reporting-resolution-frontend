import { Badge, type BadgeProps } from './Badge'
import { getPriorityLabel } from './report-labels'

type BadgeVariant = NonNullable<BadgeProps['variant']>

export interface PriorityBadgeProps {
  priority?: string | null
}

const priorityVariants: Record<string, BadgeVariant> = {
  Low: 'default',
  Medium: 'warning',
  High: 'danger',
}

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  if (!priority) {
    return null
  }

  return (
    <Badge variant={priorityVariants[priority] ?? 'default'}>
      {getPriorityLabel(priority)}
    </Badge>
  )
}