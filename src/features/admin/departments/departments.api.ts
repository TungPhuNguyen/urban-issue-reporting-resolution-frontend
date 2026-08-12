import { http } from '@/lib/api/http'

import type {
  Department,
  DepartmentListParams,
  CreateDepartmentInput,
  PagedResult,
  UpdateDepartmentInput,
} from './departments.types'

export const departmentsApi = {
  getAll: async (params: DepartmentListParams): Promise<PagedResult<Department>> => {
    const response = await http.get<PagedResult<Department>>('/admin/departments', {
      params: {
        search: params.search?.trim() || undefined,
        isActive: params.isActive,
        pageNumber: params.pageNumber,
        pageSize: params.pageSize,
      },
    })

    return response.data
  },

  getById: async (id: number): Promise<Department> => {
    const response = await http.get<Department>(`/admin/departments/${id}`)

    return response.data
  },

  create: async (input: CreateDepartmentInput): Promise<Department> => {
    const response = await http.post<Department>('/admin/departments', input)

    return response.data
  },

  update: async (input: UpdateDepartmentInput): Promise<Department> => {
    const response = await http.put<Department>(`/admin/departments/${input.id}`, {
      name: input.name,
      description: input.description,
      isActive: input.isActive,
    })

    return response.data
  },

  remove: async (id: number): Promise<void> => {
    await http.delete(`/admin/departments/${id}`)
  },
}
