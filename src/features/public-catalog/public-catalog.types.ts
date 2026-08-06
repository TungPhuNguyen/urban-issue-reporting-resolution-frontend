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

export interface AreaLocationMatch {
  areaId: number
  areaName: string
  areaCode: string | null
  districtId: number
  districtName: string
}
