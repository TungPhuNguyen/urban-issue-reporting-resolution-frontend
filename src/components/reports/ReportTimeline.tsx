import { useId } from 'react'
import { AlertCircle } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { getStatusLabel } from '@/components/ui/report-labels'
import { Spinner } from '@/components/ui/Spinner'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { getImageUrl } from '@/lib/utils/image'

export interface ReportTimelineItem {
  id: number | string
  oldStatus?: string | null
  newStatus: string
  note?: string | null
  updatedByUserId?: string | null
  updatedByUserName?: string | null
  createdAt: string
  imageUrls: readonly string[]
}

export interface ReportTimelineData {
  reportId: string
  currentStatus: string
  items: readonly ReportTimelineItem[]
}

export interface ReportTimelineProps {
  timeline?: ReportTimelineData
  isLoading?: boolean
  isFetching?: boolean
  error?: unknown
  title?: string
  emptyMessage?: string
  onRetry?: () => void
  imageUrlResolver?: (imageUrl: string) => string
}

function formatDateTime(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return 'Không xác định'
  }

  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

function getUpdatedByLabel(item: ReportTimelineItem) {
  const updatedByUserName = item.updatedByUserName?.trim()

  if (updatedByUserName) {
    return updatedByUserName
  }

  return item.updatedByUserId ? 'Người dùng không xác định' : 'Hệ thống'
}

export function ReportTimeline({
  timeline,
  isLoading = false,
  isFetching = false,
  error,
  title = 'Lịch sử xử lý',
  emptyMessage = 'Chưa có lịch sử xử lý.',
  onRetry,
  imageUrlResolver = getImageUrl,
}: ReportTimelineProps) {
  const headingId = useId()

  return (
    <section aria-labelledby={headingId}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2
          id={headingId}
          className="text-lg font-semibold text-gray-900 dark:text-gray-100"
        >
          {title}
        </h2>

        {timeline && (
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <span>Trạng thái hiện tại:</span>
            <StatusBadge status={timeline.currentStatus} />
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="flex min-h-28 items-center justify-center">
          <Spinner label="Đang tải lịch sử xử lý..." />
        </div>
      ) : error ? (
        <div className="mt-5 rounded-lg border border-red-200 bg-red-50 p-5 text-center dark:border-red-900 dark:bg-red-950/30">
          <AlertCircle
            aria-hidden="true"
            className="mx-auto h-6 w-6 text-red-600 dark:text-red-400"
          />
          <p className="mt-2 text-sm font-medium text-red-700 dark:text-red-300">
            Không thể tải lịch sử xử lý.
          </p>

          {onRetry && (
            <Button
              type="button"
              size="sm"
              variant="secondary"
              loading={isFetching}
              className="mt-4"
              onClick={onRetry}
            >
              Thử lại
            </Button>
          )}
        </div>
      ) : !timeline || timeline.items.length === 0 ? (
        <EmptyState title={emptyMessage} className="mt-5 py-8" />
      ) : (
        <ol className="mt-6 space-y-5">
          {timeline.items.map((item, index) => (
            <li key={item.id} className="relative pl-10">
              {index < timeline.items.length - 1 && (
                <span
                  aria-hidden="true"
                  className="absolute top-8 bottom-[-1.25rem] left-[0.9rem] w-px bg-gray-200 dark:bg-gray-700"
                />
              )}

              <span className="bg-brand-100 text-brand-700 dark:bg-brand-500/20 dark:text-brand-100 absolute top-0 left-0 flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold">
                {index + 1}
              </span>

              <article className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <StatusBadge status={item.newStatus} />
                  <time
                    dateTime={item.createdAt}
                    className="text-xs text-gray-500 dark:text-gray-400"
                  >
                    {formatDateTime(item.createdAt)}
                  </time>
                </div>

                {item.oldStatus && item.oldStatus !== item.newStatus && (
                  <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                    Chuyển từ <strong>{getStatusLabel(item.oldStatus)}</strong> sang{' '}
                    <strong>{getStatusLabel(item.newStatus)}</strong>.
                  </p>
                )}

                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  Thực hiện bởi: {getUpdatedByLabel(item)}
                </p>

                {item.note && (
                  <p className="mt-3 text-sm leading-6 whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                    {item.note}
                  </p>
                )}

                {item.imageUrls.length > 0 && (
                  <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {item.imageUrls.map((imageUrl, imageIndex) => {
                      const resolvedUrl = imageUrlResolver(imageUrl)

                      return (
                        <a
                          key={`${imageUrl}-${imageIndex}`}
                          href={resolvedUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="group overflow-hidden rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
                        >
                          <img
                            src={resolvedUrl}
                            alt={`Ảnh tiến trình ${imageIndex + 1}`}
                            loading="lazy"
                            className="h-40 w-full object-cover transition-transform group-hover:scale-105"
                          />
                        </a>
                      )
                    })}
                  </div>
                )}
              </article>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}