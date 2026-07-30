import { http } from '@/lib/api/http'

import type {
  AdminReportSummaryApi,
  OverdueReport,
  PagedResult,
  StaffReportSummaryApi,
  UserRole,
} from './overdue-reports.types'

const API_PAGE_SIZE = 100

const FINISHED_STATUSES = new Set([
  'Resolved',
  'Closed',
  'Rejected',
  'Cancelled',
])

function isOverdue(
  dueAt: string | null,
  status: string,
  now: number,
): dueAt is string {
  if (!dueAt || FINISHED_STATUSES.has(status)) {
    return false
  }

  const dueTime = new Date(dueAt).getTime()

  return (
    Number.isFinite(dueTime) &&
    dueTime < now
  )
}

async function getAllPages<T>(
  endpoint: string,
): Promise<T[]> {
  const firstResponse = await http.get<
    PagedResult<T>
  >(endpoint, {
    params: {
      pageNumber: 1,
      pageSize: API_PAGE_SIZE,
    },
  })

  const firstPage = firstResponse.data

  if (firstPage.totalPages <= 1) {
    return firstPage.items
  }

  const remainingRequests = Array.from(
    {
      length:
        firstPage.totalPages - 1,
    },
    (_, index) =>
      http.get<PagedResult<T>>(endpoint, {
        params: {
          pageNumber: index + 2,
          pageSize: API_PAGE_SIZE,
        },
      }),
  )

  const remainingResponses =
    await Promise.all(remainingRequests)

  return [
    ...firstPage.items,
    ...remainingResponses.flatMap(
      (response) =>
        response.data.items,
    ),
  ]
}

function mapAdminReport(
  report: AdminReportSummaryApi,
  now: number,
): OverdueReport | null {
  if (
    !isOverdue(
      report.dueAt,
      report.status,
      now,
    )
  ) {
    return null
  }

  const dueTime = new Date(
    report.dueAt,
  ).getTime()

  return {
    id: report.id,
    categoryId: report.categoryId,
    categoryName:
      report.categoryName,
    areaId: report.areaId,
    areaName: report.areaName,
    departmentId:
      report.departmentId,
    departmentName:
      report.departmentName,
    assignedStaffId:
      report.assignedStaffId,
    assignedStaffName:
      report.assignedStaffName,
    description: report.description,
    addressText: null,
    priority: report.priority,
    status: report.status,
    createdAt: report.createdAt,
    dueAt: report.dueAt,
    overdueMilliseconds:
      now - dueTime,
  }
}

function mapStaffReport(
  report: StaffReportSummaryApi,
  now: number,
): OverdueReport | null {
  if (
    !isOverdue(
      report.dueAt,
      report.status,
      now,
    )
  ) {
    return null
  }

  const dueTime = new Date(
    report.dueAt,
  ).getTime()

  return {
    id: report.id,
    categoryId: report.categoryId,
    categoryName:
      report.categoryName,
    areaId: report.areaId,
    areaName: report.areaName,
    departmentId: null,
    departmentName: null,
    assignedStaffId:
      report.assignedStaffId,
    assignedStaffName:
      report.assignedStaffName,
    description: report.description,
    addressText:
      report.addressText,
    priority: report.priority,
    status: report.status,
    createdAt: report.createdAt,
    dueAt: report.dueAt,
    overdueMilliseconds:
      now - dueTime,
  }
}

export const overdueReportsApi = {
  async getOverdueReports(
    role: UserRole,
  ): Promise<OverdueReport[]> {
    const now = Date.now()

    const reports =
      role === 'Admin'
        ? (
            await getAllPages<AdminReportSummaryApi>(
              '/admin/reports',
            )
          )
            .map((report) =>
              mapAdminReport(
                report,
                now,
              ),
            )
            .filter(
              (
                report,
              ): report is OverdueReport =>
                report !== null,
            )
        : (
            await getAllPages<StaffReportSummaryApi>(
              '/staff/reports',
            )
          )
            .map((report) =>
              mapStaffReport(
                report,
                now,
              ),
            )
            .filter(
              (
                report,
              ): report is OverdueReport =>
                report !== null,
            )

    return reports.sort(
      (left, right) =>
        right.overdueMilliseconds -
        left.overdueMilliseconds,
    )
  },
}
