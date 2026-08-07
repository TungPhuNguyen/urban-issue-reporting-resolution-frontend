import { FilePlus2, SearchX } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Spinner } from '@/components/ui/Spinner'
import { getStatusLabel } from '@/components/ui/report-labels'
import { useDebounce } from '@/hooks/useDebounce'

import { ReportCard } from '@/components/reports/ReportCard'
import { useCitizenReports } from './reports/citizen-report.queries'
import { REPORT_STATUS, type ReportStatus } from './reports/citizen-report.types'

const PAGE_SIZE = 10

const statusOptions: ReportStatus[] = [
  REPORT_STATUS.New,
  REPORT_STATUS.Assigned,
  REPORT_STATUS.Accepted,
  REPORT_STATUS.InProgress,
  REPORT_STATUS.Resolved,
  REPORT_STATUS.Closed,
  REPORT_STATUS.Rejected,
  REPORT_STATUS.Cancelled,
]

export default function CitizenReportsPage() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<ReportStatus | ''>('')
  const [pageNumber, setPageNumber] = useState(1)
  const debouncedSearch = useDebounce(search.trim(), 300)

  const { data, isLoading, isError, isFetching, refetch } = useCitizenReports({
    search: debouncedSearch || undefined,
    status: status || undefined,
    pageNumber,
    pageSize: PAGE_SIZE,
  })

  const reports = data?.items ?? []
  const currentPage = data?.pageNumber ?? pageNumber
  const totalPages = data?.totalPages ?? 0
  const hasActiveFilters = search.trim().length > 0 || status !== ''

  const clearFilters = () => {
    setSearch('')
    setStatus('')
    setPageNumber(1)
  }

  return (
    <section className="reports-page citizen-reports-page">
      <div className="page-heading page-heading--split">
        <div>
          <Badge variant="info">Quản lý phản ánh</Badge>
          <h1>Báo cáo của tôi</h1>

          <p>Theo dõi trạng thái, tiến trình và phản hồi của từng sự cố bạn đã gửi.</p>
        </div>

        <Link to="/citizen/reports/create">
          <Button>
            <FilePlus2 aria-hidden="true" size={18} />
            Tạo báo cáo
          </Button>
        </Link>
      </div>

      <Card className="panel filter-bar filter-bar--wrap">
        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_240px_auto] md:items-end">
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
              htmlFor="citizen-report-status"
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Trạng thái
            </label>

            <select
              id="citizen-report-status"
              value={status}
              onChange={(event) => {
                setStatus(event.target.value as ReportStatus | '')
                setPageNumber(1)
              }}
              className="focus:border-brand-500 focus:ring-brand-500/30 h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 transition-colors outline-none focus:ring-2 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
            >
              <option value="">Tất cả trạng thái</option>

              {statusOptions.map((option) => (
                <option key={option} value={option}>
                  {getStatusLabel(option)}
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
            <Spinner label="Đang tải danh sách phản ánh..." />
          </div>
        </Card>
      )}

      {!isLoading && isError && (
        <Card className="p-8 text-center">
          <p className="font-medium text-red-600">Không thể tải danh sách phản ánh.</p>

          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Vui lòng kiểm tra kết nối và thử lại.
          </p>

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
        <Card className="empty-state border-dashed p-8 text-center">
          <span className="empty-state__icon">
            <SearchX aria-hidden="true" />
          </span>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {hasActiveFilters
              ? 'Không tìm thấy phản ánh phù hợp'
              : 'Bạn chưa có phản ánh nào'}
          </h2>

          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {hasActiveFilters
              ? 'Hãy thử từ khóa hoặc trạng thái khác.'
              : 'Các phản ánh bạn đã gửi sẽ xuất hiện tại đây.'}
          </p>

          {hasActiveFilters ? (
            <button
              type="button"
              onClick={clearFilters}
              className="mt-5 rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              Xóa bộ lọc
            </button>
          ) : (
            <Link
              to="/citizen/reports/create"
              className="mt-5 inline-block rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
            >
              Gửi phản ánh đầu tiên
            </Link>
          )}
        </Card>
      )}

      {!isLoading && !isError && reports.length > 0 && (
        <>
          <div className="reports-result-summary">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Tổng cộng:{' '}
              <span className="font-semibold">{data?.totalItems ?? reports.length}</span>{' '}
              phản ánh
            </p>

            {isFetching && (
              <span className="text-sm text-gray-500">Đang cập nhật...</span>
            )}
          </div>

          <div className="report-grid report-grid--3">
            {reports.map((report) => (
              <ReportCard
                key={report.id}
                report={report}
                to={`/citizen/reports/${report.id}`}
                showReportId
              />
            ))}
          </div>

          {totalPages > 1 && (
            <nav
              aria-label="Phân trang danh sách phản ánh"
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
