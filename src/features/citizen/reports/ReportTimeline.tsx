import { ReportTimeline as SharedReportTimeline } from '@/components/reports/ReportTimeline'
import { localizeCitizenFacingText } from '@/lib/utils/citizen-facing-text'

import type { ReportTimeline as ReportTimelineData } from './citizen-report.types'
import { resolveImageUrl } from './report-image-url'

interface ReportTimelineProps {
  timeline: ReportTimelineData | undefined
  isLoading: boolean
  isFetching: boolean
  error: unknown
  apiOrigin: string
  onRetry: () => void
}

export function ReportTimeline({
  timeline,
  isLoading,
  isFetching,
  error,
  apiOrigin,
  onRetry,
}: ReportTimelineProps) {
  return (
    <SharedReportTimeline
      timeline={timeline}
      isLoading={isLoading}
      isFetching={isFetching}
      error={error}
      title="Tiến trình xử lý"
      emptyMessage="Chưa có tiến trình xử lý."
      imageUrlResolver={(imageUrl) => resolveImageUrl(imageUrl, apiOrigin)}
      noteFormatter={localizeCitizenFacingText}
      onRetry={onRetry}
    />
  )
}
