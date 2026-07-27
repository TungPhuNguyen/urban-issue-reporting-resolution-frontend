import { Card } from '@/components/ui/Card'
import { ReportStatusBadge } from './ReportStatusBadge'
import { Link } from 'react-router-dom'

import type { CitizenReportSummary } from './citizen-report.types'

type ReportCardProps = {
  report: CitizenReportSummary
}

export function ReportCard({ report }: ReportCardProps) {
  return (
    <Link to={`/citizen/reports/${report.id}`} className="block">
      <Card className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-gray-100">
              {report.categoryName}
            </h2>

            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              {report.addressText}
            </p>
          </div>

          <ReportStatusBadge status={report.status} />
        </div>

        <p className="mt-4 text-sm text-gray-700 dark:text-gray-300">
          {report.description}
        </p>

        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-xs text-gray-500 dark:text-gray-400">
          <span>Khu vực: {report.areaName}</span>
          <span>Lượt ủng hộ: {report.upvoteCount}</span>
          <span>Ngày gửi: {new Date(report.createdAt).toLocaleDateString('vi-VN')}</span>
        </div>
      </Card>
    </Link>
  )
}
