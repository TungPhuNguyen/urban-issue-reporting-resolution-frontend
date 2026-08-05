import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Badge } from './Badge'

describe('Badge', () => {
  it('renders its children', () => {
    render(<Badge>Thông báo</Badge>)

    expect(screen.getByText('Thông báo')).toBeInTheDocument()
  })

  it('applies the selected variant', () => {
    render(<Badge variant="success">Thành công</Badge>)

    expect(screen.getByText('Thành công')).toHaveClass('bg-green-100')
  })

  it('accepts a custom className', () => {
    render(<Badge className="custom-class">Nhãn</Badge>)

    expect(screen.getByText('Nhãn')).toHaveClass('custom-class')
  })
})
