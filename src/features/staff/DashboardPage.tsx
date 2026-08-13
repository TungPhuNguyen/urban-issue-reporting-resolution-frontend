import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  Flame,
  Gauge,
  TimerReset,
} from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Reveal } from '@/components/ui/CivicPulseAnimations'
import { Spinner } from '@/components/ui/Spinner'
import { getStatusLabel } from '@/components/ui/report-labels'
import { parseApiDateTime } from '@/lib/utils/date-time'

import { useStaffDashboard } from './staff.queries'
import type { StaffDashboardTrendItem } from './staff.types'

function dateInput(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function chartPath(items: StaffDashboardTrendItem[], max: number, area = false) {
  if (items.length === 0) return ''

  const points = items.map((item, index) => {
    const x = (index / Math.max(items.length - 1, 1)) * 700
    const y = 210 - (item.count / max) * 175
    return `${x},${y}`
  })
  const line = `M ${points.join(' L ')}`

  return area ? `${line} L 700 220 L 0 220 Z` : line
}

export default function StaffDashboardPage() {
  const today = new Date()
  const monthAgo = new Date(today)
  monthAgo.setDate(today.getDate() - 30)
  const [from, setFrom] = useState(dateInput(monthAgo))
  const [to, setTo] = useState(dateInput(today))
  const [applied, setApplied] = useState({ from, to })
  const [dateRangeError, setDateRangeError] = useState<string | null>(null)
  const query = useStaffDashboard(applied.from, applied.to)

  if (query.isPending) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <Spinner label="Đang tải tổng quan xử lý..." />
      </div>
    )
  }

  if (query.isError || !query.data) {
    return (
      <Card className="empty-state p-8 text-center">
        <h3>Không thể tải Dashboard Staff</h3>
        <p>Vui lòng kiểm tra kết nối và thử lại.</p>
        <Button variant="secondary" onClick={() => void query.refetch()}>
          Thử lại
        </Button>
      </Card>
    )
  }

  const data = query.data
  const trendMax = Math.max(1, ...data.trend.map((item) => item.count))

  return (
    <section className="dashboard-page staff-dashboard">
      <div className="page-heading page-heading--split">
        <div>
          <Badge className="badge--violet">Không gian đơn vị xử lý</Badge>
          <h1>{data.departmentName}</h1>
          <p>Ưu tiên công việc cần hành động, theo dõi SLA và hiệu suất xử lý.</p>
        </div>
        <Link to="/staff/reports">
          <Button>
            <ClipboardCheck aria-hidden="true" size={18} />
            Mở danh sách công việc
          </Button>
        </Link>
      </div>

      <form
        className="panel dashboard-date-filter"
        onSubmit={(event) => {
          event.preventDefault()
          if (from > to) {
            setDateRangeError('"Từ ngày" không được sau "Đến ngày".')
            return
          }
          setDateRangeError(null)
          setApplied({ from, to })
        }}
      >
        <label className="field">
          <span className="field__label">Từ ngày</span>
          <input
            type="date"
            value={from}
            max={to}
            onChange={(event) => {
              setFrom(event.target.value)
              setDateRangeError(null)
            }}
          />
        </label>
        <label className="field">
          <span className="field__label">Đến ngày</span>
          <input 
            type="date" 
            value={to} 
            min={from} 
            onChange={(event) => {
              setTo(event.target.value)
              setDateRangeError(null)
            }}
          />
        </label>
        <Button type="submit">Áp dụng</Button>
        {dateRangeError && (
          <p role="alert" className="w-full text-sm text-red-600">
            {dateRangeError}
          </p>
        )}
      </form>

      <div className="metric-grid metric-grid--4">
        <Reveal>
          <div className="metric-card">
            <span className="metric-card__icon blue">
              <ClipboardCheck aria-hidden="true" />
            </span>
            <div>
              <small>Tổng báo cáo</small>
              <strong>{data.totalReports}</strong>
              <span>{data.newReports} báo cáo mới</span>
            </div>
          </div>
        </Reveal>
        <Reveal delay={60}>
          <div className="metric-card">
            <span className="metric-card__icon amber">
              <Clock3 aria-hidden="true" />
            </span>
            <div>
              <small>Đang xử lý</small>
              <strong>{data.inProgressReports}</strong>
              <span>{data.acceptedReports} đã tiếp nhận</span>
            </div>
          </div>
        </Reveal>
        <Reveal delay={120}>
          <div className="metric-card">
            <span className="metric-card__icon green">
              <CheckCircle2 aria-hidden="true" />
            </span>
            <div>
              <small>Đã giải quyết</small>
              <strong>{data.resolvedReports}</strong>
              <span>
                {data.averageResolutionHours === null
                  ? 'Chưa đủ dữ liệu thời gian'
                  : `Trung bình ${data.averageResolutionHours.toFixed(1)} giờ`}
              </span>
            </div>
          </div>
        </Reveal>
        <Reveal delay={180}>
          <div className="metric-card metric-card--alert">
            <span className="metric-card__icon red">
              <AlertTriangle aria-hidden="true" />
            </span>
            <div>
              <small>Quá hạn SLA</small>
              <strong>{data.overdueReports}</strong>
              <span>{data.escalatedReports} báo cáo nâng cấp</span>
            </div>
          </div>
        </Reveal>
      </div>

      <div className="dashboard-chart-grid">
        <section className="panel chart-panel">
          <header className="panel__header">
            <div>
              <h2>Khối lượng tiếp nhận</h2>
              <p>Xu hướng trong khoảng thời gian đã chọn</p>
            </div>
            <Badge variant="success">{data.trend.length} ngày</Badge>
          </header>
          {data.trend.length > 0 ? (
            <div className="line-chart">
              <svg viewBox="0 0 700 230" preserveAspectRatio="none" aria-hidden="true">
                <defs>
                  <linearGradient id="staffAreaFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="var(--primary)" stopOpacity=".26" />
                    <stop offset="1" stopColor="var(--primary)" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path
                  className="line-chart__area staff-chart-area"
                  d={chartPath(data.trend, trendMax, true)}
                />
                <path className="line-chart__line" d={chartPath(data.trend, trendMax)} />
              </svg>
              <div className="line-chart__labels">
                <span>
                  {parseApiDateTime(data.trend[0]?.date ?? data.from).toLocaleDateString(
                    'vi-VN',
                  )}
                </span>
                <span>
                  {parseApiDateTime(
                    data.trend.at(-1)?.date ?? data.to,
                  ).toLocaleDateString('vi-VN')}
                </span>
              </div>
            </div>
          ) : (
            <div className="empty-state compact">
              <p>Chưa có dữ liệu xu hướng trong khoảng thời gian này.</p>
            </div>
          )}
        </section>

        <section className="panel">
          <header className="panel__header">
            <div>
              <h2>Phân bố trạng thái</h2>
              <p>Tất cả báo cáo của đơn vị</p>
            </div>
          </header>
          <div className="status-bars">
            {data.reportsByStatus.map((item) => (
              <div key={item.status}>
                <div>
                  <span>{getStatusLabel(item.status)}</span>
                  <strong>{item.count}</strong>
                </div>
                <i>
                  <b
                    style={{
                      width: `${(item.count / Math.max(data.totalReports, 1)) * 100}%`,
                    }}
                  />
                </i>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="panel attention-panel">
        <header className="panel__header">
          <div>
            <h2>Cần ưu tiên hôm nay</h2>
            <p>Các nhóm công việc có rủi ro SLA</p>
          </div>
          <Link to="/staff/overdue-reports">
            Xem chi tiết <ArrowRight aria-hidden="true" size={16} />
          </Link>
        </header>
        <div className="attention-grid">
          <div>
            <span className="red">
              <TimerReset aria-hidden="true" />
            </span>
            <strong>{data.slaBreachedReports}</strong>
            <p>Đã quá hạn SLA</p>
          </div>
          <div>
            <span className="amber">
              <Gauge aria-hidden="true" />
            </span>
            <strong>{data.slaWarningReports}</strong>
            <p>Sắp chạm ngưỡng SLA</p>
          </div>
          <div>
            <span className="violet">
              <Flame aria-hidden="true" />
            </span>
            <strong>{data.escalatedReports}</strong>
            <p>Đã nâng cấp xử lý</p>
          </div>
          <div>
            <span className="blue">
              <ClipboardCheck aria-hidden="true" />
            </span>
            <strong>{data.assignedReports}</strong>
            <p>Chờ nhân viên tiếp nhận</p>
          </div>
        </div>
      </section>
    </section>
  )
}
