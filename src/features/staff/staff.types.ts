export const REPORT_STATUS = {
  New: 'New',
  Assigned: 'Assigned',
  Accepted: 'Accepted',
  InProgress: 'InProgress',
  Resolved: 'Resolved',
  Closed: 'Closed',
  Rejected: 'Rejected',
  Cancelled: 'Cancelled',
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
  reportCode?: string
  title?: string

  categoryId: number
  categoryName: string

  areaId: number
  areaName: string

  description: string
  otherCategoryText?: string | null
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
  isOverdue?: boolean
  overdueHours?: number | null
  isEscalated?: boolean
  escalatedAt?: string | null
}

export interface StaffReportDetail {
  id: string
  reportNumber?: number
  reportCode?: string
  title?: string

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
  otherCategoryText?: string | null
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
  complaint?: import('@/features/reports/report.types').ReportComplaint | null
  resolution?: import('@/features/reports/report.types').ReportResolution | null
  allowedActions?: import('@/features/reports/report.types').ReportAllowedActions
  rowVersion?: string
}

export interface StaffDashboardStatusItem {
  status: ReportStatus
  count: number
}

export interface StaffDashboardTrendItem {
  date: string
  count: number
}

export interface StaffDashboard {
  departmentId: number
  departmentName: string
  from: string
  to: string
  totalReports: number
  newReports: number
  assignedReports: number
  acceptedReports: number
  inProgressReports: number
  resolvedReports: number
  closedReports: number
  rejectedReports: number
  slaWarningReports: number
  slaBreachedReports: number
  escalatedReports: number
  overdueReports: number
  averageResolutionHours: number | null
  reportsByStatus: StaffDashboardStatusItem[]
  trend: StaffDashboardTrendItem[]
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
}

export interface StaffReportTimelineItem {
  id: number

  eventType?: string | null

  oldStatus: ReportStatus | null
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
