import { http } from '@/lib/api/http'

import type {
  CitizenReportDetail,
  CitizenReportsResponse,
  ReportTimeline,
} from './reports.types'

import type { ReportStatus } from './reports.types'

export interface GetCitizenReportsParams {
  search?: string
  status?: ReportStatus
  pageNumber?: number
  pageSize?: number
}

export const reportsApi = {
  async list(
    params?: GetCitizenReportsParams,
  ): Promise<CitizenReportsResponse> {
    const response = await http.get<CitizenReportsResponse>(
      '/citizen/reports',
      {
        params,
      },
    )

    return response.data
  },

  async getById(reportId: string): Promise<CitizenReportDetail> {
    const response = await http.get<CitizenReportDetail>(
      `/citizen/reports/${reportId}`,
    )

    return response.data
  },

  async getTimeline(reportId: string): Promise<ReportTimeline> {
    const response = await http.get<ReportTimeline>(
      `/citizen/reports/${reportId}/timeline`,
    )

    return response.data
  },
}