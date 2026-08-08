import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { DuplicateReportsDialog } from './DuplicateReportsDialog'
import { citizenReportApi } from './citizen-report.api'
import type { CheckDuplicateReportsResult } from './citizen-report.types'

vi.mock('./citizen-report.api', () => ({
  citizenReportApi: {
    addUpvote: vi.fn(),
  },
}))

const reportId = '43a3f19c-27d3-4b7f-bf88-e7bc911df129'

const result: CheckDuplicateReportsResult = {
  hasPossibleDuplicates: true,
  searchRadiusInMeters: 100,
  reports: [
    {
      id: reportId,
      reportCode: 'UI-I0001',
      title: 'Đèn giao thông bị hỏng',
      description: 'Đèn giao thông không hiện đèn.',
      latitude: 21.0285,
      longitude: 105.8542,
      distanceInMeters: 44,
      status: 'InProgress',
      upvoteCount: 3,
      thumbnailUrl: null,
      createdAt: '2026-08-06T06:22:36Z',
    },
  ],
}

describe('DuplicateReportsDialog', () => {
  it('upvotes a duplicate report and shows the count returned by the API', async () => {
    const user = userEvent.setup()

    vi.mocked(citizenReportApi.addUpvote).mockResolvedValue({
      reportId,
      reportCode: 'UI-I0001',
      isUpvoted: true,
      upvoteCount: 4,
    })

    render(
      <DuplicateReportsDialog
        result={result}
        isCreating={false}
        onCancel={vi.fn()}
        onConfirm={vi.fn()}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Đồng tình' }))

    expect(citizenReportApi.addUpvote).toHaveBeenCalledWith(reportId)
    expect(await screen.findByText('4 lượt đồng tình')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Đã đồng tình' })).toBeDisabled()
  })

  it('shows the API error and allows the user to try again', async () => {
    const user = userEvent.setup()

    vi.mocked(citizenReportApi.addUpvote).mockRejectedValue(
      new Error('Bạn không thể đồng tình báo cáo do chính mình tạo.'),
    )

    render(
      <DuplicateReportsDialog
        result={result}
        isCreating={false}
        onCancel={vi.fn()}
        onConfirm={vi.fn()}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Đồng tình' }))

    expect(
      await screen.findByText('Bạn không thể đồng tình báo cáo do chính mình tạo.'),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Đồng tình' })).toBeEnabled()
  })
})
