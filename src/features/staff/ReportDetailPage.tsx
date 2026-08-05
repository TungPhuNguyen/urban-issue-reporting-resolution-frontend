import type { ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'

import { Card } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'
import { getImageUrl } from '@/lib/utils/image'

import { AcceptReportCard } from './components/AcceptReportCard'
import { ProgressUpdateCard } from './components/ProgressUpdateCard'
import { ReportTimeline } from './components/ReportTimeline'
import { StartProcessingReportCard } from './components/StartProcessingReportCard'
import { useStaffReport } from './staff.queries'
import type { ReportStatus } from './staff.types'

import { PriorityBadge } from '@/components/ui/PriorityBadge'
import { StatusBadge } from '@/components/ui/StatusBadge'

interface DetailItemProps {
  label: string
  value: ReactNode
}

function DetailItem({ label, value }: DetailItemProps) {
  return (
    <div>
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      <div className="mt-1 font-medium break-words text-gray-900 dark:text-gray-100">
        {value}
      </div>
    </div>
  )
}

function formatDateTime(value: string | null | undefined) {
  if (!value) {
    return 'Chưa cập nhật'
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return 'Không xác định'
  }

  return date.toLocaleString('vi-VN')
}

function getSlaState(status: ReportStatus, dueAt: string | null) {
  if (!dueAt) {
    return 'not-started'
  }

  const dueDate = new Date(dueAt)
  const isActive = status === 'Accepted' || status === 'InProgress'

  if (isActive && !Number.isNaN(dueDate.getTime()) && dueDate.getTime() < Date.now()) {
    return 'overdue'
  }

  if (isActive) {
    return 'active'
  }

  return 'finished'
}

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

  const slaState = getSlaState(report.status, report.dueAt)

  return (
    <section className="report-detail-page mx-auto flex max-w-5xl flex-col gap-6">
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

        <p className="mt-1 text-sm break-all text-gray-500 dark:text-gray-400">
          {report.id}
        </p>
      </div>

      <Card className="p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              {report.categoryName}
            </h2>

            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              {report.addressText || report.areaName}
            </p>
          </div>

          <StatusBadge status={report.status} />
        </div>

        <div className="mt-6 border-t border-gray-200 pt-5 dark:border-gray-800">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">Mô tả sự cố</h3>

          <p className="mt-2 leading-6 whitespace-pre-wrap text-gray-700 dark:text-gray-300">
            {report.description}
          </p>
        </div>

        <div className="mt-6 grid gap-5 border-t border-gray-200 pt-5 sm:grid-cols-2 lg:grid-cols-3 dark:border-gray-800">
          <DetailItem label="Người báo cáo" value={report.citizenName} />
          <DetailItem label="Danh mục" value={report.categoryName} />
          <DetailItem label="Khu vực" value={report.areaName} />
          <DetailItem label="Địa chỉ" value={report.addressText ?? 'Chưa có địa chỉ'} />
          <DetailItem
            label="Đơn vị xử lý"
            value={report.departmentName ?? 'Chưa phân công đơn vị'}
          />
          <DetailItem
            label="Cán bộ phụ trách"
            value={report.assignedStaffName ?? 'Chưa phân công cán bộ'}
          />
          <DetailItem
            label="Mức ưu tiên"
            value={
              report.priority ? (
                <PriorityBadge priority={report.priority} />
              ) : (
                'Chưa phân loại'
              )
            }
          />
          <DetailItem label="Lượt ủng hộ" value={`${report.upvoteCount} lượt`} />
          <DetailItem label="Tọa độ" value={`${report.latitude}, ${report.longitude}`} />
          <DetailItem label="Ngày gửi" value={formatDateTime(report.createdAt)} />
          <DetailItem
            label="Cập nhật gần nhất"
            value={formatDateTime(report.updatedAt)}
          />
          <DetailItem label="Ngày tiếp nhận" value={formatDateTime(report.acceptedAt)} />
          <DetailItem label="Ngày hoàn thành" value={formatDateTime(report.resolvedAt)} />
        </div>

        <div className="mt-6 border-t border-gray-200 pt-5 dark:border-gray-800">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">
            Hình ảnh sự cố
          </h3>

          {report.imageUrls.length === 0 ? (
            <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
              Báo cáo chưa có hình ảnh.
            </p>
          ) : (
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {report.imageUrls.map((imageUrl, index) => {
                const resolvedUrl = getImageUrl(imageUrl)

                return (
                  <a
                    key={`${imageUrl}-${index}`}
                    href={resolvedUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="group overflow-hidden rounded-lg bg-black/5 dark:bg-white/5"
                  >
                    <img
                      src={resolvedUrl}
                      alt={`Hình ảnh sự cố ${index + 1}`}
                      loading="lazy"
                      className="h-56 w-full object-cover transition-transform group-hover:scale-105"
                    />
                  </a>
                )
              })}
            </div>
          )}
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Thông tin SLA
        </h2>

        <div
          className={`mt-4 rounded-lg border p-4 ${
            slaState === 'overdue'
              ? 'border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/40'
              : 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800'
          }`}
        >
          <p
            className={`font-semibold ${
              slaState === 'overdue'
                ? 'text-red-700 dark:text-red-300'
                : 'text-gray-900 dark:text-gray-100'
            }`}
          >
            {slaState === 'not-started'
              ? 'SLA chưa bắt đầu'
              : slaState === 'overdue'
                ? 'Quá hạn SLA'
                : slaState === 'active'
                  ? 'Đang trong thời hạn SLA'
                  : 'SLA đã kết thúc'}
          </p>
        </div>

        <div className="mt-5 grid gap-5 sm:grid-cols-3">
          <DetailItem
            label="Số giờ SLA"
            value={
              report.appliedSlaHours === null
                ? 'Chưa áp dụng'
                : `${report.appliedSlaHours} giờ`
            }
          />
          <DetailItem label="Bắt đầu SLA" value={formatDateTime(report.slaStartedAt)} />
          <DetailItem label="Hạn xử lý" value={formatDateTime(report.dueAt)} />
        </div>
      </Card>

      {report.isEscalated && (
        <Card className="border-red-200 bg-red-50 p-6 dark:border-red-900 dark:bg-red-950/40">
          <h2 className="font-semibold text-red-800 dark:text-red-300">
            Báo cáo đã được cảnh báo quá hạn
          </h2>

          <p className="mt-2 text-sm text-red-700 dark:text-red-400">
            Thời gian cảnh báo: {formatDateTime(report.escalatedAt)}
          </p>
        </Card>
      )}

      {report.hasSubmittedComplaint && (
        <Card className="border-orange-200 bg-orange-50 p-6 dark:border-orange-900 dark:bg-orange-950/40">
          <h2 className="font-semibold text-orange-900 dark:text-orange-300">
            Công dân yêu cầu xử lý thêm
          </h2>

          <p className="mt-1 text-sm text-orange-700 dark:text-orange-400">
            Thời gian gửi: {formatDateTime(report.complaintSubmittedAt)}
          </p>

          <p className="mt-3 whitespace-pre-wrap text-orange-800 dark:text-orange-300">
            {report.complaintReason ?? 'Không có nội dung yêu cầu.'}
          </p>
        </Card>
      )}

      {report.status === 'Assigned' && <AcceptReportCard reportId={reportId} />}
      {report.status === 'Accepted' && <StartProcessingReportCard reportId={reportId} />}
      {report.status === 'InProgress' && <ProgressUpdateCard reportId={reportId} />}
      <ReportTimeline reportId={reportId} />
    </section>
  )
}
