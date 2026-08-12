import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import { categoriesApi } from './categories.api'
import type {
  CategoryListParams,
  CreateCategoryInput,
  UpdateCategoryInput,
} from './categories.types'

export const categoryKeys = {
  all: ['admin', 'categories'] as const,

  lists: () => [...categoryKeys.all, 'list'] as const,

  list: (params: CategoryListParams) => [...categoryKeys.lists(), params] as const,

  detail: (id: number) => [...categoryKeys.all, 'detail', id] as const,
}

export function useCategories(params: CategoryListParams) {
  return useQuery({
    queryKey: categoryKeys.list(params),

    queryFn: () => categoriesApi.getAll(params),

    placeholderData: keepPreviousData,
  })
}

export function useCategory(id: number | null) {
  return useQuery({
    queryKey: categoryKeys.detail(id ?? 0),

    queryFn: () => categoriesApi.getById(id ?? 0),

    enabled: id !== null && id > 0,
  })
}

export function useCreateCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateCategoryInput) => categoriesApi.create(input),

    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: categoryKeys.lists(),
      })
    },
  })
}

export function useUpdateCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: UpdateCategoryInput) => categoriesApi.update(input),

    onSuccess: (category) => {
      queryClient.setQueryData(categoryKeys.detail(category.id), category)

      void queryClient.invalidateQueries({
        queryKey: categoryKeys.lists(),
      })
    },
  })
}

export function useDeleteCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => categoriesApi.remove(id),

    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: categoryKeys.lists(),
      })
    },
  })
}
