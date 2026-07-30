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

describe('staffReportApi workflow payloads - UC-23 to UC-27', () => {
  beforeEach(() => {
    vi.mocked(http.post).mockReset()
    vi.mocked(http.post).mockResolvedValue({
      data: actionResult,
    })
  })

  it('trims a progress note before posting it', async () => {
    await staffReportApi.addProgressNote('report-24', '  Đang vá mặt đường.  ')

    expect(http.post).toHaveBeenCalledWith('/staff/reports/report-24/progress-notes', {
      note: 'Đang vá mặt đường.',
    })
  })

  it('posts progress images as multipart form data', async () => {
    const images = [
      new File(['one'], 'one.jpg', {
        type: 'image/jpeg',
      }),
      new File(['two'], 'two.png', {
        type: 'image/png',
      }),
    ]

    await staffReportApi.uploadProgressImages('report-25', images)

    expect(http.post).toHaveBeenCalledWith(
      '/staff/reports/report-25/progress-images',
      expect.any(FormData),
    )

    const formData = vi.mocked(http.post).mock.calls[0]![1] as FormData

    expect(formData.getAll('Images')).toEqual(images)
  })

  it('posts a trimmed result note and evidence images as multipart form data', async () => {
    const evidence = new File(['completed'], 'completed.webp', {
      type: 'image/webp',
    })

    await staffReportApi.resolveReport('report-26', '  Đã xử lý hoàn tất.  ', [evidence])

    expect(http.post).toHaveBeenCalledWith(
      '/staff/reports/report-26/resolve',
      expect.any(FormData),
    )

    const formData = vi.mocked(http.post).mock.calls[0]![1] as FormData

    expect(formData.get('Note')).toBe('Đã xử lý hoàn tất.')
    expect(formData.getAll('Images')).toEqual([evidence])
  })
})
