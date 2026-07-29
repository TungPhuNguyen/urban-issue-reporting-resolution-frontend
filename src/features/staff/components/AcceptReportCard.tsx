import { Card } from '@/components/ui/Card'
import { useAcceptStaffReport } from '../staff.queries'

interface AcceptReportCardProps {
  reportId: string
}

export function AcceptReportCard({ reportId }: AcceptReportCardProps) {
  const acceptReport = useAcceptStaffReport(reportId)

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
        Tiếp nhận báo cáo
      </h2>

      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
        Chọn mức ưu tiên và tiếp nhận báo cáo này để bắt đầu xử lý.
      </p>

      <button
        type="button"
        disabled={acceptReport.isPending}
        onClick={() => {
          acceptReport.mutate({
            priority: 2,
            note: 'Đã tiếp nhận báo cáo để xử lý.',
          })
        }}
        className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {acceptReport.isPending ? 'Đang tiếp nhận...' : 'Tiếp nhận báo cáo'}
      </button>

      {acceptReport.isError && (
        <p className="mt-3 text-sm text-red-600">
          Không thể tiếp nhận báo cáo. Vui lòng thử lại.
        </p>
      )}
    </Card>
  )
}
