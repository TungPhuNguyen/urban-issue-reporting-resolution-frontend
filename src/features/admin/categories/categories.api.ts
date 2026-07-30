import { http } from '@/lib/api/http'

import type {
  Category,
  CategoryListParams,
  CreateCategoryInput,
  PagedResult,
  UpdateCategoryInput,
} from './categories.types'

export const categoriesApi = {
  getAll: async (
    params: CategoryListParams,
  ): Promise<PagedResult<Category>> => {
    const response =
      await http.get<PagedResult<Category>>(
        '/admin/categories',
        {
          params: {
            search:
              params.search?.trim() ||
              undefined,
            isActive: params.isActive,
            pageNumber: params.pageNumber,
            pageSize: params.pageSize,
          },
        },
      )

    return response.data
  },

  getById: async (
    id: number,
  ): Promise<Category> => {
    const response =
      await http.get<Category>(
        `/admin/categories/${id}`,
      )

    return response.data
  },

  create: async (
    input: CreateCategoryInput,
  ): Promise<Category> => {
    const response =
      await http.post<Category>(
        '/admin/categories',
        input,
      )

    return response.data
  },

  update: async (
    input: UpdateCategoryInput,
  ): Promise<Category> => {
    const response =
      await http.put<Category>(
        `/admin/categories/${input.id}`,
        {
          name: input.name,
          description: input.description,
          isActive: input.isActive,
        },
      )

    return response.data
  },

  remove: async (
    id: number,
  ): Promise<void> => {
    await http.delete(
      `/admin/categories/${id}`,
    )
  },
}
