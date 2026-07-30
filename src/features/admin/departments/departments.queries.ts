import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import { departmentsApi } from './departments.api'
import type {
  DepartmentListParams,
  CreateDepartmentInput,
  UpdateDepartmentInput,
} from './departments.types'

export const departmentKeys = {
  all: ['admin', 'departments'] as const,

  lists: () =>
    [...departmentKeys.all, 'list'] as const,

  list: (
    params: DepartmentListParams,
  ) =>
    [
      ...departmentKeys.lists(),
      params,
    ] as const,

  detail: (id: number) =>
    [
      ...departmentKeys.all,
      'detail',
      id,
    ] as const,
}

export function useDepartments(
  params: DepartmentListParams,
) {
  return useQuery({
    queryKey:
      departmentKeys.list(params),

    queryFn: () =>
      departmentsApi.getAll(params),

    placeholderData: keepPreviousData,
  })
}

export function useDepartment(
  id: number | null,
) {
  return useQuery({
    queryKey:
      departmentKeys.detail(id ?? 0),

    queryFn: () =>
      departmentsApi.getById(id ?? 0),

    enabled:
      id !== null && id > 0,
  })
}

export function useCreateDepartment() {
  const queryClient =
    useQueryClient()

  return useMutation({
    mutationFn: (
      input: CreateDepartmentInput,
    ) =>
      departmentsApi.create(input),

    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey:
          departmentKeys.lists(),
      })
    },
  })
}

export function useUpdateDepartment() {
  const queryClient =
    useQueryClient()

  return useMutation({
    mutationFn: (
      input: UpdateDepartmentInput,
    ) =>
      departmentsApi.update(input),

    onSuccess: (department) => {
      queryClient.setQueryData(
        departmentKeys.detail(department.id),
        department,
      )

      void queryClient.invalidateQueries({
        queryKey:
          departmentKeys.lists(),
      })
    },
  })
}

export function useDeleteDepartment() {
  const queryClient =
    useQueryClient()

  return useMutation({
    mutationFn: (id: number) =>
      departmentsApi.remove(id),

    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey:
          departmentKeys.lists(),
      })
    },
  })
}
