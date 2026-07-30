import {
  useMemo,
  useState,
} from 'react'
import {
  useNavigate,
} from 'react-router-dom'

import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'
import { useAuthStore } from '@/features/auth/auth.store'
import { ApiError } from '@/lib/api/http'

import { useOverdueReports } from './overdue-reports.queries'
import type {
  OverdueReportFilters,
  ReportPriority,
  UserRole,
} from './overdue-reports.types'

const PAGE_SIZE = 10

const PRIORITIES: ReportPriority[] = [
  'Low',
  'Medium',
  'High',
  'Critical',
]

function getErrorMessage(
  error: unknown,
): string {
  if (
    error instanceof ApiError ||
    error instanceof Error
  ) {
    return error.message
  }

  return 'Không thể tải báo cáo quá hạn.'
}

function formatDateTime(
  value: string | null,
): string {
  if (!value) {
    return 'Chưa có'
  }

  const date = new Date(value)

  if (
    Number.isNaN(date.getTime())
  ) {
    return value
  }

  return new Intl.DateTimeFormat(
    'vi-VN',
    {
      dateStyle: 'short',
      timeStyle: 'short',
    },
  ).format(date)
}

function formatOverdueDuration(
  milliseconds: number,
): string {
  const totalMinutes = Math.max(
    1,
    Math.floor(
      milliseconds / 60_000,
    ),
  )

  const days = Math.floor(
    totalMinutes / 1_440,
  )
  const hours = Math.floor(
    (totalMinutes % 1_440) / 60,
  )
  const minutes =
    totalMinutes % 60

  const parts: string[] = []

  if (days > 0) {
    parts.push(`${days} ngày`)
  }

  if (hours > 0) {
    parts.push(`${hours} giờ`)
  }

  if (
    days === 0 &&
    minutes > 0
  ) {
    parts.push(`${minutes} phút`)
  }

  return parts.join(' ')
}

function priorityLabel(
  priority: ReportPriority,
): string {
  const labels: Record<
    ReportPriority,
    string
  > = {
    Low: 'Thấp',
    Medium: 'Trung bình',
    High: 'Cao',
    Critical: 'Khẩn cấp',
  }

  return labels[priority]
}

export default function OverdueReportsPage() {
  const navigate = useNavigate()
  const user = useAuthStore(
    (state) => state.user,
  )

  const role =
    user?.role === 'Admin'
      ? 'Admin'
      : 'Staff'

  const query = useOverdueReports(
    role as UserRole,
  )

  const [pageNumber, setPageNumber] =
    useState(1)

  const [filters, setFilters] =
    useState<OverdueReportFilters>({
      search: '',
      priority: 'all',
      status: 'all',
    })

  const filteredReports =
    useMemo(() => {
      const normalizedSearch =
        filters.search
          .trim()
          .toLocaleLowerCase(
            'vi-VN',
          )

      return (query.data ?? []).filter(
        (report) => {
          const matchesSearch =
            !normalizedSearch ||
            report.id
              .toLocaleLowerCase()
              .includes(
                normalizedSearch,
              ) ||
            report.categoryName
              .toLocaleLowerCase(
                'vi-VN',
              )
              .includes(
                normalizedSearch,
              ) ||
            report.areaName
              .toLocaleLowerCase(
                'vi-VN',
              )
              .includes(
                normalizedSearch,
              ) ||
            (
              report.departmentName ??
              ''
            )
              .toLocaleLowerCase(
                'vi-VN',
              )
              .includes(
                normalizedSearch,
              ) ||
            (
              report.assignedStaffName ??
              ''
            )
              .toLocaleLowerCase(
                'vi-VN',
              )
              .includes(
                normalizedSearch,
              )

          const matchesPriority =
            filters.priority ===
              'all' ||
            report.priority ===
              filters.priority

          const matchesStatus =
            filters.status === 'all' ||
            report.status ===
              filters.status

          return (
            matchesSearch &&
            matchesPriority &&
            matchesStatus
          )
        },
      )
    }, [filters, query.data])

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredReports.length /
        PAGE_SIZE,
    ),
  )

  const safePageNumber = Math.min(
    pageNumber,
    totalPages,
  )

  const pageItems =
    filteredReports.slice(
      (safePageNumber - 1) *
        PAGE_SIZE,
      safePageNumber * PAGE_SIZE,
    )

  const statuses = Array.from(
    new Set(
      (query.data ?? []).map(
        (report) => report.status,
      ),
    ),
  )

  function openReport(
    reportId: string,
  ) {
    navigate(
      role === 'Admin'
        ? `/admin/reports/${reportId}`
        : `/staff/reports/${reportId}`,
    )
  }

  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            Báo cáo quá hạn SLA
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Theo dõi các báo cáo chưa hoàn
            tất và đã vượt thời hạn xử lý.
          </p>
        </div>

        <Button
          type="button"
          variant="secondary"
          disabled={query.isFetching}
          onClick={() =>
            void query.refetch()
          }
        >
          Làm mới
        </Button>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <Card className="p-4">
          <p className="text-sm text-gray-500">
            Tổng báo cáo quá hạn
          </p>
          <p className="mt-1 text-2xl font-semibold">
            {query.data?.length ?? 0}
          </p>
        </Card>

        <Card className="p-4">
          <p className="text-sm text-gray-500">
            Quá hạn khẩn cấp
          </p>
          <p className="mt-1 text-2xl font-semibold">
            {
              (query.data ?? []).filter(
                (report) =>
                  report.priority ===
                  'Critical',
              ).length
            }
          </p>
        </Card>

        <Card className="p-4">
          <p className="text-sm text-gray-500">
            Chưa có Staff phụ trách
          </p>
          <p className="mt-1 text-2xl font-semibold">
            {
              (query.data ?? []).filter(
                (report) =>
                  !report.assignedStaffId,
              ).length
            }
          </p>
        </Card>
      </div>

      <Card className="p-5">
        <div className="grid gap-3 md:grid-cols-4">
          <input
            value={filters.search}
            maxLength={200}
            placeholder="Tìm ID, Category, Area..."
            onChange={(event) => {
              setFilters(
                (current) => ({
                  ...current,
                  search:
                    event.target.value,
                }),
              )
              setPageNumber(1)
            }}
            className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm dark:border-gray-700 dark:bg-gray-900"
          />

          <select
            value={filters.priority}
            onChange={(event) => {
              setFilters(
                (current) => ({
                  ...current,
                  priority:
                    event.target
                      .value as OverdueReportFilters['priority'],
                }),
              )
              setPageNumber(1)
            }}
            className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm dark:border-gray-700 dark:bg-gray-900"
          >
            <option value="all">
              Tất cả mức ưu tiên
            </option>
            {PRIORITIES.map(
              (priority) => (
                <option
                  key={priority}
                  value={priority}
                >
                  {priorityLabel(
                    priority,
                  )}
                </option>
              ),
            )}
          </select>

          <select
            value={filters.status}
            onChange={(event) => {
              setFilters(
                (current) => ({
                  ...current,
                  status:
                    event.target.value,
                }),
              )
              setPageNumber(1)
            }}
            className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm dark:border-gray-700 dark:bg-gray-900"
          >
            <option value="all">
              Tất cả trạng thái
            </option>
            {statuses.map((status) => (
              <option
                key={status}
                value={status}
              >
                {status}
              </option>
            ))}
          </select>

          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setFilters({
                search: '',
                priority: 'all',
                status: 'all',
              })
              setPageNumber(1)
            }}
          >
            Đặt lại
          </Button>
        </div>
      </Card>

      {query.isPending ? (
        <div className="flex min-h-64 items-center justify-center">
          <Spinner />
        </div>
      ) : query.isError ? (
        <Card className="flex min-h-64 flex-col items-center justify-center gap-3 p-8 text-center">
          <p className="font-medium text-red-600">
            {getErrorMessage(
              query.error,
            )}
          </p>

          <Button
            type="button"
            onClick={() =>
              void query.refetch()
            }
          >
            Thử lại
          </Button>
        </Card>
      ) : pageItems.length === 0 ? (
        <Card className="p-10 text-center">
          <h2 className="text-lg font-semibold">
            Không có báo cáo quá hạn phù hợp
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            Thay đổi bộ lọc hoặc làm mới dữ
            liệu.
          </p>
        </Card>
      ) : (
        <>
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500 dark:bg-gray-900">
                  <tr>
                    <th className="px-4 py-3">
                      Báo cáo
                    </th>
                    <th className="px-4 py-3">
                      Phân loại
                    </th>
                    <th className="px-4 py-3">
                      Đơn vị / Staff
                    </th>
                    <th className="px-4 py-3">
                      Trạng thái
                    </th>
                    <th className="px-4 py-3">
                      Hạn xử lý
                    </th>
                    <th className="px-4 py-3">
                      Quá hạn
                    </th>
                    <th className="px-4 py-3 text-right">
                      Thao tác
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {pageItems.map(
                    (report) => (
                      <tr
                        key={report.id}
                        className="align-top"
                      >
                        <td className="px-4 py-3">
                          <p className="font-medium">
                            #
                            {report.id.slice(
                              0,
                              8,
                            )}
                          </p>
                          <p className="mt-1 max-w-xs line-clamp-2 text-gray-500">
                            {
                              report.description
                            }
                          </p>
                        </td>

                        <td className="px-4 py-3">
                          <p className="font-medium">
                            {
                              report.categoryName
                            }
                          </p>
                          <p className="mt-1 text-gray-500">
                            {report.areaName}
                          </p>
                          <p className="mt-1 text-xs text-gray-500">
                            Mức độ:{' '}
                            {priorityLabel(
                              report.priority,
                            )}
                          </p>
                        </td>

                        <td className="px-4 py-3">
                          <p>
                            {report.departmentName ??
                              'Theo phòng ban của Staff'}
                          </p>
                          <p className="mt-1 text-gray-500">
                            {report.assignedStaffName ??
                              'Chưa phân công'}
                          </p>
                        </td>

                        <td className="px-4 py-3">
                          <span className="inline-flex rounded-full bg-orange-100 px-2.5 py-1 text-xs font-medium text-orange-800">
                            {report.status}
                          </span>
                        </td>

                        <td className="whitespace-nowrap px-4 py-3 text-gray-500">
                          {formatDateTime(
                            report.dueAt,
                          )}
                        </td>

                        <td className="whitespace-nowrap px-4 py-3 font-medium text-red-600">
                          {formatOverdueDuration(
                            report.overdueMilliseconds,
                          )}
                        </td>

                        <td className="px-4 py-3 text-right">
                          <Button
                            type="button"
                            size="sm"
                            variant="secondary"
                            onClick={() =>
                              openReport(
                                report.id,
                              )
                            }
                          >
                            Xem chi tiết
                          </Button>
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-gray-500">
            <p>
              Tổng cộng{' '}
              {filteredReports.length}{' '}
              báo cáo · Trang{' '}
              {safePageNumber}/
              {totalPages}
            </p>

            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant="secondary"
                disabled={
                  safePageNumber <= 1
                }
                onClick={() =>
                  setPageNumber(
                    (current) =>
                      Math.max(
                        1,
                        current - 1,
                      ),
                  )
                }
              >
                Trang trước
              </Button>

              <Button
                type="button"
                size="sm"
                variant="secondary"
                disabled={
                  safePageNumber >=
                  totalPages
                }
                onClick={() =>
                  setPageNumber(
                    (current) =>
                      current + 1,
                  )
                }
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
