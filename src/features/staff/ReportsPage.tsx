import { AlertTriangle, ArrowUpRight, Clock3, SearchX } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { PriorityBadge } from '@/components/ui/PriorityBadge'
import { Spinner } from '@/components/ui/Spinner'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { getPriorityLabel, getStatusLabel } from '@/components/ui/report-labels'
import { useDebounce } from '@/hooks/useDebounce'
import { parseApiDateTime } from '@/lib/utils/date-time'

import { useStaffReports } from './staff.queries'
import {
  REPORT_PRIORITY,
  REPORT_STATUS,
  type ReportPriority,
  type ReportStatus,
} from './staff.types'

const PAGE_SIZE = 10

const statusOptions: ReportStatus[] = [
  REPORT_STATUS.Assigned,
  REPORT_STATUS.Accepted,
  REPORT_STATUS.InProgress,
  REPORT_STATUS.Resolved,
  REPORT_STATUS.Closed,
  REPORT_STATUS.Rejected,
  REPORT_STATUS.Cancelled,
]

const priorityOptions: ReportPriority[] = [
  REPORT_PRIORITY.Low,
  REPORT_PRIORITY.Medium,
  REPORT_PRIORITY.High,
]

function formatDateTime(value: string | null) {
  if (!value) return 'Chưa bắt đầu'

  const date = parseApiDateTime(value)
  return Number.isNaN(date.getTime()) ? 'Không xác định' : date.toLocaleString('vi-VN')
}

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
    <section className="reports-page staff-reports-page">
      <div className="page-heading">
        <Badge className="badge--violet">Hàng đợi xử lý</Badge>
        <h1>Danh sách báo cáo</h1>
        <p>Lọc theo trạng thái, ưu tiên và thời hạn SLA để tập trung đúng công việc.</p>
      </div>

      <Card className="panel filter-bar filter-bar--wrap">
        <div className="staff-report-filters">
          <Input
            label="Tìm kiếm"
            type="search"
            value={search}
            maxLength={200}
            placeholder="Mã, tiêu đề, địa chỉ hoặc khu vực"
            onChange={(event) => {
              setSearch(event.target.value)
              setPageNumber(1)
            }}
          />

          <div className="field">
            <label id="staff-report-status-label" htmlFor="staff-report-status">
              Trạng thái
            </label>
            <select
              id="staff-report-status"
              aria-labelledby="staff-report-status-label"
              value={status}
              onChange={(event) => {
                setStatus(event.target.value as ReportStatus | '')
                setPageNumber(1)
              }}
            >
              <option value="">Tất cả trạng thái</option>
              {statusOptions.map((option) => (
                <option key={option} value={option}>
                  {getStatusLabel(option)}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label id="staff-report-priority-label" htmlFor="staff-report-priority">
              Mức ưu tiên
            </label>
            <select
              id="staff-report-priority"
              aria-labelledby="staff-report-priority-label"
              value={priority}
              onChange={(event) => {
                setPriority(event.target.value as ReportPriority | '')
                setPageNumber(1)
              }}
            >
              <option value="">Tất cả mức ưu tiên</option>
              {priorityOptions.map((option) => (
                <option key={option} value={option}>
                  {getPriorityLabel(option)}
                </option>
              ))}
            </select>
          </div>

          <Button
            type="button"
            variant="secondary"
            disabled={!hasActiveFilters}
            onClick={clearFilters}
          >
            Xóa bộ lọc
          </Button>
        </div>
      </Card>

      <section className="panel table-panel">
        <header className="panel__header">
          <div>
            <h2>{data?.totalItems ?? 0} báo cáo</h2>
            <p>Cập nhật mới nhất từ hệ thống</p>
          </div>
          {isFetching && !isLoading && <Badge variant="info">Đang cập nhật</Badge>}
        </header>

        {isLoading ? (
          <div className="flex min-h-64 items-center justify-center">
            <Spinner label="Đang tải danh sách báo cáo..." />
          </div>
        ) : isError ? (
          <div className="empty-state">
            <h3>Không thể tải danh sách báo cáo</h3>
            <p>Vui lòng kiểm tra kết nối và thử lại.</p>
            <Button variant="secondary" onClick={() => void refetch()}>
              Thử lại
            </Button>
          </div>
        ) : reports.length === 0 ? (
          <div className="empty-state">
            <span className="empty-state__icon">
              <SearchX aria-hidden="true" />
            </span>
            <h3>
              {hasActiveFilters
                ? 'Không tìm thấy báo cáo phù hợp'
                : 'Không có báo cáo cần xử lý'}
            </h3>
            <p>
              {hasActiveFilters
                ? 'Hãy thử từ khóa, trạng thái hoặc mức ưu tiên khác.'
                : 'Các báo cáo thuộc đơn vị sẽ xuất hiện tại đây.'}
            </p>
            {hasActiveFilters && (
              <Button variant="secondary" onClick={clearFilters}>
                Xóa bộ lọc
              </Button>
            )}
          </div>
        ) : (
          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Báo cáo</th>
                  <th>Khu vực</th>
                  <th>Trạng thái</th>
                  <th>Ưu tiên</th>
                  <th>Hạn xử lý</th>
                  <th>
                    <span className="sr-only">Thao tác</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => (
                  <tr key={report.id} className={report.isOverdue ? 'row--danger' : ''}>
                    <td>
                      <Link className="table-report" to={`/staff/reports/${report.id}`}>
                        <span>{report.reportCode ?? `#${report.id.slice(0, 8)}`}</span>
                        <strong>{report.title ?? report.categoryName}</strong>
                        {report.title && <small>{report.categoryName}</small>}
                      </Link>
                    </td>
                    <td>
                      <div className="table-location">
                        <strong>Khu vực: {report.areaName}</strong>
                        <small>{report.addressText ?? 'Chưa có địa chỉ mô tả'}</small>
                      </div>
                    </td>
                    <td>
                      <StatusBadge status={report.status} />
                    </td>
                    <td>
                      <PriorityBadge priority={report.priority} />
                    </td>
                    <td>
                      <div className={`due-cell ${report.isOverdue ? 'danger' : ''}`}>
                        {report.isOverdue ? (
                          <AlertTriangle aria-hidden="true" size={15} />
                        ) : (
                          <Clock3 aria-hidden="true" size={15} />
                        )}
                        <span>{formatDateTime(report.dueAt)}</span>
                      </div>
                    </td>
                    <td>
                      <Link
                        className="table-open"
                        to={`/staff/reports/${report.id}`}
                        aria-label={`Mở báo cáo ${report.reportCode ?? report.id}`}
                      >
                        <ArrowUpRight aria-hidden="true" size={18} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {totalPages > 1 && (
        <nav
          aria-label="Phân trang danh sách báo cáo"
          className="pagination role-pagination"
        >
          <Button
            type="button"
            variant="secondary"
            disabled={currentPage <= 1 || isFetching}
            onClick={() => setPageNumber((page) => Math.max(1, page - 1))}
          >
            Trang trước
          </Button>
          <span>
            Trang <strong>{currentPage}</strong> / {totalPages}
          </span>
          <Button
            type="button"
            variant="secondary"
            disabled={currentPage >= totalPages || isFetching}
            onClick={() => setPageNumber((page) => Math.min(totalPages, page + 1))}
          >
            Trang sau
          </Button>
        </nav>
      )}
    </section>
  )
}
