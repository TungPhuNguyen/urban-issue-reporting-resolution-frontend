import { useQuery } from '@tanstack/react-query'

import { overdueReportsApi } from './overdue-reports.api'
import type { UserRole } from './overdue-reports.types'

export const overdueReportKeys = {
  all: ['overdue-reports'] as const,

  list: (role: UserRole) =>
    [
      ...overdueReportKeys.all,
      role,
    ] as const,
}

export function useOverdueReports(
  role: UserRole,
) {
  return useQuery({
    queryKey:
      overdueReportKeys.list(role),
    queryFn: () =>
      overdueReportsApi.getOverdueReports(
        role,
      ),
    staleTime: 30_000,
    refetchInterval: 60_000,
  })
}
