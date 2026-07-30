import { Card } from '@/components/ui/Card'
import { useStartProcessingReport } from '../staff.queries'

interface StartProcessingReportCardProps {
  reportId: string
}

export function StartProcessingReportCard({ reportId }: StartProcessingReportCardProps) {
  const startProcessing = useStartProcessingReport(reportId)

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
        Bắt đầu xử lý
      </h2>

      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
        Chuyển báo cáo sang trạng thái đang xử lý.
      </p>

      <button
        type="button"
        disabled={startProcessing.isPending}
        onClick={() => {
          startProcessing.mutate({
            note: 'Bắt đầu xử lý hiện trường.',
          })
        }}
        className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {startProcessing.isPending ? 'Đang bắt đầu...' : 'Bắt đầu xử lý'}
      </button>

      {startProcessing.isError && (
        <p className="mt-3 text-sm text-red-600">
          Không thể bắt đầu xử lý. Vui lòng thử lại.
        </p>
      )}
    </Card>
  )
}
