import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import ReportDetailPage from './ReportDetailPage'
import { resolveApiOrigin, resolveImageUrl } from './report-image-url'

const useCitizenReportDetailMock = vi.hoisted(() => vi.fn())

const useCitizenReportTimelineMock = vi.hoisted(() => vi.fn())

const useCloseCitizenReportMock = vi.hoisted(() => vi.fn())

const useSubmitCitizenComplaintMock = vi.hoisted(() => vi.fn())

vi.mock('./citizen-report.queries', () => ({
  useCitizenReportDetail: useCitizenReportDetailMock,
  useCitizenReportTimeline: useCitizenReportTimelineMock,
  useCloseCitizenReport: useCloseCitizenReportMock,
  useSubmitComplaint: useSubmitCitizenComplaintMock,
}))

const report = {
  id: '43a3f19c-27d3-4b7f-bf88-e7bc911df129',
  categoryId: 1,
  categoryName: 'Ổ gà',
  areaId: 2,
  areaName: 'Phường Bến Nghé',
  departmentId: 3,
  departmentName: 'Đơn vị giao thông',
  description: 'Mặt đường có ổ gà lớn.',
  addressText: 'Đường Lê Lợi',
  latitude: 10.7769,
  longitude: 106.7009,
  priority: 'Medium',
  status: 'Resolved',
  requiresManualAssignment: false,
  upvoteCount: 2,
  imageUrls: ['/uploads/reports/report.jpg'],
  appliedSlaHours: 24,
  slaStartedAt: '2026-07-29T08:00:00Z',
  dueAt: '2026-07-30T08:00:00Z',
  createdAt: '2026-07-28T08:00:00Z',
  updatedAt: '2026-07-30T08:00:00Z',
  acceptedAt: '2026-07-29T08:00:00Z',
  resolvedAt: '2026-07-30T08:00:00Z',
  closedAt: null,
  hasSubmittedComplaint: true,
  complaintSubmittedAt: '2026-07-30T09:00:00Z',
  complaintReason: 'Vị trí này vẫn chưa được xử lý hoàn toàn.',
  rejectedAt: null,
  rejectedReason: null,
  reopenedAt: null,
  reopenReason: null,
}

describe('ReportDetailPage', () => {
  beforeEach(() => {
    useCitizenReportDetailMock.mockReset()
    useCitizenReportTimelineMock.mockReset()
    useCloseCitizenReportMock.mockReset()
    useSubmitCitizenComplaintMock.mockReset()

    useCitizenReportDetailMock.mockReturnValue({
      data: report,
      isLoading: false,
      isFetching: false,
      error: null,
      refetch: vi.fn(),
    })

    useCitizenReportTimelineMock.mockReturnValue({
      data: {
        reportId: report.id,
        currentStatus: report.status,
        items: [],
      },
      isLoading: false,
      isFetching: false,
      error: null,
      refetch: vi.fn(),
    })

    useCloseCitizenReportMock.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    })

    useSubmitCitizenComplaintMock.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    })
  })

  it('displays submitted complaint information', () => {
    render(
      <MemoryRouter initialEntries={[`/citizen/reports/${report.id}`]}>
        <Routes>
          <Route path="/citizen/reports/:reportId" element={<ReportDetailPage />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByText('Yêu cầu xử lý thêm đã gửi')).toBeInTheDocument()

    expect(screen.getByText(report.complaintReason)).toBeInTheDocument()
  })

  it('resolves a relative API base URL and image URL', () => {
    const apiOrigin = resolveApiOrigin('/api', 'https://urban-issue.example')

    expect(apiOrigin).toBe('https://urban-issue.example')

    expect(resolveImageUrl('/uploads/reports/report.jpg', apiOrigin)).toBe(
      'https://urban-issue.example/uploads/reports/report.jpg',
    )
  })
})
