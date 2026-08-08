import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { AppShell, type AppShellMenuItem } from '@/components/layout/AppShell'
import { useAuthStore } from '@/features/auth/auth.store'
import type { UserRole } from '@/features/auth/auth.types'

interface RoleLayoutProps {
  role: UserRole
  title: string
  menuItems: AppShellMenuItem[]
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
    <AppShell
      role={role}
      title={title}
      userName={user?.fullName ?? 'Người dùng'}
      menuItems={menuItems}
      isLoggingOut={isLoggingOut}
      onLogout={handleLogout}
    />
  )
}
