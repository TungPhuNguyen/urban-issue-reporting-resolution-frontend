export interface PagedResult<T> {
  items: T[]
  pageNumber: number
  pageSize: number
  totalItems: number
  totalPages: number
}

export interface Area {
  id: number
  name: string
  code: string | null
  parentAreaId: number | null
  parentAreaName: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string | null
}

export interface AreaListParams {
  search?: string
  parentAreaId?: number
  isActive?: boolean
  pageNumber: number
  pageSize: number
}

export interface CreateAreaInput {
  name: string
  code: string
  parentAreaId: number | null
}

export interface UpdateAreaInput {
  id: number
  name: string
  code: string
  parentAreaId: number | null
  isActive: boolean
}

export interface AreaBoundary {
  areaId: number
  areaName: string
  hasBoundary: boolean
  geoJson: string | null
  updatedAt: string | null
}

export interface UpdateAreaBoundaryInput {
  areaId: number
  geoJson: string | null
}
