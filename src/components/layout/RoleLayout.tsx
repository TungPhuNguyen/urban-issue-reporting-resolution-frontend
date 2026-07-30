import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'

import { useAuthStore } from '@/features/auth/auth.store'
import type { UserRole } from '@/features/auth/auth.types'

interface MenuItem {
  label: string
  path: string
}

interface RoleLayoutProps {
  role: UserRole
  title: string
  menuItems: MenuItem[]
}

export default function RoleLayout({ role, title, menuItems }: RoleLayoutProps) {
  const navigate = useNavigate()

  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)

  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true)
      await logout()
    } finally {
      navigate('/login', { replace: true })
      setIsLoggingOut(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="flex h-16 items-center justify-between border-b bg-white px-6 shadow-sm">
        <div>
          <h1 className="text-lg font-bold text-gray-800">
            Urban Issue Reporting System
          </h1>

          <p className="text-xs text-gray-500">{title}</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-medium text-gray-800">
              {user?.fullName ?? 'Unknown User'}
            </p>

            <p className="text-xs text-gray-500">{user?.role ?? role}</p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="rounded bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoggingOut ? 'Đang đăng xuất...' : 'Đăng xuất'}
          </button>
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-4rem)]">
        <aside className="w-64 border-r bg-white p-4">
          <nav className="space-y-2">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  [
                    'block rounded px-4 py-2 text-sm font-medium',
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100',
                  ].join(' ')
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
