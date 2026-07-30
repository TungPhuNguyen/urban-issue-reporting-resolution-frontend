import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import { areasApi } from './areas.api'
import type { AreaListParams, CreateAreaInput, UpdateAreaInput } from './areas.types'

export const areaKeys = {
  all: ['admin', 'areas'] as const,

  lists: () => [...areaKeys.all, 'list'] as const,

  list: (params: AreaListParams) => [...areaKeys.lists(), params] as const,

  detail: (id: number) => [...areaKeys.all, 'detail', id] as const,
}

export function useAreas(params: AreaListParams) {
  return useQuery({
    queryKey: areaKeys.list(params),
    queryFn: () => areasApi.getAll(params),
    placeholderData: keepPreviousData,
  })
}

export function useArea(id: number | null) {
  return useQuery({
    queryKey: areaKeys.detail(id ?? 0),
    queryFn: () => areasApi.getById(id ?? 0),
    enabled: id !== null && id > 0,
  })
}

export function useCreateArea() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateAreaInput) => areasApi.create(input),

    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: areaKeys.lists(),
      })
    },
  })
}

export function useUpdateArea() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: UpdateAreaInput) => areasApi.update(input),

    onSuccess: (area) => {
      queryClient.setQueryData(areaKeys.detail(area.id), area)

      void queryClient.invalidateQueries({
        queryKey: areaKeys.lists(),
      })
    },
  })
}
