import { beforeEach, describe, expect, it, vi } from 'vitest'

import { http } from '@/lib/api/http'

import { citizenReportApi } from './citizen-report.api'

vi.mock('@/lib/api/http', () => ({
  http: {
    post: vi.fn(),
  },
}))

describe('citizenReportApi.checkDuplicates', () => {
  beforeEach(() => {
    vi.mocked(http.post).mockReset()
  })

  it('posts category and coordinates to the duplicate-check endpoint', async () => {
    const payload = {
      categoryId: 2,
      latitude: 10.7769,
      longitude: 106.7009,
    }

    const response = {
      hasPossibleDuplicates: false,
      searchRadiusInMeters: 100,
      reports: [],
    }

    vi.mocked(http.post).mockResolvedValue({
      data: response,
    })

    await expect(citizenReportApi.checkDuplicates(payload)).resolves.toEqual(response)

    expect(http.post).toHaveBeenCalledWith('/citizen/reports/check-duplicates', payload)
  })
})
