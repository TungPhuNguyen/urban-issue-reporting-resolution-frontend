import { useQuery } from '@tanstack/react-query'
import { staffReportApi } from './staff-report.api'
export const staffReportKeys = {
  all: ['staff', 'reports'] as const,
  detail: (id: string) => ['staff', 'reports', 'detail', id] as const,
}
export function useStaffReportDetail(id: string) {
  return useQuery({
    queryKey: staffReportKeys.detail(id),
    queryFn: () => staffReportApi.getById(id),
    enabled: id.trim().length > 0,
  })
}
