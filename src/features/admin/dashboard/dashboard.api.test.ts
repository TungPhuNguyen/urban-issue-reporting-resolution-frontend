import { beforeEach, describe, expect, it, vi } from 'vitest'

import { http } from '@/lib/api/http'

import { adminDashboardApi } from './dashboard.api'

vi.mock('@/lib/api/http', () => ({
  http: {
    get: vi.fn(),
  },
}))

describe('adminDashboardApi', () => {
  beforeEach(() => {
    vi.mocked(http.get).mockReset()
    vi.mocked(http.get)
      .mockResolvedValueOnce({
        data: { totalReports: 10 },
      })
      .mockResolvedValueOnce({ data: [] })
      .mockResolvedValueOnce({ data: [] })
      .mockResolvedValueOnce({ data: [] })
      .mockResolvedValueOnce({
        data: { complianceRate: 80 },
      })
      .mockResolvedValueOnce({
        data: { items: [] },
      })
  })

  it('loads summary, breakdown, SLA and trend with one date range', async () => {
    const range = {
      fromDate: '2026-07-01',
      toDate: '2026-07-30',
    }

    const result = await adminDashboardApi.getDashboard(range)

    expect(http.get).toHaveBeenCalledTimes(6)
    expect(http.get).toHaveBeenCalledWith('/admin/dashboard/sla-performance', {
      params: range,
    })
    expect(http.get).toHaveBeenCalledWith('/admin/dashboard/report-trend', {
      params: range,
    })
    expect(result.slaPerformance).toEqual({
      complianceRate: 80,
    })
    expect(result.reportTrend).toEqual({
      items: [],
    })
  })
})
