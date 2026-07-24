import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'
import { ReportCard } from './ReportCard'

import { useCitizenReports } from './reports.queries'

export default function CitizenReportsPage() {
  const { data, isLoading, isError, refetch } = useCitizenReports()

  if (isLoading) {
    return <Spinner label="Đang tải danh sách báo cáo..." />
  }

  if (isError) {
    return (
      <Card className="p-8 text-center">
        <p className="font-medium text-red-600">Không thể tải danh sách báo cáo.</p>

        <Button className="mt-4" variant="secondary" onClick={() => refetch()}>
          Thử lại
        </Button>
      </Card>
    )
  }

  const reports = data?.items ?? []

  return (
    <section className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Báo cáo của tôi
        </h1>

        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Theo dõi các báo cáo bạn đã gửi.
        </p>
      </div>

      {reports.length === 0 ? (
        <Card className="border-dashed p-8 text-center">
          <p className="font-medium text-gray-900 dark:text-gray-100">
            Bạn chưa có báo cáo nào
          </p>

          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Các báo cáo bạn đã gửi sẽ xuất hiện tại đây.
          </p>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {reports.map((report) => (
            <ReportCard key={report.id} report={report} />
          ))}
        </div>
      )}
    </section>
  )
}
