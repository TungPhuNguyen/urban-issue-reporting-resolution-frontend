import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { ReportTimeline } from './ReportTimeline'
import type { ReportTimeline as ReportTimelineData } from './citizen-report.types'

const timeline: ReportTimelineData = {
  reportId: '43a3f19c-27d3-4b7f-bf88-e7bc911df129',
  currentStatus: 'Closed',
  items: [
    {
      id: 1,
      oldStatus: 'InProgress',
      newStatus: 'Resolved',
      note: 'Đã hoàn thành xử lý.',
      updatedByUserId: '7a99a75b-927c-4f3e-bbe5-e7268dcf2765',
      updatedByUserName: 'Nguyễn Văn An',
      createdAt: '2026-07-30T08:00:00Z',
      imageUrls: ['/uploads/progress/resolved.jpg'],
    },
    {
      id: 2,
      oldStatus: 'Resolved',
      newStatus: 'Closed',
      note: 'Hệ thống tự động đóng báo cáo.',
      updatedByUserId: null,
      updatedByUserName: null,
      createdAt: '2026-08-06T08:00:00Z',
      imageUrls: [],
    },
  ],
}

describe('ReportTimeline', () => {
  it('displays the updater, system action and progress image', () => {
    render(
      <ReportTimeline
        timeline={timeline}
        isLoading={false}
        isFetching={false}
        error={null}
        apiOrigin="https://urban-issue.example"
        onRetry={vi.fn()}
      />,
    )

    expect(screen.getByText('Người cập nhật: Nguyễn Văn An')).toBeInTheDocument()

    expect(screen.getByText('Người cập nhật: Hệ thống')).toBeInTheDocument()

    expect(screen.getByAltText('Ảnh tiến trình 1')).toHaveAttribute(
      'src',
      'https://urban-issue.example/uploads/progress/resolved.jpg',
    )
  })

  it('allows retrying after a timeline loading error', () => {
    const onRetry = vi.fn()

    render(
      <ReportTimeline
        timeline={undefined}
        isLoading={false}
        isFetching={false}
        error={new Error('Network error')}
        apiOrigin="https://urban-issue.example"
        onRetry={onRetry}
      />,
    )

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Thử lại',
      }),
    )

    expect(onRetry).toHaveBeenCalledOnce()
  })
})
