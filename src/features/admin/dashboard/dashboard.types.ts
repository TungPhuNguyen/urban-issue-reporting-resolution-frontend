export interface DashboardDateRange {
  fromDate: string
  toDate: string
}

export interface DashboardSummary {
  fromDate: string
  toDate: string
  totalReports: number
  newReports: number
  assignedReports: number
  acceptedReports: number
  inProgressReports: number
  resolvedReports: number
  closedReports: number
  rejectedReports: number
  requiresManualAssignmentReports: number
  pendingComplaintReports: number
  activeOverdueReports: number
  escalatedReports: number
  resolutionRate: number
}

export interface ReportsByStatusItem {
  status: string
  reportCount: number
  percentage: number
}

export interface ReportsByCategoryItem {
  categoryId: number
  categoryName: string
  reportCount: number
  percentage: number
}

export interface ReportsByAreaItem {
  areaId: number
  areaName: string
  reportCount: number
  percentage: number
}

export interface AdminDashboardData {
  summary: DashboardSummary
  reportsByStatus: ReportsByStatusItem[]
  reportsByCategory: ReportsByCategoryItem[]
  reportsByArea: ReportsByAreaItem[]
}
