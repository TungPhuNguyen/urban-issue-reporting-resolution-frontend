import { Link, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'
import { ApiError } from '@/lib/api/http'
import { useStaffReportDetail } from './staff-report.queries'
function date(v: string | null) {
  if (!v) return 'Chưa có'
  const d = new Date(v)
  return Number.isNaN(d.getTime()) ? v : d.toLocaleString('vi-VN')
}
function msg(e: unknown) {
  if (e instanceof ApiError || e instanceof Error) return e.message
  return 'Không thể tải chi tiết báo cáo.'
}
export default function StaffReportDetailPage() {
  const { reportId = '' } = useParams()
  const q = useStaffReportDetail(reportId)
  if (q.isPending)
    return (
      <div className="flex min-h-64 items-center justify-center">
        <Spinner />
      </div>
    )
  if (q.isError)
    return (
      <Card className="flex min-h-64 flex-col items-center justify-center gap-3 p-8">
        <p className="text-red-600">{msg(q.error)}</p>
        <Button onClick={() => void q.refetch()}>Thử lại</Button>
      </Card>
    )
  const r = q.data
  return (
    <section className="flex flex-col gap-5">
      <div>
        <Link
          to="/staff/reports"
          className="text-sm font-medium text-blue-600 hover:underline"
        >
          ← Quay lại danh sách
        </Link>
        <h1 className="mt-2 text-2xl font-semibold">Chi tiết báo cáo</h1>
        <p className="mt-1 font-mono text-sm text-gray-500">{r.id}</p>
      </div>
      {r.isEscalated && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          Báo cáo đã được Escalate{r.escalatedAt ? ` vào ${date(r.escalatedAt)}` : ''}.
        </div>
      )}
      <Card className="grid gap-5 p-6 md:grid-cols-2">
        {[
          ['Citizen', r.citizenName],
          ['Trạng thái', r.status],
          ['Category', r.categoryName],
          ['Area', r.areaName],
          ['Department', r.departmentName ?? 'Chưa phân công'],
          ['Staff phụ trách', r.assignedStaffName ?? 'Chưa phân công'],
          ['Priority', r.priority ?? 'Chưa đặt'],
          ['DueAt', date(r.dueAt)],
        ].map(([a, b]) => (
          <div key={a}>
            <p className="text-xs text-gray-500 uppercase">{a}</p>
            <p className="mt-1">{b}</p>
          </div>
        ))}
        <div className="md:col-span-2">
          <p className="text-xs text-gray-500 uppercase">Mô tả</p>
          <p className="mt-1 whitespace-pre-wrap">{r.description}</p>
        </div>
      </Card>
    </section>
  )
}
