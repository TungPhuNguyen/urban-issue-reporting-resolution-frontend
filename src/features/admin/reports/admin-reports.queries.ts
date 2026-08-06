import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import { adminReportsApi } from './admin-reports.api'

import type {
  AdminReportsParams,
  AssignReportInput,
  AssignStaffInput,
  ManualAssignmentQueueParams,
  RejectReportInput,
  CloseReportInput,
  DismissComplaintInput,
  ReassignReportInput,
  ReopenReportInput,
  ClassifyReportInput,
} from './admin-reports.types'

export const adminReportKeys = {
  all: ['admin', 'reports'] as const,

  manualAssignmentQueues: () =>
    [...adminReportKeys.all, 'manual-assignment-queue'] as const,

  manualAssignmentQueue: (params: ManualAssignmentQueueParams) =>
    [...adminReportKeys.manualAssignmentQueues(), params] as const,

  lists: () => [...adminReportKeys.all, 'list'] as const,

  list: (params: AdminReportsParams) => [...adminReportKeys.lists(), params] as const,

  detail: (id: string) => [...adminReportKeys.all, 'detail', id] as const,

  timeline: (id: string) => [...adminReportKeys.all, 'timeline', id] as const,

  departments: () => ['admin', 'departments', 'active'] as const,

  staffByDepartment: (departmentId: number) =>
    ['admin', 'staff', 'department', departmentId] as const,
}

export function useAdminReports(params: AdminReportsParams) {
  return useQuery({
    queryKey: adminReportKeys.list(params),
    queryFn: () => adminReportsApi.getReports(params),
    placeholderData: keepPreviousData,
  })
}

export function useManualAssignmentQueue(params: ManualAssignmentQueueParams) {
  return useQuery({
    queryKey: adminReportKeys.manualAssignmentQueue(params),

    queryFn: () => adminReportsApi.getManualAssignmentQueue(params),

    placeholderData: keepPreviousData,

    refetchOnWindowFocus: true,

    refetchInterval: 30_000,
  })
}

export function useAdminReportDetail(id: string) {
  return useQuery({
    queryKey: adminReportKeys.detail(id),

    queryFn: () => adminReportsApi.getById(id),

    enabled: id.trim().length > 0,
  })
}

export function useAdminReportTimeline(id: string) {
  return useQuery({
    queryKey: adminReportKeys.timeline(id),
    queryFn: () => adminReportsApi.getTimeline(id),
    enabled: id.trim().length > 0,
  })
}

export function useActiveDepartments() {
  return useQuery({
    queryKey: adminReportKeys.departments(),

    queryFn: adminReportsApi.getActiveDepartments,

    staleTime: 5 * 60 * 1000,
  })
}
export function useActiveStaffByDepartment(departmentId: number | null) {
  return useQuery({
    queryKey: adminReportKeys.staffByDepartment(departmentId ?? 0),

    queryFn: () => adminReportsApi.getActiveStaffByDepartment(departmentId!),

    enabled: departmentId !== null && departmentId > 0,

    staleTime: 60 * 1000,
  })
}

export function useAssignDepartment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: AssignReportInput) => adminReportsApi.assignDepartment(input),

    onSuccess: (result) => {
      queryClient.setQueryData(
        adminReportKeys.detail(result.reportId),
        (current: Record<string, unknown> | undefined) => {
          if (!current) {
            return current
          }

          return {
            ...current,

            status: result.status,

            departmentId: result.departmentId,

            departmentName: result.departmentName,

            assignedStaffId: result.assignedStaffId,

            assignedStaffName: result.assignedStaffName,

            requiresManualAssignment: result.requiresManualAssignment,

            updatedAt: result.updatedAt,
          }
        },
      )

      void queryClient.invalidateQueries({
        queryKey: adminReportKeys.all,
      })
    },
  })
}

export function useAssignStaff() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: AssignStaffInput) => adminReportsApi.assignStaff(input),

    onSuccess: (result) => {
      queryClient.setQueryData(
        adminReportKeys.detail(result.reportId),
        (current: Record<string, unknown> | undefined) => {
          if (!current) {
            return current
          }

          return {
            ...current,

            status: result.status,

            departmentId: result.departmentId,

            departmentName: result.departmentName,

            assignedStaffId: result.assignedStaffId,

            assignedStaffName: result.assignedStaffName,

            requiresManualAssignment: result.requiresManualAssignment,

            priority: result.priority,

            updatedAt: result.updatedAt,
          }
        },
      )

      void queryClient.invalidateQueries({
        queryKey: adminReportKeys.all,
      })
    },
  })
}

export function useReassignReport() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: ReassignReportInput) => adminReportsApi.reassignReport(input),

    onSuccess: (result) => {
      queryClient.setQueryData(
        adminReportKeys.detail(result.reportId),
        (current: Record<string, unknown> | undefined) => {
          if (!current) {
            return current
          }

          return {
            ...current,
            status: result.status,
            departmentId: result.departmentId,
            departmentName: result.departmentName,
            assignedStaffId: result.assignedStaffId,
            assignedStaffName: result.assignedStaffName,
            priority: result.priority,
            requiresManualAssignment: result.requiresManualAssignment,
            updatedAt: result.updatedAt,
          }
        },
      )

      void queryClient.invalidateQueries({
        queryKey: adminReportKeys.all,
      })
    },
  })
}
export function useRejectReport() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: RejectReportInput) => adminReportsApi.rejectReport(input),

    onSuccess: (result) => {
      queryClient.setQueryData(
        adminReportKeys.detail(result.reportId),
        (current: Record<string, unknown> | undefined) => {
          if (!current) {
            return current
          }

          return {
            ...current,

            status: result.status,

            departmentId: result.departmentId,

            departmentName: result.departmentName,

            assignedStaffId: result.assignedStaffId,

            assignedStaffName: result.assignedStaffName,

            requiresManualAssignment: result.requiresManualAssignment,

            updatedAt: result.updatedAt,
          }
        },
      )

      void queryClient.invalidateQueries({
        queryKey: adminReportKeys.all,
      })
    },
  })
}
export function useCloseAdminReport() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CloseReportInput) => adminReportsApi.closeReport(input),

    onSuccess: (result) => {
      queryClient.setQueryData(
        adminReportKeys.detail(result.reportId),
        (current: Record<string, unknown> | undefined) => {
          if (!current) {
            return current
          }

          return {
            ...current,
            status: result.status,
            closedAt: result.closedAt,
            updatedAt: result.closedAt,
          }
        },
      )

      /*
       * Cập nhật mọi report list/queue của Admin.
       */
      void queryClient.invalidateQueries({
        queryKey: adminReportKeys.all,
      })
    },
  })
}
export function useReopenReport() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: ReopenReportInput) => adminReportsApi.reopenReport(input),

    onSuccess: (result) => {
      queryClient.setQueryData(
        adminReportKeys.detail(result.reportId),
        (current: Record<string, unknown> | undefined) => {
          if (!current) {
            return current
          }

          return {
            ...current,
            status: result.status,
            reopenedAt: result.reopenedAt,
            dueAt: result.dueAt,
            complaintSubmittedAt: result.complaintSubmittedAt,
            updatedAt: result.reopenedAt,
          }
        },
      )

      void queryClient.invalidateQueries({
        queryKey: adminReportKeys.all,
      })
    },
  })
}

export function useDismissComplaint() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: DismissComplaintInput) => adminReportsApi.dismissComplaint(input),

    onSuccess: (result) => {
      queryClient.setQueryData(
        adminReportKeys.detail(result.reportId),
        (current: Record<string, unknown> | undefined) => {
          if (!current) {
            return current
          }

          return {
            ...current,
            status: result.status,
            complaintSubmittedAt: result.complaintSubmittedAt,
            closedAt: result.closedAt,
            updatedAt: result.closedAt ?? current.updatedAt,
          }
        },
      )

      void queryClient.invalidateQueries({
        queryKey: adminReportKeys.all,
      })
    },
  })
}

export function useClassifyReport() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: ClassifyReportInput) => adminReportsApi.classifyReport(input),
    onSuccess: (result) => {
      void queryClient.invalidateQueries({ queryKey: adminReportKeys.all })
      void queryClient.invalidateQueries({
        queryKey: adminReportKeys.detail(result.reportId),
      })
    },
  })
}
