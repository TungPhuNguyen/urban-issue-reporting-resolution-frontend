import { type FormEvent, useEffect, useState } from 'react'

import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { getStatusLabel } from '@/components/ui/report-labels'
import { ApiError } from '@/lib/api/http'

import {
  useActiveDepartments,
  useActiveStaffByDepartment,
  useReassignReport,
} from './admin-reports.queries'
import type { AdminReportDetail } from './admin-reports.types'

interface ReassignReportPanelProps {
  report: AdminReportDetail
  onSuccess: () => void
}

function errorMessage(error: unknown) {
  if (error instanceof ApiError || error instanceof Error) {
    return error.message
  }

  return 'Không thể phân công lại báo cáo.'
}

export default function ReassignReportPanel({
  report,
  onSuccess,
}: ReassignReportPanelProps) {
  const [departmentId, setDepartmentId] = useState(report.departmentId?.toString() ?? '')
  const [staffId, setStaffId] = useState(report.assignedStaffId ?? '')
  const [reason, setReason] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const selectedDepartmentId = Number(departmentId) || null
  const departmentsQuery = useActiveDepartments()
  const staffQuery = useActiveStaffByDepartment(selectedDepartmentId)
  const mutation = useReassignReport()

  useEffect(() => {
    setDepartmentId(report.departmentId?.toString() ?? '')
    setStaffId(report.assignedStaffId ?? '')
  }, [report.assignedStaffId, report.departmentId])

  const canReassign =
    report.allowedActions?.canReassign ??
    (['Assigned', 'Accepted', 'InProgress'].includes(report.status) &&
      (report.assignedStaffId !== null || report.status !== 'Assigned'))
  const hasChanged =
    selectedDepartmentId !== report.departmentId ||
    (staffId || null) !== report.assignedStaffId

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setSuccess(null)

    if (selectedDepartmentId === null) {
      setError('Vui lòng chọn phòng ban.')
      return
    }

    const normalizedReason = reason.trim()

    if (normalizedReason.length < 5 || normalizedReason.length > 1000) {
      setError('Lý do phân công lại phải từ 5 đến 1000 ký tự.')
      return
    }

    if (!hasChanged) {
      setError('Hãy chọn phòng ban hoặc Staff khác với phân công hiện tại.')
      return
    }

    try {
      await mutation.mutateAsync({
        reportId: report.id,
        departmentId: selectedDepartmentId,
        staffId: staffId || null,
        reason: normalizedReason,
      })
      setReason('')
      setSuccess(
        staffId
          ? 'Đã phân công báo cáo cho Staff đã chọn.'
          : 'Đã phân công báo cáo cho phòng ban đã chọn.',
      )
      onSuccess()
    } catch (caughtError) {
      setError(errorMessage(caughtError))
    }
  }

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
        Phân công Staff / tái phân công
      </h2>
      <p className="mt-1 text-sm text-gray-500">
        Có thể đổi phòng ban, đổi Staff hoặc chỉ giao về phòng ban. Staff phải thuộc phòng
        ban đã chọn.
      </p>

      {!canReassign ? (
        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Chức năng này xuất hiện sau lần phân công Staff đầu tiên, hoặc khi báo cáo đang
          ở trạng thái <strong>{getStatusLabel('Accepted')}</strong> hoặc{' '}
          <strong>{getStatusLabel('InProgress')}</strong>.
        </div>
      ) : (
        <form className="mt-4 flex max-w-2xl flex-col gap-4" onSubmit={submit}>
          <div className="flex flex-col gap-1">
            <label htmlFor="reassignDepartmentId" className="text-sm font-medium">
              Phòng ban xử lý
            </label>
            <select
              id="reassignDepartmentId"
              value={departmentId}
              disabled={departmentsQuery.isPending || mutation.isPending}
              onChange={(event) => {
                setDepartmentId(event.target.value)
                setStaffId('')
                setError(null)
                setSuccess(null)
              }}
              className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm dark:border-gray-700 dark:bg-gray-900"
            >
              <option value="">Chọn phòng ban</option>
              {departmentsQuery.data?.map((department) => (
                <option key={department.id} value={department.id}>
                  {department.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="reassignStaffId" className="text-sm font-medium">
              Staff phụ trách
            </label>
            <select
              id="reassignStaffId"
              value={staffId}
              disabled={
                selectedDepartmentId === null ||
                staffQuery.isPending ||
                mutation.isPending
              }
              onChange={(event) => {
                setStaffId(event.target.value)
                setError(null)
                setSuccess(null)
              }}
              className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm dark:border-gray-700 dark:bg-gray-900"
            >
              <option value="">Chỉ giao cho phòng ban</option>
              {staffQuery.data?.map((staff) => (
                <option key={staff.id} value={staff.id}>
                  {staff.fullName} — {staff.email}
                </option>
              ))}
            </select>
            {!staffQuery.isPending &&
              selectedDepartmentId !== null &&
              staffQuery.data?.length === 0 && (
                <p className="text-xs text-amber-700">
                  Phòng ban này chưa có Staff đang hoạt động.
                </p>
              )}
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="reassignReason" className="text-sm font-medium">
              Lý do phân công
            </label>
            <textarea
              id="reassignReason"
              value={reason}
              rows={4}
              maxLength={1000}
              disabled={mutation.isPending}
              placeholder="Nhập lý do phân công hoặc điều chuyển, tối thiểu 5 ký tự."
              onChange={(event) => {
                setReason(event.target.value)
                setError(null)
                setSuccess(null)
              }}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
            />
            <p className="text-right text-xs text-gray-500">{reason.length}/1000</p>
          </div>

          {departmentsQuery.isError && (
            <p className="text-sm text-red-600">{errorMessage(departmentsQuery.error)}</p>
          )}
          {staffQuery.isError && (
            <p className="text-sm text-red-600">{errorMessage(staffQuery.error)}</p>
          )}
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}
          {success && (
            <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">
              {success}
            </div>
          )}

          <div>
            <Button
              type="submit"
              loading={mutation.isPending}
              disabled={
                departmentsQuery.isPending ||
                departmentsQuery.isError ||
                staffQuery.isPending ||
                !hasChanged ||
                reason.trim().length < 5
              }
            >
              Xác nhận phân công
            </Button>
          </div>
        </form>
      )}
    </Card>
  )
}
