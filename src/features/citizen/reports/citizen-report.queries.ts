import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { useAuthStore } from '@/features/auth/auth.store'
import { ApiError } from '@/lib/api/http'

import { citizenReportApi, type GetCitizenReportsParams } from './citizen-report.api'

import type {
  CancelReportRequest,
  CloseCitizenReportInput,
  SubmitComplaintInput,
  UpdateReportRequest,
} from './citizen-report.types'

export const citizenReportKeys = {
  all: ['citizen-reports'] as const,

  lists: () => [...citizenReportKeys.all, 'list'] as const,

  list: (userId: string, params: GetCitizenReportsParams) =>
    [...citizenReportKeys.lists(), userId, params] as const,

  detail: (userId: string, reportId: string) =>
    [...citizenReportKeys.all, 'detail', userId, reportId] as const,

  timeline: (userId: string, reportId: string) =>
    [...citizenReportKeys.all, 'timeline', userId, reportId] as const,

  comments: (reportId: string, pageNumber: number) =>
    [...citizenReportKeys.all, 'comments', reportId, pageNumber] as const,
}

function shouldRetry(failureCount: number, error: unknown): boolean {
  if (error instanceof ApiError && (error.status === 403 || error.status === 404)) {
    return false
  }

  return failureCount < 2
}

export function useCitizenReports(
  params: GetCitizenReportsParams = {
    pageNumber: 1,
    pageSize: 10,
  },
) {
  const userId = useAuthStore((state) => state.user?.userId)

  return useQuery({
    queryKey: citizenReportKeys.list(userId ?? 'anonymous', params),

    queryFn: () => citizenReportApi.getMyReports(params),

    enabled: Boolean(userId),

    placeholderData: (previousData) => previousData,
  })
}

export function useCitizenReportDetail(reportId: string) {
  const userId = useAuthStore((state) => state.user?.userId)

  return useQuery({
    queryKey: citizenReportKeys.detail(userId ?? 'anonymous', reportId),

    queryFn: () => citizenReportApi.getReportDetail(reportId),

    enabled: Boolean(userId && reportId),

    retry: shouldRetry,
  })
}

export function useCitizenReportByCode(reportCode: string) {
  const userId = useAuthStore((state) => state.user?.userId)

  return useQuery({
    queryKey: [...citizenReportKeys.all, 'by-code', userId, reportCode] as const,
    queryFn: () => citizenReportApi.getReportByCode(reportCode),
    enabled: Boolean(userId && reportCode.trim()),
    retry: false,
  })
}

export function useCitizenReportTimeline(reportId: string) {
  const userId = useAuthStore((state) => state.user?.userId)

  return useQuery({
    queryKey: citizenReportKeys.timeline(userId ?? 'anonymous', reportId),

    queryFn: () => citizenReportApi.getReportTimeline(reportId),

    enabled: Boolean(userId && reportId),

    retry: shouldRetry,
  })
}

export function useSubmitComplaint() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: SubmitComplaintInput) => citizenReportApi.submitComplaint(input),

    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: citizenReportKeys.all,
      })
    },
  })
}
export function useCloseCitizenReport() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CloseCitizenReportInput) => citizenReportApi.closeReport(input),

    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: citizenReportKeys.all,
      })
    },
  })
}

export function useUpdateCitizenReport() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: UpdateReportRequest) => citizenReportApi.updateReport(input),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: citizenReportKeys.all,
      }),
  })
}

export function useCancelCitizenReport() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CancelReportRequest) => citizenReportApi.cancelReport(input),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: citizenReportKeys.all,
      }),
  })
}

export function useReportComments(reportId: string, pageNumber = 1) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  return useQuery({
    queryKey: citizenReportKeys.comments(reportId, pageNumber),
    queryFn: () => citizenReportApi.getComments(reportId, pageNumber),
    enabled: Boolean(isAuthenticated && reportId),
  })
}

export function useToggleReportUpvote(reportId: string, isUpvoted: boolean) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () =>
      isUpvoted
        ? citizenReportApi.removeUpvote(reportId)
        : citizenReportApi.addUpvote(reportId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: citizenReportKeys.all })
      void queryClient.invalidateQueries({ queryKey: ['public-reports'] })
    },
  })
}

export function useAddReportComment(reportId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (content: string) => citizenReportApi.addComment(reportId, content),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: [...citizenReportKeys.all, 'comments', reportId],
      }),
  })
}

export function useDeleteReportComment(reportId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (commentId: number) =>
      citizenReportApi.deleteComment(reportId, commentId),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: [...citizenReportKeys.all, 'comments', reportId],
      }),
  })
}
