import { http } from '@/lib/api/http'

import type {
  Area,
  AreaListParams,
  CreateAreaInput,
  PagedResult,
  UpdateAreaInput,
  AreaBoundary,
  UpdateAreaBoundaryInput,
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

  remove: async (id: number): Promise<void> => {
    await http.delete(`/admin/areas/${id}`)
  },

  getBoundary: async (id: number): Promise<AreaBoundary> => {
    const response = await http.get<AreaBoundary>(`/admin/areas/${id}/boundary`)
    return response.data
  },

  updateBoundary: async (input: UpdateAreaBoundaryInput): Promise<AreaBoundary> => {
    const response = await http.put<AreaBoundary>(
      `/admin/areas/${input.areaId}/boundary`,
      { geoJson: input.geoJson },
    )
    return response.data
  },
}
