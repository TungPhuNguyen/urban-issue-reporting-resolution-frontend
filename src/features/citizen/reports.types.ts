export const REPORT_STATUS = {
  New: 1,
  Assigned: 2,
  Accepted: 3,
  InProgress: 4,
  Resolved: 5,
  Closed: 6,
  Rejected: 7,
} as const

export type ReportStatus =
  (typeof REPORT_STATUS)[keyof typeof REPORT_STATUS]

export const REPORT_PRIORITY = {
  Low: 1,
  Medium: 2,
  High: 3,
} as const

export type ReportPriority =
  (typeof REPORT_PRIORITY)[keyof typeof REPORT_PRIORITY]

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
}

export interface ReportTimelineItem {
  id: number
  oldStatus: ReportStatus | null
  newStatus: ReportStatus
  note: string | null
  createdAt: string
  imageUrls: string[]
}

export interface ReportTimeline {
  reportId: string
  currentStatus: ReportStatus
  items: ReportTimelineItem[]
}

export type CitizenReportsResponse = PagedResult<CitizenReportSummary>