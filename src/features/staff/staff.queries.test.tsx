import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { staffReportApi } from './staff.api'
import { staffReportKeys, useAcceptStaffReport } from './staff.queries'

vi.mock('./staff.api', () => ({
  staffReportApi: {
    acceptReport: vi.fn(),
  },
}))

describe('useAcceptStaffReport - UC-19', () => {
  beforeEach(() => {
    vi.mocked(staffReportApi.acceptReport).mockReset()
  })

  it('refreshes the detail, list and timeline after accepting a report', async () => {
    const reportId = 'report-19'
    const queryClient = new QueryClient({
      defaultOptions: {
        mutations: {
          retry: false,
        },
      },
    })
    const invalidateQueries = vi
      .spyOn(queryClient, 'invalidateQueries')
      .mockResolvedValue()

    vi.mocked(staffReportApi.acceptReport).mockResolvedValue({
      id: reportId,
      status: 'Accepted',
      priority: 'High',
      assignedStaffId: 'staff-1',
      slaConfigId: 3,
      appliedSlaHours: 24,
      slaStartedAt: '2026-07-30T08:00:00Z',
      dueAt: '2026-07-31T08:00:00Z',
      updatedAt: '2026-07-30T08:00:00Z',
       imageUrls: [],
    })

    function Wrapper({ children }: { children: ReactNode }) {
      return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    }

    const { result } = renderHook(() => useAcceptStaffReport(reportId), {
      wrapper: Wrapper,
    })

    act(() => {
      result.current.mutate({
        priority: 'High',
        note: 'Cần xử lý sớm.',
      })
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(staffReportApi.acceptReport).toHaveBeenCalledWith(
      reportId,
      'High',
      'Cần xử lý sớm.',
    )
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: staffReportKeys.detail(reportId),
    })
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: staffReportKeys.list(),
    })
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: staffReportKeys.timeline(reportId),
    })
  })
})