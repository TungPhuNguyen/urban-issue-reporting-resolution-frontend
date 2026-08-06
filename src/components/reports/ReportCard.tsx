import { ArrowUpRight, CalendarDays, Clock, MapPin, ThumbsUp } from 'lucide-react'
import { Link } from 'react-router-dom'

import { PriorityBadge } from '@/components/ui/PriorityBadge'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { getImageUrl } from '@/lib/utils/image'

export interface ReportCardData {
  id: string
  reportCode?: string
  title?: string
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
    <Link to={to} className="report-card-link group focus-visible:outline-none">
      <article className="report-card group-focus-visible:ring-brand-500 group-focus-visible:ring-2">
        <div className="report-card__media">
          {thumbnailUrl ? (
            <>
              <img
                src={thumbnailUrl}
                alt={`Ảnh báo cáo ${report.categoryName}`}
                loading="lazy"
              />
              {showReportId && (
                <span className="report-card__code">
                  {report.reportCode ?? `#${report.id.slice(0, 8)}`}
                </span>
              )}
            </>
          ) : (
            <div className="report-card__placeholder" aria-hidden="true">
              <span>{report.categoryName.trim().charAt(0).toUpperCase() || '!'}</span>
            </div>
          )}
        </div>

        <div className="report-card__body">
          <div className="report-card__badges">
            <StatusBadge status={report.status} />
            <PriorityBadge priority={report.priority} />
          </div>

          <h3>{report.title ?? report.categoryName}</h3>
          {report.title && <small>{report.categoryName}</small>}
          <p>{report.description}</p>

          <div className="report-card__meta">
            <span>
              <MapPin aria-hidden="true" size={13} />
              Khu vực: {report.areaName}
            </span>
            {report.addressText && <span>{report.addressText}</span>}
            <span>
              <CalendarDays aria-hidden="true" size={13} />
              Ngày gửi: {formatDateTime(report.createdAt)}
            </span>
          </div>

          <div className="report-card__footer">
            {typeof report.upvoteCount === 'number' && (
              <span>
                <ThumbsUp aria-hidden="true" size={13} />
                {report.upvoteCount} lượt ủng hộ
              </span>
            )}
            {showDueDate && (
              <span>
                <Clock aria-hidden="true" size={13} />
                Hạn xử lý: {formatDateTime(report.dueAt)}
              </span>
            )}
            <span className="report-card__open">
              Chi tiết <ArrowUpRight aria-hidden="true" size={13} />
            </span>
          </div>
        </div>
      </article>
    </Link>
  )
}
