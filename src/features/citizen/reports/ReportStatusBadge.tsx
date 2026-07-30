import { clsx } from 'clsx'

import type { CitizenReportSummary } from './citizen-report.types'

type ReportStatusBadgeProps = {
  status: CitizenReportSummary['status']
}

const statusStyles: Record<CitizenReportSummary['status'], string> = {
  New: 'bg-blue-100 text-blue-700',
  Assigned: 'bg-purple-100 text-purple-700',
  Accepted: 'bg-cyan-100 text-cyan-700',
  InProgress: 'bg-amber-100 text-amber-700',
  Resolved: 'bg-green-100 text-green-700',
  Closed: 'bg-gray-200 text-gray-700',
  Rejected: 'bg-red-100 text-red-700',
}

const statusLabels: Record<CitizenReportSummary['status'], string> = {
  New: 'Mới',
  Assigned: 'Đã phân công',
  Accepted: 'Đã tiếp nhận',
  InProgress: 'Đang xử lý',
  Resolved: 'Đã giải quyết',
  Closed: 'Đã đóng',
  Rejected: 'Đã từ chối',
}

export function ReportStatusBadge({ status }: ReportStatusBadgeProps) {
  return (
    <span
      className={clsx('rounded-full px-3 py-1 text-xs font-medium', statusStyles[status])}
    >
      {statusLabels[status]}
    </span>
  )
}
