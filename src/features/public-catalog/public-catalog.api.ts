import { http } from '@/lib/api/http'

import type { Area, Category } from './public-catalog.types'

export const publicCatalogApi = {
  async getCategories(): Promise<Category[]> {
    const response = await http.get<Category[]>('/public/categories')

    return response.data
  },

  async getAreas(parentAreaId: number | null): Promise<Area[]> {
    const response = await http.get<Area[]>('/public/areas', {
      params: parentAreaId !== null ? { parentAreaId } : undefined,
    })

    return response.data.filter((area) => area.parentAreaId === parentAreaId)
  },
}
