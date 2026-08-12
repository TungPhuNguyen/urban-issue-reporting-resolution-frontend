export interface PagedResult<T> {
  items: T[]
  pageNumber: number
  pageSize: number
  totalItems: number
  totalPages: number
}

export interface Department {
  id: number
  name: string
  description: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string | null
}

export interface DepartmentListParams {
  search?: string
  isActive?: boolean
  pageNumber: number
  pageSize: number
}

export interface CreateDepartmentInput {
  name: string
  description: string | null
}

export interface UpdateDepartmentInput {
  id: number
  name: string
  description: string | null
  isActive: boolean
}
