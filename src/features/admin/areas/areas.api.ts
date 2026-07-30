import { http } from '@/lib/api/http'

import type {
  Area,
  AreaListParams,
  CreateAreaInput,
  PagedResult,
  UpdateAreaInput,
} from './areas.types'

export const areasApi = {
  getAll: async (params: AreaListParams): Promise<PagedResult<Area>> => {
    const response = await http.get<PagedResult<Area>>('/admin/areas', {
      params: {
        search: params.search?.trim() || undefined,
        parentAreaId: params.parentAreaId,
        isActive: params.isActive,
        pageNumber: params.pageNumber,
        pageSize: params.pageSize,
      },
    })

    return response.data
  },

  getById: async (id: number): Promise<Area> => {
    const response = await http.get<Area>(`/admin/areas/${id}`)

    return response.data
  },

  create: async (input: CreateAreaInput): Promise<Area> => {
    const response = await http.post<Area>('/admin/areas', input)

    return response.data
  },

  update: async (input: UpdateAreaInput): Promise<Area> => {
    const response = await http.put<Area>(`/admin/areas/${input.id}`, {
      name: input.name,
      code: input.code,
      parentAreaId: input.parentAreaId,
      isActive: input.isActive,
    })

    return response.data
  },
}
