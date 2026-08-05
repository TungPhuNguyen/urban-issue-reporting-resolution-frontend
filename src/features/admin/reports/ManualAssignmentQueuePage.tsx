import { useState } from 'react'
import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { Spinner } from '@/components/ui/Spinner'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { ApiError } from '@/lib/api/http'

import { useManualAssignmentQueue } from './admin-reports.queries'

const PAGE_SIZE = 10

function formatDate(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date)
}

function getErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    return error.message
  }

  return 'Không thể tải hàng đợi phân công thủ công.'
}

export default function ManualAssignmentQueuePage() {
  const [pageNumber, setPageNumber] = useState(1)

  const query = useManualAssignmentQueue({
    pageNumber,
    pageSize: PAGE_SIZE,
  })

  if (query.isPending) {
    return (
      <div className="flex min-h-64 items-center justify-center" aria-label="Đang tải">
        <Spinner />
      </div>
    )
  }

  if (query.isError) {
    return (
      <Card className="flex min-h-64 flex-col items-center justify-center gap-3 p-8 text-center">
        <h1 className="text-xl font-semibold">Không tải được hàng đợi</h1>

        <p className="max-w-xl text-sm text-red-600">{getErrorMessage(query.error)}</p>

        <Button onClick={() => query.refetch()}>Thử lại</Button>
      </Card>
    )
  }

  const page = query.data
  const reports = page.items
  const totalPages = Math.max(page.totalPages, 1)

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            Hàng đợi phân công thủ công
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Báo cáo chưa thể tự động chuyển tuyến, sắp xếp từ cũ nhất đến mới nhất.
          </p>
        </div>

        <Button
          variant="secondary"
          loading={query.isFetching}
          onClick={() => query.refetch()}
        >
          Làm mới
        </Button>
      </div>

      <Card className="overflow-hidden">
        {reports.length === 0 ? (
          <EmptyState
            title="Không có báo cáo chờ phân công"
            description="Hàng đợi sẽ tự động cập nhật khi có báo cáo mới."
            className="min-h-64 rounded-none border-0"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px] text-left text-sm">
              <thead className="border-b border-gray-200 bg-gray-50 text-gray-600 dark:border-gray-800 dark:bg-gray-800/50 dark:text-gray-300">
                <tr>
                  <th className="px-4 py-3 font-medium">Mã báo cáo</th>

                  <th className="px-4 py-3 font-medium">Danh mục</th>

                  <th className="px-4 py-3 font-medium">Khu vực</th>

                  <th className="px-4 py-3 font-medium">Mô tả</th>

                  <th className="px-4 py-3 font-medium">Ngày tạo</th>

                  <th className="px-4 py-3 font-medium">Trạng thái</th>

                  <th className="px-4 py-3 font-medium">Phân công hiện tại</th>

                  <th className="px-4 py-3 text-right font-medium">Thao tác</th>
                </tr>
              </thead>

              <tbody>
                {reports.map((report) => (
                  <tr
                    key={report.id}
                    className="border-b border-gray-100 align-top last:border-0 dark:border-gray-800"
                  >
                    <td className="px-4 py-3 font-mono text-xs font-semibold">
                      {report.id}
                    </td>

                    <td className="px-4 py-3">
                      {report.categoryName ?? 'Chưa xác định'}
                    </td>

                    <td className="px-4 py-3">{report.areaName ?? 'Chưa xác định'}</td>

                    <td className="max-w-sm px-4 py-3 text-gray-600 dark:text-gray-300">
                      <p className="line-clamp-3">{report.description}</p>
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      {formatDate(report.createdAt)}
                    </td>

                    <td className="px-4 py-3">
                      <StatusBadge status={report.status} />
                    </td>

                    <td className="px-4 py-3 text-gray-500">
                      {report.departmentName ?? 'Chưa có phòng ban'}
                    </td>

                    <td className="px-4 py-3 text-right">
                      <Link
                        to={`/admin/reports/${report.id}`}
                        className="inline-flex h-8 items-center justify-center rounded-lg bg-gray-100 px-3 text-sm font-medium text-gray-900 transition-colors hover:bg-gray-200"
                      >
                        Xem chi tiết
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-gray-500">
        <p>
          Tổng cộng {page.totalItems} báo cáo · Trang {page.pageNumber}/{totalPages}
        </p>

        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            disabled={pageNumber <= 1 || query.isFetching}
            onClick={() => setPageNumber((current) => Math.max(1, current - 1))}
          >
            Trang trước
          </Button>

          <Button
            variant="secondary"
            size="sm"
            disabled={pageNumber >= totalPages || query.isFetching}
            onClick={() => setPageNumber((current) => current + 1)}
          >
            Trang sau
          </Button>
        </div>
      </div>
    </section>
  )
}
