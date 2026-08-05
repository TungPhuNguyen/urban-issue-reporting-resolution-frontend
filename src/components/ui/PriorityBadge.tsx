import { Badge, type BadgeProps } from './Badge'

type BadgeVariant = NonNullable<BadgeProps['variant']>

interface PriorityBadgeProps {
  priority?: string | null
}

const priorityConfig: Record<string, { label: string; variant: BadgeVariant }> = {
  Low: { label: 'Ưu tiên thấp', variant: 'default' },
  Medium: { label: 'Ưu tiên vừa', variant: 'warning' },
  High: { label: 'Ưu tiên cao', variant: 'danger' },
}

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  if (!priority) {
    return null
  }

  const config = priorityConfig[priority]

  return <Badge variant={config?.variant ?? 'default'}>{config?.label ?? priority}</Badge>
}
