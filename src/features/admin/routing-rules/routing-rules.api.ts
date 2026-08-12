import { http } from '@/lib/api/http'

import type {
  AreaOption,
  CategoryOption,
  CreateRoutingRuleInput,
  DepartmentOption,
  PagedResult,
  RoutingRule,
  RoutingRuleListParams,
  UpdateRoutingRuleInput,
} from './routing-rules.types'

function cleanParams(params: RoutingRuleListParams) {
  return {
    search: params.search?.trim() || undefined,
    categoryId: params.categoryId,
    areaId: params.areaId,
    departmentId: params.departmentId,
    isActive: params.isActive,
    pageNumber: params.pageNumber,
    pageSize: params.pageSize,
  }
}

export const routingRulesApi = {
  getAll: async (params: RoutingRuleListParams): Promise<PagedResult<RoutingRule>> => {
    const response = await http.get<PagedResult<RoutingRule>>('/admin/routing-rules', {
      params: cleanParams(params),
    })

    return response.data
  },

  getById: async (id: number): Promise<RoutingRule> => {
    const response = await http.get<RoutingRule>(`/admin/routing-rules/${id}`)

    return response.data
  },

  create: async (input: CreateRoutingRuleInput): Promise<RoutingRule> => {
    const response = await http.post<RoutingRule>('/admin/routing-rules', input)

    return response.data
  },

  update: async (input: UpdateRoutingRuleInput): Promise<RoutingRule> => {
    const response = await http.put<RoutingRule>(`/admin/routing-rules/${input.id}`, {
      categoryId: input.categoryId,
      areaId: input.areaId,
      departmentId: input.departmentId,
      priorityOrder: input.priorityOrder,
      isActive: input.isActive,
    })

    return response.data
  },

  remove: async (id: number): Promise<void> => {
    await http.delete(`/admin/routing-rules/${id}`)
  },

  getActiveCategories: async (): Promise<CategoryOption[]> => {
    const response = await http.get<PagedResult<CategoryOption>>('/admin/categories', {
      params: {
        isActive: true,
        pageNumber: 1,
        pageSize: 100,
      },
    })

    return response.data.items
  },

  getActiveAreas: async (): Promise<AreaOption[]> => {
    const response = await http.get<PagedResult<AreaOption>>('/admin/areas', {
      params: {
        isActive: true,
        pageNumber: 1,
        pageSize: 100,
      },
    })

    return response.data.items
  },

  getActiveDepartments: async (): Promise<DepartmentOption[]> => {
    const response = await http.get<PagedResult<DepartmentOption>>('/admin/departments', {
      params: {
        isActive: true,
        pageNumber: 1,
        pageSize: 100,
      },
    })

    return response.data.items
  },
}
