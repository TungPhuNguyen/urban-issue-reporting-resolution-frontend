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

export interface ReportAllowedActions {
  canEdit: boolean
  canCancel: boolean
  canAssign: boolean
  canReassign: boolean
  canClassify: boolean
  canAccept: boolean
  canStartProcessing: boolean
  canAddProgress: boolean
  canResolve: boolean
  canClose: boolean
  canComplain: boolean
  canReviewComplaint: boolean
  canUpvote: boolean
}

export interface ReportResolution {
  note: string | null
  resolvedByUserId: string | null
  resolvedByUserName: string | null
  resolvedAt: string
  imageUrls: string[]
}

export interface ReportComplaint {
  id: number
  status: 'Pending' | 'Approved' | 'Dismissed' | string
  reason: string
  adminDecisionReason: string | null
  resolvedByAdminId: string | null
  resolvedByAdminName: string | null
  createdAt: string
  resolvedAt: string | null
  imageUrls: string[]
}

export interface PagedResult<T> {
  items: T[]
  pageNumber: number
  pageSize: number
  totalItems: number
  totalPages: number
}
