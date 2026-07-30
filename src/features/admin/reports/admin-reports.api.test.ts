import { beforeEach, describe, expect, it, vi } from 'vitest'

import { http } from '@/lib/api/http'

import { adminReportsApi } from './admin-reports.api'

vi.mock('@/lib/api/http', () => ({
  http: {
    get: vi.fn(),
    post: vi.fn(),
  },
}))

describe('adminReportsApi', () => {
  beforeEach(() => {
    vi.mocked(http.get).mockReset()
    vi.mocked(http.post).mockReset()
  })

  it('sends server-side complaint and escalation filters', async () => {
    const page = {
      items: [],
      pageNumber: 2,
      pageSize: 10,
      totalItems: 0,
      totalPages: 0,
    }
    vi.mocked(http.get).mockResolvedValue({
      data: page,
    })

    await expect(
      adminReportsApi.getReports({
        pageNumber: 2,
        pageSize: 10,
        search: '  ổ gà  ',
        hasComplaint: true,
        isEscalated: true,
      }),
    ).resolves.toEqual(page)

    expect(http.get).toHaveBeenCalledWith('/admin/reports', {
      params: {
        pageNumber: 2,
        pageSize: 10,
        search: 'ổ gà',
        hasComplaint: true,
        isEscalated: true,
        status: undefined,
        priority: undefined,
      },
    })
  })

  it('posts a nullable Staff and trimmed reason when reassigning', async () => {
    vi.mocked(http.post).mockResolvedValue({
      data: {
        reportId: 'report-34',
      },
    })

    await adminReportsApi.reassignReport({
      reportId: 'report-34',
      departmentId: 3,
      staffId: null,
      reason: '  Điều chuyển đúng đơn vị.  ',
    })

    expect(http.post).toHaveBeenCalledWith('/admin/reports/report-34/reassign', {
      departmentId: 3,
      staffId: null,
      reason: 'Điều chuyển đúng đơn vị.',
    })
  })

  it('posts a trimmed Admin decision to dismiss a complaint', async () => {
    vi.mocked(http.post).mockResolvedValue({
      data: {
        reportId: 'report-36',
      },
    })

    await adminReportsApi.dismissComplaint({
      reportId: 'report-36',
      reason: '  Kết quả xử lý đã đáp ứng yêu cầu.  ',
    })

    expect(http.post).toHaveBeenCalledWith('/admin/reports/report-36/dismiss-complaint', {
      reason: 'Kết quả xử lý đã đáp ứng yêu cầu.',
    })
  })

  it('loads the Admin timeline endpoint', async () => {
    const timeline = {
      reportId: 'report-43',
      currentStatus: 'Assigned',
      items: [],
    }
    vi.mocked(http.get).mockResolvedValue({
      data: timeline,
    })

    await expect(adminReportsApi.getTimeline('report-43')).resolves.toEqual(timeline)

    expect(http.get).toHaveBeenCalledWith('/admin/reports/report-43/timeline')
  })
})
