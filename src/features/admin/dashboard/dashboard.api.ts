import { http } from '@/lib/api/http'

import type {
  AdminDashboardData,
  DashboardDateRange,
  DashboardSummary,
  ReportsByAreaItem,
  ReportsByCategoryItem,
  ReportsByStatusItem,
  ReportTrend,
  SlaPerformance,
} from './dashboard.types'

function rangeParams(range: DashboardDateRange) {
  return {
    fromDate: range.fromDate,
    toDate: range.toDate,
  }
}

export const adminDashboardApi = {
  async getDashboard(range: DashboardDateRange): Promise<AdminDashboardData> {
    const params = rangeParams(range)

    const [
      summaryResponse,
      statusResponse,
      categoryResponse,
      areaResponse,
      slaResponse,
      trendResponse,
    ] = await Promise.all([
      http.get<DashboardSummary>('/admin/dashboard/summary', { params }),
      http.get<ReportsByStatusItem[]>('/admin/dashboard/reports-by-status', { params }),
      http.get<ReportsByCategoryItem[]>('/admin/dashboard/reports-by-category', {
        params,
      }),
      http.get<ReportsByAreaItem[]>('/admin/dashboard/reports-by-area', { params }),
      http.get<SlaPerformance>('/admin/dashboard/sla-performance', { params }),
      http.get<ReportTrend>('/admin/dashboard/report-trend', { params }),
    ])

    return {
      summary: summaryResponse.data,
      reportsByStatus: statusResponse.data,
      reportsByCategory: categoryResponse.data,
      reportsByArea: areaResponse.data,
      slaPerformance: slaResponse.data,
      reportTrend: trendResponse.data,
    }
  },
}
