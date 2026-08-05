import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { getImageUrl } from '@/lib/utils/image'

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

function DuplicateReportCard({ report }: { report: DuplicateReport }) {
  return (
    <li className="rounded-lg border border-amber-200 bg-white p-4 dark:border-amber-900 dark:bg-gray-900">
      <div className="flex gap-4">
        {report.thumbnailUrl && (
          <img
            src={getImageUrl(report.thumbnailUrl)}
            alt={`Ảnh báo cáo trùng lặp ${report.id.slice(0, 8)}`}
            className="h-20 w-24 shrink-0 rounded-lg object-cover"
          />
        )}

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={report.status} />

            <span className="text-sm font-medium text-amber-700 dark:text-amber-300">
              Cách vị trí đã chọn {formatDistance(report.distanceInMeters)}
            </span>
          </div>

          <p className="mt-2 line-clamp-2 text-sm text-gray-800 dark:text-gray-200">
            {report.description}
          </p>

          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
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
    <Modal
      open
      title="Có thể sự cố này đã được phản ánh"
      description={`Hệ thống tìm thấy ${result.reports.length} phản ánh cùng loại trong bán kính ${formatDistance(result.searchRadiusInMeters)}. Vui lòng kiểm tra trước khi tạo phản ánh mới.`}
      className="max-w-2xl"
      onClose={() => {
        if (!isCreating) {
          onCancel()
        }
      }}
      footer={
        <>
          <Button
            type="button"
            variant="secondary"
            disabled={isCreating}
            onClick={onCancel}
          >
            Quay lại chỉnh sửa
          </Button>
          <Button
            type="button"
            loading={isCreating}
            disabled={isCreating}
            onClick={onConfirm}
          >
            Vẫn gửi phản ánh
          </Button>
        </>
      }
    >
      <ul className="space-y-3 rounded-lg bg-amber-50/60 p-4 dark:bg-amber-950/20">
        {result.reports.map((report) => (
          <DuplicateReportCard key={report.id} report={report} />
        ))}
      </ul>

      <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        Nếu đây là cùng một sự cố, bạn không nên gửi thêm phản ánh. Nếu là sự cố khác, bạn
        vẫn có thể tiếp tục.
      </p>

      {error && (
        <div
          role="alert"
          className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300"
        >
          {error}
        </div>
      )}
    </Modal>
  )
}