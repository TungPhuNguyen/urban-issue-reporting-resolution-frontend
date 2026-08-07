import { ArrowLeft, Edit3 } from 'lucide-react'
import { type ReactNode, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'

import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { PriorityBadge } from '@/components/ui/PriorityBadge'
import { Spinner } from '@/components/ui/Spinner'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { env } from '@/config/env'
import { ApiError } from '@/lib/api/http'
import { parseApiDateTime } from '@/lib/utils/date-time'
import { getStatusLabel } from '@/components/ui/report-labels'
import { ImageUploader } from '@/features/reports/components/ImageUploader'

import { ReportComments } from './ReportComments'
import { ReportTimeline } from './ReportTimeline'
import {
  useCitizenReportDetail,
  useCitizenReportTimeline,
  useCloseCitizenReport,
  useSubmitComplaint,
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

  const date = parseApiDateTime(value)

  if (Number.isNaN(date.getTime())) {
    return 'Không xác định'
  }

  return date.toLocaleString('vi-VN')
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

  const [closeNote, setCloseNote] = useState('')

  const [closeError, setCloseError] = useState<string | null>(null)

  const [closeSuccess, setCloseSuccess] = useState<string | null>(null)

  const [showCloseConfirm, setShowCloseConfirm] = useState(false)

  const [complaintReason, setComplaintReason] = useState('')

  const [complaintError, setComplaintError] = useState<string | null>(null)

  const [complaintSuccess, setComplaintSuccess] = useState<string | null>(null)

  const [showComplaintConfirm, setShowComplaintConfirm] = useState(false)

  const [complaintImages, setComplaintImages] = useState<File[]>([])

  const [cancelReason, setCancelReason] = useState('')

  const [cancelError, setCancelError] = useState<string | null>(null)

  const [isCancelling, setIsCancelling] = useState(false)

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

  const closeMutation = useCloseCitizenReport()

  const complaintMutation = useSubmitComplaint()

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

  const currentReport = report

  const isAutomaticallyAssigned =
    !report.requiresManualAssignment && report.departmentId !== null

  const canClose =
    report.allowedActions?.canClose ??
    (report.status === 'Resolved' && !report.complaintSubmittedAt)

  const canSubmitComplaint =
    report.allowedActions?.canComplain ??
    (report.status === 'Resolved' &&
      !report.hasSubmittedComplaint &&
      !report.complaintSubmittedAt)

  async function handleCloseReport() {
    setCloseError(null)
    setCloseSuccess(null)

    const normalizedNote = closeNote.trim()

    if (normalizedNote.length > 1000) {
      setCloseError('Ghi chú không được vượt quá 1000 ký tự.')

      return
    }

    try {
      await closeMutation.mutateAsync({
        reportId,
        note: normalizedNote || undefined,
      })

      setShowCloseConfirm(false)
      setCloseSuccess('Đã đóng báo cáo thành công.')

      await refetch()
    } catch (closeRequestError) {
      setShowCloseConfirm(false)

      setCloseError(
        closeRequestError instanceof ApiError
          ? closeRequestError.message
          : 'Không thể đóng báo cáo.',
      )
    }
  }

  async function handleSubmitComplaint() {
    setComplaintError(null)
    setComplaintSuccess(null)

    const normalizedReason = complaintReason.trim()

    if (normalizedReason.length < 10) {
      setComplaintError('Lý do yêu cầu mở lại phải có ít nhất 10 ký tự.')

      return
    }

    if (normalizedReason.length > 2000) {
      setComplaintError('Lý do yêu cầu mở lại không được vượt quá 2000 ký tự.')

      return
    }

    try {
      await complaintMutation.mutateAsync({
        reportId,
        reason: normalizedReason,
        images: complaintImages,
      })

      setShowComplaintConfirm(false)
      setComplaintSuccess('Đã gửi yêu cầu mở lại báo cáo.')

      await refetch()
    } catch (complaintRequestError) {
      setShowComplaintConfirm(false)

      setComplaintError(
        complaintRequestError instanceof ApiError
          ? complaintRequestError.message
          : 'Không thể gửi yêu cầu mở lại.',
      )
    }
  }

  async function handleCancelReport() {
    const normalizedReason = cancelReason.trim()
    if (normalizedReason.length < 5 || normalizedReason.length > 1000) {
      setCancelError('Lý do hủy phải có từ 5 đến 1000 ký tự.')
      return
    }

    setIsCancelling(true)
    setCancelError(null)
    try {
      const { citizenReportApi } = await import('./citizen-report.api')
      await citizenReportApi.cancelReport({
        reportId,
        reason: normalizedReason,
        rowVersion: currentReport.rowVersion,
      })
      await refetch()
      setCancelReason('')
    } catch (requestError) {
      setCancelError(
        requestError instanceof ApiError
          ? requestError.message
          : 'Không thể hủy báo cáo.',
      )
    } finally {
      setIsCancelling(false)
    }
  }

  return (
    <section className="report-detail-page citizen-detail-page">
      <Link className="back-link" to="/citizen/reports">
        <ArrowLeft aria-hidden="true" size={17} /> Báo cáo của tôi
      </Link>

      <Card className="panel report-overview">
        {createdSuccessfully && (
          <div className="mb-5 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800 dark:border-green-900 dark:bg-green-950/40 dark:text-green-300">
            Phản ánh đã được gửi thành công.
          </div>
        )}

        <div className="page-heading page-heading--split">
          <div>
            <div className="heading-badges">
              <Badge>{report.reportCode ?? report.id}</Badge>
              <StatusBadge status={report.status} />
              <PriorityBadge priority={report.priority} />
            </div>

            <h1>{report.title ?? report.categoryName}</h1>

            <p>{report.addressText || report.areaName}</p>
          </div>

          <div className="heading-actions">
            {report.allowedActions?.canEdit && (
              <Link
                to={`/citizen/reports/${report.id}/edit`}
                className="button button--ghost"
              >
                <Edit3 aria-hidden="true" size={16} />
                Chỉnh sửa
              </Link>
            )}
          </div>
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

          {report.otherCategoryText && (
            <DetailItem label="Loại sự cố cụ thể" value={report.otherCategoryText} />
          )}

          <DetailItem label="Khu vực" value={report.areaName} />

          <DetailItem
            label="Đơn vị xử lý"
            value={report.departmentName ?? 'Chưa được phân công'}
          />

          <DetailItem
            label="Mức ưu tiên"
            value={
              report.priority ? (
                <PriorityBadge priority={report.priority} />
              ) : (
                'Chưa phân loại'
              )
            }
          />

          <DetailItem label="Lượt ủng hộ" value={report.upvoteCount} />

          <DetailItem label="Ngày gửi" value={formatDateTime(report.createdAt)} />

          <DetailItem
            label="Cập nhật gần nhất"
            value={formatDateTime(report.updatedAt)}
          />

          <DetailItem label="Vĩ độ" value={report.latitude} />

          <DetailItem label="Kinh độ" value={report.longitude} />

          <DetailItem label="Bắt đầu xử lý" value={formatDateTime(report.slaStartedAt)} />

          <DetailItem
            label="Số giờ xử lý"
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
              {report.complaint?.reason ??
                report.complaintReason ??
                'Không có nội dung yêu cầu.'}
            </p>

            {(report.complaint?.imageUrls ?? []).length > 0 && (
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {(report.complaint?.imageUrls ?? []).map((imageUrl, index) => (
                  <a
                    key={imageUrl}
                    href={resolveImageUrl(imageUrl, apiOrigin)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <img
                      src={resolveImageUrl(imageUrl, apiOrigin)}
                      alt={`Ảnh khiếu nại ${index + 1}`}
                      className="h-36 w-full rounded-lg object-cover"
                    />
                  </a>
                ))}
              </div>
            )}
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
            <div className="report-overview__gallery mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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

        {report.resolution && (
          <div className="mt-6 border-t border-gray-200 pt-5 dark:border-gray-800">
            <h2 className="text-base font-semibold">Kết quả xử lý</h2>
            <p className="mt-2 text-sm whitespace-pre-wrap text-gray-700 dark:text-gray-300">
              {report.resolution.note || 'Đơn vị xử lý chưa để lại ghi chú.'}
            </p>
            <p className="mt-1 text-xs text-gray-500">
              {report.resolution.resolvedByUserName ?? 'Cán bộ xử lý'} ·{' '}
              {formatDateTime(report.resolution.resolvedAt)}
            </p>
            {report.resolution.imageUrls.length > 0 && (
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {report.resolution.imageUrls.map((imageUrl, index) => (
                  <a
                    key={imageUrl}
                    href={resolveImageUrl(imageUrl, apiOrigin)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <img
                      src={resolveImageUrl(imageUrl, apiOrigin)}
                      alt={`Ảnh kết quả ${index + 1}`}
                      className="h-40 w-full rounded-lg object-cover"
                    />
                  </a>
                ))}
              </div>
            )}
          </div>
        )}

        {report.allowedActions?.canCancel && (
          <div className="mt-6 border-t border-gray-200 pt-5 dark:border-gray-800">
            <h2 className="text-base font-semibold text-red-700">Hủy báo cáo</h2>
            <textarea
              value={cancelReason}
              rows={3}
              maxLength={1000}
              placeholder="Nhập lý do hủy báo cáo"
              onChange={(event) => {
                setCancelReason(event.target.value)
                setCancelError(null)
              }}
              className="mt-3 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
            />
            {cancelError && <p className="mt-2 text-sm text-red-600">{cancelError}</p>}
            <Button
              type="button"
              variant="danger"
              className="mt-3"
              loading={isCancelling}
              onClick={() => void handleCancelReport()}
            >
              Xác nhận hủy báo cáo
            </Button>
          </div>
        )}

        <div className="mt-6 border-t border-gray-200 pt-5 dark:border-gray-800">
          <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
            Xác nhận kết quả xử lý
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Đóng báo cáo khi bạn xác nhận sự cố đã được xử lý hoàn tất.
          </p>

          {report.status === 'Closed' ? (
            <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800 dark:border-green-900 dark:bg-green-950/40 dark:text-green-300">
              Báo cáo đã được đóng
              {report.closedAt ? ` vào ${formatDateTime(report.closedAt)}` : ''}.
            </div>
          ) : report.complaintSubmittedAt ? (
            <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300">
              Không thể đóng báo cáo khi yêu cầu mở lại đang chờ Admin xem xét.
            </div>
          ) : !canClose ? (
            <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300">
              Chỉ có thể đóng báo cáo ở trạng thái{' '}
              <strong>{getStatusLabel('Resolved')}</strong>.
            </div>
          ) : (
            <div className="mt-4 flex max-w-2xl flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="closeNote"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Ghi chú xác nhận
                </label>

                <textarea
                  id="closeNote"
                  value={closeNote}
                  rows={4}
                  maxLength={1000}
                  disabled={closeMutation.isPending}
                  placeholder="Ghi chú xác nhận, không bắt buộc."
                  onChange={(event) => {
                    setCloseNote(event.target.value)
                    setCloseError(null)
                    setCloseSuccess(null)
                  }}
                  className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/30 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                />

                <p className="text-right text-xs text-gray-500">
                  {closeNote.length}/1000
                </p>
              </div>

              {closeError && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {closeError}
                </div>
              )}

              {closeSuccess && (
                <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">
                  {closeSuccess}
                </div>
              )}

              {!showCloseConfirm ? (
                <div>
                  <Button
                    type="button"
                    disabled={closeMutation.isPending}
                    onClick={() => {
                      setCloseError(null)
                      setShowCloseConfirm(true)
                    }}
                  >
                    Đóng báo cáo
                  </Button>
                </div>
              ) : (
                <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                  <p className="text-sm font-medium text-green-900">
                    Bạn xác nhận vấn đề đã được xử lý hoàn tất?
                  </p>

                  <p className="mt-1 text-sm text-green-800">
                    Báo cáo sẽ chuyển sang trạng thái{' '}
                    <strong>{getStatusLabel('Closed')}</strong>.
                  </p>

                  <div className="mt-4 flex flex-wrap gap-3">
                    <Button
                      type="button"
                      loading={closeMutation.isPending}
                      disabled={closeMutation.isPending}
                      onClick={handleCloseReport}
                    >
                      Xác nhận đóng
                    </Button>

                    <Button
                      type="button"
                      variant="secondary"
                      disabled={closeMutation.isPending}
                      onClick={() => setShowCloseConfirm(false)}
                    >
                      Hủy
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mt-6 border-t border-gray-200 pt-5 dark:border-gray-800">
          <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
            Yêu cầu mở lại báo cáo
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Gửi yêu cầu khi vấn đề chưa được xử lý hoàn toàn hoặc đã tái diễn.
          </p>

          {report.complaintSubmittedAt ? (
            <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300">
              Yêu cầu mở lại đã được gửi và đang chờ Admin xem xét.
            </div>
          ) : report.hasSubmittedComplaint ? (
            <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300">
              Báo cáo này đã từng được gửi yêu cầu mở lại.
            </div>
          ) : !canSubmitComplaint ? (
            <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300">
              Chỉ có thể yêu cầu mở lại báo cáo ở trạng thái{' '}
              <strong>{getStatusLabel('Resolved')}</strong>.
            </div>
          ) : (
            <div className="mt-4 flex max-w-2xl flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="complaintReason"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Lý do yêu cầu mở lại
                </label>

                <textarea
                  id="complaintReason"
                  value={complaintReason}
                  rows={4}
                  maxLength={2000}
                  disabled={complaintMutation.isPending}
                  placeholder="Mô tả lý do cần mở lại báo cáo, tối thiểu 10 ký tự."
                  onChange={(event) => {
                    setComplaintReason(event.target.value)
                    setComplaintError(null)
                    setComplaintSuccess(null)
                  }}
                  className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                />

                <p className="text-right text-xs text-gray-500">
                  {complaintReason.length}/2000
                </p>
              </div>

              <ImageUploader
                value={complaintImages}
                maxFiles={5}
                maxSizeMb={5}
                disabled={complaintMutation.isPending}
                onChange={setComplaintImages}
              />

              {complaintError && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {complaintError}
                </div>
              )}

              {complaintSuccess && (
                <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">
                  {complaintSuccess}
                </div>
              )}

              {!showComplaintConfirm ? (
                <div>
                  <Button
                    type="button"
                    disabled={
                      complaintMutation.isPending || complaintReason.trim().length < 10
                    }
                    onClick={() => {
                      setComplaintError(null)
                      setShowComplaintConfirm(true)
                    }}
                  >
                    Gửi yêu cầu mở lại
                  </Button>
                </div>
              ) : (
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                  <p className="text-sm font-medium text-blue-900">
                    Xác nhận gửi yêu cầu mở lại?
                  </p>

                  <p className="mt-1 text-sm text-blue-800">
                    Admin sẽ xem xét lý do trước khi quyết định mở lại báo cáo.
                  </p>

                  <div className="mt-4 flex flex-wrap gap-3">
                    <Button
                      type="button"
                      loading={complaintMutation.isPending}
                      disabled={complaintMutation.isPending}
                      onClick={handleSubmitComplaint}
                    >
                      Xác nhận gửi
                    </Button>

                    <Button
                      type="button"
                      variant="secondary"
                      disabled={complaintMutation.isPending}
                      onClick={() => setShowComplaintConfirm(false)}
                    >
                      Hủy
                    </Button>
                  </div>
                </div>
              )}
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
      <ReportComments reportId={reportId} />
    </section>
  )
}
