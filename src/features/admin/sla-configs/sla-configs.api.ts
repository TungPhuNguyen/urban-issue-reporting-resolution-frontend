import { http } from '@/lib/api/http'

import type {
  GetSlaConfigsParams,
  PagedResult,
  SlaConfig,
  UpdateSlaConfigInput,
} from './sla-configs.types'

function cleanParams(
  params: GetSlaConfigsParams,
) {
  return {
    search:
      params.search?.trim() || undefined,
    categoryId: params.categoryId,
    priority: params.priority,
    pageNumber: params.pageNumber,
    pageSize: params.pageSize,
  }
}

export const slaConfigsApi = {
  getAll: async (
    params: GetSlaConfigsParams,
  ): Promise<PagedResult<SlaConfig>> => {
    const response =
      await http.get<PagedResult<SlaConfig>>(
        '/admin/sla-configs',
        {
          params: cleanParams(params),
        },
      )

    return response.data
  },

  getById: async (
    id: number,
  ): Promise<SlaConfig> => {
    const response =
      await http.get<SlaConfig>(
        `/admin/sla-configs/${id}`,
      )

    return response.data
  },

  update: async ({
    id,
    durationHours,
  }: UpdateSlaConfigInput): Promise<SlaConfig> => {
    const response =
      await http.put<SlaConfig>(
        `/admin/sla-configs/${id}`,
        {
          durationHours,
        },
      )

    return response.data
  },
}
