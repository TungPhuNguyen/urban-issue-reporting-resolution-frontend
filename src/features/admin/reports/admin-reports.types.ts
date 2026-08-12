export type ReportStatus =
  | 'New'
  | 'Assigned'
  | 'InProgress'
  | 'Resolved'
  | 'Closed'
  | 'Rejected'
  | 'Cancelled'
  | string

export type ReportPriority = 'Low' | 'Medium' | 'High'

export interface ManualAssignmentReport {
  id: string

  reportCode?: string
  title?: string

  citizenName?: string

  categoryId: number
  categoryName: string

  areaId: number
  areaName: string

  description: string
  otherCategoryText?: string | null
  createdAt: string

  status: ReportStatus
  priority: ReportPriority | null

  departmentId: number | null
  departmentName: string | null

  assignedStaffId: string | null
  assignedStaffName: string | null

  requiresManualAssignment: boolean

  hasComplaint?: boolean
  upvoteCount?: number
  thumbnailUrl?: string | null
  dueAt?: string | null
  isOverdue?: boolean
  overdueHours?: number | null
  isEscalated?: boolean
  escalatedAt?: string | null
}

export interface ManualAssignmentQueueParams {
  pageNumber: number
  pageSize: number
}

export interface AdminReportsParams extends ManualAssignmentQueueParams {
  search?: string
  status?: string
  priority?: ReportPriority
  hasComplaint?: boolean
  isOverdue?: boolean
  isEscalated?: boolean
  categoryId?: number
  areaId?: number
  departmentId?: number
  staffId?: string
}

export interface PagedResult<T> {
  items: T[]
  pageNumber: number
  pageSize: number
  totalItems: number
  totalPages: number
}

export interface AdminReportDetail extends ManualAssignmentReport {
  reportNumber?: number
  citizenId: string
  citizenEmail: string

  addressText: string | null
  latitude: number
  longitude: number

  upvoteCount: number
  commentCount: number
  imageUrls: string[]

  slaConfigId: number | null
  appliedSlaHours: number | null
  slaStartedAt: string | null
  dueAt: string | null

  isEscalated: boolean
  escalatedAt: string | null

  updatedAt: string | null
  acceptedAt: string | null
  resolvedAt: string | null
  closedAt: string | null

  hasSubmittedComplaint: boolean
  complaintSubmittedAt: string | null
  complaintReason: string | null

  rejectedAt: string | null
  rejectedReason: string | null

  reopenedAt: string | null
  reopenReason: string | null
  complaint?: import('@/features/reports/report.types').ReportComplaint | null
  resolution?: import('@/features/reports/report.types').ReportResolution | null
  allowedActions?: import('@/features/reports/report.types').ReportAllowedActions
  rowVersion?: string
}

export interface Department {
  id: number
  name: string
  description: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string | null
}

export interface AssignReportInput {
  reportId: string
  departmentId: number
  note?: string
}

export interface AssignReportResult {
  reportId: string
  status: ReportStatus

  departmentId: number | null
  departmentName: string | null

  assignedStaffId: string | null
  assignedStaffName: string | null

  priority: ReportPriority | null
  requiresManualAssignment: boolean
  updatedAt: string | null
}
export interface AdminStaffSummary {
  id: string
  fullName: string
  email: string
  roleName: string

  departmentId: number | null
  departmentName: string | null

  isActive: boolean
  createdAt: string
  updatedAt: string | null
}

export interface AssignStaffInput {
  reportId: string
  departmentId: number
  staffId: string
  reason: string
}

export interface ReassignReportInput {
  reportId: string
  departmentId: number
  staffId: string | null
  reason: string
}

export interface RejectReportInput {
  reportId: string
  reason: string
}
export interface CloseReportInput {
  reportId: string
  note?: string
}

export interface PostResolutionActionResult {
  reportId: string
  status: ReportStatus
  complaintSubmittedAt: string | null
  complaintDeadline: string | null
  closedAt: string | null
  reopenedAt: string | null
  dueAt: string | null
}
export interface ReopenReportInput {
  reportId: string
  reason: string
}

export interface DismissComplaintInput {
  reportId: string
  reason: string
}

export interface ClassifyReportInput {
  reportId: string
  categoryId: number
  note?: string
}

export interface AdminReportTimelineItem {
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

export interface AdminReportTimeline {
  reportId: string
  currentStatus: ReportStatus
  items: AdminReportTimelineItem[]
}
