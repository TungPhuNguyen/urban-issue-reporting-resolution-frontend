import { CalendarDays, Clock, MapPin, ThumbsUp } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Card } from '@/components/ui/Card'
import { PriorityBadge } from '@/components/ui/PriorityBadge'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { getImageUrl } from '@/lib/utils/image'

export interface ReportCardData {
  id: string
  categoryName: string
  areaName: string
  description: string
  addressText?: string | null
  status: string
  priority?: string | null
  upvoteCount?: number
  thumbnailUrl?: string | null
  createdAt: string
  dueAt?: string | null
}

export interface ReportCardProps {
  report: ReportCardData
  to: string
  showReportId?: boolean
  showDueDate?: boolean
}

function formatDateTime(value: string | null | undefined) {
  if (!value) {
    return 'Chưa bắt đầu'
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return 'Không xác định'
  }

  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date)
}

export function ReportCard({
  report,
  to,
  showReportId = false,
  showDueDate = false,
}: ReportCardProps) {
  const thumbnailUrl = getImageUrl(report.thumbnailUrl)

  return (
    <Link to={to} className="group block rounded-xl focus-visible:outline-none">
      <Card className="group-hover:border-brand-500/40 group-focus-visible:ring-brand-500 overflow-hidden transition duration-200 group-hover:-translate-y-0.5 group-hover:shadow-md group-focus-visible:ring-2">
        <div className="flex flex-col sm:flex-row">
          {thumbnailUrl && (
            <div className="h-44 shrink-0 overflow-hidden bg-gray-100 sm:h-auto sm:w-48 dark:bg-gray-800">
              <img
                src={thumbnailUrl}
                alt={`Ảnh báo cáo ${report.categoryName}`}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
          )}

          <div className="min-w-0 flex-1 p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                {showReportId && (
                  <p className="text-xs font-medium tracking-wide text-gray-500 uppercase dark:text-gray-400">
                    Mã báo cáo: #{report.id.slice(0, 8)}
                  </p>
                )}

                <h2 className="mt-1 font-semibold text-gray-900 dark:text-gray-100">
                  {report.categoryName}
                </h2>

                <p className="mt-1 flex items-start gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>Khu vực: {report.areaName}</span>
                </p>

                {report.addressText && (
                  <p className="mt-1 pl-5 text-sm text-gray-600 dark:text-gray-400">
                    {report.addressText}
                  </p>
                )}
              </div>

              <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
                <StatusBadge status={report.status} />
                <PriorityBadge priority={report.priority} />
              </div>
            </div>

            <p className="mt-4 line-clamp-2 text-sm leading-6 text-gray-700 dark:text-gray-300">
              {report.description}
            </p>

            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-gray-500 dark:text-gray-400">
              {typeof report.upvoteCount === 'number' && (
                <span className="inline-flex items-center gap-1.5">
                  <ThumbsUp className="h-3.5 w-3.5" />
                  {report.upvoteCount} lượt ủng hộ
                </span>
              )}

              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5" />
                Ngày gửi: {formatDateTime(report.createdAt)}
              </span>

              {showDueDate && (
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  Hạn xử lý: {formatDateTime(report.dueAt)}
                </span>
              )}
            </div>
          </div>
        </div>
      </Card>
    </Link>
  )
}
