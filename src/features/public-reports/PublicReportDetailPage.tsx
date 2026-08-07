import { Link, useParams } from 'react-router-dom'

import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { PriorityBadge } from '@/components/ui/PriorityBadge'
import { Spinner } from '@/components/ui/Spinner'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { useAuthStore } from '@/features/auth/auth.store'
import { ReportComments } from '@/features/citizen/reports/ReportComments'
import { useToggleReportUpvote } from '@/features/citizen/reports/citizen-report.queries'
import { getImageUrl } from '@/lib/utils/image'

import { usePublicReport } from './public-reports.queries'

export default function PublicReportDetailPage() {
  const { reportId = '' } = useParams()
  const reportQuery = usePublicReport(reportId)
  const user = useAuthStore((state) => state.user)
  const report = reportQuery.data
  const upvoteMutation = useToggleReportUpvote(
    reportId,
    report?.isUpvotedByCurrentUser ?? false,
  )

  if (reportQuery.isPending)
    return (
      <div className="flex min-h-64 items-center justify-center">
        <Spinner />
      </div>
    )
  if (reportQuery.isError || !report)
    return (
      <Card className="mx-auto my-10 max-w-2xl p-8 text-center text-red-600">
        Không tìm thấy báo cáo công khai.
      </Card>
    )

  return (
    <section className="mx-auto max-w-5xl px-4 pt-10 pb-[calc(2.5rem+env(safe-area-inset-bottom))] sm:px-6">
      <Link to="/reports" className="text-sm text-blue-600 hover:underline">
        ← Quay lại bản đồ
      </Link>
      <Card className="mt-5 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm text-gray-500">{report.reportCode}</p>
            <h1 className="mt-1 text-2xl font-bold">{report.title}</h1>
            <p className="mt-1 text-sm text-gray-500">
              {report.categoryName} · {report.areaName}
            </p>
          </div>
          <div className="flex gap-2">
            <PriorityBadge priority={report.priority} />
            <StatusBadge status={report.status} />
          </div>
        </div>
        <p className="mt-6 whitespace-pre-wrap text-gray-700">{report.description}</p>
        <div className="mt-5 grid gap-3 text-sm sm:grid-cols-3">
          <span>Đơn vị: {report.departmentName ?? 'Chưa phân công'}</span>
          <span>Ủng hộ: {report.upvoteCount}</span>
          <span>Bình luận: {report.commentCount}</span>
          <a
            className="text-blue-600 hover:underline"
            target="_blank"
            rel="noreferrer"
            href={`https://www.google.com/maps?q=${report.latitude},${report.longitude}`}
          >
            Mở vị trí trên bản đồ
          </a>
        </div>
        {report.imageUrls.length > 0 && (
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {report.imageUrls.map((url, index) => (
              <a key={url} href={getImageUrl(url)} target="_blank" rel="noreferrer">
                <img
                  src={getImageUrl(url)}
                  alt={`Ảnh báo cáo ${index + 1}`}
                  className="h-52 w-full rounded-lg object-cover"
                />
              </a>
            ))}
          </div>
        )}
        <div className="mt-6 border-t border-gray-200 pt-5">
          {user?.role === 'Citizen' && report.allowedActions.canUpvote ? (
            <Button
              type="button"
              variant={report.isUpvotedByCurrentUser ? 'secondary' : 'primary'}
              loading={upvoteMutation.isPending}
              onClick={() => void upvoteMutation.mutateAsync()}
            >
              {report.isUpvotedByCurrentUser ? 'Bỏ ủng hộ' : 'Ủng hộ báo cáo'}
            </Button>
          ) : !user ? (
            <Link
              to="/login"
              state={{ from: `/reports/${report.id}` }}
              className="text-sm font-medium text-blue-600 hover:underline"
            >
              Đăng nhập để ủng hộ và bình luận
            </Link>
          ) : null}
        </div>
      </Card>
      {user?.role === 'Citizen' && (
        <div className="mt-5">
          <ReportComments reportId={report.id} />
        </div>
      )}
    </section>
  )
}
