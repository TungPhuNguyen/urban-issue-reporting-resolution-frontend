import { useQuery } from '@tanstack/react-query'

import { publicCatalogApi } from './public-catalog.api'

export const publicCatalogKeys = {
  all: ['public-catalog'] as const,

  categories: () => [...publicCatalogKeys.all, 'categories'] as const,

  areas: (parentAreaId: number | null = null) =>
    [...publicCatalogKeys.all, 'areas', parentAreaId ?? 'root'] as const,

  resolvedArea: (latitude: number, longitude: number) =>
    [...publicCatalogKeys.all, 'resolved-area', latitude, longitude] as const,
}

export function useResolvedArea(
  latitude: number | null,
  longitude: number | null,
  enabled = true,
) {
  return useQuery({
    queryKey: publicCatalogKeys.resolvedArea(latitude ?? 0, longitude ?? 0),
    queryFn: () => publicCatalogApi.resolveArea(latitude!, longitude!),
    enabled: enabled && latitude !== null && longitude !== null,
    retry: false,
  })
}

export function usePublicCategories() {
  return useQuery({
    queryKey: publicCatalogKeys.categories(),
    queryFn: publicCatalogApi.getCategories,
    staleTime: 5 * 60 * 1000,
  })
}

export function usePublicAreas(parentAreaId: number | null = null, enabled = true) {
  return useQuery({
    queryKey: publicCatalogKeys.areas(parentAreaId),
    queryFn: () => publicCatalogApi.getAreas(parentAreaId ?? null),
    staleTime: 5 * 60 * 1000,
    enabled,
  })
}
