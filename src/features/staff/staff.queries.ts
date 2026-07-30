import {
  type QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { staffReportApi } from './staff.api'
import type { ReportPriority } from './staff.types'
import type { GetStaffReportsParams } from './staff.api'

export const staffReportKeys = {
  all: ['staff-reports'] as const,

  list: () => [...staffReportKeys.all, 'list'] as const,

  detail: (reportId: string) => [...staffReportKeys.all, 'detail', reportId] as const,

  timeline: (reportId: string) => [...staffReportKeys.all, 'timeline', reportId] as const,
}

interface AcceptStaffReportInput {
  priority: ReportPriority
  note?: string
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

async function invalidateStaffReportWorkflow(queryClient: QueryClient, reportId: string) {
  await Promise.all([
    queryClient.invalidateQueries({
      queryKey: staffReportKeys.detail(reportId),
    }),
    queryClient.invalidateQueries({
      queryKey: staffReportKeys.list(),
    }),
    queryClient.invalidateQueries({
      queryKey: staffReportKeys.timeline(reportId),
    }),
  ])
}

export function useStaffReports(params: GetStaffReportsParams) {
  return useQuery({
    queryKey: [...staffReportKeys.list(), params],

    queryFn: () => staffReportApi.getReports(params),
  })
}

export function useStaffReport(reportId: string) {
  return useQuery({
    queryKey: staffReportKeys.detail(reportId),

    queryFn: () => staffReportApi.getReport(reportId),

    enabled: !!reportId,
  })
}

export function useStaffReportTimeline(reportId: string) {
  return useQuery({
    queryKey: staffReportKeys.timeline(reportId),
    queryFn: () => staffReportApi.getTimeline(reportId),
    enabled: Boolean(reportId),
  })
}

export function useAcceptStaffReport(reportId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ priority, note }: AcceptStaffReportInput) =>
      staffReportApi.acceptReport(reportId, priority, note),

    onSuccess: () => invalidateStaffReportWorkflow(queryClient, reportId),
  })
}

export function useStartProcessingReport(reportId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ note }: StartProcessingInput) =>
      staffReportApi.startProcessing(reportId, note),

    onSuccess: () => invalidateStaffReportWorkflow(queryClient, reportId),
  })
}

export function useAddProgressNote(reportId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ note }: ProgressNoteInput) =>
      staffReportApi.addProgressNote(reportId, note),

    onSuccess: () => invalidateStaffReportWorkflow(queryClient, reportId),
  })
}

export function useUploadProgressImages(reportId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ files }: UploadProgressImagesInput) =>
      staffReportApi.uploadProgressImages(reportId, files),

    onSuccess: () => invalidateStaffReportWorkflow(queryClient, reportId),
  })
}

export function useResolveReport(reportId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ note, images }: ResolveReportInput) =>
      staffReportApi.resolveReport(reportId, note, images),

    onSuccess: () => invalidateStaffReportWorkflow(queryClient, reportId),
  })
}
