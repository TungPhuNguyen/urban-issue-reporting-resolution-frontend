import { useQuery } from '@tanstack/react-query'
import { reportsApi } from './reports.api'

export const reportKeys = {
  all: ['reports'] as const,
  list: () => [...reportKeys.all, 'list'] as const,
  detail: (reportId: string) => [...reportKeys.all, 'detail', reportId] as const,
  timeline: (reportId: string) => [...reportKeys.all, 'timeline', reportId] as const,
}

export function useCitizenReports() {
  return useQuery({
    queryKey: reportKeys.list(),
    queryFn: () =>
      reportsApi.list({
        pageNumber: 1,
        pageSize: 10,
      }),
  })
}

export function useCitizenReportDetail(reportId: string) {
  return useQuery({
    queryKey: reportKeys.detail(reportId),
    queryFn: () => reportsApi.getById(reportId),
    enabled: Boolean(reportId),
  })
}

export function useCitizenReportTimeline(reportId: string) {
  return useQuery({
    queryKey: reportKeys.timeline(reportId),
    queryFn: () => reportsApi.getTimeline(reportId),
    enabled: Boolean(reportId),
  })
}
