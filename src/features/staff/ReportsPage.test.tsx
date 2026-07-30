import { act, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import StaffReportsPage from './ReportsPage'

const useStaffReportsMock = vi.hoisted(() => vi.fn())

vi.mock('./staff.queries', () => ({
  useStaffReports: useStaffReportsMock,
}))

const report = {
  id: '43a3f19c-27d3-4b7f-bf88-e7bc911df129',
  categoryId: 1,
  categoryName: 'Ổ gà',
  areaId: 2,
  areaName: 'Phường Bến Nghé',
  description: 'Mặt đường có ổ gà lớn.',
  addressText: 'Đường Lê Lợi',
  priority: 'Medium',
  status: 'InProgress',
  assignedStaffId: null,
  assignedStaffName: null,
  requiresManualAssignment: false,
  upvoteCount: 2,
  thumbnailUrl: null,
  createdAt: '2026-07-30T08:00:00Z',
  dueAt: '2026-07-31T08:00:00Z',
}

describe('StaffReportsPage - UC-17', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  beforeEach(() => {
    useStaffReportsMock.mockReset()
    useStaffReportsMock.mockReturnValue({
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

  it('displays reports belonging to the staff department', () => {
    render(
      <MemoryRouter>
        <StaffReportsPage />
      </MemoryRouter>,
    )

    expect(screen.getByText(report.categoryName)).toBeInTheDocument()
    expect(screen.getByText(`Khu vực: ${report.areaName}`)).toBeInTheDocument()
    expect(
      screen.getByRole('link', {
        name: new RegExp(report.categoryName),
      }),
    ).toHaveAttribute('href', `/staff/reports/${report.id}`)
  })

  it('filters reports by status and resets to the first page', () => {
    render(
      <MemoryRouter>
        <StaffReportsPage />
      </MemoryRouter>,
    )

    fireEvent.change(screen.getByLabelText('Trạng thái'), {
      target: { value: 'InProgress' },
    })

    expect(useStaffReportsMock).toHaveBeenLastCalledWith({
      search: undefined,
      status: 'InProgress',
      priority: undefined,
      pageNumber: 1,
      pageSize: 10,
    })
  })

  it('searches after the debounce delay and resets to the first page', () => {
    vi.useFakeTimers()

    render(
      <MemoryRouter>
        <StaffReportsPage />
      </MemoryRouter>,
    )

    fireEvent.change(screen.getByLabelText('Tìm kiếm'), {
      target: { value: '  ổ gà  ' },
    })

    act(() => {
      vi.advanceTimersByTime(300)
    })

    expect(useStaffReportsMock).toHaveBeenLastCalledWith({
      search: 'ổ gà',
      status: undefined,
      priority: undefined,
      pageNumber: 1,
      pageSize: 10,
    })
  })

  it('filters reports by priority and resets to the first page', () => {
    render(
      <MemoryRouter>
        <StaffReportsPage />
      </MemoryRouter>,
    )

    fireEvent.change(screen.getByLabelText('Mức ưu tiên'), {
      target: { value: 'Medium' },
    })

    expect(useStaffReportsMock).toHaveBeenLastCalledWith({
      search: undefined,
      status: undefined,
      priority: 'Medium',
      pageNumber: 1,
      pageSize: 10,
    })
  })

  it('requests the next page', () => {
    render(
      <MemoryRouter>
        <StaffReportsPage />
      </MemoryRouter>,
    )

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Trang sau',
      }),
    )

    expect(useStaffReportsMock).toHaveBeenLastCalledWith({
      search: undefined,
      status: undefined,
      priority: undefined,
      pageNumber: 2,
      pageSize: 10,
    })
  })
})
