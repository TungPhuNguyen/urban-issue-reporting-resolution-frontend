import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PriorityBadge } from './PriorityBadge'

describe('PriorityBadge', () => {
  it('renders the Vietnamese priority label', () => {
    render(<PriorityBadge priority="High" />)

    expect(screen.getByText('Ưu tiên cao')).toBeInTheDocument()
  })

  it('renders the original value for an unknown priority', () => {
    render(<PriorityBadge priority="Urgent" />)

    expect(screen.getByText('Urgent')).toBeInTheDocument()
  })

  it('renders nothing when priority is missing', () => {
    const { container } = render(<PriorityBadge />)

    expect(container).toBeEmptyDOMElement()
  })
})
