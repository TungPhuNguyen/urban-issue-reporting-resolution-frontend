import { useParams } from 'react-router-dom'
import {
  useCitizenReportDetail,
  useCitizenReportTimeline,
} from './reports/citizen-report.queries'
import { Spinner } from '@/components/ui/Spinner'
import { Card } from '@/components/ui/Card'
import { ReportStatusBadge } from './reports/ReportStatusBadge'
import { ReportTimeline } from './reports/ReportTimeline'
import { ApiError } from '@/lib/api/http'
import { env } from '@/config/env'

export default function ReportDetailPage() {
  const { reportId = '' } = useParams()

  const apiOrigin = new URL(env.apiBaseUrl).origin

  const { data: report, isLoading, error } = useCitizenReportDetail(reportId)

  const {
    data: timeline,
    isLoading: isTimelineLoading,
    error: timelineError,
  } = useCitizenReportTimeline(reportId)

  if (isLoading) {
    return <Spinner />
  }

  if (error instanceof ApiError) {
    if (error.status === 404) {
      return (
        <Card className="p-6">
          <p className="text-gray-700 dark:text-gray-300">Không tìm thấy báo cáo.</p>
        </Card>
      )
    }

    if (error.status === 403) {
      return (
        <Card className="p-6">
          <p className="text-gray-700 dark:text-gray-300">
            Bạn không có quyền xem báo cáo này.
          </p>
        </Card>
      )
    }

    return (
      <Card className="p-6">
        <p className="text-red-600">{error.message}</p>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="p-6">
        <p className="text-red-600">Không thể tải thông tin báo cáo.</p>
      </Card>
    )
  }

  if (!report) {
    return (
      <Card className="p-6">
        <p className="text-gray-700 dark:text-gray-300">Không có dữ liệu báo cáo.</p>
      </Card>
    )
  }

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {report.categoryName}
          </h1>

          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {report.addressText}
          </p>
        </div>

        <ReportStatusBadge status={report.status} />
      </div>
      <div className="mt-6 border-t border-gray-200 pt-5 dark:border-gray-800">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          Mô tả sự cố
        </h2>

        <p className="mt-2 text-sm leading-6 text-gray-700 dark:text-gray-300">
          {report.description}
        </p>
      </div>
      <div className="mt-6 grid gap-4 border-t border-gray-200 pt-5 text-sm sm:grid-cols-2 lg:grid-cols-4 dark:border-gray-800">
        <div>
          <p className="text-gray-500 dark:text-gray-400">Khu vực</p>
          <p className="mt-1 font-medium text-gray-900 dark:text-gray-100">
            {report.areaName}
          </p>
        </div>

        <div>
          <p className="text-gray-500 dark:text-gray-400">Lượt ủng hộ</p>
          <p className="mt-1 font-medium text-gray-900 dark:text-gray-100">
            {report.upvoteCount}
          </p>
        </div>

        <div>
          <p className="text-gray-500 dark:text-gray-400">Ngày gửi</p>
          <p className="mt-1 font-medium text-gray-900 dark:text-gray-100">
            {new Date(report.createdAt).toLocaleDateString('vi-VN')}
          </p>
        </div>

        <div>
          <p className="text-gray-500 dark:text-gray-400">Mức ưu tiên</p>
          <p className="mt-1 font-medium text-gray-900 dark:text-gray-100">
            {report.priority ?? 'Chưa phân loại'}
          </p>
        </div>
      </div>
      <ReportTimeline
        timeline={timeline}
        isLoading={isTimelineLoading}
        error={timelineError}
        apiOrigin={apiOrigin}
      />
      {report.imageUrls.length > 0 && (
        <div className="mt-6 border-t border-gray-200 pt-5 dark:border-gray-800">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Hình ảnh sự cố
          </h2>

          <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {report.imageUrls.map((imageUrl) => (
              <div
                key={imageUrl}
                className="overflow-hidden rounded-lg bg-black/5 dark:bg-white/5"
              >
                <img
                  src={`${apiOrigin}${imageUrl}`}
                  alt={`Hình ảnh sự cố ${report.categoryName}`}
                  className="max-h-96 w-full object-contain"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  )
}
