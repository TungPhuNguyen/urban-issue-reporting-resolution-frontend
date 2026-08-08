import { http } from '@/lib/api/http'

import type {
  PublicReportDetail,
  PublicReportsParams,
  PublicReportsResponse,
} from './public-reports.types'

export const publicReportsApi = {
  async getReports(params: PublicReportsParams): Promise<PublicReportsResponse> {
    const response = await http.get<PublicReportsResponse>('/public/reports', {
      params,
    })
    return response.data
  },

  async getById(id: string): Promise<PublicReportDetail> {
    const response = await http.get<PublicReportDetail>(`/public/reports/${id}`)
    return response.data
  },

  async getByCode(reportCode: string): Promise<PublicReportDetail> {
    const response = await http.get<PublicReportDetail>(
      `/public/reports/by-code/${encodeURIComponent(reportCode)}`,
    )
    return response.data
  },
}
