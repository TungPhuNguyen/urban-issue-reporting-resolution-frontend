import { beforeEach, describe, expect, it, vi } from 'vitest'

import { http } from '@/lib/api/http'

import { staffReportApi } from './staff.api'

vi.mock('@/lib/api/http', () => ({
  http: {
    post: vi.fn(),
  },
}))

const actionResult = {
  id: 'report-19',
  status: 'Accepted',
  priority: 'High',
  assignedStaffId: 'staff-1',
  slaConfigId: 3,
  appliedSlaHours: 24,
  slaStartedAt: '2026-07-30T08:00:00Z',
  dueAt: '2026-07-31T08:00:00Z',
  updatedAt: '2026-07-30T08:00:00Z',
}

describe('staffReportApi.acceptReport - UC-19', () => {
  beforeEach(() => {
    vi.mocked(http.post).mockReset()
    vi.mocked(http.post).mockResolvedValue({
      data: actionResult,
    })
  })

  it('posts the string priority and trimmed note to the accept endpoint', async () => {
    await expect(
      staffReportApi.acceptReport('report-19', 'High', '  Cần xử lý sớm.  '),
    ).resolves.toEqual(actionResult)

    expect(http.post).toHaveBeenCalledWith('/staff/reports/report-19/accept', {
      priority: 'High',
      note: 'Cần xử lý sớm.',
    })
  })

  it('omits the optional note when it is blank', async () => {
    await staffReportApi.acceptReport('report-19', 'Low', '   ')

    expect(http.post).toHaveBeenCalledWith('/staff/reports/report-19/accept', {
      priority: 'Low',
    })
  })
})