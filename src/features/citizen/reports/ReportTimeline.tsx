import { Spinner } from '@/components/ui/Spinner'

import { ReportStatusBadge } from './ReportStatusBadge'
import { resolveImageUrl } from './report-image-url'
import type {
  ReportTimeline as ReportTimelineData,
  ReportTimelineItem,
} from './citizen-report.types'

interface ReportTimelineProps {
  timeline: ReportTimelineData | undefined
  isLoading: boolean
  isFetching: boolean
  error: unknown
  apiOrigin: string
  onRetry: () => void
}

function getUpdatedByLabel(item: ReportTimelineItem): string {
  const updatedByUserName = item.updatedByUserName?.trim()

  if (updatedByUserName) {
    return updatedByUserName
  }

  return item.updatedByUserId ? 'Người dùng không xác định' : 'Hệ thống'
}

function formatDateTime(value: string): string {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return 'Không xác định'
  }

  return date.toLocaleString('vi-VN')
}

export function ReportTimeline({
  timeline,
  isLoading,
  isFetching,
  error,
  apiOrigin,
  onRetry,
}: ReportTimelineProps) {
  if (isLoading) {
    return (
      <section>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Tiến trình xử lý
        </h2>

        <div className="mt-4 flex justify-center">
          <Spinner />
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Tiến trình xử lý
        </h2>

        <p className="mt-3 text-sm text-red-600 dark:text-red-400">
          Không thể tải tiến trình xử lý.
        </p>

        <button
          type="button"
          disabled={isFetching}
          onClick={onRetry}
          className="mt-3 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
        >
          {isFetching ? 'Đang tải lại...' : 'Thử lại'}
        </button>
      </section>
    )
  }

  if (!timeline || timeline.items.length === 0) {
    return (
      <section>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Tiến trình xử lý
        </h2>

        <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
          Chưa có tiến trình xử lý.
        </p>
      </section>
    )
  }

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Tiến trình xử lý
        </h2>

        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <span>Trạng thái hiện tại:</span>

          <ReportStatusBadge status={timeline.currentStatus} />
        </div>
      </div>

      <div className="mt-5 space-y-4">
        {timeline.items.map((item, index) => (
          <article
            key={item.id}
            className="relative rounded-lg border border-gray-200 p-4 dark:border-gray-800"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-700">
                  {index + 1}
                </span>

                <ReportStatusBadge status={item.newStatus} />
              </div>

              <time className="text-xs text-gray-500 dark:text-gray-400">
                {formatDateTime(item.createdAt)}
              </time>
            </div>

            {item.oldStatus && (
              <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                Trạng thái được cập nhật từ <strong>{item.oldStatus}</strong> sang{' '}
                <strong>{item.newStatus}</strong>.
              </p>
            )}

            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              {`Người cập nhật: ${getUpdatedByLabel(item)}`}
            </p>

            {item.note && (
              <p className="mt-3 text-sm leading-6 whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                {item.note}
              </p>
            )}

            {item.imageUrls.length > 0 && (
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {item.imageUrls.map((imageUrl, imageIndex) => {
                  const resolvedUrl = resolveImageUrl(imageUrl, apiOrigin)

                  return (
                    <a
                      key={`${imageUrl}-${imageIndex}`}
                      href={resolvedUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="overflow-hidden rounded-lg bg-black/5 dark:bg-white/5"
                    >
                      <img
                        src={resolvedUrl}
                        alt={`Ảnh tiến trình ${imageIndex + 1}`}
                        className="h-48 w-full object-cover transition-transform hover:scale-105"
                        loading="lazy"
                      />
                    </a>
                  )
                })}
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  )
}
