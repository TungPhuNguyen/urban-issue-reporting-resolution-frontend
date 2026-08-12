import { beforeEach, describe, expect, it, vi } from 'vitest'

import { http } from '@/lib/api/http'

import { overdueReportsApi } from './overdue-reports.api'

vi.mock('@/lib/api/http', () => ({
  http: {
    get: vi.fn(),
  },
}))

describe('overdueReportsApi', () => {
  beforeEach(() => {
    vi.mocked(http.get).mockReset()
    vi.mocked(http.get).mockResolvedValue({
      data: {
        items: [
          {
            id: 'report-41',
            citizenName: 'Citizen',
            categoryId: 1,
            categoryName: 'Ổ gà',
            areaId: 2,
            areaName: 'Bến Nghé',
            departmentId: 3,
            departmentName: 'Giao thông',
            assignedStaffId: null,
            assignedStaffName: null,
            description: 'Mặt đường hư hỏng',
            priority: 'High',
            status: 'InProgress',
            requiresManualAssignment: false,
            hasComplaint: false,
            upvoteCount: 1,
            thumbnailUrl: null,
            createdAt: '2026-07-28T00:00:00Z',
            dueAt: '2026-07-29T00:00:00Z',
            isOverdue: true,
            overdueHours: 24,
            isEscalated: true,
            escalatedAt: '2026-07-29T01:00:00Z',
          },
        ],
        pageNumber: 1,
        pageSize: 10,
        totalItems: 1,
        totalPages: 1,
      },
    })
  })

  it('uses backend overdue/escalation filters and preserves pagination', async () => {
    const result = await overdueReportsApi.getOverdueReports({
      role: 'Admin',
      pageNumber: 1,
      pageSize: 10,
      search: '  đường  ',
      isEscalated: true,
    })

    expect(http.get).toHaveBeenCalledWith('/admin/reports', {
      params: {
        pageNumber: 1,
        pageSize: 10,
        search: 'đường',
        isOverdue: true,
        isEscalated: true,
        priority: undefined,
        status: undefined,
      },
    })
    expect(result.totalItems).toBe(1)
    expect(result.items[0]).toMatchObject({
      id: 'report-41',
      isEscalated: true,
      departmentName: 'Giao thông',
    })
  })
})
