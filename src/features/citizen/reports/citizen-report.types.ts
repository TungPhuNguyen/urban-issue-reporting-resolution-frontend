export type ReportStatus =
  | 'New'
  | 'Assigned'
  | 'Accepted'
  | 'InProgress'
  | 'Resolved'
  | 'Closed'
  | 'Rejected'
  
  export interface CreateReportRequest {
  categoryId: number
  areaId: number
  description: string
  addressText?: string
  latitude: number
  longitude: number
  images: File[]
}

export interface CreateReportResult {
  id: string
  status: string
  departmentId: number | null
  departmentName: string | null
  requiresManualAssignment: boolean
  createdAt: string
  imageUrls: string[]
}

export interface CitizenReportDetail {
  id: string
  categoryId: number
  categoryName: string
  areaId: number
  areaName: string
  departmentId: number | null
  departmentName: string | null
  description: string
  addressText: string | null
  latitude: number
  longitude: number
  status: ReportStatus
  priority: string | null
  requiresManualAssignment: boolean
  imageUrls: string[]
  createdAt: string
}



