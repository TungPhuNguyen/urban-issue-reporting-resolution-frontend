export interface PagedResult<T> {
  items: T[]
  pageNumber: number
  pageSize: number
  totalItems: number
  totalPages: number
}

export interface Category {
  id: number
  name: string
  description: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string | null
}

export interface CategoryListParams {
  search?: string
  isActive?: boolean
  pageNumber: number
  pageSize: number
}

export interface CreateCategoryInput {
  name: string
  description: string | null
}

export interface UpdateCategoryInput {
  id: number
  name: string
  description: string | null
  isActive: boolean
}
