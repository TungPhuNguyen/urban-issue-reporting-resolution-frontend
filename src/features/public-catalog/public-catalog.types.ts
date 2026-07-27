export interface Category {
  id: number
  name: string
  description?: string | null
}

export interface Area {
  id: number
  name: string
  code?: string | null
  parentAreaId: number | null
}