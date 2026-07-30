export type UserRole = 'Admin' | 'Staff'

export type ReportPriority =
  | 'Low'
  | 'Medium'
  | 'High'
  | 'Critical'

export type ReportStatus =
  | 'New'
  | 'Assigned'
  | 'Accepted'
  | 'InProgress'
  | 'Resolved'
  | 'Closed'
  | 'Rejected'
  | 'Cancelled'
  | string

export interface PagedResult<T> {
  items: T[]
  pageNumber: number
  pageSize: number
  totalItems: number
  totalPages: number
}

export interface OverdueReport {
  id: string
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
  priority: ReportPriority
  status: ReportStatus
  createdAt: string
  dueAt: string | null
  overdueMilliseconds: number
}

export interface AdminReportSummaryApi {
  id: string
  citizenFullName: string
  categoryId: number
  categoryName: string
  areaId: number
  areaName: string
  departmentId: number | null
  departmentName: string | null
  assignedStaffId: string | null
  assignedStaffName: string | null
  description: string
  priority: ReportPriority
  status: ReportStatus
  requiresManualAssignment: boolean
  hasComplaint: boolean
  upvoteCount: number
  thumbnailUrl: string | null
  createdAt: string
  dueAt: string | null
}

export interface StaffReportSummaryApi {
  id: string
  categoryId: number
  categoryName: string
  areaId: number
  areaName: string
  description: string
  addressText: string | null
  priority: ReportPriority
  status: ReportStatus
  assignedStaffId: string | null
  assignedStaffName: string | null
  requiresManualAssignment: boolean
  upvoteCount: number
  thumbnailUrl: string | null
  createdAt: string
  dueAt: string | null
}

export interface OverdueReportFilters {
  search: string
  priority: 'all' | ReportPriority
  status: 'all' | ReportStatus
}
