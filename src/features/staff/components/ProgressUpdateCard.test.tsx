import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { STAFF_IMAGE_MAX_SIZE_BYTES } from '../staff-report-validation'
import { ProgressUpdateCard } from './ProgressUpdateCard'

const useAddProgressNoteMock = vi.hoisted(() => vi.fn())
const useUploadProgressImagesMock = vi.hoisted(() => vi.fn())
const useResolveReportMock = vi.hoisted(() => vi.fn())

const addProgressNoteMutateMock = vi.hoisted(() => vi.fn())
const uploadProgressImagesMutateMock = vi.hoisted(() => vi.fn())
const resolveReportMutateMock = vi.hoisted(() => vi.fn())

vi.mock('../staff.queries', () => ({
  useAddProgressNote: useAddProgressNoteMock,
  useUploadProgressImages: useUploadProgressImagesMock,
  useResolveReport: useResolveReportMock,
}))

function mutationState(
  mutate: ReturnType<typeof vi.fn>,
  overrides: Record<string, unknown> = {},
) {
  return {
    mutate,
    isPending: false,
    isError: false,
    isSuccess: false,
    error: null,
    ...overrides,
  }
}

function createImage(name: string, type = 'image/jpeg', size = 10) {
  const file = new File(['image'], name, { type })

  Object.defineProperty(file, 'size', {
    configurable: true,
    value: size,
  })

  return file
}

describe('ProgressUpdateCard - UC-24 to UC-27', () => {
  beforeEach(() => {
    addProgressNoteMutateMock.mockReset()
    uploadProgressImagesMutateMock.mockReset()
    resolveReportMutateMock.mockReset()

    useAddProgressNoteMock.mockReturnValue(mutationState(addProgressNoteMutateMock))
    useUploadProgressImagesMock.mockReturnValue(
      mutationState(uploadProgressImagesMutateMock),
    )
    useResolveReportMock.mockReturnValue(mutationState(resolveReportMutateMock))
  })

  it('validates and trims a progress note before submitting it', async () => {
    const user = userEvent.setup()

    render(<ProgressUpdateCard reportId="report-24" />)

    const note = screen.getByLabelText('Nội dung ghi chú')
    const submitButton = screen.getByRole('button', {
      name: 'Thêm ghi chú',
    })

    expect(note).toHaveAttribute('maxlength', '2000')
    expect(submitButton).toBeDisabled()

    await user.type(note, 'abcd')

    expect(
      screen.getByText('Ghi chú tiến độ phải có ít nhất 5 ký tự.'),
    ).toBeInTheDocument()
    expect(submitButton).toBeDisabled()

    await user.clear(note)
    await user.type(note, '  Đã vá mặt đường.  ')
    await user.click(submitButton)

    expect(addProgressNoteMutateMock).toHaveBeenCalledWith(
      {
        note: 'Đã vá mặt đường.',
      },
      expect.objectContaining({
        onSuccess: expect.any(Function),
      }),
    )
  })

  it('uploads 1 to 5 valid progress images', async () => {
    const user = userEvent.setup()
    const images = [createImage('before.jpg'), createImage('during.png', 'image/png')]

    render(<ProgressUpdateCard reportId="report-25" />)

    const input = screen.getByLabelText('Chọn ảnh tiến độ')

    expect(input).toHaveAttribute('accept', 'image/jpeg,image/png,image/webp')

    await user.upload(input, images)

    expect(screen.getByText('Đã chọn 2/5 ảnh')).toBeInTheDocument()

    await user.click(
      screen.getByRole('button', {
        name: 'Tải ảnh tiến độ',
      }),
    )

    expect(uploadProgressImagesMutateMock).toHaveBeenCalledWith(
      { files: images },
      expect.objectContaining({
        onSuccess: expect.any(Function),
      }),
    )
  })

  it('blocks invalid progress image type, size and count', () => {
    render(<ProgressUpdateCard reportId="report-25" />)

    const input = screen.getByLabelText('Chọn ảnh tiến độ')
    const invalidFiles = [
      createImage('document.pdf', 'application/pdf'),
      createImage('large.png', 'image/png', STAFF_IMAGE_MAX_SIZE_BYTES + 1),
      ...Array.from({ length: 4 }, (_, index) => createImage(`${index}.jpg`)),
    ]

    fireEvent.change(input, {
      target: {
        files: invalidFiles,
      },
    })

    expect(screen.getByText('Chỉ được chọn tối đa 5 ảnh tiến độ.')).toBeInTheDocument()
    expect(
      screen.getByText('"document.pdf" không đúng định dạng JPEG, PNG hoặc WEBP.'),
    ).toBeInTheDocument()
    expect(screen.getByText('"large.png" vượt quá 5 MB.')).toBeInTheDocument()
    expect(
      screen.getByRole('button', {
        name: 'Tải ảnh tiến độ',
      }),
    ).toBeDisabled()
  })

  it('requires a valid result note and 1 to 5 evidence images before resolving', async () => {
    const user = userEvent.setup()
    const evidence = createImage('completed.webp', 'image/webp')

    render(<ProgressUpdateCard reportId="report-26" />)

    const resolveButton = screen.getByRole('button', {
      name: 'Hoàn thành xử lý',
    })

    expect(resolveButton).toBeDisabled()

    await user.type(screen.getByLabelText('Kết quả xử lý'), '  Đã xử lý hoàn tất.  ')
    await user.upload(screen.getByLabelText('Ảnh minh chứng'), evidence)
    await user.click(resolveButton)

    expect(resolveReportMutateMock).toHaveBeenCalledWith(
      {
        note: 'Đã xử lý hoàn tất.',
        images: [evidence],
      },
      expect.objectContaining({
        onSuccess: expect.any(Function),
      }),
    )
  })

  it('disables resolve controls while pending and shows the backend error', () => {
    useResolveReportMock.mockReturnValue(
      mutationState(resolveReportMutateMock, {
        isPending: true,
        isError: true,
        error: new Error('Chỉ cán bộ được phân công mới có thể hoàn thành.'),
      }),
    )

    render(<ProgressUpdateCard reportId="report-27" />)

    expect(screen.getByLabelText('Kết quả xử lý')).toBeDisabled()
    expect(screen.getByLabelText('Ảnh minh chứng')).toBeDisabled()
    expect(
      screen.getByRole('button', {
        name: 'Đang hoàn thành...',
      }),
    ).toBeDisabled()
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Chỉ cán bộ được phân công mới có thể hoàn thành.',
    )
  })
})
