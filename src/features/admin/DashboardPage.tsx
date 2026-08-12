import { AlertTriangle, CheckCircle2, ClipboardList } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { getStatusLabel } from '@/components/ui/report-labels'
import { Spinner } from '@/components/ui/Spinner'
import { ApiError } from '@/lib/api/http'

import { useAdminDashboard } from './dashboard/dashboard.queries'
import type {
  DashboardDateRange,
  ReportsByAreaItem,
  ReportsByCategoryItem,
  ReportsByStatusItem,
} from './dashboard/dashboard.types'

function toInputDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function defaultRange(): DashboardDateRange {
  const toDate = new Date()
  const fromDate = new Date()
  fromDate.setDate(fromDate.getDate() - 29)

  return {
    fromDate: toInputDate(fromDate),
    toDate: toInputDate(toDate),
  }
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat('vi-VN').format(value)
}

function formatHours(value: number | null) {
  if (value === null) {
    return 'Chưa có dữ liệu'
  }

  return `${value.toLocaleString('vi-VN', {
    maximumFractionDigits: 1,
  })} giờ`
}

function errorMessage(error: unknown): string {
  if (error instanceof ApiError || error instanceof Error) {
    return error.message
  }

  return 'Không thể tải dữ liệu dashboard.'
}

interface BreakdownCardProps {
  title: string
  emptyMessage: string
  items: Array<{
    key: string | number
    label: string
    count: number
    percentage: number
  }>
}

function BreakdownCard({ title, emptyMessage, items }: BreakdownCardProps) {
  return (
    <Card className="panel breakdown-panel">
      <header className="panel__header">
        <div>
          <h2>{title}</h2>
        </div>
      </header>

      {items.length === 0 ? (
        <p className="mt-5 text-sm text-gray-500">{emptyMessage}</p>
      ) : (
        <div className="mt-5 space-y-4">
          {items.map((item) => (
            <div key={item.key}>
              <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
                <span className="truncate font-medium text-gray-700 dark:text-gray-200">
                  {item.label}
                </span>
                <span className="shrink-0 text-gray-500">
                  {formatNumber(item.count)} · {item.percentage.toFixed(1)}%
                </span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                <div
                  className="bg-brand-600 h-full rounded-full"
                  style={{
                    width: `${Math.min(100, Math.max(0, item.percentage))}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}

export default function AdminDashboardPage() {
  const navigate = useNavigate()
  const initialRange = useMemo(defaultRange, [])
  const [draftRange, setDraftRange] = useState(initialRange)
  const [appliedRange, setAppliedRange] = useState(initialRange)
  const [validationError, setValidationError] = useState<string | null>(null)

  const dashboardQuery = useAdminDashboard(appliedRange)
  const data = dashboardQuery.data

  function applyRange() {
    if (!draftRange.fromDate || !draftRange.toDate) {
      setValidationError('Vui lòng chọn đầy đủ ngày bắt đầu và ngày kết thúc.')
      return
    }

    if (draftRange.fromDate > draftRange.toDate) {
      setValidationError('Ngày bắt đầu không được sau ngày kết thúc.')
      return
    }

    setValidationError(null)
    setAppliedRange({ ...draftRange })
  }

  const statusItems = (data?.reportsByStatus ?? []).map((item: ReportsByStatusItem) => ({
    key: item.status,
    label: getStatusLabel(item.status),
    count: item.reportCount,
    percentage: item.percentage,
  }))

  const categoryItems = (data?.reportsByCategory ?? [])
    .slice(0, 8)
    .map((item: ReportsByCategoryItem) => ({
      key: item.categoryId,
      label: item.categoryName,
      count: item.reportCount,
      percentage: item.percentage,
    }))

  const areaItems = (data?.reportsByArea ?? [])
    .slice(0, 8)
    .map((item: ReportsByAreaItem) => ({
      key: item.areaId,
      label: item.areaName,
      count: item.reportCount,
      percentage: item.percentage,
    }))

  return (
    <section className="dashboard-page admin-dashboard flex flex-col gap-5">
      <div className="page-heading page-heading--split">
        <div>
          <Badge variant="danger">Trung tâm điều hành</Badge>
          <h1>Tổng quan hệ thống</h1>
          <p>Hiệu suất xử lý, rủi ro SLA và hoạt động điều phối toàn hệ thống.</p>
        </div>

        <Button
          type="button"
          variant="secondary"
          loading={dashboardQuery.isFetching}
          onClick={() => void dashboardQuery.refetch()}
        >
          Làm mới
        </Button>
      </div>

      <Card className="panel admin-date-filter">
        <div className="grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
          <label className="flex flex-col gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-200">
            Từ ngày
            <input
              type="date"
              value={draftRange.fromDate}
              max={draftRange.toDate || undefined}
              onChange={(event) =>
                setDraftRange((current) => ({
                  ...current,
                  fromDate: event.target.value,
                }))
              }
              className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm dark:border-gray-700 dark:bg-gray-950"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-200">
            Đến ngày
            <input
              type="date"
              value={draftRange.toDate}
              min={draftRange.fromDate || undefined}
              onChange={(event) =>
                setDraftRange((current) => ({
                  ...current,
                  toDate: event.target.value,
                }))
              }
              className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm dark:border-gray-700 dark:bg-gray-950"
            />
          </label>

          <Button type="button" onClick={applyRange}>
            Áp dụng
          </Button>
        </div>

        {validationError && (
          <p className="mt-3 text-sm text-red-600">{validationError}</p>
        )}
      </Card>

      {dashboardQuery.isPending ? (
        <Card className="min-h-72">
          <Spinner label="Đang tải dashboard..." />
        </Card>
      ) : dashboardQuery.isError ? (
        <Card className="flex min-h-72 flex-col items-center justify-center gap-3 p-8 text-center">
          <p className="font-medium text-red-600">{errorMessage(dashboardQuery.error)}</p>
          <Button type="button" onClick={() => void dashboardQuery.refetch()}>
            Thử lại
          </Button>
        </Card>
      ) : data ? (
        <>
          <div className="metric-grid metric-grid--4">
            <Card className="metric-card">
              <span className="metric-card__icon blue">
                <ClipboardList aria-hidden="true" />
              </span>
              <div>
                <small>Tổng báo cáo</small>
                <strong>{formatNumber(data.summary.totalReports)}</strong>
                <span>{formatNumber(data.summary.newReports)} báo cáo mới</span>
              </div>
            </Card>

            <Card className="metric-card">
              <span className="metric-card__icon green">
                <CheckCircle2 aria-hidden="true" />
              </span>
              <div>
                <small>Đã xử lý / đóng</small>
                <strong>
                  {formatNumber(
                    data.summary.resolvedReports + data.summary.closedReports,
                  )}
                </strong>
                <span>Tỷ lệ {data.summary.resolutionRate.toFixed(2)}%</span>
              </div>
            </Card>

            <Card className="metric-card">
              <span className="metric-card__icon amber">
                <AlertTriangle aria-hidden="true" />
              </span>

              <div>
                <small>Đã cảnh báo quá hạn</small>

                <strong>{formatNumber(data.summary.escalatedReports)}</strong>

                <button
                  type="button"
                  onClick={() => navigate('/admin/reports?isEscalated=true')}
                >
                  Xem danh sách
                </button>
              </div>
            </Card>

            <Card className="metric-card metric-card--alert">
              <span className="metric-card__icon red">
                <AlertTriangle aria-hidden="true" />
              </span>
              <div>
                <small>Đang quá hạn</small>
                <strong>{formatNumber(data.summary.activeOverdueReports)}</strong>
                <button type="button" onClick={() => navigate('/admin/overdue-reports')}>
                  Xem danh sách
                </button>
              </div>
            </Card>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Card className="p-4">
              <p className="text-sm text-gray-500">Chờ phân công thủ công</p>
              <p className="mt-1 text-2xl font-semibold">
                {formatNumber(data.summary.requiresManualAssignmentReports)}
              </p>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="mt-2 px-0"
                onClick={() => navigate('/admin/reports/manual-assignment')}
              >
                Xử lý ngay
              </Button>
            </Card>

            <Card className="p-4">
              <p className="text-sm text-gray-500">Khiếu nại chờ xử lý</p>
              <p className="mt-1 text-2xl font-semibold">
                {formatNumber(data.summary.pendingComplaintReports)}
              </p>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="mt-2 px-0"
                onClick={() => navigate('/admin/reports?hasComplaint=true')}
              >
                Xử lý ngay
              </Button>
            </Card>

            <Card className="p-4">
              <p className="text-sm text-gray-500">Đang xử lý</p>
              <p className="mt-1 text-2xl font-semibold">
                {formatNumber(data.summary.inProgressReports)}
              </p>
            </Card>

            <Card className="p-4">
              <p className="text-sm text-gray-500">Bị từ chối</p>
              <p className="mt-1 text-2xl font-semibold">
                {formatNumber(data.summary.rejectedReports)}
              </p>
            </Card>
          </div>

          <div className="grid gap-5 xl:grid-cols-3">
            <BreakdownCard
              title="Theo trạng thái"
              emptyMessage="Không có dữ liệu trạng thái trong khoảng thời gian này."
              items={statusItems}
            />
            <BreakdownCard
              title="Theo loại sự cố"
              emptyMessage="Không có dữ liệu loại sự cố trong khoảng thời gian này."
              items={categoryItems}
            />
            <BreakdownCard
              title="Theo khu vực"
              emptyMessage="Không có dữ liệu khu vực trong khoảng thời gian này."
              items={areaItems}
            />
          </div>

          <div className="grid gap-5 xl:grid-cols-3">
            <Card className="p-5 xl:col-span-1">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Hiệu suất SLA
              </h2>
              <div className="mt-5 space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Tỷ lệ đúng hạn</p>
                  <p className="mt-1 text-3xl font-bold text-green-600">
                    {data.slaPerformance.complianceRate.toFixed(1)}%
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
                    <p className="text-gray-500">Hoàn tất đúng hạn</p>
                    <p className="mt-1 text-xl font-semibold">
                      {formatNumber(data.slaPerformance.completedOnTimeReports)}
                    </p>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
                    <p className="text-gray-500">Hoàn tất trễ</p>
                    <p className="mt-1 text-xl font-semibold text-red-600">
                      {formatNumber(data.slaPerformance.completedLateReports)}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Thời gian xử lý trung bình</p>
                  <p className="mt-1 text-xl font-semibold">
                    {formatHours(data.slaPerformance.averageHandlingHours)}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-5 xl:col-span-2">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Xu hướng báo cáo
              </h2>
              {data.reportTrend.items.length === 0 ? (
                <p className="mt-5 text-sm text-gray-500">
                  Không có dữ liệu xu hướng trong khoảng thời gian này.
                </p>
              ) : (
                <div className="mt-5 max-h-80 space-y-3 overflow-y-auto pr-2">
                  {data.reportTrend.items.map((item) => {
                    const maximum = Math.max(
                      item.createdCount,
                      item.resolvedCount,
                      item.closedCount,
                      1,
                    )

                    return (
                      <div
                        key={item.date}
                        className="grid grid-cols-[6rem_1fr] items-center gap-3"
                      >
                        <span className="text-xs text-gray-500">
                          {new Date(`${item.date}T00:00:00`).toLocaleDateString('vi-VN')}
                        </span>
                        <div className="space-y-1">
                          {[
                            {
                              label: 'Tạo',
                              value: item.createdCount,
                              color: 'bg-blue-500',
                            },
                            {
                              label: 'Xử lý',
                              value: item.resolvedCount,
                              color: 'bg-amber-500',
                            },
                            {
                              label: 'Đóng',
                              value: item.closedCount,
                              color: 'bg-green-500',
                            },
                          ].map((bar) => (
                            <div
                              key={bar.label}
                              className="flex items-center gap-2 text-xs"
                            >
                              <span className="w-10 text-gray-500">{bar.label}</span>
                              <div className="h-2 flex-1 rounded-full bg-gray-100 dark:bg-gray-800">
                                <div
                                  className={`h-full rounded-full ${bar.color}`}
                                  style={{
                                    width: `${(bar.value / maximum) * 100}%`,
                                  }}
                                />
                              </div>
                              <span className="w-6 text-right">{bar.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </Card>
          </div>
        </>
      ) : null}
    </section>
  )
}
