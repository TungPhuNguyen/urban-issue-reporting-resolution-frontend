import { Spinner } from '@/components/ui/Spinner'
import { ReportStatusBadge } from './ReportStatusBadge'
import type { ReportTimeline as ReportTimelineData } from './citizen-report.types'

interface ReportTimelineProps {
  timeline: ReportTimelineData | undefined
  isLoading: boolean
  error: unknown
  apiOrigin: string
}

export function ReportTimeline({
  timeline,
  isLoading,
  error,
  apiOrigin,
}: ReportTimelineProps) {
  return (
    <div className="mt-6 border-t border-gray-200 pt-5 dark:border-gray-800">
      <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
        Tiến trình xử lý
      </h2>

      {isLoading ? (
        <div className="mt-4">
          <Spinner />
        </div>
      ) : error ? (
        <p className="mt-2 text-sm text-red-600">
          Không thể tải tiến trình xử lý.
        </p>
      ) : timeline && timeline.items.length > 0 ? (
        <div className="mt-4 space-y-4">
          {timeline.items.map((item) => (
            <div
              key={item.id}
              className="rounded-lg border border-gray-200 p-4 dark:border-gray-800"
            >
              <div className="flex items-center justify-between gap-4">
                <ReportStatusBadge status={item.newStatus} />

                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(item.createdAt).toLocaleString('vi-VN')}
                </span>
              </div>

              {item.note && (
                <p className="mt-3 text-sm leading-6 text-gray-700 dark:text-gray-300">
                  {item.note}
                </p>
              )}

              {item.imageUrls.length > 0 && (
                <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {item.imageUrls.map((imageUrl) => (
                    <div
                      key={imageUrl}
                      className="overflow-hidden rounded-lg bg-black/5 dark:bg-white/5"
                    >
                      <img
                        src={`${apiOrigin}${imageUrl}`}
                        alt="Hình ảnh cập nhật tiến trình"
                        className="max-h-72 w-full object-contain"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Chưa có tiến trình xử lý.
        </p>
      )}
    </div>
  )
}