import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { AcceptReportCard } from './AcceptReportCard'

const useAcceptStaffReportMock = vi.hoisted(() => vi.fn())
const mutateMock = vi.hoisted(() => vi.fn())

vi.mock('../staff.queries', () => ({
  useAcceptStaffReport: useAcceptStaffReportMock,
}))

describe('AcceptReportCard - UC-19', () => {
  beforeEach(() => {
    mutateMock.mockReset()
    useAcceptStaffReportMock.mockReset()
    useAcceptStaffReportMock.mockReturnValue({
      mutate: mutateMock,
      isPending: false,
      isError: false,
      isSuccess: false,
      error: null,
    })
  })

  it('requires a priority and sends the selected priority with a trimmed note', async () => {
    const user = userEvent.setup()

    render(<AcceptReportCard reportId="report-19" />)

    const submitButton = screen.getByRole('button', {
      name: 'Tiếp nhận báo cáo',
    })

    expect(submitButton).toBeDisabled()

    await user.selectOptions(screen.getByLabelText('Mức ưu tiên'), 'High')
    await user.type(
      screen.getByLabelText('Ghi chú tiếp nhận (không bắt buộc)'),
      '  Cần xử lý sớm.  ',
    )
    await user.click(submitButton)

    expect(mutateMock).toHaveBeenCalledWith({
      priority: 'High',
      note: 'Cần xử lý sớm.',
    })
  })

  it('allows accepting a report without an optional note', async () => {
    const user = userEvent.setup()

    render(<AcceptReportCard reportId="report-19" />)

    await user.selectOptions(screen.getByLabelText('Mức ưu tiên'), 'Low')
    await user.click(
      screen.getByRole('button', {
        name: 'Tiếp nhận báo cáo',
      }),
    )

    expect(mutateMock).toHaveBeenCalledWith({
      priority: 'Low',
    })
  })

  it('limits the optional note to the backend maximum length', () => {
    render(<AcceptReportCard reportId="report-19" />)

    expect(screen.getByLabelText('Ghi chú tiếp nhận (không bắt buộc)')).toHaveAttribute(
      'maxlength',
      '1000',
    )
    expect(screen.getByText('0/1000 ký tự')).toBeInTheDocument()
  })

  it('disables the form while the request is pending', () => {
    useAcceptStaffReportMock.mockReturnValue({
      mutate: mutateMock,
      isPending: true,
      isError: false,
      isSuccess: false,
      error: null,
    })

    render(<AcceptReportCard reportId="report-19" />)

    expect(screen.getByLabelText('Mức ưu tiên')).toBeDisabled()
    expect(screen.getByLabelText('Ghi chú tiếp nhận (không bắt buộc)')).toBeDisabled()
    expect(
      screen.getByRole('button', {
        name: 'Đang tiếp nhận...',
      }),
    ).toBeDisabled()
  })

  it('shows the error returned by the backend', () => {
    useAcceptStaffReportMock.mockReturnValue({
      mutate: mutateMock,
      isPending: false,
      isError: true,
      isSuccess: false,
      error: new Error('Chưa cấu hình SLA cho mức ưu tiên này.'),
    })

    render(<AcceptReportCard reportId="report-19" />)

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Chưa cấu hình SLA cho mức ưu tiên này.',
    )
  })
})