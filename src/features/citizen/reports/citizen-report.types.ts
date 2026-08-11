import type {
  PagedResult,
  ReportAllowedActions,
  ReportComplaint,
  ReportPriority,
  ReportResolution,
  ReportStatus,
} from '@/features/reports/report.types'

export { REPORT_PRIORITY, REPORT_STATUS } from '@/features/reports/report.types'
export type { ReportPriority, ReportStatus } from '@/features/reports/report.types'
export type { PagedResult } from '@/features/reports/report.types'

export interface CreateReportRequest {
  categoryId: number
  areaId: number
  title: string
  description: string
  otherCategoryText?: string
  addressText?: string
  latitude: number
  longitude: number
  confirmPossibleDuplicate?: boolean
  images: File[]
}

export interface UpdateReportRequest {
  reportId: string
  categoryId: number
  areaId: number
  title: string
  description: string
  otherCategoryText?: string
  addressText?: string
  latitude: number
  longitude: number
  confirmPossibleDuplicate?: boolean
  rowVersion: string
}

export interface CancelReportRequest {
  reportId: string
  reason: string
  rowVersion: string
}

export interface CheckDuplicateReportsRequest {
  categoryId: number
  latitude: number
  longitude: number
}

export interface DuplicateReport {
  id: string
  reportCode: string
  title: string
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
  reportNumber: number
  reportCode: string
  title: string
  status: ReportStatus
  departmentId: number | null
  departmentName: string | null
  requiresManualAssignment: boolean
  createdAt: string
  imageUrls: string[]
}

export interface CitizenReportSummary {
  id: string
  reportCode: string
  title: string
  categoryId: number
  categoryName: string
  areaId: number
  areaName: string
  departmentId: number | null
  departmentName: string | null
  description: string
  otherCategoryText: string | null
  addressText: string | null
  priority: ReportPriority | null
  status: ReportStatus
  requiresManualAssignment: boolean
  upvoteCount: number
  thumbnailUrl: string | null
  createdAt: string
  updatedAt: string | null
}

export interface CitizenReportDetail extends CitizenReportSummary {
  reportNumber: number
  latitude: number
  longitude: number
  imageUrls: string[]
  appliedSlaHours: number | null
  slaStartedAt: string | null
  dueAt: string | null
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
  isUpvotedByCurrentUser: boolean
  complaint: ReportComplaint | null
  resolution: ReportResolution | null
  allowedActions: ReportAllowedActions
  rowVersion: string
}

export interface ReportTimelineItem {
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

export interface ReportTimeline {
  reportId: string
  currentStatus: ReportStatus
  items: ReportTimelineItem[]
}

export type CitizenReportsResponse = PagedResult<CitizenReportSummary>

export interface SubmitComplaintInput {
  reportId: string
  reason: string
  images: File[]
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

export interface CloseCitizenReportInput {
  reportId: string
  note?: string
}

export interface ReportUpvoteResult {
  reportId: string
  reportCode: string
  isUpvoted: boolean
  upvoteCount: number
}

export interface ReportComment {
  id: number
  reportId: string
  authorName: string
  content: string
  isMine: boolean
  createdAt: string
}
