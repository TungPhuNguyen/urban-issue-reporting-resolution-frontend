import { useQuery } from '@tanstack/react-query'

import { adminDashboardApi } from './dashboard.api'
import type { DashboardDateRange } from './dashboard.types'

export const adminDashboardKeys = {
  all: ['admin-dashboard'] as const,
  detail: (range: DashboardDateRange) =>
    [
      ...adminDashboardKeys.all,
      range.fromDate,
      range.toDate,
    ] as const,
}

export function useAdminDashboard(
  range: DashboardDateRange,
) {
  return useQuery({
    queryKey: adminDashboardKeys.detail(range),
    queryFn: () =>
      adminDashboardApi.getDashboard(range),
    staleTime: 30_000,
  })
}
