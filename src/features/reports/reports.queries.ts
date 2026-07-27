import { useQuery } from '@tanstack/react-query'
import { reportsApi } from './reports.api'

export const reportKeys = {
  categories: ['reports', 'categories'] as const,
  areas: (parentAreaId?: number) =>
    ['reports', 'areas', parentAreaId ?? 'root'] as const,
}

export function usePublicCategories() {
  return useQuery({
    queryKey: reportKeys.categories,
    queryFn: reportsApi.getCategories,
    staleTime: 5 * 60 * 1000,
  })
}

export function usePublicAreas(parentAreaId?: number, enabled = true) {
  return useQuery({
    queryKey: reportKeys.areas(parentAreaId),
    queryFn: () => reportsApi.getAreas(parentAreaId),
    staleTime: 5 * 60 * 1000,
    enabled,
  })
}
