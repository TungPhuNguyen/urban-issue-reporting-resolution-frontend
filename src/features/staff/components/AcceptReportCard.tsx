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
  const [note, setNote] = useState('')

  const errorMessage =
    acceptReport.error instanceof Error && acceptReport.error.message
      ? acceptReport.error.message
      : 'Không thể tiếp nhận báo cáo. Vui lòng thử lại.'

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
        Tiếp nhận báo cáo
      </h2>

      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
        Chọn mức ưu tiên và tiếp nhận báo cáo này để bắt đầu xử lý.
      </p>

      <form
        className="mt-4"
        onSubmit={(event) => {
          event.preventDefault()

          if (priority === '') return

          const trimmedNote = note.trim()

          acceptReport.mutate({
            priority,
            ...(trimmedNote ? { note: trimmedNote } : {}),
          })
        }}
      >
        <div>
          <label
            htmlFor="accept-report-priority"
            className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Mức ưu tiên
          </label>

          <select
            id="accept-report-priority"
            value={priority}
            required
            disabled={acceptReport.isPending}
            onChange={(event) => setPriority(event.target.value as ReportPriority | '')}
            className="w-full rounded-lg border border-gray-300 p-2 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-600 dark:bg-gray-800"
          >
            <option value="">-- Chọn mức ưu tiên --</option>
            <option value={REPORT_PRIORITY.Low}>Thấp</option>
            <option value={REPORT_PRIORITY.Medium}>Trung bình</option>
            <option value={REPORT_PRIORITY.High}>Cao</option>
          </select>
        </div>

        <div className="mt-4">
          <label
            htmlFor="accept-report-note"
            className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Ghi chú tiếp nhận (không bắt buộc)
          </label>

          <textarea
            id="accept-report-note"
            value={note}
            rows={3}
            maxLength={1000}
            disabled={acceptReport.isPending}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Nhập ghi chú cho lần tiếp nhận..."
            aria-describedby="accept-report-note-length"
            className="w-full rounded-lg border border-gray-300 p-3 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-600 dark:bg-gray-800"
          />

          <p
            id="accept-report-note-length"
            className="mt-1 text-right text-xs text-gray-500 dark:text-gray-400"
          >
            {note.length}/1000 ký tự
          </p>
        </div>

        <button
          type="submit"
          disabled={acceptReport.isPending || priority === ''}
          className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {acceptReport.isPending ? 'Đang tiếp nhận...' : 'Tiếp nhận báo cáo'}
        </button>
      </form>

      {acceptReport.isError && (
        <p role="alert" className="mt-3 text-sm text-red-600">
          {errorMessage}
        </p>
      )}

      {acceptReport.isSuccess && (
        <p
          role="status"
          className="mt-3 text-sm font-medium text-green-600 dark:text-green-400"
        >
          Tiếp nhận báo cáo thành công.
        </p>
      )}
    </Card>
  )
}
