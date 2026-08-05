import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'

import RoleLayout from './RoleLayout'

const authState = vi.hoisted(() => ({
  user: {
    fullName: 'Nguyễn Văn An',
    role: 'Admin' as const,
  },
  logout: vi.fn().mockResolvedValue(undefined),
  navigate: vi.fn(),
}))

vi.mock('@/features/auth/auth.store', () => ({
  useAuthStore: (selector: (state: typeof authState) => unknown) => selector(authState),
}))

vi.mock('react-router-dom', async () => {
  const actual =
    await vi.importActual<typeof import('react-router-dom')>('react-router-dom')

  return {
    ...actual,
    useNavigate: () => authState.navigate,
  }
})

function renderRoleLayout() {
  render(
    <MemoryRouter initialEntries={['/admin/dashboard']}>
      <Routes>
        <Route
          path="/admin"
          element={
            <RoleLayout
              role="Admin"
              title="Cổng quản trị"
              menuItems={[
                {
                  label: 'Tổng quan',
                  path: '/admin/dashboard',
                },
              ]}
            />
          }
        >
          <Route path="dashboard" element={<p>Nội dung quản trị</p>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  )
}

describe('RoleLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the authenticated user and page content', () => {
    renderRoleLayout()

    expect(screen.getByText('Nguyễn Văn An')).toBeInTheDocument()
    expect(screen.getByText('Admin')).toBeInTheDocument()
    expect(screen.getByText('Nội dung quản trị')).toBeInTheDocument()
  })

  it('logs out and redirects to the login page', async () => {
    const user = userEvent.setup()

    renderRoleLayout()

    await user.click(screen.getByRole('button', { name: 'Đăng xuất' }))

    await waitFor(() => {
      expect(authState.logout).toHaveBeenCalledOnce()
      expect(authState.navigate).toHaveBeenCalledWith('/login', {
        replace: true,
      })
    })
  })
})
