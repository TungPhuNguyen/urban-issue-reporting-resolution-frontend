import { http } from '@/lib/api/http'

import type {
  CheckDuplicateReportsRequest,
  CheckDuplicateReportsResult,
  CitizenReportDetail,
  CitizenReportsResponse,
  CreateReportRequest,
  CreateReportResult,
  ReportStatus,
  ReportTimeline,
  SubmitComplaintInput,
  PostResolutionActionResult,
  CloseCitizenReportInput,
} from './citizen-report.types'

export interface GetCitizenReportsParams {
  search?: string
  status?: ReportStatus
  pageNumber?: number
  pageSize?: number
}

export const citizenReportApi = {
  async checkDuplicates(
    payload: CheckDuplicateReportsRequest,
  ): Promise<CheckDuplicateReportsResult> {
    const response = await http.post<CheckDuplicateReportsResult>(
      '/citizen/reports/check-duplicates',
      payload,
    )

    return response.data
  },

  async createReport(payload: CreateReportRequest): Promise<CreateReportResult> {
    const formData = new FormData()

    formData.append('CategoryId', String(payload.categoryId))

    formData.append('AreaId', String(payload.areaId))

    formData.append('Description', payload.description)

    formData.append('Latitude', String(payload.latitude))

    formData.append('Longitude', String(payload.longitude))

    if (payload.addressText) {
      formData.append('AddressText', payload.addressText)
    }

    payload.images.forEach((image) => {
      formData.append('Images', image)
    })

    const response = await http.post<CreateReportResult>('/citizen/reports', formData)

    return response.data
  },

  async getMyReports(params?: GetCitizenReportsParams): Promise<CitizenReportsResponse> {
    const response = await http.get<CitizenReportsResponse>('/citizen/reports', {
      params,
    })

    return response.data
  },

  async getReportDetail(reportId: string): Promise<CitizenReportDetail> {
    const response = await http.get<CitizenReportDetail>(`/citizen/reports/${reportId}`)

    return response.data
  },

  async getReportTimeline(reportId: string): Promise<ReportTimeline> {
    const response = await http.get<ReportTimeline>(
      `/citizen/reports/${reportId}/timeline`,
    )

    return response.data
  },

  submitComplaint: async ({
    reportId,
    reason,
  }: SubmitComplaintInput): Promise<PostResolutionActionResult> => {
    const response =
      await http.post<PostResolutionActionResult>(
        `/citizen/reports/${reportId}/complaints`,
        {
          reason: reason.trim(),
        },
      )

    return response.data
  },
  
  closeReport: async ({
    reportId,
    note,
  }: CloseCitizenReportInput): Promise<PostResolutionActionResult> => {
    const response =
      await http.post<PostResolutionActionResult>(
        `/citizen/reports/${reportId}/close`,
        {
          note: note?.trim() || null,
        },
      )

    return response.data
  },
}
