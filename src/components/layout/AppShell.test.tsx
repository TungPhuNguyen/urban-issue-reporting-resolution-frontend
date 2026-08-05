import type { ComponentProps } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'

import { AppShell } from './AppShell'

function renderAppShell(overrides: Partial<ComponentProps<typeof AppShell>> = {}) {
  const props: ComponentProps<typeof AppShell> = {
    title: 'Cổng quản trị',
    role: 'Admin',
    userName: 'Nguyễn Văn An',
    menuItems: [
      {
        label: 'Tổng quan',
        path: '/admin/dashboard',
        end: true,
      },
      {
        label: 'Tất cả báo cáo',
        path: '/admin/reports',
      },
    ],
    isLoggingOut: false,
    onLogout: vi.fn(),
    ...overrides,
  }

  render(
    <MemoryRouter initialEntries={['/admin/dashboard']}>
      <Routes>
        <Route path="/admin" element={<AppShell {...props} />}>
          <Route path="dashboard" element={<p>Nội dung dashboard</p>} />
          <Route path="reports" element={<p>Danh sách báo cáo</p>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  )

  return props
}

describe('AppShell', () => {
  it('renders the navigation, user and outlet content', () => {
    renderAppShell()

    expect(screen.getAllByText('Cổng quản trị')).toHaveLength(2)
    expect(screen.getByText('Nguyễn Văn An')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Tổng quan' })).toBeInTheDocument()
    expect(screen.getByText('Nội dung dashboard')).toBeInTheDocument()
  })

  it('highlights the active navigation item', () => {
    renderAppShell()

    expect(screen.getByRole('link', { name: 'Tổng quan' })).toHaveClass('bg-brand-50')
  })

  it('opens and closes the mobile menu', async () => {
    const user = userEvent.setup()

    renderAppShell()

    await user.click(screen.getByRole('button', { name: 'Mở menu' }))

    expect(screen.getAllByRole('navigation', { name: 'Admin navigation' })).toHaveLength(
      2,
    )

    await user.click(screen.getAllByRole('button', { name: 'Đóng menu' })[0]!)

    expect(screen.getAllByRole('navigation', { name: 'Admin navigation' })).toHaveLength(
      1,
    )
  })

  it('calls onLogout when the logout button is clicked', async () => {
    const user = userEvent.setup()
    const onLogout = vi.fn()

    renderAppShell({ onLogout })

    await user.click(screen.getByRole('button', { name: 'Đăng xuất' }))

    expect(onLogout).toHaveBeenCalledOnce()
  })
})
