import { http } from '@/lib/api/http'

import type {
  PagedResult,
  StaffReportActionResult,
  StaffReportDetail,
  StaffReportSummary,
  ReportPriority,
  ReportStatus,
  StaffReportTimeline,
  StaffProgressUpdate,
} from './staff.types'

export interface GetStaffReportsParams {
  search?: string
  status?: ReportStatus
  priority?: ReportPriority
  pageNumber?: number
  pageSize?: number
}

export const staffReportApi = {
  async getReports(
    params?: GetStaffReportsParams,
  ): Promise<PagedResult<StaffReportSummary>> {
    const response = await http.get<PagedResult<StaffReportSummary>>('/staff/reports', {
      params,
    })

    return response.data
  },

  async getReport(reportId: string): Promise<StaffReportDetail> {
    const response = await http.get<StaffReportDetail>(`/staff/reports/${reportId}`)

    return response.data
  },

  async getTimeline(reportId: string): Promise<StaffReportTimeline> {
    const response = await http.get<StaffReportTimeline>(
      `/staff/reports/${reportId}/timeline`,
    )

    return response.data
  },

  async acceptReport(
    reportId: string,
    priority: ReportPriority,
    note?: string,
  ): Promise<StaffReportActionResult> {
    const trimmedNote = note?.trim()

    const response = await http.post<StaffReportActionResult>(
      `/staff/reports/${reportId}/accept`,
      {
        priority,
        ...(trimmedNote ? { note: trimmedNote } : {}),
      },
    )

    return response.data
  },

  async startProcessing(
    reportId: string,
    note: string,
  ): Promise<StaffReportActionResult> {
    const response = await http.post<StaffReportActionResult>(
      `/staff/reports/${reportId}/start-processing`,
      {
        note,
      },
    )

    return response.data
  },

  async addProgressNote(
    reportId: string,
    note: string,
  ): Promise<StaffProgressUpdate> {
    const response = await http.post<StaffProgressUpdate>(
      `/staff/reports/${reportId}/progress-notes`,
      {
        note: note.trim(),
      },
    )

    return response.data
  },

  async uploadProgressImages(
    reportId: string,
    files: File[],
  ): Promise<StaffProgressUpdate> {
    const formData = new FormData()

    files.forEach((file) => {
      formData.append('Images', file)
    })

    const response = await http.post<StaffProgressUpdate>(
      `/staff/reports/${reportId}/progress-images`,
      formData,
    )

    return response.data
  },

  async resolveReport(
    reportId: string,
    note: string,
    images: File[],
  ): Promise<StaffReportActionResult> {
    const formData = new FormData()

    formData.append('Note', note.trim())

    images.forEach((image) => {
      formData.append('Images', image)
    })

    const response = await http.post<StaffReportActionResult>(
      `/staff/reports/${reportId}/resolve`,
      formData,
    )

    return response.data
  },
}