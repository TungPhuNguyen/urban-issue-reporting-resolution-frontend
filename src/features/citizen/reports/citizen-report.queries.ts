import { useQuery } from '@tanstack/react-query'

import {
  citizenReportApi,
  type GetCitizenReportsParams,
} from './citizen-report.api'

export const reportKeys = {
  all: ['citizen-reports'] as const,

  lists: () =>
    [...reportKeys.all, 'list'] as const,

  list: (params: GetCitizenReportsParams) =>
    [...reportKeys.lists(), params] as const,

  detail: (reportId: string) =>
    [...reportKeys.all, 'detail', reportId] as const,

  timeline: (reportId: string) =>
    [...reportKeys.all, 'timeline', reportId] as const,
}

export function useCitizenReports(
  params: GetCitizenReportsParams = {
    pageNumber: 1,
    pageSize: 10,
  },
) {
  return useQuery({
    queryKey: reportKeys.list(params),
    queryFn: () =>
      citizenReportApi.getMyReports(params),
  })
}

export function useCitizenReportDetail(
  reportId: string,
) {
  return useQuery({
    queryKey: reportKeys.detail(reportId),
    queryFn: () =>
      citizenReportApi.getReportDetail(reportId),
    enabled: Boolean(reportId),
  })
}

export function useCitizenReportTimeline(
  reportId: string,
) {
  return useQuery({
    queryKey: reportKeys.timeline(reportId),
    queryFn: () =>
      citizenReportApi.getReportTimeline(reportId),
    enabled: Boolean(reportId),
  })
}