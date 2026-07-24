export interface PublicCategory {
  id: number
  name: string
  description: string | null
}

export interface PublicArea {
  id: number
  name: string
  code: string
  parentAreaId: number | null
}

export type ReportStatus =
  | 'New'
  | 'Assigned'
  | 'Accepted'
  | 'InProgress'
  | 'Resolved'
  | 'Closed'
  | 'Rejected'

export interface CreateReportPayload {
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
  status: ReportStatus
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

  priority: string | null
  status: ReportStatus
  requiresManualAssignment: boolean

  upvoteCount: number
  imageUrls: string[]

  appliedSlaHours: number | null
  slaStartedAt: string | null
  dueAt: string | null

  createdAt: string
  updatedAt: string | null
  acceptedAt: string | null
  resolvedAt: string | null
  closedAt: string | null

  rejectedAt: string | null
  rejectedReason: string | null

  reopenedAt: string | null
  reopenReason: string | null
}