import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Modal } from './Modal'

describe('Modal', () => {
  it('does not render when closed', () => {
    render(
      <Modal open={false} title="Xác nhận" onClose={vi.fn()}>
        Nội dung
      </Modal>,
    )

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders its content when open', () => {
    render(
      <Modal
        open
        title="Xác nhận"
        description="Vui lòng kiểm tra thông tin"
        footer={<button type="button">Lưu</button>}
        onClose={vi.fn()}
      >
        Nội dung modal
      </Modal>,
    )

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Xác nhận')).toBeInTheDocument()
    expect(screen.getByText('Vui lòng kiểm tra thông tin')).toBeInTheDocument()
    expect(screen.getByText('Nội dung modal')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Lưu' })).toBeInTheDocument()
  })

  it('calls onClose when the close button is clicked', async () => {
    const onClose = vi.fn()

    render(
      <Modal open title="Xác nhận" onClose={onClose}>
        Nội dung
      </Modal>,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Đóng' }))

    expect(onClose).toHaveBeenCalledOnce()
  })

  it('calls onClose when Escape is pressed', async () => {
    const onClose = vi.fn()

    render(
      <Modal open title="Xác nhận" onClose={onClose}>
        Nội dung
      </Modal>,
    )

    await userEvent.keyboard('{Escape}')

    expect(onClose).toHaveBeenCalledOnce()
  })

  it('moves focus inside, traps it and restores it after closing', async () => {
    const user = userEvent.setup()
    const trigger = document.createElement('button')
    trigger.textContent = 'Mở modal'
    document.body.append(trigger)
    trigger.focus()

    const { rerender } = render(
      <Modal
        open
        title="Xác nhận"
        footer={<button type="button">Lưu</button>}
        onClose={vi.fn()}
      >
        Nội dung
      </Modal>,
    )

    expect(screen.getByRole('button', { name: 'Đóng' })).toHaveFocus()

    await user.tab({ shift: true })
    expect(screen.getByRole('button', { name: 'Lưu' })).toHaveFocus()

    rerender(
      <Modal open={false} title="Xác nhận" onClose={vi.fn()}>
        Nội dung
      </Modal>,
    )

    expect(trigger).toHaveFocus()
    trigger.remove()
  })

  it('locks body scrolling while open', () => {
    const { unmount } = render(
      <Modal open title="Xác nhận" onClose={vi.fn()}>
        Nội dung
      </Modal>,
    )

    expect(document.body.style.overflow).toBe('hidden')

    unmount()

    expect(document.body.style.overflow).toBe('')
  })
})
