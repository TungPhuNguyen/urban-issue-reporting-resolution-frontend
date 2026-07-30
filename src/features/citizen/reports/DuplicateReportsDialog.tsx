import { env } from '@/config/env'

import { ReportStatusBadge } from './ReportStatusBadge'
import type { CheckDuplicateReportsResult, DuplicateReport } from './citizen-report.types'

interface DuplicateReportsDialogProps {
  result: CheckDuplicateReportsResult
  isCreating: boolean
  error?: string
  onCancel: () => void
  onConfirm: () => void
}

function formatDateTime(value: string): string {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return 'Không xác định'
  }

  return date.toLocaleString('vi-VN')
}

function formatDistance(distanceInMeters: number): string {
  if (distanceInMeters < 1000) {
    return `${Math.round(distanceInMeters)} m`
  }

  return `${(distanceInMeters / 1000).toFixed(1)} km`
}

function resolveThumbnailUrl(imageUrl: string): string {
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl
  }

  const apiUrl = new URL(env.apiBaseUrl, window.location.origin)

  const normalizedPath = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`

  return new URL(normalizedPath, apiUrl.origin).toString()
}

function DuplicateReportCard({ report }: { report: DuplicateReport }) {
  return (
    <li className="rounded-lg border border-amber-200 bg-white p-4">
      <div className="flex gap-4">
        {report.thumbnailUrl && (
          <img
            src={resolveThumbnailUrl(report.thumbnailUrl)}
            alt=""
            className="h-20 w-24 shrink-0 rounded-lg object-cover"
          />
        )}

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <ReportStatusBadge status={report.status} />

            <span className="text-sm font-medium text-amber-700">
              Cách vị trí đã chọn {formatDistance(report.distanceInMeters)}
            </span>
          </div>

          <p className="mt-2 line-clamp-2 text-sm text-gray-800">{report.description}</p>

          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
            <span>{formatDateTime(report.createdAt)}</span>

            <span>{report.upvoteCount} lượt đồng tình</span>
          </div>
        </div>
      </div>
    </li>
  )
}

export function DuplicateReportsDialog({
  result,
  isCreating,
  error,
  onCancel,
  onConfirm,
}: DuplicateReportsDialogProps) {
  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-gray-950/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="duplicate-dialog-title"
      aria-describedby="duplicate-dialog-description"
    >
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white shadow-2xl">
        <div className="border-b border-gray-200 p-5">
          <h2 id="duplicate-dialog-title" className="text-xl font-bold text-gray-900">
            Có thể sự cố này đã được phản ánh
          </h2>

          <p id="duplicate-dialog-description" className="mt-2 text-sm text-gray-600">
            Hệ thống tìm thấy {result.reports.length} phản ánh cùng loại trong bán kính{' '}
            {formatDistance(result.searchRadiusInMeters)}. Vui lòng kiểm tra trước khi tạo
            phản ánh mới.
          </p>
        </div>

        <ul className="space-y-3 bg-amber-50/60 p-5">
          {result.reports.map((report) => (
            <DuplicateReportCard key={report.id} report={report} />
          ))}
        </ul>

        <div className="border-t border-gray-200 p-5">
          <p className="text-sm text-gray-600">
            Nếu đây là cùng một sự cố, bạn không nên gửi thêm phản ánh. Nếu là sự cố khác,
            bạn vẫn có thể tiếp tục.
          </p>

          {error && (
            <div
              role="alert"
              className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          <div className="mt-5 flex flex-wrap justify-end gap-3">
            <button
              type="button"
              disabled={isCreating}
              onClick={onCancel}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Quay lại chỉnh sửa
            </button>

            <button
              type="button"
              disabled={isCreating}
              onClick={onConfirm}
              className="rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isCreating ? 'Đang gửi phản ánh...' : 'Vẫn gửi phản ánh'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
