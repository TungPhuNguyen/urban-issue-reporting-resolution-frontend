import { act, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import CitizenReportsPage from './ReportsPage'

const useCitizenReportsMock = vi.hoisted(() => vi.fn())

vi.mock('./reports/citizen-report.queries', () => ({
  useCitizenReports: useCitizenReportsMock,
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
  priority: 'Medium',
  status: 'InProgress',
  requiresManualAssignment: false,
  upvoteCount: 2,
  thumbnailUrl: null,
  createdAt: '2026-07-30T08:00:00Z',
  updatedAt: null,
}

describe('CitizenReportsPage', () => {
  beforeEach(() => {
    useCitizenReportsMock.mockReset()
    useCitizenReportsMock.mockReturnValue({
      data: {
        items: [report],
        pageNumber: 1,
        pageSize: 10,
        totalItems: 11,
        totalPages: 2,
      },
      isLoading: false,
      isError: false,
      isFetching: false,
      refetch: vi.fn(),
    })
  })

  it('filters reports by status and resets to the first page', () => {
    render(
      <MemoryRouter>
        <CitizenReportsPage />
      </MemoryRouter>,
    )

    fireEvent.change(screen.getByLabelText('Trạng thái'), {
      target: { value: 'InProgress' },
    })

    expect(useCitizenReportsMock).toHaveBeenLastCalledWith({
      search: undefined,
      status: 'InProgress',
      pageNumber: 1,
      pageSize: 10,
    })
  })

  it('searches after the debounce delay', () => {
    vi.useFakeTimers()

    render(
      <MemoryRouter>
        <CitizenReportsPage />
      </MemoryRouter>,
    )

    fireEvent.change(screen.getByLabelText('Tìm kiếm'), {
      target: { value: '  ổ gà  ' },
    })

    act(() => {
      vi.advanceTimersByTime(300)
    })

    expect(useCitizenReportsMock).toHaveBeenLastCalledWith({
      search: 'ổ gà',
      status: undefined,
      pageNumber: 1,
      pageSize: 10,
    })

    vi.useRealTimers()
  })

  it('requests the next page', () => {
    render(
      <MemoryRouter>
        <CitizenReportsPage />
      </MemoryRouter>,
    )

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Trang sau',
      }),
    )

    expect(useCitizenReportsMock).toHaveBeenLastCalledWith({
      search: undefined,
      status: undefined,
      pageNumber: 2,
      pageSize: 10,
    })
  })
})