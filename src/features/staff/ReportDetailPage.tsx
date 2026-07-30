import { Link, useParams } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'
import { AcceptReportCard } from './components/AcceptReportCard'
import { StartProcessingReportCard } from './components/StartProcessingReportCard'
import { ProgressUpdateCard } from './components/ProgressUpdateCard'
import { ReportTimeline } from './components/ReportTimeline'

import { useStaffReport } from './staff.queries'

export default function StaffReportDetailPage() {
  const { reportId = '' } = useParams()

  const {
    data: report,
    isLoading,
    isError,
    isFetching,
    refetch,
  } = useStaffReport(reportId)

  if (isLoading) {
    return (
      <section className="mx-auto max-w-5xl">
        <Card className="p-10">
          <div className="flex justify-center">
            <Spinner label="Đang tải chi tiết báo cáo..." />
          </div>
        </Card>
      </section>
    )
  }

  if (isError || !report) {
    return (
      <section className="mx-auto max-w-5xl">
        <Card className="p-8 text-center">
          <p className="font-medium text-red-600">Không thể tải chi tiết báo cáo.</p>

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
      </section>
    )
  }

  return (
    <section className="mx-auto flex max-w-5xl flex-col gap-6">
      <div>
        <Link
          to="/staff/reports"
          className="text-sm font-medium text-blue-600 hover:underline"
        >
          ← Quay lại danh sách
        </Link>

        <h1 className="mt-3 text-2xl font-bold text-gray-900 dark:text-gray-100">
          Chi tiết báo cáo
        </h1>
      </div>

      <Card className="p-6">
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Danh mục</p>
            <p className="mt-1 font-medium text-gray-900 dark:text-gray-100">
              {report.categoryName}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Trạng thái</p>
            <p className="mt-1 font-medium text-gray-900 dark:text-gray-100">
              {report.status}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Khu vực</p>
            <p className="mt-1 font-medium text-gray-900 dark:text-gray-100">
              {report.areaName}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Địa chỉ</p>
            <p className="mt-1 font-medium text-gray-900 dark:text-gray-100">
              {report.addressText ?? 'Chưa có địa chỉ'}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Người báo cáo</p>
            <p className="mt-1 font-medium text-gray-900 dark:text-gray-100">
              {report.citizenName}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Mức ưu tiên</p>
            <p className="mt-1 font-medium text-gray-900 dark:text-gray-100">
              {report.priority ?? 'Chưa phân loại'}
            </p>
          </div>
        </div>

        <div className="mt-6">
          <p className="text-sm text-gray-500 dark:text-gray-400">Mô tả</p>
          <p className="mt-2 text-gray-700 dark:text-gray-300">{report.description}</p>
        </div>
      </Card>
      {report.status === 'Assigned' && <AcceptReportCard reportId={reportId} />}
      {report.status === 'Accepted' && <StartProcessingReportCard reportId={reportId} />}
      {report.status === 'InProgress' && <ProgressUpdateCard reportId={reportId} />}
      <ReportTimeline reportId={reportId} />
    </section>
  )
}
