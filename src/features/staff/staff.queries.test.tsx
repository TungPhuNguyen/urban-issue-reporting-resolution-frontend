import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { staffReportApi } from './staff.api'
import {
  staffReportKeys,
  useAcceptStaffReport,
  useAddProgressNote,
  useResolveReport,
  useUploadProgressImages,
} from './staff.queries'

vi.mock('./staff.api', () => ({
  staffReportApi: {
    acceptReport: vi.fn(),
    addProgressNote: vi.fn(),
    uploadProgressImages: vi.fn(),
    resolveReport: vi.fn(),
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

describe('Staff workflow cache refresh - UC-24 to UC-28', () => {
  beforeEach(() => {
    vi.mocked(staffReportApi.addProgressNote).mockReset()
    vi.mocked(staffReportApi.uploadProgressImages).mockReset()
    vi.mocked(staffReportApi.resolveReport).mockReset()
  })

  function createTestContext() {
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

    function Wrapper({ children }: { children: ReactNode }) {
      return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    }

    return {
      Wrapper,
      invalidateQueries,
    }
  }

  function expectWorkflowRefresh(
    invalidateQueries: ReturnType<typeof vi.spyOn>,
    reportId: string,
  ) {
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: staffReportKeys.detail(reportId),
    })
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: staffReportKeys.list(),
    })
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: staffReportKeys.timeline(reportId),
    })
  }

  it('refreshes detail, list and timeline after adding a progress note', async () => {
    const reportId = 'report-24'
    const { Wrapper, invalidateQueries } = createTestContext()

    vi.mocked(staffReportApi.addProgressNote).mockResolvedValue({
      reportId,
      statusUpdateId: 24,
      status: 'InProgress',
      note: 'Đang vá mặt đường.',
      imageUrls: [],
      createdAt: '2026-07-30T09:00:00Z',
      updatedAt: '2026-07-30T09:00:00Z',
    })

    const { result } = renderHook(() => useAddProgressNote(reportId), {
      wrapper: Wrapper,
    })

    act(() => {
      result.current.mutate({
        note: 'Đang vá mặt đường.',
      })
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expectWorkflowRefresh(invalidateQueries, reportId)
  })

  it('refreshes the timeline after uploading progress images', async () => {
    const reportId = 'report-25'
    const { Wrapper, invalidateQueries } = createTestContext()
    const image = new File(['image'], 'progress.jpg', {
      type: 'image/jpeg',
    })

    vi.mocked(staffReportApi.uploadProgressImages).mockResolvedValue({
      reportId,
      statusUpdateId: 25,
      status: 'InProgress',
      note: null,
      imageUrls: ['/uploads/progress.jpg'],
      createdAt: '2026-07-30T10:00:00Z',
      updatedAt: '2026-07-30T10:00:00Z',
    })

    const { result } = renderHook(() => useUploadProgressImages(reportId), {
      wrapper: Wrapper,
    })

    act(() => {
      result.current.mutate({ files: [image] })
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expectWorkflowRefresh(invalidateQueries, reportId)
  })

  it('refreshes detail, list and timeline after resolving a report', async () => {
    const reportId = 'report-26'
    const { Wrapper, invalidateQueries } = createTestContext()
    const image = new File(['image'], 'resolved.jpg', {
      type: 'image/jpeg',
    })

    vi.mocked(staffReportApi.resolveReport).mockResolvedValue({
      id: reportId,
      status: 'Resolved',
      priority: 'High',
      assignedStaffId: 'staff-1',
      slaConfigId: 3,
      appliedSlaHours: 24,
      slaStartedAt: '2026-07-30T08:00:00Z',
      dueAt: '2026-07-31T08:00:00Z',
      updatedAt: '2026-07-30T11:00:00Z',
    })

    const { result } = renderHook(() => useResolveReport(reportId), {
      wrapper: Wrapper,
    })

    act(() => {
      result.current.mutate({
        note: 'Đã xử lý hoàn tất.',
        images: [image],
      })
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expectWorkflowRefresh(invalidateQueries, reportId)
  })
})
