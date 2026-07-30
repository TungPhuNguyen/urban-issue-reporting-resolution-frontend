import { Card } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'
import { getImageUrl } from '@/lib/utils/image'

import { useStaffReportTimeline } from '../staff.queries'

interface ReportTimelineProps {
  reportId: string
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

export function ReportTimeline({ reportId }: ReportTimelineProps) {
  const {
    data: timeline,
    isLoading,
    isError,
    isFetching,
    refetch,
  } = useStaffReportTimeline(reportId)

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex justify-center">
          <Spinner label="Đang tải lịch sử xử lý..." />
        </div>
      </Card>
    )
  }

  if (isError || !timeline) {
    return (
      <Card className="p-6 text-center">
        <p className="font-medium text-red-600">Không thể tải lịch sử xử lý.</p>

        <button
          type="button"
          disabled={isFetching}
          onClick={() => {
            void refetch()
          }}
          className="mt-4 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
        >
          {isFetching ? 'Đang tải lại...' : 'Thử lại'}
        </button>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Lịch sử xử lý
        </h2>

        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Trạng thái hiện tại: {timeline.currentStatus}
        </p>
      </div>

      {timeline.items.length === 0 ? (
        <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">
          Chưa có lịch sử xử lý.
        </p>
      ) : (
        <ol className="mt-6 space-y-6">
          {timeline.items.map((item) => (
            <li
              key={item.id}
              className="border-l-2 border-gray-200 pl-5 dark:border-gray-700"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {item.newStatus}
                </span>

                {item.oldStatus && item.oldStatus !== item.newStatus && (
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {item.oldStatus} → {item.newStatus}
                  </span>
                )}
              </div>

              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {formatDateTime(item.createdAt)}
              </p>

              {item.updatedByUserName && (
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                  Thực hiện bởi: {item.updatedByUserName}
                </p>
              )}

              {item.note && (
                <p className="mt-3 whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                  {item.note}
                </p>
              )}

              {item.imageUrls.length > 0 && (
                <div className="mt-4 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                  {item.imageUrls.map((imageUrl) => (
                    <a
                      key={imageUrl}
                      href={getImageUrl(imageUrl)}
                      target="_blank"
                      rel="noreferrer"
                      className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700"
                    >
                      <img
                        src={getImageUrl(imageUrl)}
                        alt={`Ảnh lịch sử trạng thái ${item.newStatus}`}
                        className="h-40 w-full object-cover transition hover:scale-105"
                      />
                    </a>
                  ))}
                </div>
              )}
            </li>
          ))}
        </ol>
      )}
    </Card>
  )
}
