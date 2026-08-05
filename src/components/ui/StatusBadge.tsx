import { Badge, type BadgeProps } from './Badge'

type BadgeVariant = NonNullable<BadgeProps['variant']>

interface StatusBadgeProps {
  status?: string | null
}

const statusConfig: Record<string, { label: string; variant: BadgeVariant }> = {
  New: { label: 'Mới tiếp nhận', variant: 'info' },
  Assigned: { label: 'Đã phân công', variant: 'info' },
  Accepted: { label: 'Đã tiếp nhận', variant: 'info' },
  InProgress: { label: 'Đang xử lý', variant: 'warning' },
  Resolved: { label: 'Đã xử lý', variant: 'success' },
  Closed: { label: 'Đã đóng', variant: 'default' },
  Rejected: { label: 'Từ chối', variant: 'danger' },
  Cancelled: { label: 'Đã hủy', variant: 'default' },
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = status ? statusConfig[status] : undefined

  return (
    <Badge variant={config?.variant ?? 'default'}>
      <span aria-hidden="true" className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current" />
      {config?.label ?? status ?? 'Không xác định'}
    </Badge>
  )
}
