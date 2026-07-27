import {
  useLocation,
  useParams,
} from 'react-router-dom'

import { Card } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'
import { env } from '@/config/env'
import { ApiError } from '@/lib/api/http'

import { ReportStatusBadge } from './ReportStatusBadge'
import { ReportTimeline } from './ReportTimeline'
import {
  useCitizenReportDetail,
  useCitizenReportTimeline,
} from './citizen-report.queries'

interface ReportDetailLocationState {
  created?: boolean
}

function resolveImageUrl(
  imageUrl: string,
  apiOrigin: string,
): string {
  if (
    imageUrl.startsWith('http://') ||
    imageUrl.startsWith('https://')
  ) {
    return imageUrl
  }

  const normalizedPath = imageUrl.startsWith('/')
    ? imageUrl
    : `/${imageUrl}`

  return `${apiOrigin}${normalizedPath}`
}

function formatDateTime(
  value: string | null | undefined,
): string {
  if (!value) {
    return 'Chưa cập nhật'
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return 'Không xác định'
  }

  return date.toLocaleString('vi-VN')
}

function getPriorityLabel(
  priority: string | null | undefined,
): string {
  switch (priority) {
    case 'High':
      return 'Cao'

    case 'Medium':
      return 'Trung bình'

    case 'Low':
      return 'Thấp'

    default:
      return 'Chưa phân loại'
  }
}

export default function ReportDetailPage() {
  const { reportId = '' } = useParams()
  const location = useLocation()

  const apiOrigin = new URL(env.apiBaseUrl).origin

  const locationState =
    location.state as ReportDetailLocationState | null

  const createdSuccessfully =
    locationState?.created === true

  const {
    data: report,
    isLoading,
    error,
  } = useCitizenReportDetail(reportId)

  const {
    data: timeline,
    isLoading: isTimelineLoading,
    error: timelineError,
  } = useCitizenReportTimeline(reportId)

  if (isLoading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <Spinner />
      </div>
    )
  }

  if (error instanceof ApiError) {
    if (error.status === 404) {
      return (
        <Card className="p-6">
          <p className="text-gray-700 dark:text-gray-300">
            Không tìm thấy báo cáo.
          </p>
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
        <p className="text-red-600 dark:text-red-400">
          {error.message}
        </p>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="p-6">
        <p className="text-red-600 dark:text-red-400">
          Không thể tải thông tin báo cáo.
        </p>
      </Card>
    )
  }

  if (!report) {
    return (
      <Card className="p-6">
        <p className="text-gray-700 dark:text-gray-300">
          Không có dữ liệu báo cáo.
        </p>
      </Card>
    )
  }

  const isAutomaticallyAssigned =
    !report.requiresManualAssignment &&
    report.departmentId !== null

  return (
    <Card className="p-5">
      {createdSuccessfully && (
        <div className="mb-5 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800 dark:border-green-900 dark:bg-green-950/40 dark:text-green-300">
          Phản ánh đã được gửi thành công.
        </div>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Mã phản ánh
          </p>

          <p className="mt-1 break-all text-sm text-gray-600 dark:text-gray-400">
            {report.id}
          </p>

          <h1 className="mt-3 text-2xl font-bold text-gray-900 dark:text-gray-100">
            {report.categoryName}
          </h1>

          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {report.addressText ?? report.areaName}
          </p>
        </div>

        <ReportStatusBadge status={report.status} />
      </div>

      <div className="mt-6">
        {report.requiresManualAssignment ? (
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-900 dark:bg-yellow-950/40">
            <h2 className="font-semibold text-yellow-900 dark:text-yellow-300">
              Chờ Admin phân công
            </h2>

            <p className="mt-1 text-sm text-yellow-800 dark:text-yellow-400">
              Hiện chưa tìm thấy quy tắc phân công phù hợp.
              Báo cáo đang chờ quản trị viên phân công thủ
              công.
            </p>
          </div>
        ) : isAutomaticallyAssigned ? (
          <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950/40">
            <h2 className="font-semibold text-green-900 dark:text-green-300">
              Đã tự động phân công
            </h2>

            <p className="mt-1 text-sm text-green-800 dark:text-green-400">
              Báo cáo đã được hệ thống chuyển đến{' '}
              <strong>
                {report.departmentName ??
                  'đơn vị xử lý phù hợp'}
              </strong>
              .
            </p>
          </div>
        ) : (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Thông tin phân công đang được cập nhật.
            </p>
          </div>
        )}
      </div>

      <div className="mt-6 border-t border-gray-200 pt-5 dark:border-gray-800">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          Mô tả sự cố
        </h2>

        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-700 dark:text-gray-300">
          {report.description}
        </p>
      </div>

      <div className="mt-6 grid gap-4 border-t border-gray-200 pt-5 text-sm sm:grid-cols-2 lg:grid-cols-3 dark:border-gray-800">
        <div>
          <p className="text-gray-500 dark:text-gray-400">
            Khu vực
          </p>

          <p className="mt-1 font-medium text-gray-900 dark:text-gray-100">
            {report.areaName}
          </p>
        </div>

        <div>
          <p className="text-gray-500 dark:text-gray-400">
            Đơn vị xử lý
          </p>

          <p className="mt-1 font-medium text-gray-900 dark:text-gray-100">
            {report.departmentName ??
              'Chưa được phân công'}
          </p>
        </div>

        <div>
          <p className="text-gray-500 dark:text-gray-400">
            Mức ưu tiên
          </p>

          <p className="mt-1 font-medium text-gray-900 dark:text-gray-100">
            {getPriorityLabel(report.priority)}
          </p>
        </div>

        <div>
          <p className="text-gray-500 dark:text-gray-400">
            Lượt ủng hộ
          </p>

          <p className="mt-1 font-medium text-gray-900 dark:text-gray-100">
            {report.upvoteCount}
          </p>
        </div>

        <div>
          <p className="text-gray-500 dark:text-gray-400">
            Ngày gửi
          </p>

          <p className="mt-1 font-medium text-gray-900 dark:text-gray-100">
            {formatDateTime(report.createdAt)}
          </p>
        </div>

        <div>
          <p className="text-gray-500 dark:text-gray-400">
            Cập nhật gần nhất
          </p>

          <p className="mt-1 font-medium text-gray-900 dark:text-gray-100">
            {formatDateTime(report.updatedAt)}
          </p>
        </div>

        <div>
          <p className="text-gray-500 dark:text-gray-400">
            Vĩ độ
          </p>

          <p className="mt-1 font-medium text-gray-900 dark:text-gray-100">
            {report.latitude}
          </p>
        </div>

        <div>
          <p className="text-gray-500 dark:text-gray-400">
            Kinh độ
          </p>

          <p className="mt-1 font-medium text-gray-900 dark:text-gray-100">
            {report.longitude}
          </p>
        </div>

        <div>
          <p className="text-gray-500 dark:text-gray-400">
            Thời hạn xử lý
          </p>

          <p className="mt-1 font-medium text-gray-900 dark:text-gray-100">
            {formatDateTime(report.dueAt)}
          </p>
        </div>
      </div>

      {report.rejectedReason && (
        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/40">
          <h2 className="font-semibold text-red-900 dark:text-red-300">
            Lý do từ chối
          </h2>

          <p className="mt-1 text-sm text-red-800 dark:text-red-400">
            {report.rejectedReason}
          </p>
        </div>
      )}

      {report.reopenReason && (
        <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950/40">
          <h2 className="font-semibold text-blue-900 dark:text-blue-300">
            Lý do mở lại
          </h2>

          <p className="mt-1 text-sm text-blue-800 dark:text-blue-400">
            {report.reopenReason}
          </p>
        </div>
      )}

      {report.imageUrls.length > 0 && (
        <div className="mt-6 border-t border-gray-200 pt-5 dark:border-gray-800">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Hình ảnh sự cố
          </h2>

          <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {report.imageUrls.map(
              (imageUrl, index) => (
                <a
                  key={`${imageUrl}-${index}`}
                  href={resolveImageUrl(
                    imageUrl,
                    apiOrigin,
                  )}
                  target="_blank"
                  rel="noreferrer"
                  className="overflow-hidden rounded-lg bg-black/5 dark:bg-white/5"
                >
                  <img
                    src={resolveImageUrl(
                      imageUrl,
                      apiOrigin,
                    )}
                    alt={`Hình ảnh sự cố ${index + 1}`}
                    className="h-64 w-full object-cover transition-transform hover:scale-105"
                    loading="lazy"
                  />
                </a>
              ),
            )}
          </div>
        </div>
      )}

      <div className="mt-6 border-t border-gray-200 pt-5 dark:border-gray-800">
        <ReportTimeline
          timeline={timeline}
          isLoading={isTimelineLoading}
          error={timelineError}
          apiOrigin={apiOrigin}
        />
      </div>
    </Card>
  )
}