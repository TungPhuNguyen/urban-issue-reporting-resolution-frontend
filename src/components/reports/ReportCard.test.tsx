import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import { ReportCard, type ReportCardData } from './ReportCard'

const report: ReportCardData = {
  id: '43a3f19c-27d3-4b7f-bf88-e7bc911df129',
  categoryName: 'Ổ gà',
  areaName: 'Phường Bến Nghé',
  description: 'Mặt đường có ổ gà lớn.',
  addressText: 'Đường Lê Lợi',
  status: 'InProgress',
  priority: 'High',
  upvoteCount: 12,
  thumbnailUrl: 'https://cdn.example/report.jpg',
  createdAt: '2026-07-30T08:00:00Z',
  dueAt: null,
}

describe('ReportCard', () => {
  it('renders localized report information and destination', () => {
    render(
      <MemoryRouter>
        <ReportCard
          report={report}
          to={`/staff/reports/${report.id}`}
          showReportId
          showDueDate
        />
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: /Ổ gà/ })).toHaveAttribute(
      'href',
      `/staff/reports/${report.id}`,
    )
    expect(screen.getByText('Đang xử lý')).toBeInTheDocument()
    expect(screen.getByText('Ưu tiên cao')).toBeInTheDocument()
    expect(screen.getByText('12 lượt ủng hộ')).toBeInTheDocument()
    expect(screen.getByText('Hạn xử lý: Chưa bắt đầu')).toBeInTheDocument()
    expect(screen.getByAltText('Ảnh báo cáo Ổ gà')).toHaveAttribute(
      'src',
      report.thumbnailUrl,
    )
  })
})