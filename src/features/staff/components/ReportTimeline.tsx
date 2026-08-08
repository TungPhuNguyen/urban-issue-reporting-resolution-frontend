import { ReportTimeline as SharedReportTimeline } from '@/components/reports/ReportTimeline'
import { Card } from '@/components/ui/Card'

import { useStaffReportTimeline } from '../staff.queries'

interface ReportTimelineProps {
  reportId: string
}

export function ReportTimeline({ reportId }: ReportTimelineProps) {
  const query = useStaffReportTimeline(reportId)

  return (
    <Card className="p-6">
      <SharedReportTimeline
        timeline={query.data}
        isLoading={query.isLoading}
        isFetching={query.isFetching}
        error={query.isError ? query.error : undefined}
        onRetry={() => void query.refetch()}
      />
    </Card>
  )
}
