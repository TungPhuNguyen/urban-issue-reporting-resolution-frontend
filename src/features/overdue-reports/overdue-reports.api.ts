import { http } from '@/lib/api/http'

import type {
  AdminReportSummaryApi,
  OverdueReport,
  OverdueReportParams,
  PagedResult,
  StaffReportSummaryApi,
} from './overdue-reports.types'

type ReportSummary = AdminReportSummaryApi | StaffReportSummaryApi

function mapReport(report: ReportSummary): OverdueReport {
  const dueTime = report.dueAt ? new Date(report.dueAt).getTime() : Number.NaN
  const overdueMilliseconds = Number.isFinite(dueTime)
    ? Math.max(0, Date.now() - dueTime)
    : Math.max(0, (report.overdueHours ?? 0) * 60 * 60 * 1000)

  return {
    id: report.id,
    categoryId: report.categoryId,
    categoryName: report.categoryName,
    areaId: report.areaId,
    areaName: report.areaName,
    departmentId: 'departmentId' in report ? report.departmentId : null,
    departmentName: 'departmentName' in report ? report.departmentName : null,
    assignedStaffId: report.assignedStaffId,
    assignedStaffName: report.assignedStaffName,
    description: report.description,
    addressText: 'addressText' in report ? report.addressText : null,
    priority: report.priority,
    status: report.status,
    createdAt: report.createdAt,
    dueAt: report.dueAt,
    overdueMilliseconds,
    isEscalated: report.isEscalated,
    escalatedAt: report.escalatedAt,
  }
}

export const overdueReportsApi = {
  async getOverdueReports({
    role,
    ...params
  }: OverdueReportParams): Promise<PagedResult<OverdueReport>> {
    const endpoint = role === 'Admin' ? '/admin/reports' : '/staff/reports'

    const response = await http.get<PagedResult<ReportSummary>>(endpoint, {
      params: {
        ...params,
        search: params.search?.trim() || undefined,
        priority: params.priority || undefined,
        status: params.status || undefined,
        isOverdue: true,
        isEscalated: params.isEscalated || undefined,
      },
    })

    return {
      ...response.data,
      items: response.data.items.map(mapReport),
    }
  },
}
