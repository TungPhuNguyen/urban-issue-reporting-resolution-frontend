import { Link } from 'react-router-dom'

import { Card } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'

import { ReportCard } from './reports/ReportCard'
import { useCitizenReports } from './reports/citizen-report.queries'

export default function CitizenReportsPage() {
  const {
    data,
    isLoading,
    isError,
    isFetching,
    refetch,
  } = useCitizenReports({
    pageNumber: 1,
    pageSize: 10,
  })

  const reports = data?.items ?? []

  return (
    <section className="mx-auto flex max-w-5xl flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Báo cáo của tôi
          </h1>

          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Theo dõi các phản ánh hạ tầng mà bạn đã gửi.
          </p>
        </div>

        <Link
          to="/citizen/reports/create"
          className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700"
        >
          Tạo phản ánh mới
        </Link>
      </div>

      {isLoading && (
        <Card className="p-10">
          <div className="flex justify-center">
            <Spinner label="Đang tải danh sách phản ánh..." />
          </div>
        </Card>
      )}

      {!isLoading && isError && (
        <Card className="p-8 text-center">
          <p className="font-medium text-red-600">
            Không thể tải danh sách phản ánh.
          </p>

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
        <Card className="border-dashed p-8 text-center">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Bạn chưa có phản ánh nào
          </h2>

          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Các phản ánh bạn đã gửi sẽ xuất hiện tại đây.
          </p>

          <Link
            to="/citizen/reports/create"
            className="mt-5 inline-block rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            Gửi phản ánh đầu tiên
          </Link>
        </Card>
      )}

      {!isLoading && !isError && reports.length > 0 && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Tổng cộng:{' '}
              <span className="font-semibold">
                {data?.totalItems ?? reports.length}
              </span>{' '}
              phản ánh
            </p>

            {isFetching && (
              <span className="text-sm text-gray-500">
                Đang cập nhật...
              </span>
            )}
          </div>

          <div className="flex flex-col gap-4">
            {reports.map((report) => (
              <ReportCard
                key={report.id}
                report={report}
              />
            ))}
          </div>
        </>
      )}
    </section>
  )
}