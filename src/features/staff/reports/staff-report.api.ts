import { http } from '@/lib/api/http'
import type { StaffReportDetail } from './staff-report.types'
export const staffReportApi = {
  async getById(reportId: string): Promise<StaffReportDetail> {
    const response = await http.get<StaffReportDetail>(`/staff/reports/${reportId}`)
    return response.data
  },
}
