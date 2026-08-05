import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { ReportTimeline, type ReportTimelineData } from './ReportTimeline'

const timeline: ReportTimelineData = {
  reportId: 'report-1',
  currentStatus: 'Reopened',
  items: [
    {
      id: 1,
      oldStatus: 'Resolved',
      newStatus: 'Reopened',
      note: 'Cần xử lý bổ sung.',
      updatedByUserId: 'admin-1',
      updatedByUserName: 'Nguyễn Văn An',
      createdAt: '2026-08-05T08:00:00Z',
      imageUrls: ['/uploads/progress/reopened.jpg'],
    },
  ],
}

describe('ReportTimeline', () => {
  it('renders localized statuses, updater and resolved image URL', () => {
    render(
      <ReportTimeline
        timeline={timeline}
        imageUrlResolver={(url) => `https://urban-issue.example${url}`}
      />,
    )

    expect(screen.getAllByText('Đã mở lại')).toHaveLength(3)
    expect(screen.getByText('Thực hiện bởi: Nguyễn Văn An')).toBeInTheDocument()
    expect(screen.getByAltText('Ảnh tiến trình 1')).toHaveAttribute(
      'src',
      'https://urban-issue.example/uploads/progress/reopened.jpg',
    )
  })

  it('shows an empty state', () => {
    render(<ReportTimeline timeline={{ ...timeline, items: [] }} />)

    expect(screen.getByText('Chưa có lịch sử xử lý.')).toBeInTheDocument()
  })

  it('allows retrying after an error', () => {
    const onRetry = vi.fn()

    render(<ReportTimeline error={new Error('Network error')} onRetry={onRetry} />)

    fireEvent.click(screen.getByRole('button', { name: 'Thử lại' }))

    expect(onRetry).toHaveBeenCalledOnce()
  })
})