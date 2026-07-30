import { useState } from 'react'

import { Card } from '@/components/ui/Card'
import { useAcceptStaffReport } from '../staff.queries'
import { REPORT_PRIORITY, type ReportPriority } from '../staff.types'

interface AcceptReportCardProps {
  reportId: string
}

export function AcceptReportCard({ reportId }: AcceptReportCardProps) {
  const acceptReport = useAcceptStaffReport(reportId)
  const [priority, setPriority] = useState<ReportPriority | ''>('')

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
        Tiếp nhận báo cáo
      </h2>

      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
        Chọn mức ưu tiên và tiếp nhận báo cáo này để bắt đầu xử lý.
      </p>
      <div className="mt-4">
        <label
          htmlFor="priority"
          className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Mức ưu tiên
        </label>

        <select
          id="priority"
          value={priority}
          onChange={(e) => setPriority(e.target.value as ReportPriority | '')}
          className="w-full rounded-lg border border-gray-300 p-2 dark:border-gray-600 dark:bg-gray-800"
        >
          <option value="">-- Chọn mức ưu tiên --</option>
          <option value={REPORT_PRIORITY.Low}>Low</option>
          <option value={REPORT_PRIORITY.Medium}>Medium</option>
          <option value={REPORT_PRIORITY.High}>High</option>
        </select>
      </div>

      <button
        type="button"
        disabled={acceptReport.isPending || priority === ''}
        onClick={() => {
          if (priority === '') return

          acceptReport.mutate({
            priority,
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