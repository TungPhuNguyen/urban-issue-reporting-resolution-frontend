import { useQuery } from '@tanstack/react-query'

import { overdueReportsApi } from './overdue-reports.api'
import type { OverdueReportParams } from './overdue-reports.types'

export const overdueReportKeys = {
  all: ['overdue-reports'] as const,

  list: (params: OverdueReportParams) => [...overdueReportKeys.all, params] as const,
}

export function useOverdueReports(params: OverdueReportParams) {
  return useQuery({
    queryKey: overdueReportKeys.list(params),
    queryFn: () => overdueReportsApi.getOverdueReports(params),
    staleTime: 30_000,
    refetchInterval: 60_000,
  })
}
