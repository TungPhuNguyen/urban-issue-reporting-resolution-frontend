import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StatusBadge } from './StatusBadge'

describe('StatusBadge', () => {
  it('renders the Vietnamese status label', () => {
    render(<StatusBadge status="InProgress" />)

    expect(screen.getByText('Đang xử lý')).toBeInTheDocument()
  })

  it('supports the Cancelled status', () => {
    render(<StatusBadge status="Cancelled" />)

    expect(screen.getByText('Đã hủy')).toBeInTheDocument()
  })

  it('supports the Reopened status', () => {
    render(<StatusBadge status="Reopened" />)

    expect(screen.getByText('Đã mở lại')).toBeInTheDocument()
  })

  it('renders the original value for an unknown status', () => {
    render(<StatusBadge status="UnknownStatus" />)

    expect(screen.getByText('UnknownStatus')).toBeInTheDocument()
  })

  it('renders a fallback when status is missing', () => {
    render(<StatusBadge />)

    expect(screen.getByText('Không xác định')).toBeInTheDocument()
  })
})
