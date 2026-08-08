import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { EmptyState } from './EmptyState'

describe('EmptyState', () => {
  it('renders the title', () => {
    render(<EmptyState title="Chưa có báo cáo" />)

    expect(screen.getByText('Chưa có báo cáo')).toBeInTheDocument()
  })

  it('renders the description', () => {
    render(
      <EmptyState
        title="Chưa có báo cáo"
        description="Các báo cáo mới sẽ xuất hiện tại đây."
      />,
    )

    expect(screen.getByText('Các báo cáo mới sẽ xuất hiện tại đây.')).toBeInTheDocument()
  })

  it('renders a custom icon and action', () => {
    render(
      <EmptyState
        title="Chưa có dữ liệu"
        icon={<span>Biểu tượng</span>}
        action={<button type="button">Tạo báo cáo</button>}
      />,
    )

    expect(screen.getByText('Biểu tượng')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Tạo báo cáo' })).toBeInTheDocument()
  })

  it('accepts a custom className', () => {
    render(<EmptyState title="Trống" className="custom-class" />)

    expect(screen.getByText('Trống').parentElement).toHaveClass('custom-class')
  })
})
