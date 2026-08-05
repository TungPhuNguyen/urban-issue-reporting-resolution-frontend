import { ReportTimeline } from '@/components/reports/ReportTimeline'
import { Card } from '@/components/ui/Card'

import { useAdminReportTimeline } from './admin-reports.queries'

interface AdminReportTimelineProps {
  reportId: string
}

export default function AdminReportTimeline({ reportId }: AdminReportTimelineProps) {
  const query = useAdminReportTimeline(reportId)

  return (
    <Card className="p-6">
      <ReportTimeline
        timeline={query.data}
        isLoading={query.isPending}
        isFetching={query.isFetching}
        error={query.isError ? query.error : undefined}
        onRetry={() => void query.refetch()}
      />
    </Card>
  )
}