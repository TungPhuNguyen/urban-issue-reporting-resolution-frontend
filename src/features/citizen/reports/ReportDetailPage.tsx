import type { ReactNode } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'

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
import { resolveApiOrigin, resolveImageUrl } from './report-image-url'

interface ReportDetailLocationState {
  created?: boolean
}

interface DetailItemProps {
  label: string
  value: ReactNode
}

function DetailItem({ label, value }: DetailItemProps) {
  return (
    <div>
      <p className="text-gray-500 dark:text-gray-400">{label}</p>

      <div className="mt-1 font-medium text-gray-900 dark:text-gray-100">{value}</div>
    </div>
  )
}

function formatDateTime(value: string | null | undefined): string {
  if (!value) {
    return 'Chưa cập nhật'
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return 'Không xác định'
  }

  return date.toLocaleString('vi-VN')
}

function getPriorityLabel(priority: string | null | undefined): string {
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

function ErrorCard({
  message,
  onRetry,
  isRetrying = false,
}: {
  message: string
  onRetry?: () => void
  isRetrying?: boolean
}) {
  return (
    <Card className="p-8 text-center">
      <p className="font-medium text-red-600 dark:text-red-400">{message}</p>

      <div className="mt-5 flex flex-wrap justify-center gap-3">
        {onRetry && (
          <button
            type="button"
            disabled={isRetrying}
            onClick={onRetry}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
          >
            {isRetrying ? 'Đang tải lại...' : 'Thử lại'}
          </button>
        )}

        <Link
          to="/citizen/reports"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          Quay lại danh sách
        </Link>
      </div>
    </Card>
  )
}

export default function ReportDetailPage() {
  const { reportId = '' } = useParams()
  const location = useLocation()

  const apiOrigin = resolveApiOrigin(env.apiBaseUrl, window.location.origin)

  const locationState = location.state as ReportDetailLocationState | null

  const createdSuccessfully = locationState?.created === true

  const {
    data: report,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useCitizenReportDetail(reportId)

  const {
    data: timeline,
    isLoading: isTimelineLoading,
    isFetching: isTimelineFetching,
    error: timelineError,
    refetch: refetchTimeline,
  } = useCitizenReportTimeline(reportId)

  if (!reportId) {
    return <ErrorCard message="Mã phản ánh không hợp lệ." />
  }

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
        <ErrorCard message="Không tìm thấy phản ánh hoặc bạn không có quyền xem phản ánh này." />
      )
    }

    if (error.status === 403) {
      return <ErrorCard message="Bạn không có quyền xem phản ánh này." />
    }

    return (
      <ErrorCard
        message={error.message || 'Không thể tải thông tin phản ánh.'}
        isRetrying={isFetching}
        onRetry={() => {
          void refetch()
        }}
      />
    )
  }

  if (error) {
    return (
      <ErrorCard
        message="Không thể tải thông tin phản ánh."
        isRetrying={isFetching}
        onRetry={() => {
          void refetch()
        }}
      />
    )
  }

  if (!report) {
    return <ErrorCard message="Không có dữ liệu phản ánh." />
  }

  const isAutomaticallyAssigned =
    !report.requiresManualAssignment && report.departmentId !== null

  return (
    <section className="mx-auto flex max-w-5xl flex-col gap-5">
      <div>
        <Link
          to="/citizen/reports"
          className="inline-flex items-center text-sm font-medium text-blue-600 transition hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        >
          ← Quay lại danh sách phản ánh
        </Link>
      </div>

      <Card className="p-5 sm:p-6">
        {createdSuccessfully && (
          <div className="mb-5 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800 dark:border-green-900 dark:bg-green-950/40 dark:text-green-300">
            Phản ánh đã được gửi thành công.
          </div>
        )}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-medium tracking-wide text-gray-500 uppercase dark:text-gray-400">
              Mã phản ánh
            </p>

            <p className="mt-1 text-sm break-all text-gray-600 dark:text-gray-400">
              {report.id}
            </p>

            <h1 className="mt-3 text-2xl font-bold text-gray-900 dark:text-gray-100">
              {report.categoryName}
            </h1>

            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              {report.addressText || report.areaName}
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
                Hiện chưa tìm thấy quy tắc phân công phù hợp. Phản ánh đang chờ quản trị
                viên phân công thủ công.
              </p>
            </div>
          ) : isAutomaticallyAssigned ? (
            <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950/40">
              <h2 className="font-semibold text-green-900 dark:text-green-300">
                Đã tự động phân công
              </h2>

              <p className="mt-1 text-sm text-green-800 dark:text-green-400">
                Phản ánh đã được hệ thống chuyển đến{' '}
                <strong>{report.departmentName ?? 'đơn vị xử lý phù hợp'}</strong>.
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
          <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
            Mô tả sự cố
          </h2>

          <p className="mt-2 text-sm leading-6 whitespace-pre-wrap text-gray-700 dark:text-gray-300">
            {report.description}
          </p>
        </div>

        <div className="mt-6 grid gap-5 border-t border-gray-200 pt-5 text-sm sm:grid-cols-2 lg:grid-cols-3 dark:border-gray-800">
          <DetailItem label="Danh mục" value={report.categoryName} />

          <DetailItem label="Khu vực" value={report.areaName} />

          <DetailItem
            label="Đơn vị xử lý"
            value={report.departmentName ?? 'Chưa được phân công'}
          />

          <DetailItem label="Mức ưu tiên" value={getPriorityLabel(report.priority)} />

          <DetailItem label="Lượt ủng hộ" value={report.upvoteCount} />

          <DetailItem label="Ngày gửi" value={formatDateTime(report.createdAt)} />

          <DetailItem
            label="Cập nhật gần nhất"
            value={formatDateTime(report.updatedAt)}
          />

          <DetailItem label="Vĩ độ" value={report.latitude} />

          <DetailItem label="Kinh độ" value={report.longitude} />

          <DetailItem label="Bắt đầu SLA" value={formatDateTime(report.slaStartedAt)} />

          <DetailItem
            label="Số giờ SLA"
            value={
              report.appliedSlaHours !== null
                ? `${report.appliedSlaHours} giờ`
                : 'Chưa áp dụng'
            }
          />

          <DetailItem label="Thời hạn xử lý" value={formatDateTime(report.dueAt)} />

          <DetailItem label="Ngày tiếp nhận" value={formatDateTime(report.acceptedAt)} />

          <DetailItem label="Ngày hoàn thành" value={formatDateTime(report.resolvedAt)} />

          <DetailItem label="Ngày đóng" value={formatDateTime(report.closedAt)} />

          {report.rejectedAt && (
            <DetailItem label="Ngày từ chối" value={formatDateTime(report.rejectedAt)} />
          )}

          {report.reopenedAt && (
            <DetailItem label="Ngày mở lại" value={formatDateTime(report.reopenedAt)} />
          )}
        </div>

        {report.rejectedReason && (
          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/40">
            <h2 className="font-semibold text-red-900 dark:text-red-300">
              Lý do từ chối
            </h2>

            <p className="mt-2 text-sm whitespace-pre-wrap text-red-800 dark:text-red-400">
              {report.rejectedReason}
            </p>
          </div>
        )}

        {report.reopenReason && (
          <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950/40">
            <h2 className="font-semibold text-blue-900 dark:text-blue-300">
              Lý do mở lại
            </h2>

            <p className="mt-2 text-sm whitespace-pre-wrap text-blue-800 dark:text-blue-400">
              {report.reopenReason}
            </p>
          </div>
        )}

        {report.hasSubmittedComplaint && (
          <div className="mt-6 rounded-lg border border-orange-200 bg-orange-50 p-4 dark:border-orange-900 dark:bg-orange-950/40">
            <h2 className="font-semibold text-orange-900 dark:text-orange-300">
              Yêu cầu xử lý thêm đã gửi
            </h2>

            <p className="mt-1 text-xs text-orange-700 dark:text-orange-400">
              Thời gian gửi: {formatDateTime(report.complaintSubmittedAt)}
            </p>

            <p className="mt-3 text-sm whitespace-pre-wrap text-orange-800 dark:text-orange-300">
              {report.complaintReason ?? 'Không có nội dung yêu cầu.'}
            </p>
          </div>
        )}

        <div className="mt-6 border-t border-gray-200 pt-5 dark:border-gray-800">
          <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
            Hình ảnh sự cố
          </h2>

          {report.imageUrls.length === 0 ? (
            <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
              Phản ánh chưa có hình ảnh.
            </p>
          ) : (
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {report.imageUrls.map((imageUrl, index) => {
                const resolvedUrl = resolveImageUrl(imageUrl, apiOrigin)

                return (
                  <a
                    key={`${imageUrl}-${index}`}
                    href={resolvedUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="group overflow-hidden rounded-lg bg-black/5 dark:bg-white/5"
                  >
                    <img
                      src={resolvedUrl}
                      alt={`Hình ảnh sự cố ${index + 1}`}
                      className="h-64 w-full object-cover transition-transform group-hover:scale-105"
                      loading="lazy"
                    />
                  </a>
                )
              })}
            </div>
          )}
        </div>

        <ReportTimeline
          timeline={timeline}
          isLoading={isTimelineLoading}
          isFetching={isTimelineFetching}
          error={timelineError}
          apiOrigin={apiOrigin}
          onRetry={() => {
            void refetchTimeline()
          }}
        />
      </Card>
    </section>
  )
}
