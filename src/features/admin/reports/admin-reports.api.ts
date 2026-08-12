import { http } from '@/lib/api/http'
import { parseApiDateTime } from '@/lib/utils/date-time'

import type {
  AdminReportDetail,
  AdminReportsParams,
  AdminReportTimeline,
  AssignReportInput,
  AssignReportResult,
  Department,
  ManualAssignmentQueueParams,
  ManualAssignmentReport,
  PagedResult,
  AdminStaffSummary,
  AssignStaffInput,
  RejectReportInput,
  CloseReportInput,
  DismissComplaintInput,
  PostResolutionActionResult,
  ReassignReportInput,
  ReopenReportInput,
  ClassifyReportInput,
} from './admin-reports.types'

function removeAssignedReports(
  page: PagedResult<ManualAssignmentReport>,
): PagedResult<ManualAssignmentReport> {
  return {
    ...page,

    items: page.items.filter(
      (report) => report.requiresManualAssignment === true && report.departmentId == null,
    ),
  }
}

export const adminReportsApi = {
  getReports: async (
    params: AdminReportsParams,
  ): Promise<PagedResult<ManualAssignmentReport>> => {
    const response = await http.get<PagedResult<ManualAssignmentReport>>(
      '/admin/reports',
      {
        params: {
          ...params,
          search: params.search?.trim() || undefined,
          status: params.status || undefined,
          priority: params.priority || undefined,
        },
      },
    )

    return response.data
  },

  getManualAssignmentQueue: async (
    params: ManualAssignmentQueueParams,
  ): Promise<PagedResult<ManualAssignmentReport>> => {
    const response = await http.get<PagedResult<ManualAssignmentReport>>(
      '/admin/reports',
      {
        params: {
          pageNumber: params.pageNumber,
          pageSize: params.pageSize,
          requiresManualAssignment: true,
        },
      },
    )

    const filteredPage = removeAssignedReports(response.data)

    return {
      ...filteredPage,

      items: [...filteredPage.items].sort(
        (first, second) =>
          parseApiDateTime(first.createdAt).getTime() -
          parseApiDateTime(second.createdAt).getTime(),
      ),
    }
  },

  getById: async (id: string): Promise<AdminReportDetail> => {
    const response = await http.get<AdminReportDetail>(`/admin/reports/${id}`)

    return response.data
  },

  getTimeline: async (id: string): Promise<AdminReportTimeline> => {
    const response = await http.get<AdminReportTimeline>(`/admin/reports/${id}/timeline`)

    return response.data
  },

  getActiveDepartments: async (): Promise<Department[]> => {
    const response = await http.get<PagedResult<Department>>('/admin/departments', {
      params: {
        isActive: true,
        pageNumber: 1,
        pageSize: 100,
      },
    })

    return response.data.items.filter((department) => department.isActive)
  },

  getActiveStaffByDepartment: async (
    departmentId: number,
  ): Promise<AdminStaffSummary[]> => {
    const response = await http.get<PagedResult<AdminStaffSummary>>('/admin/users', {
      params: {
        roleName: 'Staff',
        departmentId,
        isActive: true,
        pageNumber: 1,
        pageSize: 100,
      },
    })

    return response.data.items.filter(
      (staff) =>
        staff.roleName === 'Staff' &&
        staff.isActive &&
        staff.departmentId === departmentId,
    )
  },

  assignStaff: async ({
    reportId,
    departmentId,
    staffId,
    reason,
  }: AssignStaffInput): Promise<AssignReportResult> => {
    const response = await http.post<AssignReportResult>(
      `/admin/reports/${reportId}/reassign`,
      {
        departmentId,
        staffId,
        reason: reason.trim(),
      },
    )

    return response.data
  },

  reassignReport: async ({
    reportId,
    departmentId,
    staffId,
    reason,
  }: ReassignReportInput): Promise<AssignReportResult> => {
    const response = await http.post<AssignReportResult>(
      `/admin/reports/${reportId}/reassign`,
      {
        departmentId,
        staffId,
        reason: reason.trim(),
      },
    )

    return response.data
  },
  rejectReport: async ({
    reportId,
    reason,
  }: RejectReportInput): Promise<AssignReportResult> => {
    const response = await http.post<AssignReportResult>(
      `/admin/reports/${reportId}/reject`,
      {
        reason: reason.trim(),
      },
    )

    return response.data
  },

  assignDepartment: async ({
    reportId,
    departmentId,
    note,
  }: AssignReportInput): Promise<AssignReportResult> => {
    const response = await http.post<AssignReportResult>(
      `/admin/reports/${reportId}/assign`,
      {
        departmentId,
        staffId: null,
        note: note?.trim() || 'Phân công thủ công bởi Admin',
      },
    )

    return response.data
  },
  closeReport: async ({
    reportId,
    note,
  }: CloseReportInput): Promise<PostResolutionActionResult> => {
    const response = await http.post<PostResolutionActionResult>(
      `/admin/reports/${reportId}/close`,
      {
        note: note?.trim() || null,
      },
    )

    return response.data
  },
  reopenReport: async ({
    reportId,
    reason,
  }: ReopenReportInput): Promise<PostResolutionActionResult> => {
    const response = await http.post<PostResolutionActionResult>(
      `/admin/reports/${reportId}/reopen`,
      {
        reason: reason.trim(),
      },
    )

    return response.data
  },

  dismissComplaint: async ({
    reportId,
    reason,
  }: DismissComplaintInput): Promise<PostResolutionActionResult> => {
    const response = await http.post<PostResolutionActionResult>(
      `/admin/reports/${reportId}/dismiss-complaint`,
      {
        reason: reason.trim(),
      },
    )

    return response.data
  },

  classifyReport: async ({
    reportId,
    categoryId,
    note,
  }: ClassifyReportInput): Promise<AssignReportResult> => {
    const response = await http.post<AssignReportResult>(
      `/admin/reports/${reportId}/classify`,
      { categoryId, note: note?.trim() || null },
    )
    return response.data
  },
}
