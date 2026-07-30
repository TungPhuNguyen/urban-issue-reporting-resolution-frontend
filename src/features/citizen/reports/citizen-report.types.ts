export const REPORT_STATUS = {
  New: 'New',
  Assigned: 'Assigned',
  Accepted: 'Accepted',
  InProgress: 'InProgress',
  Resolved: 'Resolved',
  Closed: 'Closed',
  Rejected: 'Rejected',
} as const

export type ReportStatus =
  (typeof REPORT_STATUS)[keyof typeof REPORT_STATUS]

export const REPORT_PRIORITY = {
  Low: 'Low',
  Medium: 'Medium',
  High: 'High',
} as const

export type ReportPriority =
  (typeof REPORT_PRIORITY)[keyof typeof REPORT_PRIORITY]

export interface CreateReportRequest {
  categoryId: number
  areaId: number
  description: string
  addressText?: string
  latitude: number
  longitude: number
  images: File[]
}

export interface CheckDuplicateReportsRequest {
  categoryId: number
  latitude: number
  longitude: number
}

export interface DuplicateReport {
  id: string
  description: string
  latitude: number
  longitude: number
  distanceInMeters: number
  status: ReportStatus
  upvoteCount: number
  thumbnailUrl: string | null
  createdAt: string
}

export interface CheckDuplicateReportsResult {
  hasPossibleDuplicates: boolean
  searchRadiusInMeters: number
  reports: DuplicateReport[]
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

export interface PagedResult<T> {
  items: T[]
  pageNumber: number
  pageSize: number
  totalItems: number
  totalPages: number
}

export interface CitizenReportSummary {
  id: string
  categoryId: number
  categoryName: string
  areaId: number
  areaName: string
  departmentId: number | null
  departmentName: string | null
  description: string
  addressText: string | null
  priority: ReportPriority | null
  status: ReportStatus
  requiresManualAssignment: boolean
  upvoteCount: number
  thumbnailUrl: string | null
  createdAt: string
  updatedAt: string | null
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
  priority: ReportPriority | null
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
  hasSubmittedComplaint: boolean
  complaintSubmittedAt: string | null
  complaintReason: string | null
}

export interface ReportTimelineItem {
  id: number
  oldStatus: ReportStatus | null
  newStatus: ReportStatus
  note: string | null
  updatedByUserId: string | null
  updatedByUserName: string | null
  createdAt: string
  imageUrls: string[]
}

export interface ReportTimeline {
  reportId: string
  currentStatus: ReportStatus
  items: ReportTimelineItem[]
}

export type CitizenReportsResponse =
  PagedResult<CitizenReportSummary>