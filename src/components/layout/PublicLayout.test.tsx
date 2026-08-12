import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'

import PublicLayout from './PublicLayout'

function renderPublicLayout() {
  render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<p>Nội dung trang chủ</p>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  )
}

describe('PublicLayout', () => {
  it('renders the public navigation links', () => {
    renderPublicLayout()

    expect(screen.getByRole('link', { name: 'Urban Issue - Trang chủ' })).toHaveAttribute(
      'href',
      '/',
    )

    expect(screen.getByRole('link', { name: 'Đăng nhập' })).toHaveAttribute(
      'href',
      '/login',
    )

    expect(screen.getByRole('link', { name: 'Đăng ký' })).toHaveAttribute(
      'href',
      '/register',
    )
  })

  it('renders the nested route content', () => {
    renderPublicLayout()

    expect(screen.getByText('Nội dung trang chủ')).toBeInTheDocument()
  })
})
