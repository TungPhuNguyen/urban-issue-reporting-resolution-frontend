export const REPORT_STATUS = {
  New: 'New',
  Assigned: 'Assigned',
  Accepted: 'Accepted',
  InProgress: 'InProgress',
  Resolved: 'Resolved',
  Closed: 'Closed',
  Rejected: 'Rejected',
} as const

export type ReportStatus = (typeof REPORT_STATUS)[keyof typeof REPORT_STATUS]

export const REPORT_PRIORITY = {
  Low: 'Low',
  Medium: 'Medium',
  High: 'High',
} as const

export type ReportPriority = (typeof REPORT_PRIORITY)[keyof typeof REPORT_PRIORITY]

export interface PagedResult<T> {
  items: T[]
  pageNumber: number
  pageSize: number
  totalItems: number
  totalPages: number
}

export interface StaffReportSummary {
  id: string

  categoryId: number
  categoryName: string

  areaId: number
  areaName: string

  description: string
  addressText: string | null

  priority: ReportPriority | null
  status: ReportStatus

  assignedStaffId: string | null
  assignedStaffName: string | null

  requiresManualAssignment: boolean

  upvoteCount: number

  thumbnailUrl: string | null

  createdAt: string
  dueAt: string | null
}

export interface StaffReportDetail {
  id: string

  citizenId: string
  citizenName: string

  categoryId: number
  categoryName: string

  areaId: number
  areaName: string

  departmentId: number | null
  departmentName: string | null

  assignedStaffId: string | null
  assignedStaffName: string | null

  description: string
  addressText: string | null

  latitude: number
  longitude: number

  priority: ReportPriority | null
  status: ReportStatus

  upvoteCount: number

  imageUrls: string[]

  appliedSlaHours: number | null
  slaStartedAt: string | null
  dueAt: string | null

  isEscalated: boolean
  escalatedAt: string | null

  hasSubmittedComplaint: boolean
  complaintSubmittedAt: string | null
  complaintReason: string | null

  createdAt: string
  updatedAt: string | null

  acceptedAt: string | null
  resolvedAt: string | null
}

export interface StaffProgressUpdate {
  reportId: string
  statusUpdateId: number

  status: ReportStatus

  note: string | null

  imageUrls: string[]

  createdAt: string
  updatedAt: string | null
}

export interface StaffReportActionResult {
  id: string

  status: ReportStatus

  priority: ReportPriority | null

  assignedStaffId: string | null

  slaConfigId: number | null

  appliedSlaHours: number | null

  slaStartedAt: string | null

  dueAt: string | null

  updatedAt: string | null

  imageUrls: string[]
}

export interface StaffReportTimelineItem {
  id: number

  oldStatus: ReportStatus
  newStatus: ReportStatus

  note: string | null

  updatedByUserId: string | null
  updatedByUserName: string | null

  createdAt: string

  imageUrls: string[]
}

export interface StaffReportTimeline {
  reportId: string
  currentStatus: ReportStatus
  items: StaffReportTimelineItem[]
}