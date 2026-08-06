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
  CancelReportRequest,
  PagedResult,
  ReportComment,
  ReportUpvoteResult,
  UpdateReportRequest,
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

    formData.append('Title', payload.title)

    formData.append('Description', payload.description)

    formData.append(
      'ConfirmPossibleDuplicate',
      String(payload.confirmPossibleDuplicate ?? false),
    )

    formData.append('Latitude', String(payload.latitude))

    formData.append('Longitude', String(payload.longitude))

    if (payload.addressText) {
      formData.append('AddressText', payload.addressText)
    }

    if (payload.otherCategoryText) {
      formData.append('OtherCategoryText', payload.otherCategoryText)
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

  async getReportByCode(reportCode: string): Promise<CitizenReportDetail> {
    const response = await http.get<CitizenReportDetail>(
      `/citizen/reports/by-code/${encodeURIComponent(reportCode)}`,
    )

    return response.data
  },

  async updateReport(payload: UpdateReportRequest): Promise<CitizenReportDetail> {
    const response = await http.put<CitizenReportDetail>(
      `/citizen/reports/${payload.reportId}`,
      {
        categoryId: payload.categoryId,
        areaId: payload.areaId,
        title: payload.title.trim(),
        description: payload.description.trim(),
        otherCategoryText: payload.otherCategoryText?.trim() || null,
        addressText: payload.addressText?.trim() || null,
        latitude: payload.latitude,
        longitude: payload.longitude,
        confirmPossibleDuplicate: payload.confirmPossibleDuplicate ?? false,
        rowVersion: payload.rowVersion,
      },
    )

    return response.data
  },

  async cancelReport(payload: CancelReportRequest): Promise<PostResolutionActionResult> {
    const response = await http.post<PostResolutionActionResult>(
      `/citizen/reports/${payload.reportId}/cancel`,
      {
        reason: payload.reason.trim(),
        rowVersion: payload.rowVersion,
      },
    )

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
    images,
  }: SubmitComplaintInput): Promise<PostResolutionActionResult> => {
    const formData = new FormData()
    formData.append('Reason', reason.trim())
    images.forEach((image) => formData.append('Images', image))

    const response = await http.post<PostResolutionActionResult>(
      `/citizen/reports/${reportId}/complaints`,
      formData,
    )

    return response.data
  },

  closeReport: async ({
    reportId,
    note,
  }: CloseCitizenReportInput): Promise<PostResolutionActionResult> => {
    const response = await http.post<PostResolutionActionResult>(
      `/citizen/reports/${reportId}/close`,
      {
        note: note?.trim() || null,
      },
    )

    return response.data
  },

  async addUpvote(reportId: string): Promise<ReportUpvoteResult> {
    const response = await http.post<ReportUpvoteResult>(
      `/citizen/reports/${reportId}/upvote`,
    )
    return response.data
  },

  async removeUpvote(reportId: string): Promise<ReportUpvoteResult> {
    const response = await http.delete<ReportUpvoteResult>(
      `/citizen/reports/${reportId}/upvote`,
    )
    return response.data
  },

  async getComments(
    reportId: string,
    pageNumber = 1,
    pageSize = 20,
  ): Promise<PagedResult<ReportComment>> {
    const response = await http.get<PagedResult<ReportComment>>(
      `/citizen/reports/${reportId}/comments`,
      { params: { pageNumber, pageSize } },
    )
    return response.data
  },

  async addComment(reportId: string, content: string): Promise<ReportComment> {
    const response = await http.post<ReportComment>(
      `/citizen/reports/${reportId}/comments`,
      { content: content.trim() },
    )
    return response.data
  },

  async deleteComment(reportId: string, commentId: number): Promise<void> {
    await http.delete(`/citizen/reports/${reportId}/comments/${commentId}`)
  },
}
