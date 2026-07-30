import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'
import { getImageUrl } from '@/features/staff/image'

import { useAdminReportTimeline } from './admin-reports.queries'

interface AdminReportTimelineProps {
  reportId: string
}

function formatDate(value: string) {
  const date = new Date(value)

  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat('vi-VN', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(date)
}

export default function AdminReportTimeline({ reportId }: AdminReportTimelineProps) {
  const query = useAdminReportTimeline(reportId)

  if (query.isPending) {
    return (
      <Card className="p-6">
        <Spinner label="Đang tải lịch sử xử lý..." />
      </Card>
    )
  }

  if (query.isError || !query.data) {
    return (
      <Card className="p-6 text-center">
        <p className="text-sm text-red-600">Không thể tải lịch sử xử lý.</p>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          className="mt-3"
          onClick={() => void query.refetch()}
        >
          Thử lại
        </Button>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold">Lịch sử xử lý</h2>
      <p className="mt-1 text-sm text-gray-500">
        Trạng thái hiện tại: {query.data.currentStatus}
      </p>

      {query.data.items.length === 0 ? (
        <p className="mt-5 text-sm text-gray-500">Chưa có lịch sử xử lý.</p>
      ) : (
        <ol className="mt-5 space-y-5">
          {query.data.items.map((item) => (
            <li
              key={item.id}
              className="border-l-2 border-gray-200 pl-5 dark:border-gray-700"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold">{item.newStatus}</span>
                {item.oldStatus && item.oldStatus !== item.newStatus && (
                  <span className="text-sm text-gray-500">
                    {item.oldStatus} → {item.newStatus}
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-gray-500">
                {formatDate(item.createdAt)}
                {item.updatedByUserName ? ` · ${item.updatedByUserName}` : ' · Hệ thống'}
              </p>
              {item.note && (
                <p className="mt-3 text-sm whitespace-pre-wrap">{item.note}</p>
              )}
              {item.imageUrls.length > 0 && (
                <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {item.imageUrls.map((imageUrl, index) => (
                    <a
                      key={`${imageUrl}-${index}`}
                      href={getImageUrl(imageUrl)}
                      target="_blank"
                      rel="noreferrer"
                      className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700"
                    >
                      <img
                        src={getImageUrl(imageUrl)}
                        alt={`Ảnh lịch sử ${index + 1}`}
                        loading="lazy"
                        className="h-40 w-full object-cover"
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
