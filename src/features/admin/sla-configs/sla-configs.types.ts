export type ReportPriority = 'Low' | 'Medium' | 'High'

export interface PagedResult<T> {
  items: T[]
  pageNumber: number
  pageSize: number
  totalItems: number
  totalPages: number
}

export interface SlaConfig {
  id: number
  categoryId: number
  categoryName: string
  priority: ReportPriority
  durationHours: number
  createdAt: string
  updatedAt: string | null
}

export interface GetSlaConfigsParams {
  search?: string
  categoryId?: number
  priority?: ReportPriority
  pageNumber: number
  pageSize: number
}

export interface UpdateSlaConfigInput {
  id: number
  durationHours: number
}
