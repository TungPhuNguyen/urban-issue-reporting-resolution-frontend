export interface PagedResult<T> {
  items: T[]
  pageNumber: number
  pageSize: number
  totalItems: number
  totalPages: number
}

export interface RoutingRule {
  id: number
  categoryId: number
  categoryName: string
  areaId: number
  areaName: string
  departmentId: number
  departmentName: string
  priorityOrder: number
  isActive: boolean
  createdAt: string
  updatedAt: string | null
}

export interface RoutingRuleListParams {
  search?: string
  categoryId?: number
  areaId?: number
  departmentId?: number
  isActive?: boolean
  pageNumber: number
  pageSize: number
}

export interface CreateRoutingRuleInput {
  categoryId: number
  areaId: number
  departmentId: number
  priorityOrder: number
}

export interface UpdateRoutingRuleInput {
  id: number
  categoryId: number
  areaId: number
  departmentId: number
  priorityOrder: number
  isActive: boolean
}

export interface CatalogOption {
  id: number
  name: string
  isActive: boolean
}

export interface CategoryOption extends CatalogOption {
  description: string | null
}

export interface AreaOption extends CatalogOption {
  code: string | null
  parentAreaId: number | null
  parentAreaName: string | null
}

export interface DepartmentOption extends CatalogOption {
  description: string | null
}
