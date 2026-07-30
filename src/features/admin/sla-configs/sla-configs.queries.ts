import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import { slaConfigsApi } from './sla-configs.api'
import type {
  GetSlaConfigsParams,
  UpdateSlaConfigInput,
} from './sla-configs.types'

export const slaConfigKeys = {
  all: ['admin', 'sla-configs'] as const,

  lists: () =>
    [...slaConfigKeys.all, 'list'] as const,

  list: (
    params: GetSlaConfigsParams,
  ) =>
    [
      ...slaConfigKeys.lists(),
      params,
    ] as const,

  detail: (id: number) =>
    [
      ...slaConfigKeys.all,
      'detail',
      id,
    ] as const,
}

export function useSlaConfigs(
  params: GetSlaConfigsParams,
) {
  return useQuery({
    queryKey:
      slaConfigKeys.list(params),

    queryFn: () =>
      slaConfigsApi.getAll(params),

    placeholderData: keepPreviousData,
  })
}

export function useSlaConfig(
  id: number | null,
) {
  return useQuery({
    queryKey:
      slaConfigKeys.detail(id ?? 0),

    queryFn: () =>
      slaConfigsApi.getById(id ?? 0),

    enabled:
      id !== null && id > 0,
  })
}

export function useUpdateSlaConfig() {
  const queryClient =
    useQueryClient()

  return useMutation({
    mutationFn: (
      input: UpdateSlaConfigInput,
    ) =>
      slaConfigsApi.update(input),

    onSuccess: (result) => {
      queryClient.setQueryData(
        slaConfigKeys.detail(result.id),
        result,
      )

      void queryClient.invalidateQueries({
        queryKey:
          slaConfigKeys.lists(),
      })
    },
  })
}
