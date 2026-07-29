import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { staffReportApi } from './staff.api'
import type { ReportPriority } from './staff.types'

export const staffReportKeys = {
  all: ['staff-reports'] as const,

  list: () => [...staffReportKeys.all, 'list'] as const,

  detail: (reportId: string) => [...staffReportKeys.all, 'detail', reportId] as const,
}

interface AcceptStaffReportInput {
  priority: ReportPriority
  note: string
}

interface StartProcessingInput {
  note: string
}

interface ProgressNoteInput {
  note: string
}

interface UploadProgressImagesInput {
  files: File[]
}

interface ResolveReportInput {
  note: string
  images: File[]
}

export function useStaffReports() {
  return useQuery({
    queryKey: staffReportKeys.list(),

    queryFn: () =>
      staffReportApi.getReports({
        pageNumber: 1,
        pageSize: 10,
      }),
  })
}

export function useStaffReport(reportId: string) {
  return useQuery({
    queryKey: staffReportKeys.detail(reportId),

    queryFn: () => staffReportApi.getReport(reportId),

    enabled: !!reportId,
  })
}

export function useAcceptStaffReport(reportId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ priority, note }: AcceptStaffReportInput) =>
      staffReportApi.acceptReport(reportId, priority, note),

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: staffReportKeys.detail(reportId),
        }),
        queryClient.invalidateQueries({
          queryKey: staffReportKeys.list(),
        }),
      ])
    },
  })
}

export function useStartProcessingReport(reportId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ note }: StartProcessingInput) =>
      staffReportApi.startProcessing(reportId, note),

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: staffReportKeys.detail(reportId),
        }),
        queryClient.invalidateQueries({
          queryKey: staffReportKeys.list(),
        }),
      ])
    },
  })
}

export function useAddProgressNote(reportId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ note }: ProgressNoteInput) =>
      staffReportApi.addProgressNote(reportId, note),

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: staffReportKeys.detail(reportId),
        }),
        queryClient.invalidateQueries({
          queryKey: staffReportKeys.list(),
        }),
      ])
    },
  })
}

export function useUploadProgressImages(reportId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ files }: UploadProgressImagesInput) =>
      staffReportApi.uploadProgressImages(reportId, files),

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: staffReportKeys.detail(reportId),
        }),
        queryClient.invalidateQueries({
          queryKey: staffReportKeys.list(),
        }),
      ])
    },
  })
}

export function useResolveReport(reportId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ note, images }: ResolveReportInput) =>
      staffReportApi.resolveReport(reportId, note, images),

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: staffReportKeys.detail(reportId),
        }),
        queryClient.invalidateQueries({
          queryKey: staffReportKeys.list(),
        }),
      ])
    },
  })
}
