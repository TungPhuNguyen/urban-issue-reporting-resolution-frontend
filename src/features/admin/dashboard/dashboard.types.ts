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
  averageHandlingHours: number | null
}

export interface ReportsByAreaItem {
  areaId: number
  areaName: string
  reportCount: number
  percentage: number
  averageHandlingHours: number | null
}

export interface SlaPerformance {
  fromDate: string
  toDate: string
  slaTrackedReports: number
  completedReports: number
  completedOnTimeReports: number
  completedLateReports: number
  activeOverdueReports: number
  escalatedReports: number
  complianceRate: number
  averageHandlingHours: number | null
}

export interface ReportTrendItem {
  date: string
  createdCount: number
  resolvedCount: number
  closedCount: number
}

export interface ReportTrend {
  fromDate: string
  toDate: string
  items: ReportTrendItem[]
}

export interface AdminDashboardData {
  summary: DashboardSummary
  reportsByStatus: ReportsByStatusItem[]
  reportsByCategory: ReportsByCategoryItem[]
  reportsByArea: ReportsByAreaItem[]
  slaPerformance: SlaPerformance
  reportTrend: ReportTrend
}
