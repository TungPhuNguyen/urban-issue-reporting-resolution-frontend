import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { parseApiDateTime } from '@/lib/utils/date-time'

import StaffReportDetailPage from './ReportDetailPage'

const useStaffReportMock = vi.hoisted(() => vi.fn())

vi.mock('./staff.queries', () => ({
  useStaffReport: useStaffReportMock,
}))

vi.mock('./components/AcceptReportCard', () => ({
  AcceptReportCard: () => <div>AcceptReportCard</div>,
}))

vi.mock('./components/StartProcessingReportCard', () => ({
  StartProcessingReportCard: () => <div>StartProcessingReportCard</div>,
}))

vi.mock('./components/ProgressUpdateCard', () => ({
  ProgressUpdateCard: () => <div>ProgressUpdateCard</div>,
}))

vi.mock('./components/ReportTimeline', () => ({
  ReportTimeline: () => <div>ReportTimeline</div>,
}))

const report = {
  id: '43a3f19c-27d3-4b7f-bf88-e7bc911df129',
  citizenId: 'f911c84f-4f26-4f93-ad44-0670b488a508',
  citizenName: 'Nguyễn Văn A',
  categoryId: 1,
  categoryName: 'Ổ gà',
  areaId: 2,
  areaName: 'Phường Bến Nghé',
  departmentId: 3,
  departmentName: 'Đơn vị giao thông',
  assignedStaffId: '1f692205-83e0-460f-9164-b1f60315cf8b',
  assignedStaffName: 'Trần Cán Bộ',
  description: 'Mặt đường có ổ gà lớn.',
  addressText: 'Đường Lê Lợi',
  latitude: 10.7769,
  longitude: 106.7009,
  priority: 'High',
  status: 'InProgress',
  upvoteCount: 8,
  imageUrls: ['/uploads/reports/report.jpg'],
  appliedSlaHours: 24,
  slaStartedAt: '2026-07-29T08:00:00',
  dueAt: '2020-07-30T08:00:00',
  isEscalated: true,
  escalatedAt: '2026-07-30T09:00:00Z',
  hasSubmittedComplaint: true,
  complaintSubmittedAt: '2026-07-30T10:00:00Z',
  complaintReason: 'Vị trí này vẫn chưa được xử lý hoàn toàn.',
  createdAt: '2026-07-28T08:00:00Z',
  updatedAt: '2026-07-30T08:00:00Z',
  acceptedAt: '2026-07-29T08:00:00Z',
  resolvedAt: null,
}

function renderPage() {
  return render(
    <MemoryRouter initialEntries={[`/staff/reports/${report.id}`]}>
      <Routes>
        <Route path="/staff/reports/:reportId" element={<StaffReportDetailPage />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('StaffReportDetailPage - UC-18, UC-21 and UC-22', () => {
  beforeEach(() => {
    useStaffReportMock.mockReset()
    useStaffReportMock.mockReturnValue({
      data: report,
      isLoading: false,
      isError: false,
      isFetching: false,
      refetch: vi.fn(),
    })
  })

  it('displays the complete report information and incident images', () => {
    renderPage()

    expect(screen.getByText(report.id)).toBeInTheDocument()
    expect(screen.getByText(report.citizenName)).toBeInTheDocument()
    expect(screen.getByText(report.departmentName)).toBeInTheDocument()
    expect(screen.getByText(report.assignedStaffName)).toBeInTheDocument()
    expect(screen.getByText(report.description)).toBeInTheDocument()
    expect(screen.getByText('Ưu tiên cao')).toBeInTheDocument()
    expect(screen.getByText('Đang xử lý')).toBeInTheDocument()
    expect(screen.getByText('8 lượt')).toBeInTheDocument()
    expect(screen.getByText('10.7769, 106.7009')).toBeInTheDocument()

    const image = screen.getByRole('img', {
      name: 'Hình ảnh sự cố 1',
    })

    expect(image).toHaveAttribute(
      'src',
      'http://localhost:5180/uploads/reports/report.jpg',
    )
  })

  it('warns staff about overdue SLA, escalation and citizen complaint', () => {
    renderPage()

    expect(screen.getByText('Quá hạn SLA')).toBeInTheDocument()
    expect(screen.getByText('Báo cáo đã được cảnh báo quá hạn')).toBeInTheDocument()
    expect(screen.getByText('Công dân yêu cầu xử lý thêm')).toBeInTheDocument()
    expect(screen.getByText(report.complaintReason)).toBeInTheDocument()
    expect(screen.getByText('24 giờ')).toBeInTheDocument()
  })

  it('shows the SLA start and immutable due time returned after acceptance', () => {
    renderPage()

    expect(screen.getByText('Bắt đầu SLA').parentElement).toHaveTextContent(
      parseApiDateTime(report.slaStartedAt).toLocaleString('vi-VN'),
    )
    expect(screen.getByText('Hạn xử lý').parentElement).toHaveTextContent(
      parseApiDateTime(report.dueAt).toLocaleString('vi-VN'),
    )
  })

  it('shows clear empty states when optional detail data is unavailable', () => {
    useStaffReportMock.mockReturnValue({
      data: {
        ...report,
        assignedStaffId: null,
        assignedStaffName: null,
        priority: null,
        status: 'Assigned',
        imageUrls: [],
        appliedSlaHours: null,
        slaStartedAt: null,
        dueAt: null,
        isEscalated: false,
        escalatedAt: null,
        hasSubmittedComplaint: false,
        complaintSubmittedAt: null,
        complaintReason: null,
      },
      isLoading: false,
      isError: false,
      isFetching: false,
      refetch: vi.fn(),
    })

    renderPage()

    expect(screen.getByText('Chưa phân công cán bộ')).toBeInTheDocument()
    expect(screen.getByText('Chưa phân loại')).toBeInTheDocument()
    expect(screen.getByText('SLA chưa bắt đầu')).toBeInTheDocument()
    expect(screen.getByText('Báo cáo chưa có hình ảnh.')).toBeInTheDocument()
    expect(screen.queryByText('Công dân yêu cầu xử lý thêm')).not.toBeInTheDocument()
  })
})
