import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { PriorityBadge } from '@/components/ui/PriorityBadge'
import { getPriorityLabel, getStatusLabel } from '@/components/ui/report-labels'
import { Spinner } from '@/components/ui/Spinner'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { ApiError } from '@/lib/api/http'

import { useAdminReports } from './admin-reports.queries'
import type { ReportPriority } from './admin-reports.types'

const PAGE_SIZE = 10
const PRIORITIES: ReportPriority[] = ['Low', 'Medium', 'High']
const STATUSES = [
  'New',
  'Assigned',
  'Accepted',
  'InProgress',
  'Resolved',
  'Reopened',
  'Closed',
  'Rejected',
]

function parseBoolean(value: string | null) {
  return value === 'true' ? true : undefined
}

function formatDate(value: string | null | undefined) {
  if (!value) {
    return 'Chưa có'
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date)
}

function errorMessage(error: unknown) {
  if (error instanceof ApiError || error instanceof Error) {
    return error.message
  }

  return 'Không thể tải danh sách báo cáo.'
}

export default function AdminReportsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const pageNumber = Math.max(1, Number(searchParams.get('page')) || 1)
  const [search, setSearch] = useState(searchParams.get('search') ?? '')

  const status = searchParams.get('status') ?? ''
  const priority = (searchParams.get('priority') as ReportPriority | null) ?? ''
  const hasComplaint = parseBoolean(searchParams.get('hasComplaint'))
  const isEscalated = parseBoolean(searchParams.get('isEscalated'))

  const query = useAdminReports({
    pageNumber,
    pageSize: PAGE_SIZE,
    search: searchParams.get('search') ?? undefined,
    status: status || undefined,
    priority: priority || undefined,
    hasComplaint,
    isEscalated,
  })

  function updateFilters(updates: Record<string, string | undefined>) {
    const next = new URLSearchParams(searchParams)

    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        next.set(key, value)
      } else {
        next.delete(key)
      }
    })
    next.set('page', '1')
    setSearchParams(next)
  }

  function changePage(nextPage: number) {
    const next = new URLSearchParams(searchParams)
    next.set('page', String(nextPage))
    setSearchParams(next)
  }

  const page = query.data
  const totalPages = Math.max(page?.totalPages ?? 0, 1)

  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            Tất cả báo cáo
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Tìm kiếm, xử lý khiếu nại và theo dõi báo cáo được cảnh báo.
          </p>
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

      <Card className="p-5">
        <form
          className="grid gap-3 md:grid-cols-2 xl:grid-cols-5"
          onSubmit={(event) => {
            event.preventDefault()
            updateFilters({
              search: search.trim() || undefined,
            })
          }}
        >
          <input
            value={search}
            maxLength={200}
            placeholder="Tìm mô tả, địa chỉ, người gửi..."
            onChange={(event) => setSearch(event.target.value)}
            className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm dark:border-gray-700 dark:bg-gray-900"
          />

          <select
            aria-label="Trạng thái"
            value={status}
            onChange={(event) =>
              updateFilters({
                status: event.target.value || undefined,
              })
            }
            className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm dark:border-gray-700 dark:bg-gray-900"
          >
            <option value="">Tất cả trạng thái</option>
            {STATUSES.map((item) => (
              <option key={item} value={item}>
                {getStatusLabel(item)}
              </option>
            ))}
          </select>

          <select
            aria-label="Mức ưu tiên"
            value={priority}
            onChange={(event) =>
              updateFilters({
                priority: event.target.value || undefined,
              })
            }
            className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm dark:border-gray-700 dark:bg-gray-900"
          >
            <option value="">Tất cả mức ưu tiên</option>
            {PRIORITIES.map((item) => (
              <option key={item} value={item}>
                {getPriorityLabel(item)}
              </option>
            ))}
          </select>

          <label className="flex h-10 items-center gap-2 rounded-lg border border-gray-300 px-3 text-sm dark:border-gray-700">
            <input
              type="checkbox"
              checked={hasComplaint === true}
              onChange={(event) =>
                updateFilters({
                  hasComplaint: event.target.checked ? 'true' : undefined,
                })
              }
            />
            Khiếu nại chờ xử lý
          </label>

          <label className="flex h-10 items-center gap-2 rounded-lg border border-gray-300 px-3 text-sm dark:border-gray-700">
            <input
              type="checkbox"
              checked={isEscalated === true}
              onChange={(event) =>
                updateFilters({
                  isEscalated: event.target.checked ? 'true' : undefined,
                })
              }
            />
            Đã cảnh báo
          </label>

          <div className="flex gap-2 xl:col-span-5">
            <Button type="submit">Tìm kiếm</Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setSearch('')
                setSearchParams({})
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
          <p className="font-medium text-red-600">{errorMessage(query.error)}</p>
          <Button type="button" onClick={() => void query.refetch()}>
            Thử lại
          </Button>
        </Card>
      ) : !page || page.items.length === 0 ? (
        <EmptyState
          title="Không có báo cáo phù hợp"
          description="Hãy thay đổi bộ lọc hoặc làm mới dữ liệu."
        />
      ) : (
        <>
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-gray-50 text-xs tracking-wide text-gray-500 uppercase dark:bg-gray-900">
                  <tr>
                    <th className="px-4 py-3">Báo cáo</th>
                    <th className="px-4 py-3">Phân loại</th>
                    <th className="px-4 py-3">Phân công</th>
                    <th className="px-4 py-3">Trạng thái</th>
                    <th className="px-4 py-3">Cờ xử lý</th>
                    <th className="px-4 py-3 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {page.items.map((report) => (
                    <tr key={report.id} className="align-top">
                      <td className="px-4 py-3">
                        <p className="font-medium">#{report.id.slice(0, 8)}</p>
                        <p className="mt-1 line-clamp-2 max-w-xs text-gray-500">
                          {report.description}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          {formatDate(report.createdAt)}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <p>{report.categoryName}</p>
                        <p className="mt-1 text-gray-500">{report.areaName}</p>
                        <div className="mt-2">
                          {report.priority ? (
                            <PriorityBadge priority={report.priority} />
                          ) : (
                            <span className="text-xs text-gray-500">Chưa xác định</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p>{report.departmentName ?? 'Chưa có phòng ban'}</p>
                        <p className="mt-1 text-gray-500">
                          {report.assignedStaffName ?? 'Chưa có Staff'}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={report.status} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col items-start gap-1.5">
                          {report.hasComplaint && <Badge variant="info">Khiếu nại</Badge>}
                          {report.isEscalated && (
                            <Badge variant="warning">Đã cảnh báo</Badge>
                          )}
                          {report.isOverdue && <Badge variant="danger">Quá hạn</Badge>}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          to={`/admin/reports/${report.id}`}
                          className="inline-flex h-8 items-center rounded-lg bg-gray-100 px-3 font-medium text-gray-900 hover:bg-gray-200"
                        >
                          Xem chi tiết
                        </Link>
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
                onClick={() => changePage(pageNumber - 1)}
              >
                Trang trước
              </Button>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                disabled={pageNumber >= totalPages || query.isFetching}
                onClick={() => changePage(pageNumber + 1)}
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
