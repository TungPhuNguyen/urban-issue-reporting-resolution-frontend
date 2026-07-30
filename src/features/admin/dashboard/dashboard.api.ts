import { http } from '@/lib/api/http'

import type {
  AdminDashboardData,
  DashboardDateRange,
  DashboardSummary,
  ReportsByAreaItem,
  ReportsByCategoryItem,
  ReportsByStatusItem,
} from './dashboard.types'

function rangeParams(range: DashboardDateRange) {
  return {
    fromDate: range.fromDate,
    toDate: range.toDate,
  }
}

export const adminDashboardApi = {
  async getDashboard(
    range: DashboardDateRange,
  ): Promise<AdminDashboardData> {
    const params = rangeParams(range)

    const [
      summaryResponse,
      statusResponse,
      categoryResponse,
      areaResponse,
    ] = await Promise.all([
      http.get<DashboardSummary>(
        '/admin/dashboard/summary',
        { params },
      ),
      http.get<ReportsByStatusItem[]>(
        '/admin/dashboard/reports-by-status',
        { params },
      ),
      http.get<ReportsByCategoryItem[]>(
        '/admin/dashboard/reports-by-category',
        { params },
      ),
      http.get<ReportsByAreaItem[]>(
        '/admin/dashboard/reports-by-area',
        { params },
      ),
    ])

    return {
      summary: summaryResponse.data,
      reportsByStatus: statusResponse.data,
      reportsByCategory: categoryResponse.data,
      reportsByArea: areaResponse.data,
    }
  },
}
