import { http } from '@/lib/api/http'
import type { Category, Area } from './reports.types'

export const reportsApi = {
  getCategories: async (): Promise<Category[]> => {
    const { data } = await http.get<Category[]>('/public/categories')
    return data
  },

  getAreas: async (parentAreaId?: number): Promise<Area[]> => {
    const { data } = await http.get<Area[]>('/public/areas', {
      params: parentAreaId ? { parentAreaId } : undefined,
    })
    return data
  },
}
