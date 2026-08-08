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

describe('citizenReportApi multipart contracts', () => {
  beforeEach(() => {
    vi.mocked(http.post).mockReset()
    vi.mocked(http.post).mockResolvedValue({ data: {} })
  })

  it('includes the new report fields and duplicate confirmation', async () => {
    const image = new File(['image'], 'issue.jpg', { type: 'image/jpeg' })

    await citizenReportApi.createReport({
      categoryId: 9,
      areaId: 12,
      title: 'Ổ gà lớn trước cổng trường',
      description: 'Mặt đường hư hỏng gây nguy hiểm.',
      otherCategoryText: 'Hạ tầng khác',
      addressText: 'Số 1 đường A',
      latitude: 21.02,
      longitude: 105.84,
      confirmPossibleDuplicate: true,
      images: [image],
    })

    const [, body] = vi.mocked(http.post).mock.calls[0]!
    expect(body).toBeInstanceOf(FormData)
    const formData = body as FormData
    expect(formData.get('Title')).toBe('Ổ gà lớn trước cổng trường')
    expect(formData.get('OtherCategoryText')).toBe('Hạ tầng khác')
    expect(formData.get('ConfirmPossibleDuplicate')).toBe('true')
    expect(formData.getAll('Images')).toEqual([image])
  })

  it('submits complaints as multipart data with images', async () => {
    const image = new File(['image'], 'complaint.png', { type: 'image/png' })

    await citizenReportApi.submitComplaint({
      reportId: 'report-id',
      reason: 'Sự cố vẫn chưa được xử lý hoàn toàn.',
      images: [image],
    })

    const [url, body] = vi.mocked(http.post).mock.calls[0]!
    expect(url).toBe('/citizen/reports/report-id/complaints')
    expect(body).toBeInstanceOf(FormData)
    expect((body as FormData).get('Reason')).toBe('Sự cố vẫn chưa được xử lý hoàn toàn.')
    expect((body as FormData).getAll('Images')).toEqual([image])
  })
})
