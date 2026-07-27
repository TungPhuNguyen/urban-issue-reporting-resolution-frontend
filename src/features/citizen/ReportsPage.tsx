import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'

import { ReportCard } from './ReportCard'
import { useCitizenReports } from './reports.queries'

export default function CitizenReportsPage() {
  const {
    data,
    isLoading,
    isError,
    refetch,
  } = useCitizenReports()

  if (isLoading) {
    return (
      <Spinner label="Đang tải danh sách báo cáo..." />
    )
  }

  if (isError) {
    return (
      <Card className="p-8 text-center">
        <p className="font-medium text-red-600">
          Không thể tải danh sách báo cáo.
        </p>

        <Button
          className="mt-4"
          variant="secondary"
          onClick={() => void refetch()}
        >
          Thử lại
        </Button>
      </Card>
    )
  }

  const reports = data?.items ?? []

  return (
    <section className="flex flex-col gap-6">
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
          className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
        >
          Tạo phản ánh mới
        </Link>
      </div>

      {reports.length === 0 ? (
        <Card className="border-dashed p-8 text-center">
          <p className="font-medium text-gray-900 dark:text-gray-100">
            Bạn chưa có báo cáo nào
          </p>

          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Hãy tạo phản ánh đầu tiên để báo cáo vấn đề
            hạ tầng.
          </p>

          <Link
            to="/citizen/reports/create"
            className="mt-5 inline-block rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            Gửi phản ánh đầu tiên
          </Link>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {reports.map((report) => (
            <ReportCard
              key={report.id}
              report={report}
            />
          ))}
        </div>
      )}
    </section>
  )
}