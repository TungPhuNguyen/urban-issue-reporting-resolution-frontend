import { AlertTriangle, ArrowLeft } from 'lucide-react'
import { type FormEvent, useState } from 'react'

import { Link, useNavigate, useParams } from 'react-router-dom'

import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { PriorityBadge } from '@/components/ui/PriorityBadge'
import { getStatusLabel } from '@/components/ui/report-labels'
import { Spinner } from '@/components/ui/Spinner'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { ApiError } from '@/lib/api/http'
import { parseApiDateTime } from '@/lib/utils/date-time'
import { getImageUrl } from '@/lib/utils/image'
import { usePublicCategories } from '@/features/public-catalog/public-catalog.queries'

import AdminReportTimeline from './AdminReportTimeline'
import ReassignReportPanel from './ReassignReportPanel'
import ReopenReportPanel from './ReopenReportPanel'

import {
  useActiveDepartments,
  useActiveStaffByDepartment,
  useAdminReportDetail,
  useAssignDepartment,
  useAssignStaff,
  useRejectReport,
  useCloseAdminReport,
  useClassifyReport,
} from './admin-reports.queries'

function formatDate(value: string | null | undefined) {
  if (!value) {
    return 'Chưa có'
  }

  const date = parseApiDateTime(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date)
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof ApiError) {
    return error.message
  }

  if (error instanceof Error) {
    return error.message
  }

  return fallback
}

export default function AdminReportDetailPage() {
  const { reportId = '' } = useParams()
  const navigate = useNavigate()

  const [departmentId, setDepartmentId] = useState('')

  const [note, setNote] = useState('')

  const [formError, setFormError] = useState<string | null>(null)

  const [assignSuccess, setAssignSuccess] = useState<string | null>(null)

  const [staffId, setStaffId] = useState('')

  const [staffReason, setStaffReason] = useState('Phân công Staff phụ trách báo cáo')

  const [staffError, setStaffError] = useState<string | null>(null)

  const [staffSuccess, setStaffSuccess] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')

  const [rejectError, setRejectError] = useState<string | null>(null)

  const [rejectSuccess, setRejectSuccess] = useState<string | null>(null)

  const [showRejectConfirm, setShowRejectConfirm] = useState(false)

  const [closeNote, setCloseNote] = useState('')

  const [closeError, setCloseError] = useState<string | null>(null)

  const [closeSuccess, setCloseSuccess] = useState<string | null>(null)

  const [showCloseConfirm, setShowCloseConfirm] = useState(false)

  const [classificationCategoryId, setClassificationCategoryId] = useState('')
  const [classificationNote, setClassificationNote] = useState('')
  const [classificationError, setClassificationError] = useState<string | null>(null)

  const reportQuery = useAdminReportDetail(reportId)

  const departmentsQuery = useActiveDepartments()

  const assignMutation = useAssignDepartment()
  const reportDepartmentId = reportQuery.data?.departmentId ?? null

  const staffQuery = useActiveStaffByDepartment(reportDepartmentId)

  const assignStaffMutation = useAssignStaff()
  const rejectMutation = useRejectReport()
  const closeMutation = useCloseAdminReport()
  const classifyMutation = useClassifyReport()
  const categoriesQuery = usePublicCategories()

  if (reportQuery.isPending) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <Spinner />
      </div>
    )
  }

  if (reportQuery.isError) {
    return (
      <Card className="flex min-h-64 flex-col items-center justify-center gap-3 p-8 text-center">
        <h1 className="text-xl font-semibold">Không tải được chi tiết báo cáo</h1>

        <p className="text-sm text-red-600">
          {getErrorMessage(reportQuery.error, 'Không thể tải báo cáo.')}
        </p>

        <Button onClick={() => reportQuery.refetch()}>Thử lại</Button>
      </Card>
    )
  }

  const report = reportQuery.data
  const canClose =
    report.allowedActions?.canClose ??
    (report.status === 'Resolved' && report.complaintSubmittedAt === null)

  const canReject =
    report.status !== 'Resolved' &&
    report.status !== 'Closed' &&
    report.status !== 'Rejected'

  const canAssignStaff =
    report.status === 'Assigned' &&
    report.departmentId !== null &&
    report.assignedStaffId === null

  const canAssign =
    report.allowedActions?.canAssign ??
    (report.status === 'New' && report.departmentId == null)

  async function handleClassify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextCategoryId = Number(classificationCategoryId)
    if (!Number.isInteger(nextCategoryId) || nextCategoryId <= 0) {
      setClassificationError('Vui lòng chọn danh mục mới.')
      return
    }
    setClassificationError(null)
    try {
      await classifyMutation.mutateAsync({
        reportId,
        categoryId: nextCategoryId,
        note: classificationNote,
      })
      await reportQuery.refetch()
      setClassificationCategoryId('')
      setClassificationNote('')
    } catch (error) {
      setClassificationError(getErrorMessage(error, 'Không thể phân loại báo cáo.'))
    }
  }

  async function handleAssign(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError(null)
    setAssignSuccess(null)

    const selectedDepartmentId = Number(departmentId)

    if (!Number.isInteger(selectedDepartmentId) || selectedDepartmentId <= 0) {
      setFormError('Vui lòng chọn phòng ban.')

      return
    }

    try {
      await assignMutation.mutateAsync({
        reportId,
        departmentId: selectedDepartmentId,
        note,
      })

      setAssignSuccess('Đã phân công phòng ban. Bạn có thể chọn Staff ngay bên dưới.')
      setDepartmentId('')
      setNote('')
      await reportQuery.refetch()
    } catch (error) {
      setFormError(getErrorMessage(error, 'Không thể phân công báo cáo.'))
    }
  }
  async function handleAssignStaff(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setStaffError(null)
    setStaffSuccess(null)

    if (report.departmentId === null) {
      setStaffError('Báo cáo chưa được phân công phòng ban.')

      return
    }

    if (!staffId) {
      setStaffError('Vui lòng chọn Staff phụ trách.')

      return
    }

    const normalizedReason = staffReason.trim()

    if (normalizedReason.length < 5) {
      setStaffError('Lý do phân công phải có ít nhất 5 ký tự.')

      return
    }

    try {
      const result = await assignStaffMutation.mutateAsync({
        reportId,
        departmentId: report.departmentId,
        staffId,
        reason: normalizedReason,
      })

      setStaffSuccess(
        `Đã phân công báo cáo cho ${result.assignedStaffName ?? 'Staff đã chọn'}.`,
      )

      setStaffId('')

      await reportQuery.refetch()
    } catch (error) {
      setStaffError(getErrorMessage(error, 'Không thể phân công Staff.'))
    }
  }
  async function handleRejectReport() {
    setRejectError(null)
    setRejectSuccess(null)

    const normalizedReason = rejectReason.trim()

    if (normalizedReason.length < 10) {
      setRejectError('Lý do từ chối phải có ít nhất 10 ký tự.')

      return
    }

    if (normalizedReason.length > 1000) {
      setRejectError('Lý do từ chối không được vượt quá 1000 ký tự.')

      return
    }

    try {
      await rejectMutation.mutateAsync({
        reportId,
        reason: normalizedReason,
      })

      setShowRejectConfirm(false)

      setRejectSuccess('Đã từ chối báo cáo thành công.')

      await reportQuery.refetch()
    } catch (error) {
      setShowRejectConfirm(false)

      setRejectError(getErrorMessage(error, 'Không thể từ chối báo cáo.'))
    }
  }
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

      await reportQuery.refetch()
    } catch (error) {
      setShowCloseConfirm(false)

      setCloseError(getErrorMessage(error, 'Không thể đóng báo cáo.'))
    }
  }
  return (
    <section className="report-detail-page admin-detail-page flex flex-col gap-5">
      <Link className="back-link" to="/admin/reports">
        <ArrowLeft aria-hidden="true" size={17} /> Quản lý báo cáo
      </Link>

      <div className="page-heading page-heading--split">
        <div>
          <div className="heading-badges">
            <Badge>{report.reportCode ?? report.id}</Badge>
            <StatusBadge status={report.status} />
            {report.requiresManualAssignment && (
              <Badge variant="warning">Cần điều phối</Badge>
            )}
            {report.isEscalated && (
              <Badge variant="danger">
                <AlertTriangle aria-hidden="true" size={13} /> Quá hạn
              </Badge>
            )}
          </div>
          <h1>{report.title ?? 'Chi tiết báo cáo'}</h1>
          <p>
            {report.citizenName} · {report.citizenEmail} · {report.areaName}
          </p>
        </div>
      </div>

      <Card className="panel report-overview grid gap-5 md:grid-cols-2">
        <div>
          <p className="text-xs font-medium tracking-wide text-gray-500 uppercase">
            Người báo cáo
          </p>

          <p className="mt-1">{report.citizenName}</p>

          <p className="text-sm text-gray-500">{report.citizenEmail}</p>
        </div>

        <div>
          <p className="text-xs font-medium tracking-wide text-gray-500 uppercase">
            Trạng thái
          </p>

          <div className="mt-1">
            <StatusBadge status={report.status} />
          </div>
        </div>

        <div>
          <p className="text-xs font-medium tracking-wide text-gray-500 uppercase">
            Danh mục
          </p>

          <p className="mt-1">{report.categoryName}</p>
          {report.otherCategoryText && (
            <p className="mt-1 text-sm text-amber-700">{report.otherCategoryText}</p>
          )}
        </div>

        <div>
          <p className="text-xs font-medium tracking-wide text-gray-500 uppercase">
            Khu vực
          </p>

          <p className="mt-1">{report.areaName}</p>
        </div>

        <div>
          <p className="text-xs font-medium tracking-wide text-gray-500 uppercase">
            Địa chỉ
          </p>

          <p className="mt-1">{report.addressText ?? 'Chưa xác định'}</p>
        </div>

        <div>
          <p className="text-xs font-medium tracking-wide text-gray-500 uppercase">
            Ngày tạo
          </p>

          <p className="mt-1">{formatDate(report.createdAt)}</p>
        </div>

        <div>
          <p className="text-xs font-medium tracking-wide text-gray-500 uppercase">
            Phòng ban hiện tại
          </p>

          <p className="mt-1">{report.departmentName ?? 'Chưa phân công'}</p>
        </div>

        <div>
          <p className="text-xs font-medium tracking-wide text-gray-500 uppercase">
            Staff hiện tại
          </p>

          <p className="mt-1">{report.assignedStaffName ?? 'Chưa phân công'}</p>
        </div>

        <div>
          <p className="text-xs font-medium tracking-wide text-gray-500 uppercase">
            Mức ưu tiên
          </p>

          <div className="mt-1">
            {report.priority ? (
              <PriorityBadge priority={report.priority} />
            ) : (
              'Chưa xác định'
            )}
          </div>
        </div>

        <div>
          <p className="text-xs font-medium tracking-wide text-gray-500 uppercase">SLA</p>

          <p className="mt-1">
            {report.appliedSlaHours !== null
              ? `${report.appliedSlaHours} giờ`
              : 'Chưa bắt đầu'}
          </p>

          <p className="text-sm text-gray-500">Hạn xử lý: {formatDate(report.dueAt)}</p>
        </div>

        <div>
          <p className="text-xs font-medium tracking-wide text-gray-500 uppercase">
            Cảnh báo quá hạn
          </p>

          <p
            className={`mt-1 font-medium ${
              report.isEscalated ? 'text-red-600' : 'text-gray-700 dark:text-gray-300'
            }`}
          >
            {report.isEscalated
              ? `Đã cảnh báo lúc ${formatDate(report.escalatedAt)}`
              : 'Chưa có cảnh báo'}
          </p>
        </div>

        <div>
          <p className="text-xs font-medium tracking-wide text-gray-500 uppercase">
            Tọa độ
          </p>

          <a
            href={`https://www.google.com/maps?q=${report.latitude},${report.longitude}`}
            target="_blank"
            rel="noreferrer"
            className="mt-1 inline-block text-blue-600 hover:underline"
          >
            {report.latitude}, {report.longitude}
          </a>
        </div>

        <div className="md:col-span-2">
          <p className="text-xs font-medium tracking-wide text-gray-500 uppercase">
            Mô tả
          </p>

          <p className="mt-1 whitespace-pre-wrap">{report.description}</p>
        </div>
      </Card>

      <Card className="panel p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Hình ảnh phản ánh
        </h2>

        {report.imageUrls.length === 0 ? (
          <p className="mt-4 text-sm text-gray-500">Báo cáo chưa có hình ảnh.</p>
        ) : (
          <div className="report-overview__gallery mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {report.imageUrls.map((imageUrl, index) => (
              <a
                key={`${imageUrl}-${index}`}
                href={getImageUrl(imageUrl)}
                target="_blank"
                rel="noreferrer"
                className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <img
                  src={getImageUrl(imageUrl)}
                  alt={`Ảnh phản ánh ${index + 1}`}
                  loading="lazy"
                  className="h-52 w-full object-cover"
                />
              </a>
            ))}
          </div>
        )}
      </Card>

      {report.allowedActions?.canClassify && (
        <Card className="border-amber-200 p-6">
          <h2 className="text-lg font-semibold">Phân loại báo cáo “Khác”</h2>
          <p className="mt-1 text-sm text-gray-500">
            Chọn danh mục chính thức trước khi phân công đơn vị xử lý.
          </p>
          <form className="mt-4 grid max-w-2xl gap-3" onSubmit={handleClassify}>
            <select
              value={classificationCategoryId}
              onChange={(event) => setClassificationCategoryId(event.target.value)}
              className="h-10 rounded-lg border border-gray-300 bg-white px-3 dark:border-gray-700 dark:bg-gray-900"
            >
              <option value="">Chọn danh mục mới</option>
              {categoriesQuery.data
                ?.filter((category) => category.id !== report.categoryId)
                .map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
            </select>
            <textarea
              value={classificationNote}
              maxLength={1000}
              rows={3}
              placeholder="Ghi chú phân loại"
              onChange={(event) => setClassificationNote(event.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-900"
            />
            {classificationError && (
              <p className="text-sm text-red-600">{classificationError}</p>
            )}
            <Button type="submit" loading={classifyMutation.isPending}>
              Xác nhận phân loại
            </Button>
          </form>
        </Card>
      )}

      {report.resolution && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold">Kết quả xử lý</h2>
          <p className="mt-2 text-sm whitespace-pre-wrap">
            {report.resolution.note ?? 'Không có ghi chú.'}
          </p>
          {report.resolution.imageUrls.length > 0 && (
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {report.resolution.imageUrls.map((url, index) => (
                <a key={url} href={getImageUrl(url)} target="_blank" rel="noreferrer">
                  <img
                    src={getImageUrl(url)}
                    alt={`Ảnh kết quả ${index + 1}`}
                    className="h-40 w-full rounded-lg object-cover"
                  />
                </a>
              ))}
            </div>
          )}
        </Card>
      )}

      <AdminReportTimeline reportId={report.id} />

      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Phân công phòng ban
        </h2>

        {assignSuccess && (
          <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">
            {assignSuccess}
          </div>
        )}

        {!canAssign ? (
          <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            Báo cáo này không thể phân công mới. Chỉ báo cáo ở trạng thái{' '}
            <strong>{getStatusLabel('New')}</strong> và chưa có phòng ban mới được phân
            công.
          </div>
        ) : (
          <form className="mt-4 flex max-w-2xl flex-col gap-4" onSubmit={handleAssign}>
            <div className="flex flex-col gap-1">
              <label
                htmlFor="departmentId"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Phòng ban xử lý
              </label>

              <select
                id="departmentId"
                value={departmentId}
                disabled={departmentsQuery.isPending || assignMutation.isPending}
                onChange={(event) => {
                  setDepartmentId(event.target.value)

                  setFormError(null)
                }}
                className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 transition-colors outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
              >
                <option value="">Chọn phòng ban</option>

                {departmentsQuery.data?.map((department) => (
                  <option key={department.id} value={department.id}>
                    {department.name}
                  </option>
                ))}
              </select>
            </div>

            {departmentsQuery.isError && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                <p>
                  {getErrorMessage(
                    departmentsQuery.error,
                    'Không thể tải danh sách phòng ban.',
                  )}
                </p>

                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="mt-2"
                  onClick={() => departmentsQuery.refetch()}
                >
                  Tải lại phòng ban
                </Button>
              </div>
            )}

            <div className="flex flex-col gap-1">
              <label
                htmlFor="assignmentNote"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Ghi chú
              </label>

              <textarea
                id="assignmentNote"
                value={note}
                maxLength={1000}
                rows={4}
                disabled={assignMutation.isPending}
                placeholder="Ví dụ: Phân công xử lý báo cáo theo khu vực phụ trách."
                onChange={(event) => setNote(event.target.value)}
                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 transition-colors outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
              />

              <p className="text-right text-xs text-gray-500">{note.length}/1000</p>
            </div>

            {formError && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {formError}
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              <Button
                type="submit"
                loading={assignMutation.isPending}
                disabled={
                  departmentsQuery.isPending || departmentsQuery.isError || !departmentId
                }
              >
                Xác nhận phân công
              </Button>

              <Button
                type="button"
                variant="secondary"
                disabled={assignMutation.isPending}
                onClick={() => navigate('/admin/reports/manual-assignment')}
              >
                Hủy
              </Button>
            </div>
          </form>
        )}
      </Card>
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Phân công Staff
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Chỉ hiển thị Staff đang hoạt động và thuộc phòng ban của báo cáo.
        </p>

        {report.departmentId === null ? (
          <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            Hãy phân công phòng ban cho báo cáo trước khi chọn Staff.
          </div>
        ) : report.assignedStaffId !== null ? (
          <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
            Báo cáo hiện được giao cho{' '}
            <strong>{report.assignedStaffName ?? report.assignedStaffId}</strong>.
          </div>
        ) : !canAssignStaff ? (
          <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            Chỉ báo cáo ở trạng thái <strong>{getStatusLabel('Assigned')}</strong>, đã có
            phòng ban và chưa có Staff mới được phân công.
          </div>
        ) : (
          <form
            className="mt-4 flex max-w-2xl flex-col gap-4"
            onSubmit={handleAssignStaff}
          >
            <div className="flex flex-col gap-1">
              <label
                htmlFor="staffId"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Staff phụ trách
              </label>

              <select
                id="staffId"
                value={staffId}
                disabled={staffQuery.isPending || assignStaffMutation.isPending}
                onChange={(event) => {
                  setStaffId(event.target.value)
                  setStaffError(null)
                  setStaffSuccess(null)
                }}
                className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 transition-colors outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
              >
                <option value="">Chọn Staff</option>

                {staffQuery.data?.map((staff) => (
                  <option key={staff.id} value={staff.id}>
                    {staff.fullName} — {staff.email}
                  </option>
                ))}
              </select>
            </div>

            {staffQuery.isPending && (
              <p className="text-sm text-gray-500">Đang tải danh sách Staff...</p>
            )}

            {staffQuery.isError && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                <p>
                  {getErrorMessage(staffQuery.error, 'Không thể tải danh sách Staff.')}
                </p>

                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="mt-2"
                  onClick={() => staffQuery.refetch()}
                >
                  Tải lại Staff
                </Button>
              </div>
            )}

            {!staffQuery.isPending &&
              !staffQuery.isError &&
              staffQuery.data?.length === 0 && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                  Phòng ban này chưa có Staff đang hoạt động.
                </div>
              )}

            <div className="flex flex-col gap-1">
              <label
                htmlFor="staffReason"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Lý do phân công
              </label>

              <textarea
                id="staffReason"
                value={staffReason}
                rows={3}
                maxLength={1000}
                disabled={assignStaffMutation.isPending}
                onChange={(event) => {
                  setStaffReason(event.target.value)

                  setStaffError(null)
                  setStaffSuccess(null)
                }}
                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 transition-colors outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
              />

              <p className="text-right text-xs text-gray-500">
                {staffReason.length}/1000
              </p>
            </div>

            {staffError && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {staffError}
              </div>
            )}

            {staffSuccess && (
              <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">
                {staffSuccess}
              </div>
            )}

            <div>
              <Button
                type="submit"
                loading={assignStaffMutation.isPending}
                disabled={
                  staffQuery.isPending ||
                  staffQuery.isError ||
                  staffQuery.data?.length === 0 ||
                  !staffId ||
                  staffReason.trim().length < 5
                }
              >
                Xác nhận phân công Staff
              </Button>
            </div>
          </form>
        )}
      </Card>
      {(report.allowedActions?.canReassign ??
        (report.assignedStaffId !== null ||
          report.status === 'Accepted' ||
          report.status === 'InProgress')) && (
        <ReassignReportPanel
          report={report}
          onSuccess={() => void reportQuery.refetch()}
        />
      )}
      <Card className="border-red-200 p-6 dark:border-red-900">
        <h2 className="text-lg font-semibold text-red-700 dark:text-red-400">
          Từ chối báo cáo
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Chỉ sử dụng khi báo cáo không hợp lệ, không phù hợp hoặc không thể xử lý.
        </p>

        {!canReject ? (
          <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            Không thể từ chối báo cáo ở trạng thái{' '}
            <strong>{getStatusLabel(report.status)}</strong>.
          </div>
        ) : (
          <div className="mt-4 flex max-w-2xl flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label
                htmlFor="rejectReason"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Lý do từ chối
              </label>

              <textarea
                id="rejectReason"
                value={rejectReason}
                rows={4}
                maxLength={1000}
                disabled={rejectMutation.isPending}
                placeholder="Nhập lý do cụ thể, tối thiểu 10 ký tự."
                onChange={(event) => {
                  setRejectReason(event.target.value)

                  setRejectError(null)
                  setRejectSuccess(null)
                }}
                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 transition-colors outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/30 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
              />

              <p className="text-right text-xs text-gray-500">
                {rejectReason.length}/1000
              </p>
            </div>

            {rejectError && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {rejectError}
              </div>
            )}

            {rejectSuccess && (
              <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">
                {rejectSuccess}
              </div>
            )}

            {!showRejectConfirm ? (
              <div>
                <Button
                  type="button"
                  disabled={rejectMutation.isPending || rejectReason.trim().length < 10}
                  onClick={() => {
                    setRejectError(null)
                    setShowRejectConfirm(true)
                  }}
                >
                  Từ chối báo cáo
                </Button>
              </div>
            ) : (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                <p className="text-sm font-medium text-red-800">
                  Bạn chắc chắn muốn từ chối báo cáo này?
                </p>

                <p className="mt-1 text-sm text-red-700">
                  Báo cáo sẽ chuyển sang trạng thái{' '}
                  <strong>{getStatusLabel('Rejected')}</strong> và không còn nằm trong
                  hàng đợi xử lý.
                </p>

                <div className="mt-4 flex flex-wrap gap-3">
                  <Button
                    type="button"
                    loading={rejectMutation.isPending}
                    disabled={rejectMutation.isPending}
                    onClick={handleRejectReport}
                  >
                    Xác nhận từ chối
                  </Button>

                  <Button
                    type="button"
                    variant="secondary"
                    disabled={rejectMutation.isPending}
                    onClick={() => setShowRejectConfirm(false)}
                  >
                    Hủy
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </Card>
      <Card className="border-green-200 p-6 dark:border-green-900">
        <h2 className="text-lg font-semibold text-green-700 dark:text-green-400">
          Đóng báo cáo
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Xác nhận kết thúc báo cáo sau khi vấn đề đã được xử lý thành công.
        </p>

        {report.status === 'Closed' ? (
          <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
            Báo cáo đã được đóng
            {report.closedAt ? ` vào ${formatDate(report.closedAt)}` : ''}.
          </div>
        ) : !canClose ? (
          <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            {report.complaintSubmittedAt ? (
              'Báo cáo có khiếu nại đang chờ. Hãy xử lý khiếu nại ở phần bên dưới.'
            ) : (
              <>
                Chỉ có thể đóng báo cáo ở trạng thái{' '}
                <strong>{getStatusLabel('Resolved')}</strong>. Trạng thái hiện tại là{' '}
                <strong>{getStatusLabel(report.status)}</strong>.
              </>
            )}
          </div>
        ) : (
          <div className="mt-4 flex max-w-2xl flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label
                htmlFor="adminCloseNote"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Ghi chú đóng báo cáo
              </label>

              <textarea
                id="adminCloseNote"
                value={closeNote}
                rows={4}
                maxLength={1000}
                disabled={closeMutation.isPending}
                placeholder="Ví dụ: Đã kiểm tra kết quả xử lý và xác nhận hoàn tất."
                onChange={(event) => {
                  setCloseNote(event.target.value)

                  setCloseError(null)
                  setCloseSuccess(null)
                }}
                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 transition-colors outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/30 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
              />

              <p className="text-right text-xs text-gray-500">{closeNote.length}/1000</p>
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
                  Bạn chắc chắn muốn đóng báo cáo này?
                </p>

                <p className="mt-1 text-sm text-green-800">
                  Trạng thái sẽ chuyển từ <strong>{getStatusLabel('Resolved')}</strong>{' '}
                  sang <strong>{getStatusLabel('Closed')}</strong>. Ghi chú xử lý và hình
                  ảnh minh chứng hiện có sẽ được giữ nguyên.
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
      </Card>

      {(report.allowedActions?.canReviewComplaint ?? true) && (
        <ReopenReportPanel report={report} onSuccess={() => void reportQuery.refetch()} />
      )}
    </section>
  )
}
