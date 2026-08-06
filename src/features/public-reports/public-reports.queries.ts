import { keepPreviousData, useQuery } from '@tanstack/react-query'

import { publicReportsApi } from './public-reports.api'
import type { PublicReportsParams } from './public-reports.types'

export const publicReportKeys = {
  all: ['public-reports'] as const,
  list: (params: PublicReportsParams) =>
    [...publicReportKeys.all, 'list', params] as const,
  detail: (id: string) => [...publicReportKeys.all, 'detail', id] as const,
}

export function usePublicReports(params: PublicReportsParams) {
  return useQuery({
    queryKey: publicReportKeys.list(params),
    queryFn: () => publicReportsApi.getReports(params),
    placeholderData: keepPreviousData,
  })
}

export function usePublicReport(id: string) {
  return useQuery({
    queryKey: publicReportKeys.detail(id),
    queryFn: () =>
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        id,
      )
        ? publicReportsApi.getById(id)
        : publicReportsApi.getByCode(id),
    enabled: Boolean(id),
    retry: false,
  })
}
