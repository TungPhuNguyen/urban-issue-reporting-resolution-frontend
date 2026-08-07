import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  FilePlus2,
  MapPinned,
  MessageSquareText,
  ThumbsUp,
  TrendingUp,
} from 'lucide-react'
import { Link } from 'react-router-dom'

import { ReportCard } from '@/components/reports/ReportCard'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Reveal } from '@/components/ui/CivicPulseAnimations'
import { Spinner } from '@/components/ui/Spinner'
import { useAuthStore } from '@/features/auth/auth.store'

import { useCitizenReports } from './reports/citizen-report.queries'

const ACTIVE_STATUSES = new Set(['New', 'Assigned', 'Accepted', 'InProgress'])
const COMPLETED_STATUSES = new Set(['Resolved', 'Closed'])

export default function CitizenDashboardPage() {
  const user = useAuthStore((state) => state.user)
  const reportsQuery = useCitizenReports({ pageNumber: 1, pageSize: 100 })
  const reports = reportsQuery.data?.items ?? []
  const firstName = user?.fullName.trim().split(/\s+/).at(-1) ?? 'bạn'
  const stats = {
    total: reportsQuery.data?.totalItems ?? reports.length,
    active: reports.filter((report) => ACTIVE_STATUSES.has(report.status)).length,
    completed: reports.filter((report) => COMPLETED_STATUSES.has(report.status)).length,
    upvotes: reports.reduce((total, report) => total + report.upvoteCount, 0),
  }

  return (
    <section className="dashboard-page citizen-dashboard">
      <div className="page-heading page-heading--split">
        <div>
          <Badge variant="info">Không gian công dân</Badge>
          <h1>Xin chào, {firstName} 👋</h1>
          <p>Theo dõi phản ánh của bạn và những thay đổi đang diễn ra trong cộng đồng.</p>
        </div>
        <Link to="/citizen/reports/create">
          <Button size="lg">
            <FilePlus2 aria-hidden="true" size={19} />
            Tạo báo cáo mới
          </Button>
        </Link>
      </div>

      <div className="metric-grid metric-grid--4">
        <Reveal>
          <div className="metric-card">
            <span className="metric-card__icon blue">
              <MapPinned aria-hidden="true" />
            </span>
            <div>
              <small>Tổng báo cáo</small>
              <strong>{stats.total}</strong>
              <span>Tất cả phản ánh của bạn</span>
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
              <strong>{stats.active}</strong>
              <span>Đang được đơn vị tiếp nhận</span>
            </div>
          </div>
        </Reveal>
        <Reveal delay={120}>
          <div className="metric-card">
            <span className="metric-card__icon green">
              <CheckCircle2 aria-hidden="true" />
            </span>
            <div>
              <small>Đã hoàn tất</small>
              <strong>{stats.completed}</strong>
              <span>Đã xử lý hoặc đóng</span>
            </div>
          </div>
        </Reveal>
        <Reveal delay={180}>
          <div className="metric-card">
            <span className="metric-card__icon violet">
              <ThumbsUp aria-hidden="true" />
            </span>
            <div>
              <small>Lượt đồng tình</small>
              <strong>{stats.upvotes}</strong>
              <span>Từ cộng đồng</span>
            </div>
          </div>
        </Reveal>
      </div>

      <div className="dashboard-layout">
        <section className="panel panel--reports">
          <header className="panel__header">
            <div>
              <h2>Báo cáo gần đây</h2>
              <p>Các phản ánh mới nhất của bạn</p>
            </div>
            <Link to="/citizen/reports">
              Xem tất cả <ArrowRight aria-hidden="true" size={16} />
            </Link>
          </header>

          {reportsQuery.isPending ? (
            <div className="flex min-h-48 items-center justify-center">
              <Spinner label="Đang tải báo cáo gần đây..." />
            </div>
          ) : reportsQuery.isError ? (
            <div className="empty-state compact">
              <h3>Không thể tải báo cáo</h3>
              <p>Vui lòng kiểm tra kết nối và thử lại.</p>
              <Button variant="secondary" onClick={() => void reportsQuery.refetch()}>
                Thử lại
              </Button>
            </div>
          ) : reports.length > 0 ? (
            <div className="report-grid">
              {reports.slice(0, 4).map((report) => (
                <ReportCard
                  key={report.id}
                  report={report}
                  to={`/citizen/reports/${report.id}`}
                  showReportId
                />
              ))}
            </div>
          ) : (
            <div className="empty-state compact">
              <h3>Bạn chưa có báo cáo nào</h3>
              <p>Hãy gửi phản ánh đầu tiên để cùng cải thiện khu vực sống.</p>
            </div>
          )}
        </section>

        <aside className="dashboard-side">
          <section className="panel quick-actions">
            <header className="panel__header">
              <div>
                <h2>Thao tác nhanh</h2>
                <p>Tiếp tục hành động</p>
              </div>
            </header>
            <Link to="/citizen/reports/create">
              <span className="quick-action__icon blue">
                <FilePlus2 aria-hidden="true" />
              </span>
              <div>
                <strong>Tạo báo cáo</strong>
                <small>Phản ánh sự cố mới</small>
              </div>
              <ArrowRight aria-hidden="true" />
            </Link>
            <Link to="/reports">
              <span className="quick-action__icon green">
                <MapPinned aria-hidden="true" />
              </span>
              <div>
                <strong>Bản đồ cộng đồng</strong>
                <small>Xem tình hình quanh bạn</small>
              </div>
              <ArrowRight aria-hidden="true" />
            </Link>
            <Link to="/citizen/notifications">
              <span className="quick-action__icon violet">
                <MessageSquareText aria-hidden="true" />
              </span>
              <div>
                <strong>Thông báo</strong>
                <small>Cập nhật tiến độ mới</small>
              </div>
              <ArrowRight aria-hidden="true" />
            </Link>
          </section>

          <section className="panel citizen-impact">
            <span className="citizen-impact__icon">
              <TrendingUp aria-hidden="true" />
            </span>
            <h3>Tác động của bạn</h3>
            <strong>{stats.completed} vấn đề đã được cải thiện</strong>
            <p>Mỗi phản ánh được xử lý giúp không gian sống an toàn và tiện nghi hơn.</p>
            <div className="impact-progress">
              <i style={{ width: `${Math.min(100, stats.completed * 16)}%` }} />
            </div>
          </section>
        </aside>
      </div>
    </section>
  )
}
