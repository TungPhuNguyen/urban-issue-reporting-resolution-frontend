export type UserRole = 'Admin' | 'Staff'

export type ReportPriority = 'Low' | 'Medium' | 'High'

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
  isEscalated: boolean
  escalatedAt: string | null
}

export interface AdminReportSummaryApi {
  id: string
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
  priority: ReportPriority
  status: ReportStatus
  requiresManualAssignment: boolean
  hasComplaint: boolean
  upvoteCount: number
  thumbnailUrl: string | null
  createdAt: string
  dueAt: string | null
  isOverdue: boolean
  overdueHours: number | null
  isEscalated: boolean
  escalatedAt: string | null
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
  isOverdue: boolean
  overdueHours: number | null
  isEscalated: boolean
  escalatedAt: string | null
}

export interface OverdueReportFilters {
  search: string
  priority: 'all' | ReportPriority
  status: 'all' | ReportStatus
  isEscalated: boolean
}

export interface OverdueReportParams {
  role: UserRole
  pageNumber: number
  pageSize: number
  search?: string
  priority?: ReportPriority
  status?: ReportStatus
  isEscalated?: boolean
}
