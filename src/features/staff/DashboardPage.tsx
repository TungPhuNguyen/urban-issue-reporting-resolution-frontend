import { useState } from 'react'

import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'
import { getStatusLabel } from '@/components/ui/report-labels'

import { useStaffDashboard } from './staff.queries'

function dateInput(date: Date) {
  return date.toISOString().slice(0, 10)
}

export default function StaffDashboardPage() {
  const today = new Date()
  const monthAgo = new Date(today)
  monthAgo.setDate(today.getDate() - 30)
  const [from, setFrom] = useState(dateInput(monthAgo))
  const [to, setTo] = useState(dateInput(today))
  const [applied, setApplied] = useState({ from, to })
  const query = useStaffDashboard(applied.from, applied.to)
  if (query.isPending)
    return (
      <div className="flex min-h-64 items-center justify-center">
        <Spinner />
      </div>
    )
  if (query.isError || !query.data)
    return (
      <Card className="p-8 text-center text-red-600">Không thể tải dashboard Staff.</Card>
    )
  const data = query.data
  const trendMax = Math.max(1, ...data.trend.map((item) => item.count))
  const metrics = [
    ['Tổng báo cáo', data.totalReports],
    ['Đang xử lý', data.inProgressReports],
    ['Đã xử lý', data.resolvedReports],
    ['Quá hạn', data.overdueReports],
    ['Cảnh báo SLA', data.slaWarningReports],
    ['Vi phạm SLA', data.slaBreachedReports],
  ] as const
  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Tổng quan xử lý</h1>
          <p className="mt-1 text-sm text-gray-500">{data.departmentName}</p>
        </div>
        <form
          className="flex flex-wrap items-end gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            setApplied({ from, to })
          }}
        >
          <label className="text-sm">
            Từ ngày
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="ml-2 h-10 rounded-lg border border-gray-300 px-2"
            />
          </label>
          <label className="text-sm">
            Đến ngày
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="ml-2 h-10 rounded-lg border border-gray-300 px-2"
            />
          </label>
          <Button type="submit">Áp dụng</Button>
        </form>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        {metrics.map(([label, value]) => (
          <Card key={label} className="p-4">
            <p className="text-sm text-gray-500">{label}</p>
            <p className="mt-1 text-3xl font-semibold">{value}</p>
          </Card>
        ))}
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="p-6">
          <h2 className="text-lg font-semibold">Theo trạng thái</h2>
          <div className="mt-4 space-y-3">
            {data.reportsByStatus.map((item) => (
              <div key={item.status} className="flex items-center justify-between gap-4">
                <span className="text-sm">{getStatusLabel(item.status)}</span>
                <strong>{item.count}</strong>
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-6">
          <h2 className="text-lg font-semibold">Xu hướng báo cáo</h2>
          <div className="mt-5 flex h-52 items-end gap-2 overflow-x-auto">
            {data.trend.map((item) => (
              <div
                key={item.date}
                className="flex min-w-8 flex-1 flex-col items-center justify-end gap-1"
              >
                <span className="text-xs">{item.count}</span>
                <div
                  className="w-full rounded-t bg-blue-500"
                  style={{ height: `${Math.max(4, (item.count / trendMax) * 160)}px` }}
                />
                <span className="text-[10px] text-gray-500">
                  {new Date(item.date).toLocaleDateString('vi-VN', {
                    day: '2-digit',
                    month: '2-digit',
                  })}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
      <Card className="p-5">
        <p className="text-sm text-gray-500">Thời gian xử lý trung bình</p>
        <p className="mt-1 text-2xl font-semibold">
          {data.averageResolutionHours === null
            ? 'Chưa đủ dữ liệu'
            : `${data.averageResolutionHours.toFixed(1)} giờ`}
        </p>
      </Card>
    </section>
  )
}
