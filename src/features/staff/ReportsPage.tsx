import { useState } from 'react'

import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Spinner } from '@/components/ui/Spinner'
import { useDebounce } from '@/hooks/useDebounce'

import { useStaffReports } from './staff.queries'
import {
  REPORT_PRIORITY,
  REPORT_STATUS,
  type ReportPriority,
  type ReportStatus,
} from './staff.types'
import { ReportCard } from '@/components/reports/ReportCard'

const PAGE_SIZE = 10

const statusOptions: {
  value: ReportStatus
  label: string
}[] = [
    { value: REPORT_STATUS.Assigned, label: 'Đã phân công' },
    { value: REPORT_STATUS.Accepted, label: 'Đã tiếp nhận' },
    { value: REPORT_STATUS.InProgress, label: 'Đang xử lý' },
    { value: REPORT_STATUS.Resolved, label: 'Đã giải quyết' },
    { value: REPORT_STATUS.Reopened, label: 'Đã mở lại' },
    { value: REPORT_STATUS.Closed, label: 'Đã đóng' },
    { value: REPORT_STATUS.Rejected, label: 'Đã từ chối' },
  ]

const priorityOptions: {
  value: ReportPriority
  label: string
}[] = [
    { value: REPORT_PRIORITY.Low, label: 'Thấp' },
    { value: REPORT_PRIORITY.Medium, label: 'Trung bình' },
    { value: REPORT_PRIORITY.High, label: 'Cao' },
  ]

export default function StaffReportsPage() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<ReportStatus | ''>('')
  const [priority, setPriority] = useState<ReportPriority | ''>('')
  const [pageNumber, setPageNumber] = useState(1)
  const debouncedSearch = useDebounce(search.trim(), 300)

  const { data, isLoading, isError, isFetching, refetch } = useStaffReports({
    search: debouncedSearch || undefined,
    status: status || undefined,
    priority: priority || undefined,
    pageNumber,
    pageSize: PAGE_SIZE,
  })

  const reports = data?.items ?? []
  const currentPage = data?.pageNumber ?? pageNumber
  const totalPages = data?.totalPages ?? 0
  const hasActiveFilters = search.trim().length > 0 || status !== '' || priority !== ''

  const clearFilters = () => {
    setSearch('')
    setStatus('')
    setPriority('')
    setPageNumber(1)
  }

  return (
    <section className="mx-auto flex max-w-5xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Báo cáo cần xử lý
        </h1>

        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Danh sách báo cáo thuộc đơn vị của cán bộ.
        </p>
      </div>

      <Card className="p-4">
        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_180px_180px_auto] md:items-end">
          <Input
            label="Tìm kiếm"
            type="search"
            value={search}
            maxLength={200}
            placeholder="Mô tả, địa chỉ, loại sự cố hoặc khu vực"
            onChange={(event) => {
              setSearch(event.target.value)
              setPageNumber(1)
            }}
          />

          <div className="flex flex-col gap-1">
            <label
              htmlFor="staff-report-status"
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Trạng thái
            </label>

            <select
              id="staff-report-status"
              value={status}
              onChange={(event) => {
                setStatus(event.target.value as ReportStatus | '')
                setPageNumber(1)
              }}
              className="focus:border-brand-500 focus:ring-brand-500/30 h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 transition-colors outline-none focus:ring-2 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
            >
              <option value="">Tất cả trạng thái</option>

              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label
              htmlFor="staff-report-priority"
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Mức ưu tiên
            </label>

            <select
              id="staff-report-priority"
              value={priority}
              onChange={(event) => {
                setPriority(event.target.value as ReportPriority | '')
                setPageNumber(1)
              }}
              className="focus:border-brand-500 focus:ring-brand-500/30 h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 transition-colors outline-none focus:ring-2 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
            >
              <option value="">Tất cả mức ưu tiên</option>

              {priorityOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            disabled={!hasActiveFilters}
            onClick={clearFilters}
            className="h-10 rounded-lg border border-gray-300 px-4 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
          >
            Xóa bộ lọc
          </button>
        </div>
      </Card>

      {isLoading && (
        <Card className="p-10">
          <div className="flex justify-center">
            <Spinner label="Đang tải danh sách báo cáo..." />
          </div>
        </Card>
      )}

      {!isLoading && isError && (
        <Card className="p-8 text-center">
          <p className="font-medium text-red-600">Không thể tải danh sách báo cáo.</p>

          <button
            type="button"
            disabled={isFetching}
            onClick={() => {
              void refetch()
            }}
            className="mt-4 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 dark:text-gray-200"
          >
            {isFetching ? 'Đang tải lại...' : 'Thử lại'}
          </button>
        </Card>
      )}

      {!isLoading && !isError && reports.length === 0 && (
        <Card className="border-dashed p-8 text-center">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {hasActiveFilters
              ? 'Không tìm thấy báo cáo phù hợp'
              : 'Không có báo cáo cần xử lý'}
          </h2>

          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {hasActiveFilters
              ? 'Hãy thử từ khóa, trạng thái hoặc mức ưu tiên khác.'
              : 'Các báo cáo thuộc đơn vị sẽ xuất hiện tại đây.'}
          </p>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="mt-5 rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              Xóa bộ lọc
            </button>
          )}
        </Card>
      )}

      {!isLoading && !isError && reports.length > 0 && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Tổng cộng:{' '}
              <span className="font-semibold">{data?.totalItems ?? reports.length}</span>{' '}
              báo cáo
            </p>

            {isFetching && (
              <span className="text-sm text-gray-500">Đang cập nhật...</span>
            )}
          </div>

          <div className="flex flex-col gap-4">
            {reports.map((report) => (
              <ReportCard
                key={report.id}
                report={report}
                to={`/staff/reports/${report.id}`}
                showReportId
                showDueDate
              />
            ))}
          </div>

          {totalPages > 1 && (
            <nav
              aria-label="Phân trang danh sách báo cáo"
              className="flex flex-wrap items-center justify-center gap-3"
            >
              <button
                type="button"
                disabled={currentPage <= 1 || isFetching}
                onClick={() => {
                  setPageNumber((page) => Math.max(1, page - 1))
                }}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
              >
                Trang trước
              </button>

              <span className="text-sm text-gray-600 dark:text-gray-400">
                Trang <span className="font-semibold">{currentPage}</span> / {totalPages}
              </span>

              <button
                type="button"
                disabled={currentPage >= totalPages || isFetching}
                onClick={() => {
                  setPageNumber((page) => Math.min(totalPages, page + 1))
                }}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
              >
                Trang sau
              </button>
            </nav>
          )}
        </>
      )}
    </section>
  )
}
