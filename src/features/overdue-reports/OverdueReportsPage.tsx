import { AlertTriangle, Siren, UserRoundX } from 'lucide-react'
import { type FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { PriorityBadge } from '@/components/ui/PriorityBadge'
import { getPriorityLabel, getStatusLabel } from '@/components/ui/report-labels'
import { Spinner } from '@/components/ui/Spinner'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { useAuthStore } from '@/features/auth/auth.store'
import { ApiError } from '@/lib/api/http'
import { parseApiDateTime } from '@/lib/utils/date-time'

import { useOverdueReports } from './overdue-reports.queries'
import type {
  OverdueReportFilters,
  ReportPriority,
  UserRole,
} from './overdue-reports.types'

const PAGE_SIZE = 10
const PRIORITIES: ReportPriority[] = ['Low', 'Medium', 'High']

function getErrorMessage(error: unknown) {
  if (error instanceof ApiError || error instanceof Error) {
    return error.message
  }

  return 'Không thể tải báo cáo quá hạn.'
}

function formatDateTime(value: string | null) {
  if (!value) {
    return 'Chưa có'
  }

  const date = parseApiDateTime(value)

  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat('vi-VN', {
        dateStyle: 'short',
        timeStyle: 'short',
      }).format(date)
}

function formatOverdueDuration(milliseconds: number) {
  const totalMinutes = Math.max(1, Math.floor(milliseconds / 60_000))
  const days = Math.floor(totalMinutes / 1_440)
  const hours = Math.floor((totalMinutes % 1_440) / 60)
  const minutes = totalMinutes % 60
  const parts: string[] = []

  if (days > 0) {
    parts.push(`${days} ngày`)
  }
  if (hours > 0) {
    parts.push(`${hours} giờ`)
  }
  if (days === 0 && minutes > 0) {
    parts.push(`${minutes} phút`)
  }

  return parts.join(' ')
}

export default function OverdueReportsPage() {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const role: UserRole = user?.role === 'Admin' ? 'Admin' : 'Staff'

  const [pageNumber, setPageNumber] = useState(1)
  const [draftSearch, setDraftSearch] = useState('')
  const [filters, setFilters] = useState<OverdueReportFilters>({
    search: '',
    priority: 'all',
    status: 'all',
    isEscalated: false,
  })

  const query = useOverdueReports({
    role,
    pageNumber,
    pageSize: PAGE_SIZE,
    search: filters.search || undefined,
    priority: filters.priority === 'all' ? undefined : filters.priority,
    status: filters.status === 'all' ? undefined : filters.status,
    isEscalated: filters.isEscalated || undefined,
  })
  const page = query.data
  const totalPages = Math.max(page?.totalPages ?? 0, 1)

  function submitSearch(event: FormEvent) {
    event.preventDefault()
    setFilters((current) => ({
      ...current,
      search: draftSearch.trim(),
    }))
    setPageNumber(1)
  }

  function openReport(reportId: string) {
    navigate(
      role === 'Admin' ? `/admin/reports/${reportId}` : `/staff/reports/${reportId}`,
    )
  }

  return (
    <section className="reports-page staff-overdue-page flex flex-col gap-5">
      <div className="page-heading page-heading--split">
        <div>
          <Badge variant="danger">Ưu tiên xử lý</Badge>
          <h1>Báo cáo quá hạn SLA</h1>
          <p>Theo dõi các công việc đã vượt thời hạn và cần hành động ngay.</p>
        </div>
        <Button
          type="button"
          variant="secondary"
          loading={query.isFetching}
          onClick={() => void query.refetch()}
        >
          Làm mới
        </Button>
      </div>

      <div className="metric-grid overdue-metric-grid">
        <Card className="metric-card metric-card--alert">
          <span className="metric-card__icon red">
            <AlertTriangle aria-hidden="true" />
          </span>
          <div>
            <small>Tổng báo cáo quá hạn</small>
            <strong>{page?.totalItems ?? 0}</strong>
            <span>Cần được ưu tiên xử lý</span>
          </div>
        </Card>
        <Card className="metric-card">
          <span className="metric-card__icon amber">
            <Siren aria-hidden="true" />
          </span>
          <div>
            <small>Đã cảnh báo trong trang</small>
            <strong>
              {page?.items.filter((report) => report.isEscalated).length ?? 0}
            </strong>
            <span>Đã gửi cảnh báo nâng cấp</span>
          </div>
        </Card>
        <Card className="metric-card">
          <span className="metric-card__icon violet">
            <UserRoundX aria-hidden="true" />
          </span>
          <div>
            <small>Chưa có Staff trong trang</small>
            <strong>
              {page?.items.filter((report) => !report.assignedStaffId).length ?? 0}
            </strong>
            <span>Cần phân công người phụ trách</span>
          </div>
        </Card>
      </div>

      <Card className="panel filter-bar filter-bar--wrap">
        <form
          className="grid gap-3 md:grid-cols-2 xl:grid-cols-5"
          onSubmit={submitSearch}
        >
          <input
            value={draftSearch}
            maxLength={200}
            placeholder="Tìm mô tả, địa chỉ, Category..."
            onChange={(event) => setDraftSearch(event.target.value)}
            className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm dark:border-gray-700 dark:bg-gray-900"
          />
          <select
            value={filters.priority}
            onChange={(event) => {
              setFilters((current) => ({
                ...current,
                priority: event.target.value as OverdueReportFilters['priority'],
              }))
              setPageNumber(1)
            }}
            className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm dark:border-gray-700 dark:bg-gray-900"
          >
            <option value="all">Tất cả mức ưu tiên</option>
            {PRIORITIES.map((priority) => (
              <option key={priority} value={priority}>
                {getPriorityLabel(priority)}
              </option>
            ))}
          </select>
          <select
            value={filters.status}
            onChange={(event) => {
              setFilters((current) => ({
                ...current,
                status: event.target.value,
              }))
              setPageNumber(1)
            }}
            className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm dark:border-gray-700 dark:bg-gray-900"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="Accepted">{getStatusLabel('Accepted')}</option>
            <option value="InProgress">{getStatusLabel('InProgress')}</option>
          </select>
          <label className="flex h-10 items-center gap-2 rounded-lg border border-gray-300 px-3 text-sm dark:border-gray-700">
            <input
              type="checkbox"
              checked={filters.isEscalated}
              onChange={(event) => {
                setFilters((current) => ({
                  ...current,
                  isEscalated: event.target.checked,
                }))
                setPageNumber(1)
              }}
            />
            Chỉ báo cáo đã cảnh báo
          </label>
          <div className="flex gap-2">
            <Button type="submit">Tìm kiếm</Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setDraftSearch('')
                setFilters({
                  search: '',
                  priority: 'all',
                  status: 'all',
                  isEscalated: false,
                })
                setPageNumber(1)
              }}
            >
              Đặt lại
            </Button>
          </div>
        </form>
      </Card>

      {query.isPending ? (
        <div className="flex min-h-64 items-center justify-center">
          <Spinner />
        </div>
      ) : query.isError ? (
        <Card className="flex min-h-64 flex-col items-center justify-center gap-3 p-8 text-center">
          <p className="font-medium text-red-600">{getErrorMessage(query.error)}</p>
          <Button type="button" onClick={() => void query.refetch()}>
            Thử lại
          </Button>
        </Card>
      ) : !page || page.items.length === 0 ? (
        <EmptyState
          title="Không có báo cáo quá hạn phù hợp"
          description="Hãy thay đổi bộ lọc hoặc làm mới dữ liệu."
        />
      ) : (
        <>
          <Card className="panel table-panel overflow-hidden">
            <div className="data-table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th className="px-4 py-3">Báo cáo</th>
                    <th className="px-4 py-3">Phân loại</th>
                    <th className="px-4 py-3">Đơn vị / Staff</th>
                    <th className="px-4 py-3">Trạng thái</th>
                    <th className="px-4 py-3">Hạn xử lý</th>
                    <th className="px-4 py-3">Quá hạn</th>
                    <th className="px-4 py-3 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {page.items.map((report) => (
                    <tr key={report.id} className="row--danger align-top">
                      <td className="px-4 py-3">
                        <p className="font-medium">#{report.id.slice(0, 8)}</p>
                        <p className="mt-1 line-clamp-2 max-w-xs text-gray-500">
                          {report.description}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium">{report.categoryName}</p>
                        <p className="mt-1 text-gray-500">{report.areaName}</p>
                        <div className="mt-2">
                          <PriorityBadge priority={report.priority} />
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p>{report.departmentName ?? 'Theo phòng ban Staff'}</p>
                        <p className="mt-1 text-gray-500">
                          {report.assignedStaffName ?? 'Chưa phân công'}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={report.status} />
                        {report.isEscalated && (
                          <div className="mt-2">
                            <Badge variant="warning">Đã cảnh báo</Badge>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-gray-500">
                        {formatDateTime(report.dueAt)}
                      </td>
                      <td className="px-4 py-3 font-medium whitespace-nowrap text-red-600">
                        {formatOverdueDuration(report.overdueMilliseconds)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          onClick={() => openReport(report.id)}
                        >
                          Xem chi tiết
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-gray-500">
            <p>
              Tổng cộng {page.totalItems} báo cáo · Trang {page.pageNumber}/{totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant="secondary"
                disabled={pageNumber <= 1 || query.isFetching}
                onClick={() => setPageNumber((current) => Math.max(1, current - 1))}
              >
                Trang trước
              </Button>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                disabled={pageNumber >= totalPages || query.isFetching}
                onClick={() => setPageNumber((current) => current + 1)}
              >
                Trang sau
              </Button>
            </div>
          </div>
        </>
      )}
    </section>
  )
}
