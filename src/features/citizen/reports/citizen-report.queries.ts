import { useQuery } from '@tanstack/react-query'

import { useAuthStore } from '@/features/auth/auth.store'
import { ApiError } from '@/lib/api/http'

import { citizenReportApi, type GetCitizenReportsParams } from './citizen-report.api'

export const citizenReportKeys = {
  all: ['citizen-reports'] as const,

  lists: () => [...citizenReportKeys.all, 'list'] as const,

  list: (userId: string, params: GetCitizenReportsParams) =>
    [...citizenReportKeys.lists(), userId, params] as const,

  detail: (userId: string, reportId: string) =>
    [...citizenReportKeys.all, 'detail', userId, reportId] as const,

  timeline: (userId: string, reportId: string) =>
    [...citizenReportKeys.all, 'timeline', userId, reportId] as const,
}

function shouldRetry(failureCount: number, error: unknown): boolean {
  if (error instanceof ApiError && (error.status === 403 || error.status === 404)) {
    return false
  }

  return failureCount < 2
}

export function useCitizenReports(
  params: GetCitizenReportsParams = {
    pageNumber: 1,
    pageSize: 10,
  },
) {
  const userId = useAuthStore((state) => state.user?.userId)

  return useQuery({
    queryKey: citizenReportKeys.list(userId ?? 'anonymous', params),

    queryFn: () => citizenReportApi.getMyReports(params),

    enabled: Boolean(userId),

    placeholderData: (previousData) => previousData,
  })
}

export function useCitizenReportDetail(reportId: string) {
  const userId = useAuthStore((state) => state.user?.userId)

  return useQuery({
    queryKey: citizenReportKeys.detail(userId ?? 'anonymous', reportId),

    queryFn: () => citizenReportApi.getReportDetail(reportId),

    enabled: Boolean(userId && reportId),

    retry: shouldRetry,
  })
}

export function useCitizenReportTimeline(reportId: string) {
  const userId = useAuthStore((state) => state.user?.userId)

  return useQuery({
    queryKey: citizenReportKeys.timeline(userId ?? 'anonymous', reportId),

    queryFn: () => citizenReportApi.getReportTimeline(reportId),

    enabled: Boolean(userId && reportId),

    retry: shouldRetry,
  })
}
