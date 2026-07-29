import { Link } from 'react-router-dom'

import { Card } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'

import { useStaffReports } from './staff.queries'

export default function StaffReportsPage() {
  const { data, isLoading, isError, isFetching, refetch } = useStaffReports()

  const reports = data?.items ?? []

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
            Không có báo cáo cần xử lý
          </h2>

          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Các báo cáo thuộc đơn vị sẽ xuất hiện tại đây.
          </p>
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
              <Link key={report.id} to={`/staff/reports/${report.id}`} className="block">
                <Card className="p-5 transition hover:-translate-y-0.5 hover:shadow-md">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="font-semibold text-gray-900 dark:text-gray-100">
                        {report.categoryName}
                      </h2>

                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        {report.addressText}
                      </p>
                    </div>

                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {report.status}
                    </span>
                  </div>

                  <p className="mt-3 text-sm text-gray-700 dark:text-gray-300">
                    {report.description}
                  </p>
                </Card>
              </Link>
            ))}
          </div>
        </>
      )}
    </section>
  )
}
