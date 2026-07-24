import { useQuery } from '@tanstack/react-query'
import { reportsApi } from './reports.api'

export const reportKeys = {
  all: ['reports'] as const,
  list: () => [...reportKeys.all, 'list'] as const,
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